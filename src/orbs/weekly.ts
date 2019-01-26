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

import {ACTION_WEEKLY_RANKINGS, rest} from "./rest"
import {TextChannel} from "discord.js"
import {client} from "../discord"
import {config} from "../config"
import {makeTopText} from "../discord/command/top"

export type WeeklyStatsDatum = {
	name: string
	totGames: number
	totShots: number
	totHits: number
	totPoints: number
	numWins: number
	numTop3: number
}

export async function weeklyStats(){
	const [, payload, weekTime] = await rest(ACTION_WEEKLY_RANKINGS)
	const {data} = JSON.parse(payload) as {
		data: WeeklyStatsDatum[]
	}
	const remaining = 604800 - parseInt(weekTime)
	return {data, remaining}
}

export async function scheduleWeeklyFeed(){
	const remaining = (await weeklyStats()).remaining * 1000

	const moments = {
		1: "Last hour before the weekly competition ends. Will there be sudden plot twists?",
		12: "12 hours before the weekly competition ends. Work hard and make it to the top!",
		24: "24 hours before the weekly competition ends.",
		84: "Half of the week has passed!",
	} as {[hours: number]: string}

	for(const hours in moments){
		const millis = parseInt(hours) * 3600 * 1000
		if(millis < remaining){
			setTimeout(() => {
				const channel = client.channels.get(config.discord.weeklyFeed) as TextChannel
				channel.send(moments[hours]).catch(err => console.error(err))
			}, remaining - millis)
			console.log(`Scheduled to execute automated message ${hours} after ${remaining - millis} ms`)
		}else{
			console.log(`Not scheduling ${hours} as ${millis} >= ${remaining}`)
		}
	}

	setTimeout(() => {
		(async() => {
			const {data} = await weeklyStats()
			const channel = client.channels.get(config.discord.weeklyFeed) as TextChannel
			await channel.send("The weekly competition has ended!")
			await channel.send(makeTopText(data))
		})().catch(err => console.error(err))
		setTimeout(scheduleWeeklyFeed, 86400 * 1000)
	}, remaining - 30000) // be 30 seconds early to prevent data reset
}
