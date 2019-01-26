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

import {makePromise} from "./index"

export class SyncLock{
	private locked: boolean = false
	private notify: (() => void)[] = []

	run<T>(fn: () => Promise<T>): Promise<T>{
		if(this.locked){
			const {promise, resolve, reject} = makePromise<T>()
			this.notify.push(() => {
				this.execute(fn)
					.then(resolve)
					.catch(reject)
			})
			return promise
		}

		return this.execute(fn)
	}

	private execute<T>(fn: () => Promise<T>){
		this.locked = true
		return fn()
			.then(value => {
				this.unlock()
				return value
			})
			.catch(err => {
				this.unlock()
				return Promise.reject(err)
			})
	}

	private unlock(){
		this.locked = false
		const next = this.notify.shift()
		if(next){
			next()
		}
	}
}
