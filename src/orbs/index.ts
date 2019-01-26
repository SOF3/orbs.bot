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

import {listServers} from "./rest"
import {OrbsListMatchClient} from "./OrbsListMatchClient"
import {query} from "../db"

export const EMOJI_LIST: string[] = ["🍎", "🍌", "🍇", "🥝", "🥔", "🍥", "🍡", "🥠"]
export const EMOJI_QUESTION: string = "❓"

export const UPDATE_RATE = 3000

export let listMatchClients: OrbsListMatchClient[] = []

export async function initOrbs(){
	await query("UPDATE game SET endTime = UNIX_TIMESTAMP() * 1000, badEnd = TRUE WHERE endTime IS NULL")

	console.log("Listing orbs servers")
	const serverList = await listServers()
	listMatchClients = await Promise.all(serverList.map(address => {
		console.log(`Connecting to ${address}`)
		const client = new OrbsListMatchClient(address)
		return client.prepare()
	}))
}
