/*
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published
 *  by the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {Command} from "./index"
import {getClients} from "../orbs/pool"
import {Message, Snowflake} from "discord.js"
import {delay} from "../util"
import {alive} from "../../app"

let lock = {} as {[guildId: string]: Snowflake}

const LIVE_TIME = 300000
const LIVE_STEP = 3000

export const GamesCommand: Command = {
	name: "games",
	description: "Show current games",
	args: "",
	executor: async(msg) => {
		if(lock[msg.guild.id] !== undefined){
			await msg.reply(`I am already reporting a live message on <#${lock[msg.guild.id]}>`)
			return
		}

		lock[msg.guild.id] = msg.channel.id

		const reply = await msg.reply(getLines(), {
			embed: {
				title: "Note",
				description: `I have only been alive for ${Math.round((Date.now() - alive) / 60000)} minute(s). ` +
					`Some games might be older than me!`,
				timestamp: new Date(Date.now() + LIVE_TIME),
			},
		})
		if(reply instanceof Message){
			let remaining = LIVE_TIME
			while(true){
				remaining -= LIVE_STEP
				if(remaining < 0){
					break
				}
				await Promise.all([
					reply.edit(getLines() + (remaining === 0 ? "" :
						`\n\n(The message will be live for ${Math.round(remaining / 600) / 100} more minutes)`)),
					delay(LIVE_STEP),
				])
			}
		}

		delete lock[msg.guild.id]
	},
}

const symbols = "@:^?%-&$."

function getLines(){
	const lines = [] as string[]
	let cnt = 0
	for(const client of getClients()){
		for(const id in client.games){
			const game = client.games[id]
			const players = game.players.slice(0).sort((a, b) => a.name.localeCompare(b.name))
			const playerNames = players.map((it, i) => `${symbols.charAt(i)} ${it.name}`).join(", ")
			let array = ""
			let i = 0
			for(const player of players) array += symbols.charAt(i++).toString().repeat(player.orbs)
			array += symbols.charAt(8).repeat(players.reduce((a, b) => a -b.orbs, 24))
			lines.push("```")
			lines.push(`Game #${id} has run for ${(Date.now() - game.createTime) / 1000} seconds`)
			lines.push(playerNames)
			lines.push(array)
			lines.push("```")
			cnt++
		}
	}
	return `${cnt} game(s) running:\n${lines.join("\n")}`
}
