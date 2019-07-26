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
import {weeklyStats, WeeklyStatsDatum} from "../../orbs/weekly"
import {secondsToString} from "../../util"

export const TopCommand: Command = {
	name: "top",
	description: "Show weekly rankings",
	executor: async msg => {
		const {data, remaining} = await weeklyStats()
		await msg.reply(`Weekly competition ends in ${secondsToString(remaining)}\n` + makeTopText(data))
	},
}

export function makeTopText(data: WeeklyStatsDatum[]){
	let output = [] as string[]
	let rank = 1
	for(const result of data){
		const text = `#${rank++}. **${result.name}** won ${result.numWins} in ${result.totGames} games`
			+ (result.numTop3 > result.numWins ? `(top 3 in ${result.numTop3 - result.numWins} other games)` : "")
			+ ". " + makeAccuracyText(result.totHits, result.totShots)
		output.push(text)
		if(rank > 15){
			break
		}
	}
	return output.join("\n")
}

export function makeAccuracyText(hits: number, shots: number){
	const accuracy = hits / shots
	const accuracyText = Math.round(accuracy * 1000) / 10
	const missText = Math.round((1 - accuracy) * 1000) / 10
	if(accuracy > 0.8){
		return `Admire their ${accuracyText}% accuracy among the ${shots} shots!`
	}
	if(accuracy < 0.4){
		return `But only ${accuracyText}% accuracy? The ${shots - hits} missed shots must have been humiliating!`
	}
	if(accuracy < 0.55){
		return `Better reduce the ${missText}% missed shots.`
	}
	if(accuracy > 0.65){
		return `Keep refining your ${accuracyText}% accuracy!`
	}
	return `${accuracyText}% accuracy looks nice.`
}

