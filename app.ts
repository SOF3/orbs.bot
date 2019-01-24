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

import {Client, TextChannel} from "discord.js"
import {secrets} from "./secrets"
import {commands} from "./src/commands"
import {Friendly} from "./src/commands/Friendly"
import {ACTION_WEEKLY_RANKINGS, getWeekEnd, sendRequest} from "./src/orbs"
import {initPool} from "./src/orbs/pool"
import {logConsole, WEEKLY_FEED_CHANNEL_ID} from "./src/util"

export const bot = new Client()
bot.login(secrets.token).catch(err => logConsole(`Login error: ${err}`))

async function onBotReady(){
	logConsole(`Bot started. Invite link: https://discordapp.com/oauth2/authorize?scope=bot&client_id=${secrets.clientId}`)

	const weekEnd = await getWeekEnd()

	const moments = {
		1: "Last hour before the weekly competition ends. Will there be sudden plot twists?",
		12: "12 hours before the weekly competition ends. Work hard and make it to the top!",
		24: "24 hours before the weekly competition ends.",
		84: "Half of the week has passed!",
	}

	for(const hours in moments){
		const millis = parseInt(hours) * 3600 * 1000
		if(millis < weekEnd){
			setTimeout(() => {
				const channel = bot.channels.get(WEEKLY_FEED_CHANNEL_ID)
				if(channel instanceof TextChannel){
					channel.send(moments[hours]).catch(err => console.error(err))
				}
			}, millis)
		}
	}

	setTimeout(() => {
		const channel = bot.channels.get(WEEKLY_FEED_CHANNEL_ID) as TextChannel

		function send(content: string){
			channel.send(content).catch(err => console.error(err))
		}

		sendRequest(ACTION_WEEKLY_RANKINGS)
			.then(data => {
				const results = JSON.parse(data[1]).data as {
					name: string
					totGames: number
					totShots: number
					totHits: number
					totPoints: number
					numWins: number
					numTop3: number
				}[]

				function formAccuracyMessage(hits: number, shots: number){
					const accuracy = hits / shots
					const accuracyText = Math.round(accuracy * 1000) / 10
					const missText = Math.round((1 - accuracy) * 1000) / 10
					if(accuracy > 0.9){
						return `Admire the ${accuracyText}% accuracy they maintained among the ${shots} shots!`
					}
					if(accuracy < 0.3){
						return `But only ${accuracyText}% accuracy? The ${shots - hits} missed shots must have been humiliating!`
					}
					if(accuracy < 0.5){
						return `Better reduce the ${missText}% missed shots.`
					}
					return `Their ${accuracyText}% accuracy seems promising.`
				}

				send("The weekly competition has ended!")

				let rank = 1
				for(let i = 1; i <= 5; i++){
					const lines = results.slice(10 * i - 9, 10 * i).map(result =>
						`#${++rank}. **${result.name}** won ${result.numWins} in ${result.totGames} games`
						+ (result.numTop3 > result.numWins ? `(top 3 in ${result.numTop3} other games)` : "")
						+ " " + formAccuracyMessage(result.totHits, result.totShots))
					send(lines.join("\n"))
				}

			})

	}, weekEnd * 1000 - 60000) // let's make it one minute faster
}

bot.on("ready", () => {
	onBotReady().catch(err => console.error(err))
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
