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

import {Command} from "./index"
import {query} from "../../db"
import {EMOJI_LIST, EMOJI_QUESTION} from "../../orbs"
import {Message} from "discord.js"
import {secondsToString} from "../../util"

type Event = {
	orb: number,
	emoji: string,
	gameTime: number,
	ty: string,
}
type ConquerEvent = Event & {
	player: number,
}
type ShotEvent = Event & {
	player: number,
	direction_x: number,
	direction_y: number,
}
type SpecialEvent = Event & {
	player: number,
	"type": number,
}
type Player = {
	playerId: number,
	name: string,
	isBot: number,
	botId: number,
	loseTime: number,
	loseGameTime: number,
}

const EMOJI_LOGO = "🔸"

export const ReplayCommand: Command = {
	name: "replay",
	description: "Replay game by game ID (get from ,find)",
	executor: async(msg, args) => {
		const id = args[0];
		if(id === undefined) {
			await msg.reply("Usage: ,replay <id>")
			return
		}

		const game = (await query<{
			id: number,
			startTime: number,
			endTime: number,
			endGameTime: number,
		}>("SELECT * FROM game WHERE id = ?", [id]))[0]
		if(game === undefined){
			await msg.reply("No such game")
			return
		}

		const players = await query<Player>("SELECT playerId, name, isBot, botId, loseTime, loseGameTime FROM game_player WHERE game = ? ORDER BY playerId", [id])

		const conquers = (await query<ConquerEvent>("SELECT orb, player, gameTime FROM game_conquer WHERE game = ?", [id]))
			.map(conquer => {
				conquer.emoji = "💀"
				conquer.ty = "conquer"
				return conquer
			})
		const shots = (await query<ShotEvent>("SELECT orb, player, direction_x, direction_y, gameTime FROM game_shot WHERE game = ?", [id]))
			.map(shot => {
				shot.emoji = "🔫"
				shot.ty = "shot"
				return shot
			})
		const specials = (await query<SpecialEvent>("SELECT orb, player, type, gameTime FROM game_special WHERE game = ?", [id]))
			.map(special => {
				special.emoji = special["type"] === 21 ? " 🛡️ " : "💣"
				special.ty = "special"
				return special
			})

		const eventQueue = (conquers as Event[]).concat(shots).concat(specials) as Event[]
		eventQueue.sort((a, b) => a.gameTime - b.gameTime)

		let elapsed = 0
		const orbs = [
			0, -1, -1, 4, -1, -1, 3, -1, -1, 6, -1, -1,
			1, -1, -1, 5, -1, -1, 2, -1, -1, 7, -1, -1,
		]
		const orbsEvents = [
			[], [], [], [], [], [],
			[], [], [], [], [], [],
			[], [], [], [], [], [],
			[], [], [], [], [], [],
		] as string[][]

		const putEvent = (orb: number, event: string) => {
			orbsEvents[orb].unshift(event)
			setTimeout(() => {orbsEvents[orb].pop()}, 3000)
		}

		const makeMessage = () => {
			return `Replaying game #${game.id} on ${new Date(game.startTime).toISOString()}: ${colonTime(elapsed)}/${colonTime(game.endGameTime)}`
				+ `\nPlayers: ${players.map((player: Player) => EMOJI_LIST[player.playerId] + player.name + (player.isBot ? "🤖" : "")).join(" · ")}`
				+ `\n${orbs.map(orb => (orb !== -1 ? EMOJI_LIST[orb] : EMOJI_QUESTION)).join("")}`
				+ `\n${orbsEvents.map(event => event[0] || EMOJI_LOGO).join("")}`
				+ `\n${orbsEvents.map(event => event[1] || EMOJI_LOGO).join("")}`
				+ `\n${orbsEvents.map(event => event[2] || EMOJI_LOGO).join("")}`
				+ `\n(${eventQueue.length} events left)`
		};

		const edit = (await msg.reply(makeMessage())) as Message
		const editNext = () => {
			edit.edit(makeMessage())
			if(eventQueue.length > 0) setTimeout(editNext, 1500)
		}
		setTimeout(editNext)

		for(const event of eventQueue){
			setTimeout(() => {
				putEvent(event.orb, event.emoji)
				if(event.ty === "conquer") {
					const ev = event as ConquerEvent
					orbs[event.orb] = (event as ConquerEvent).player
				}
				eventQueue.shift()
				elapsed = event.gameTime
			}, event.gameTime * 1000)
		}
	},
}

function colonTime(input: number): string {
	const minutes = Math.floor(input / 60);
	const seconds = Math.round(input % 60)
	const secondsString = (seconds < 10 ? "0" : "") + seconds.toString()
	return `${minutes}:${secondsString}`
}
