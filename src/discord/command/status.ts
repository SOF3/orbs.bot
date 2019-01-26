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

import * as os from "os"
import * as process from "process"
import {Command} from "./index"
import {adminList} from "../../util"

export const StatusCommand: Command = {
	name: "status",
	description: "Internal stuff",
	executor: async msg => {
		if(adminList.indexOf(msg.author.id) < 0){
			await msg.react("😡")
			await msg.reply("Who do you think you are?")
			return
		}

		const info = []
		info.push(`os.hostname: ${os.hostname()}`)
		info.push(`os.loadavg: ${os.loadavg()}`)
		info.push(`os.uptime: ${os.uptime()}`)
		info.push(`os.freemem: ${os.freemem()}`)
		info.push(`os.totalmem: ${os.totalmem()}`)
		info.push(`os.cpus: ${JSON.stringify(os.cpus())}`)
		info.push(`os.type: ${os.type()}`)
		info.push(`os.release: ${os.release()}`)
		info.push(`os.networkInterfaces: ${JSON.stringify(os.networkInterfaces())}`)
		info.push(`os.homedir: ${os.homedir()}`)
		info.push(`os.userInfo: ${JSON.stringify(os.userInfo())}`)
		info.push(`os.arch: ${os.arch()}`)
		info.push(`os.platform: ${os.platform()}`)
		info.push(`os.tmpdir: ${os.tmpdir()}`)
		info.push(`os.endianness: ${os.endianness()}`)

		info.push(`process.execPath: ${process.execPath}`)
		info.push(`process.cwd: ${process.cwd()}`)
		info.push(`process.version: ${process.version}`)
		info.push(`process.versions: ${JSON.stringify(process.versions)}`)
		info.push(`process.pid: ${process.pid}`)
		info.push(`process.title: ${process.title}`)
		info.push(`process.arch: ${process.arch}`)
		info.push(`process.platform: ${process.platform}`)
		info.push(`process.memoryUsage: ${JSON.stringify(process.memoryUsage())}`)
		info.push(`process.cpuUsage: ${JSON.stringify(process.cpuUsage())}`)
		info.push(`process.uptime: ${process.uptime()}`)
		info.push(`process.release: ${JSON.stringify(process.release)}`)

		await msg.reply(info.join("\n"))
	},
}
