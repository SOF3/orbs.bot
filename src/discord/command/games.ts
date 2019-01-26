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
import {OrbsSpectatorClient} from "../../orbs/OrbsSpectatorClient"
import {EMOJI_LIST, listMatchClients, UPDATE_RATE} from "../../orbs"
import {Message} from "discord.js"
import {secondsToString} from "../../util"

const UPDATE_DURATION = 1000 * 60 * 5

export const GamesCommand: Command = {
	name: "games",
	description: "Show ongoing games",
	executor: async(msg) => {
		const text = makeGamesText(msg, UPDATE_DURATION)
		const reply = await msg.reply(text) as Message

		for(let elapsed = 0; elapsed < UPDATE_DURATION; elapsed += UPDATE_RATE){
			await reply.edit(makeGamesText(msg, UPDATE_DURATION - elapsed))
			await new Promise(resolve => setTimeout(resolve, UPDATE_RATE))
		}
	},
}

function makeGamesText(msg: Message, remainingTime: number){
	const games = [] as OrbsSpectatorClient[]
	for(const lister of listMatchClients){
		for(const game of lister.spectators){
			games.push(game)
		}
	}

	let output = `<@${msg.author.id}>, `
	output += games.length === 1 ? `1 game is running:` : `${games.length} games are running:`
	if(remainingTime > UPDATE_RATE * 2){
		output += ` (will be live for ${secondsToString(remainingTime / 1000)})`
	}

	for(const game of games){
		output += `\n\nGame #${game.gameId} started ${secondsToString((Date.now() - game.realStartTime) / 1000)} ago`
		if(Array.isArray(game.players)){
			output += `\nPlayers: ${game.players.map((p, i) => EMOJI_LIST[i] + p.name + (p.isBot ? "🤖" : "")).join(" · ")}\n`
			output += game.emojiList()
		}else{
			output += `\nI can't get player information`
		}
	}

	return output
}
