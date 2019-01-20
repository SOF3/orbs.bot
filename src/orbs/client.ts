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

import {WEBSOCKET_GAME_LIST} from "./index"
import * as ws from "websocket"
import {OrbsGame} from "./OrbsGame"
import {logConsole} from "../util"

export class OrbsClient{
	address: string
	client: ws.client
	conn: ws.connection

	games: {[sessionId: string]: OrbsGame} = {}

	constructor(address: string, onConnect: (client: OrbsClient) => void, onError: () => void){
		this.address = address
		this.client = new ws.client()
		this.client.on("connect", (conn) => {
			logConsole(`Connected to ws://${address}`)
			onConnect(this)
			this.conn = conn
			this.init()
		})
		this.client.on("connectFailed", (err) => {
			logConsole(`Connection to ws://${address} failed: ${err}`)
			onError()
		})
		this.client.connect("ws://" + address + "/")
	}

	init(){
		setInterval(() => {
			this.conn.sendUTF(WEBSOCKET_GAME_LIST.toString())
		}, 3000)

		this.conn.on("message", (message) => {
			const data = message.utf8Data.split("\t")
			// console.info(`Received message: ${data}`)
			switch(parseInt(data[0])){
				case WEBSOCKET_GAME_LIST:
					this.updateGameList(data.slice(1))
			}
		})
	}

	updateGameList(args: string[]){
		let i = 0
		const list = {} as {[sessionId: string]: OrbsGame}
		while(i < args.length){
			const game = new OrbsGame(parseInt(args[i++]), this.address)
			while(i < args.length - 1 && args[i] !== "*"){
				game.players.push({name: args[i], orbs: parseInt(args[i + 1])})
				i += 2
			}
			list[game.sessionId] = game
			i++
		}

		// merge game list
		const sessionIds = [] as string[]
		for(const sessionId in this.games){
			sessionIds.push(sessionId)
		}
		for(const sessionId of sessionIds){
			const game = this.games[sessionId]
			if(list[sessionId] === undefined){
				game.end()
				delete this.games[sessionId]
			}else{
				const newGame = list[sessionId]
				delete list[sessionId]
				game.updatePlayers(newGame.players)
			}
		}
		for(const sessionId in list){
			const game: OrbsGame = list[sessionId]
			game.start()
			this.games[sessionId] = game
		}
	}
}
