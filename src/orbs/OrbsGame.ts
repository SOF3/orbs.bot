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

import {logConsole} from "../util"
import {currentMinute} from "./logs"

export class OrbsGame{
	createTime: number = Date.now()
	sessionId: number
	players: {name: string, orbs: number}[] = []
	address: string

	constructor(sessionId: number, address: string){
		this.sessionId = sessionId
		this.address = address
	}

	updatePlayers(players: {name: string, orbs: number}[]){
		this.players = players
	}

	start(){
		logConsole(`Game ${this.sessionId} started on ${this.address}`)
		currentMinute.gameStarts++
	}

	end(){
		logConsole(`Removed game ${this.sessionId} with ${this.players.map(player => `${player.name}: ${player.orbs}`).join(", ")}`)
		logConsole(`Duration: ${(Date.now() - this.createTime) / 1000} seconds`)

		currentMinute.gameEnds++
	}
}
