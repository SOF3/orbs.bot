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

import * as request from "request"
import {logConsole} from "../util"

export const serverAddress = "http://85.10.196.164:19330/"

export function sendRequest(action: number, extraParams: string = ""): Promise<string[3]>{
	return new Promise((resolve, reject) => {
		const url = serverAddress + `?action=${action}${extraParams}`
		logConsole(`URL request: ${url}`)
		request(url, (err, res, body) => {
			if(err){
				reject(err)
				return
			}
			const params = body.split("\t")
			resolve(params)
		})
	})
}

export async function getWeekEnd(){
	const [, , time] = await sendRequest(ACTION_WEEKLY_RANKINGS)
	const remaining = 60 * 60 * 24 * 7 - parseInt(time)
	return remaining
}

export const ACTION_WEEKLY_RANKINGS = 18

export const ACTION_LIST_SERVERS = 37

export const WEBSOCKET_GAME_LIST = 38
