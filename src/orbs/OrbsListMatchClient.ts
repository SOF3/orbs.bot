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
import {UPDATE_RATE} from "./index"
import {query, selectOne} from "../db"
import {OrbsSpectatorClient} from "./OrbsSpectatorClient"

export class OrbsListMatchClient extends OrbsClient{
	spectators = [] as OrbsSpectatorClient[]
	knownGameIds = {} as {[id: number]: boolean}

	protected async init(){
		setInterval(() => {
			this.sendMessage(OrbsClient.GAME_LIST)
		}, UPDATE_RATE)
	}

	protected async handleMessage(id: number, data: string[]){
		switch(id){
			case OrbsClient.GAME_LIST:
				await this.handleGameList(data)
				break
		}
	}

	private async handleGameList(args: string[]){
		const promises = [] as Promise<void>[]

		for(let i = 0; i < args.length; i++){
			const gameId = parseInt(args[i++])
			const players = [] as {name: string; orbs: number}[]
			while(i < args.length - 1 && args[i] !== "*"){
				const name = args[i++]
				const orbs = parseInt(args[i++])
				players.push({name: name, orbs: orbs})
			}
			promises.push(this.handleGameInfo(gameId, players))
		}
		await promises
	}

	private async handleGameInfo(gameId: number, players: {name: string; orbs: number}[]){
		if(this.knownGameIds[gameId] !== undefined){
			return
		}
		this.knownGameIds[gameId] = true
		const client = new OrbsSpectatorClient(this.address, gameId, client => {
			this.spectators.splice(this.spectators.indexOf(client), 1)
		})
		await client.prepare()
		this.spectators.push(client)
	}
}
