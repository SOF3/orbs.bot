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

export const adminList = [
	"390090409159950338",
	"391734240699744256",
	"172779439736750080",
]

export function async<T = any>(fn: (cb: (err: any, value?: T) => void) => void): Promise<T>{
	return new Promise((resolve, reject) => {
		fn((err, value) => {
			if(err){
				reject(err)
			}else{
				resolve(value)
			}
		})
	})
}

export function makePromise<T>(){
	let resolve = undefined as any as (value: T) => void
	let reject = undefined as any as (err: any) => void
	const promise = new Promise<T>((p1, p2) => {
		resolve = p1
		reject = p2
	})
	return {promise, resolve, reject}
}

const units: [number, (n: number) => string][] = [
	[604800, n => `${n}wk`],
	[86400, n => `${n}d`],
	[3600, n => `${n}h`],
	[60, n => `${n}min`],
]

export function secondsToString(seconds: number | undefined){
	if(seconds === undefined){
		return "long long"
	}
	const pieces = [] as string[]
	for(const [base, fn] of units){
		if(seconds >= base * 2){
			const n = Math.floor(seconds / base)
			pieces.push(fn(n))
			seconds -= n * base
		}
	}
	if(seconds > 0){
		pieces.push(`${seconds}s`)
	}
	return pieces.join(" ")
}
