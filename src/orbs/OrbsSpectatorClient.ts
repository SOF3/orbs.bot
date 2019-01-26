/*
 * Copyright (C) 2019 SOFe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {OrbsClient} from "./OrbsClient"
import {config} from "../index"
import {ListedOrb, ListedPlayer} from "./protocolTypes"
import {EMOJI_LIST, EMOJI_QUESTION} from "./index"
import {query, selectOne} from "../db"

export type Orb = ListedOrb & {}
export type Player = ListedPlayer & {
	shots: number
	hits: number
}

export class OrbsSpectatorClient extends OrbsClient{
	readonly gameId: number
	private firstInsert: boolean

	hasOPList: boolean = false
	realStartTime: number = Date.now()
	orbs: Orb[]
	players: Player[]
	private readonly closer: (client: OrbsSpectatorClient) => void

	constructor(address: string, gameId: number, closer: (client: OrbsSpectatorClient) => void){
		super(address)
		this.gameId = gameId
		this.closer = closer
	}

	protected async init(): Promise<void>{
		const original = await selectOne<{cnt: number}>("SELECT * FROM game WHERE id = ?", [this.gameId])
		this.firstInsert = original === null
		if(this.firstInsert){
			await query("INSERT INTO game (id, startTime) VALUES (?, ?)", [this.gameId, Date.now()])
		}else{
			await query("UPDATE game SET endTime = NULL, badEnd = FALSE WHERE id = ?", [this.gameId])
		}
		this.sendMessage(OrbsSpectatorClient.JOIN_MATCH,
			config.orbs.username, config.orbs.guid,
			-999, -999,
			this.gameId >> 16,
		)
	}

	protected async handleMessage(id: number, data: string[]): Promise<void>{
		switch(id){
			case OrbsSpectatorClient.ORBS_PLAYERS_LIST:
				return await this.handleOPList(data)
			case OrbsSpectatorClient.SHOOT:
				return await this.handleShoot(data)
			case OrbsSpectatorClient.CONQUER:
				return await this.handleConquer(data)
			case OrbsSpectatorClient.SHIELD:
			case OrbsSpectatorClient.BOMB:
				return await this.handleSpecial(data, id)
			case OrbsSpectatorClient.RESULTS:
				return await this.handleResults()
		}
	}

	private async handleOPList(data: string[]){
		if(this.hasOPList){
			return
		}

		const {orbs, players} = JSON.parse(data[0]) as {
			orbs: ListedOrb[]
			players: ListedPlayer[]
		}
		const elapsed = parseInt(data[1])
		this.realStartTime = Date.now() - elapsed
		for(let i = 0; i < 24; i++){
			orbs[i].ownerId = parseInt(data[i + 2])
		}

		if(!this.hasOPList){
			this.orbs = orbs
			this.players = players.map(player => Object.assign(player, {
				shots: 0,
				hits: 0,
			}))
			this.hasOPList = true
			if(this.firstInsert){
				await Promise.all(players.map(player => query(
					"INSERT INTO game_player (game, playerId, name, isBot, botId) VALUES (?, ?, ?, ?, ?)",
					[this.gameId, player.id, player.name, player.isBot, player.isBot ? player.nid : null],
				)))
			}
		}
	}

	private async handleShoot(data: string[]){
		if(!this.hasOPList){
			return
		}
		const orbId = parseInt(data[0])
		const timestamp = parseFloat(data[1])
		const shooterId = this.orbs[orbId].ownerId
		if(shooterId === -1){
			console.log("Shot from unowned orb detected")
			return
		}
		const shooter = this.players[shooterId]
		shooter.lastFiredFromOrbId = orbId
		this.realStartTime = Math.round(Date.now() - timestamp * 1000)
		await query(
			"INSERT INTO game_shot (game, orb, player, direction_x, direction_y, gameTime) VALUES (?, ?, ?, ?, ?, ?)",
			[this.gameId, orbId, shooterId, parseFloat(data[2]), parseFloat(data[3]), timestamp],
		)
		return
	}

	private async handleConquer(data: string[]){
		if(!this.hasOPList){
			return
		} // not sure why two packet-11 are sent before packet-8
		const orbId = parseInt(data[0])
		const timestamp = parseFloat(data[2])
		const playerId = parseInt(data[1])
		const loserId = this.orbs[orbId].ownerId
		this.orbs[orbId].ownerId = playerId
		this.realStartTime = Math.round(Date.now() - timestamp * 1000)
		await query(
			"INSERT INTO game_conquer (game, orb, player, gameTime) VALUES (?, ?, ?, ?)",
			[this.gameId, orbId, playerId, timestamp],
		)

		if(loserId !== -1){
			let ok = false
			for(const orb of this.orbs){
				if(orb.ownerId === loserId){
					ok = true
					break
				}
			}
			if(!ok){
				await query("UPDATE game_player SET loseTime = ?, loseGameTime = ? WHERE game = ? AND name = ?",
					[Date.now(), timestamp, this.gameId, this.players[loserId].name])
			}
		}

		return
	}

	private async handleSpecial(data: string[], id: number){
		const orbId = parseInt(data[0])
		const timestamp = parseFloat(data[1])
		const playerId = this.orbs[orbId].ownerId
		this.realStartTime = Math.round(Date.now() - timestamp * 1000)
		await query(
			"INSERT INTO game_special (game, orb, player, type, gameTime) VALUES (?, ?, ?, ?, ?)",
			[this.gameId, orbId, playerId, id, timestamp],
		)
	}

	private async handleResults(){
		await query("UPDATE game SET endTime = ?, endGameTime = ? WHERE id = ?",
			[Date.now(), (Date.now() - this.realStartTime) / 1000, this.gameId])
		this.conn.close()
		this.closer(this)
		return
	}

	emojiList(){
		return this.orbs.map(orb => orb.ownerId === -1 ? EMOJI_QUESTION : EMOJI_LIST[orb.ownerId]).join("")
	}
}
