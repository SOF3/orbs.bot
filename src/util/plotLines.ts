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

import * as fs from "fs"
import * as util from "util"
import * as childProcess from "child_process"
import {async} from "./index"
import {SyncLock} from "./SyncLock"

const lock = new SyncLock()

export function plotLines(title: string, xLabel: string, yLabel: string, color: string, data: [number, number][]): Promise<Buffer>{
	return lock.run(async() => {
		const quote = (str: string) => `"${str.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}"`

		const meta = fs.createWriteStream("meta.csv")
		await new Promise(resolve => meta.on("open", resolve))
		await async(cb => meta.write("title,xlab,ylab,col\n", cb))
		await async(cb => meta.write([title, xLabel, yLabel, color].map(quote).join(",") + "\n", cb))
		meta.close()

		const input = fs.createWriteStream("input.csv")
		await new Promise(resolve => input.on("open", resolve))
		await async(cb => input.write(`x,y\n`, cb))
		for(const [x, y] of data){
			await async(cb => input.write(`${x},${y}\n`, cb))
		}
		input.close()

		console.log("Executing Rscript plot/lines.R")
		await util.promisify(childProcess.exec)("Rscript plot/lines.R")
		const result = await async(cb => fs.readFile("output.png", cb))
		await async(cb => fs.unlink("output.png", cb))
		return result
	})
}
