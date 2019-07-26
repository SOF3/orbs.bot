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
import {secondsToString} from "../../util"

const PAGE_SIZE = 20

export const FindCommand: Command = {
	name: "find",
	description: "Find games by player name: ,find <name> [page]",
	executor: async(msg, args) => {
		const name = args[0];
		if(name === undefined) {
			await msg.reply("Usage: ,find <name> [page]")
			return
		}

		const data = await query<{game: number, loseGameTime: number, startTime: number, endGameTime: number}>(`
			SELECT game, loseGameTime, startTime, endGameTime
			FROM game_player INNER JOIN game ON game=id
			WHERE name = ?
			ORDER BY startTime DESC
			`, [name]);

		if(data.length === 0) {
			await msg.reply("Player does not exist")
			return
		}

		let page = 1
		if(args[1]) {
			page = parseInt(args[1])
		}
		const start = (page - 1) * PAGE_SIZE
		const end = page * PAGE_SIZE

		if(start >= data.length) {
			await msg.reply(`Page ${page} does not exist`)
			return
		}

		const maxPage = Math.ceil(data.length / PAGE_SIZE)

		let message = `Showing page ${page} of ${maxPage}:`
		for(const datum of data.slice(start, Math.min(end, data.length))) {
			message += `\nGame #${datum.game} on ${new Date(datum.startTime).toISOString()}: `
			if(datum.loseGameTime) {
				message += `Lose after ${secondsToString(datum.loseGameTime)}\n    (Game took ${secondsToString(datum.endGameTime)})`
			} else {
				message += `Win after ${secondsToString(datum.endGameTime)}`
			}
		}

		console.info(message.length)
		await msg.reply(message)
	},
}
