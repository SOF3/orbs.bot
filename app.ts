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

import {Client} from "discord.js"
import * as process from "process"
import {secrets} from "./secrets"
import {commands} from "./src/commands"
import {initPool} from "./src/orbs/pool"
import {logConsole} from "./src/util"
import {Friendly} from "./src/commands/Friendly"

export const bot = new Client()
bot.login(secrets.token).catch(err => logConsole(`Login error: ${err}`))

bot.on("ready", () => {
	logConsole(`Bot started. Invite link: https://discordapp.com/oauth2/authorize?scope=bot&client_id=${secrets.clientId}`)
})

bot.on("any", (event) => {
	logConsole(`Event: ${event}`)
})

bot.on("message", (msg) => {
	(async() => {
		const message = msg.content
		logConsole(`Received message from ${msg.author.username} on ${msg.guild.name} #${msg.channel["name"]}:\n${message}`)
		if(message.charAt(0) === ","){
			const args = message.split(" ")
			const name = args.shift().toLowerCase().substr(1)
			const cmd = commands[name]
			if(cmd === undefined){
				logConsole(`Unknown command ${name} ignored`)
				return
			}
			await msg.react("🤔")
			await cmd.executor(msg, args)
			await msg.react("👌")
		}
	})().catch((err) => {
		if(err instanceof Friendly){
			msg.react("⚠").then(() => msg.reply(err.message))
				.catch(err => logConsole(`Error during error: ${err}`))
			return
		}

		logConsole(`Error: ${err}`)
		msg.react("🤕").then(() => msg.reply("Internal error")).catch(() => {
			logConsole(`Error during error: ${err}`)
		})
	})
})

initPool().catch(err => {
	logConsole(`initPool error: ${err}`)
})

export const alive = Date.now()

logConsole("Bot alive!")
