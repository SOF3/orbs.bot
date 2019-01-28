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
import {plotLines} from "../../util/plotLines"
import {Attachment} from "discord.js"

export async function reportActivity(total: number, unit: number, name: string, unitName: string, unitCount: number){
	const bins = total / unit
	const data = await query<{units: number; cnt: number}>(`
					SELECT -x units, (
						SELECT COUNT(*) FROM game WHERE
							startTime < UNIX_TIMESTAMP() * 1000 - :unit * nat.x + :unit 
							AND (endTime >= UNIX_TIMESTAMP() * 1000 - :unit * nat.x OR endTime IS NULL)
					) cnt FROM natural_number nat WHERE 1 <= x AND x <= :bins
					ORDER BY units ASC`
		.replace(/:bins/g, bins.toString())
		.replace(/:total/g, total.toString())
		.replace(/:unit/g, unit.toString()))

	return await plotLines(
		`Server activity over the past ${name}`, unitName, "Games", "blue",
		data.map(row => [row.units * unitCount, row.cnt] as [number, number]))
}

export function registerActivityCommands(): Command[]{
	const UNIT_SECOND = 1000
	const UNIT_MINUTE = UNIT_SECOND * 60
	const UNIT_HOUR = UNIT_MINUTE * 60
	const UNIT_DAY = UNIT_HOUR * 24

	const lists: [string, number, number, string, number][] = [
		["week", UNIT_HOUR, 7 * UNIT_DAY, "days", 1 / 24], // 24 * 7 = 168 bins
		["day", 10 * UNIT_MINUTE, UNIT_DAY, "hours", 1 / 6], // 24 * 6 = 144 bins
		["hour", 30 * UNIT_SECOND, UNIT_HOUR, "minutes", 0.5], // 2 * 60 = 120 bins
	]

	return lists.map(setup => {
		const [name, unit, total, unitName, unitCount] = setup
		return {
			name: name,
			description: `Shows server activity over the past ${name}`,
			executor: async msg => {
				const image = await reportActivity(total, unit, name, unitName, unitCount)

				const files = [new Attachment(image, `${name}.png`)]
				console.log(`Sending ${name}.png`)
				await msg.reply({files: files})
			},
		} as Command
	})
}
