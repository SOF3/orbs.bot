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
import * as fs from "fs"

logConsole("Initializing logs")

export const minuteLogs = [] as MinuteLog[]

interface MinuteLog{
	timestamp: number
	gameStarts: number
	gameEnds: number
}

const logFile = "orbs.log"

if(fs.existsSync(logFile)){
	logConsole("Loading orbs.log")
	let lines = 0
	for(const line of fs.readFileSync(logFile, {encoding: "utf8"}).split("\n")){
		if(line.length >= 2){
			const fields = line.split(",")
			minuteLogs.push({
				timestamp: parseInt(fields[0]),
				gameStarts: parseInt(fields[1]),
				gameEnds: parseInt(fields[2]),
			})
			lines++
		}
	}
	logConsole(`Loaded ${lines} lines`)
}

setInterval(() => {
	const ws = fs.createWriteStream(logFile, {encoding: "utf8"})
	ws.on("open", () => {
		for(const minute of minuteLogs){
			ws.write(`${minute.timestamp},${minute.gameStarts},${minute.gameEnds}\n`)
		}
		ws.end()
		logConsole(`Saved cache of ${minuteLogs.length} entries`)
	})
}, 120000)


export let currentMinute: MinuteLog

export function getCurrentMinuteTimestamp(){
	return Math.floor(Date.now() / 60000)
}

function refreshMinute(){
	const now = getCurrentMinuteTimestamp()
	let removes = 0
	while(minuteLogs.length > 0 && (now - minuteLogs[0].timestamp) > 60 * 24 * 7){ // log up to 7 days of data
		minuteLogs.shift()
		removes++
	}
	if(removes > 0){
		logConsole(`Removed ${removes} cache entries, minuteLogs.length = ${minuteLogs.length}`)
	}
	if(currentMinute !== undefined && now !== currentMinute.timestamp){
		minuteLogs.push(currentMinute)
		currentMinute = undefined
	}
	if(currentMinute === undefined){
		currentMinute = {
			timestamp: now,
			gameStarts: 0,
			gameEnds: 0,
		}
	}

	setTimeout(refreshMinute, 1000)
}

refreshMinute()
