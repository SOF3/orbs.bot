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

import * as ws from "websocket"
import {makePromise} from "../util"

export abstract class OrbsClient{
	static readonly GAME_LIST = 38
	static readonly JOIN_MATCH = 6
	static readonly ORBS_PLAYERS_LIST = 8
	static readonly SHOOT = 10 // orbId, timestamp, x, y
	static readonly CONQUER = 11 // orbId, playerId, timestamp
	static readonly RESULTS = 14
	static readonly SHIELD = 21 // orbId, timestamp
	static readonly BOMB = 23 // orbId, timestamp

	readonly address: string
	ws: ws.client
	conn: ws.connection

	constructor(address: string){
		this.address = address
	}

	async prepare(){
		this.ws = new ws.client()

		const {promise, resolve, reject} = makePromise<ws.connection>()
		this.ws.on("connect", resolve)
		this.ws.on("connectFailed", reject)

		this.ws.connect(`ws://${this.address}/`)
		this.conn = await promise

		await this.init()

		this.conn.on("message", message => {
			if(message.utf8Data === undefined){
				return
			}
			const data = message.utf8Data.split("\t")
			this.handleMessage(parseInt(data[0]), data.slice(1))
				.catch(err => console.error(err))
		})

		return this
	}

	protected abstract init(): Promise<void>

	protected sendMessage(id: number, ...args: (string | number)[]){
		this.conn.sendUTF([id.toString()].concat(args.map(arg => arg.toString())).join("\t"))
	}

	protected abstract handleMessage(id: number, data: string[]): Promise<void>
}
