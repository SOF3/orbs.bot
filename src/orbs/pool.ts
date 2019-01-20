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

import {ACTION_LIST_SERVERS, sendRequest} from "./index"
import {bot} from "../../app"
import {OrbsClient} from "./client"
import {logConsole} from "../util"

const pool = [] as OrbsClient[]

export function getClients(){
	return pool
}

export async function initPool(){
	const servers = await sendRequest(ACTION_LIST_SERVERS)
	if(parseInt(servers[0]) !== ACTION_LIST_SERVERS){
		throw `servers[0] = ${servers[0]}`
	}
	const promises = []
	for(let i = 1; i < servers.length; i++){
		promises.push(new Promise((resolve, reject) => {
			new OrbsClient(servers[i], client => {
				pool.push(client)
				resolve()
			}, reject)
		}))
	}
	await Promise.all(promises)
	await bot.user.setPresence({
		afk: false,
		status: "online",
		game: {
			name: `${pool.length} servers on orbs.it`,
			type: "WATCHING",
			url: "http://orbs.it/game/index.html",
		},
	})
	logConsole(`Watching ${pool.length} servers on orbs.it`)

	setInterval(() => {
		const stats = countGames()
		bot.user.setPresence({
			afk: false,
			status: "online",
			game: {
				type: "WATCHING",
				name: `${stats.players} players in ${stats.games} games on ${pool.length} orbs.it servers`,
				url: "http://orbs.it/game/index.html",
			},
		})
	}, 3000)
}

export function countGames(): {games: number, players: number}{
	const ret = {games: 0, players: 0}
	for(const client of pool){
		for(const sessionId in client.games){
			ret.games++
			ret.players += client.games[sessionId].players.length
		}
	}
	return ret
}
