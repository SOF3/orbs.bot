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

import {Client, Message, TextChannel} from "discord.js"
import {config} from "../config"
import {Friendly} from "../util/Friendly"
import {commands} from "./command"
import {listMatchClients, UPDATE_RATE} from "../orbs"

export let client: Client

export async function initDiscord(){
	client = new Client()
	console.log("Logging in")
	await client.login(config.discord.token)
	console.log("Waiting for ready")
//	await new Promise((resolve, reject) => {
//		client.on("ready", resolve)
//		client.on("error", reject)
//	})

	console.info("Connected to Discord")
	console.debug(`Invite link: https://discordapp.com/oauth2/authorize?scope=bot&client_id=${config.discord.clientId}`)

	await client.user.setActivity("bot startup", {type: "PLAYING"})

	client.on("message", msg => {
		onMessage(msg).catch(err => console.error(err))
	})

	setInterval(() => {
		let games = 0
		let players = 0
		for(const bot of listMatchClients){
			for(const spectator of bot.spectators){
				games++
				players += spectator.players.filter(player => !player.isBot).length
			}
		}
		client.user.setActivity(`${players} humans in ${games} games`, {type: "WATCHING"})
			.catch(err => console.error(err))
	}, UPDATE_RATE)
}

export async function onMessage(msg: Message){
	if(!msg.content.startsWith(",")){
		return
	}
	const args = msg.content.substr(1).split(/ +/)
	const cmdName = args.shift() as string
	const cmd = commands[cmdName]
	if(cmd !== undefined){
		await msg.react("🤔")
		console.log(`Handling command ,${cmdName} by ${msg.author.username} on ${msg.guild.name} #${(msg.channel as TextChannel).name}`)
		try{
			await cmd.executor(msg, args)
		}catch(e){
			if(e instanceof Friendly){
				await msg.react("⚠")
				await msg.reply(e.message)
			}else{
				await msg.react("🤕")
				await msg.reply("An internal error occurred")
				throw e;
			}
		}
		await msg.react("👌")
	}
}
