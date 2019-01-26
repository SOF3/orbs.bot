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

import * as request from "request-promise-native"

const SERVER_ADDRESS = "http://85.10.196.164:19330/"

export const ACTION_WEEKLY_RANKINGS = 18
export const ACTION_LIST_SERVERS = 37

export async function rest(action: number, extraParams: any = {}): Promise<string[]>{
	let uri = `${SERVER_ADDRESS}?action=${action}`
	for(const name in extraParams){
		if(extraParams.hasOwnProperty(name)){
			uri += `&${encodeURIComponent(name)}=${encodeURIComponent(extraParams[name])}`
		}
	}

	const response = await request(uri)
	return response.split("\t")
}

export async function listServers(): Promise<string[]>{
	const servers = await rest(ACTION_LIST_SERVERS)
	return servers.slice(1)
}
