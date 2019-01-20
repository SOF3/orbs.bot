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

import {Attachment, Message} from "discord.js"
import {Command} from "./index"
import {Friendly} from "./Friendly"
import {getCurrentMinuteTimestamp, minuteLogs} from "../orbs/logs"
import * as svg2png from "svg2png"
import {logConsole, plot2} from "../util"

const fn = (total, unit) => async(msg: Message) => {
	const x = [] as number[]
	const y1 = [] as number[]
	const y2 = [] as number[]
	const units = total / unit
	for(let i = units; i > 0; i--){
		x.push(-i)
		y1.push(0)
		y2.push(0)
	}
	const now = getCurrentMinuteTimestamp()
	for(const row of minuteLogs){
		const delta = Math.ceil((now - row.timestamp) / unit)
		const i = units - delta
		if(i >= 0 && i < units){
			y1[i] += row.gameStarts
			y2[i] += row.gameEnds
		}
	}

	const lightSettings = {
		title: `Server activity in the past ${total} minutes (unit = ${unit})`,
		colorBg: "white",
		x: x,
		labelX: "Time",
		colorX: "black",
		y1: y1,
		labelY1: "+",
		colorY1: "green",
		y2: y2,
		labelY2: "-",
		colorY2: "red",
	}
	const darkSettings = {
		title: `Server activity in the past ${total} minutes (unit = ${unit})`,
		colorBg: "black",
		x: x,
		labelX: "Time",
		colorX: "white",
		y1: y1,
		labelY1: "+",
		colorY1: "green",
		y2: y2,
		labelY2: "-",
		colorY2: "red",
	}

	const settings = {}
	settings[`${total}-${unit}-light.png`] = lightSettings
	settings[`${total}-${unit}-dark.png`] = darkSettings

	const png = {}
	for(const name in settings){
		const plot = plot2(settings[name])
		png[name] = await svg2png(new Buffer(plot.string), {width: plot.width, height: plot.height})
	}

	const files = []
	for(const name in png){
		files.push(new Attachment(png[name], name))
	}

	logConsole("Sending")
	await msg.reply({files: files})
}

export const HourCommand: Command = {
	name: "hour",
	description: "Show activity in the past hour, alias for ,act 06 1",
	args: "",
	executor: fn(60, 1),
}

export const DayCommand: Command = {
	name: "day",
	description: "Show activity in the past day, alias for ,act 1440 15",
	args: "",
	executor: fn(60 * 24, 15),
}

export const ActivityCommand: Command = {
	name: "act",
	description: "Show activity",
	args: "<total minutes> <step minutes>",
	executor: async(msg, args) => {
		const error = "Usage: `,activity <total minutes> <step minutes>`. Use `,hour` or `,day` if you can't understand."
		if(args.length < 2){
			throw new Friendly(error)
		}
		let total = parseInt(args[0])
		const unit = parseInt(args[1])
		if(total < 1 || unit < 1){
			throw new Friendly(error)
		}

		if(total <= unit || (total % unit) !== 0){
			throw new Friendly("`total minutes` must be a multiple of `unit minutes` and greater than `unit minutes`")
		}

		if(total > minuteLogs.length){
			total = minuteLogs.length
			total -= total % unit
			await msg.reply(`⚠ I don't have that much data! Truncated to totally ${total} minutes.`)
		}

		await fn(total, unit)(msg)
	},
}
