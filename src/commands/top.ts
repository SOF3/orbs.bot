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

import {Command} from "."
import {ACTION_WEEKLY_RANKINGS, sendRequest} from "../orbs"
import {logConsole} from "../util"

export const TopCommand: Command = {
	name: "top",
	description: "Shows top rankings",
	args: "",
	executor: async(msg, args) => {
		const data = await sendRequest(ACTION_WEEKLY_RANKINGS)
		if(parseInt(data[0]) !== ACTION_WEEKLY_RANKINGS){
			logConsole(`commands.top: data[0] = ${data[0]} != ${ACTION_WEEKLY_RANKINGS}`)
			throw "Internal error"
		}
		const results = JSON.parse(data[1]).data as {
			name: string
			totGames: number
			totShots: number
			totHits: number
			totPoints: number
			numWins: number
			numTop3: number
		}[]
		let output = ""
		let i = 0
		for(const result of results){
			output += `#${++i}) ${result.name}: won ${result.numWins} / ${result.numTop3} / ${result.totGames} games, ` +
				`${Math.round(result.totHits / result.totShots * 1000) / 10}% accuracy in ${result.totShots} hits.\n`
			if(i === 10){
				break
			}
		}

		await msg.reply(output)
	},
}
