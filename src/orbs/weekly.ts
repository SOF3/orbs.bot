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

export async function weeklyStats(){
	const [, payload, weekTime] = await rest(ACTION_WEEKLY_RANKINGS)
	const {data} = JSON.parse(payload) as {
		data: {
			name: string
			totGames: number
			totShots: number
			totHits: number
			totPoints: number
			numWins: number
			numTop3: number
		}[]
	}
	const remaining = 604800 - parseInt(weekTime)
	return {data, remaining}
}
