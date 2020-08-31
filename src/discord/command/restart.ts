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

import {adminList} from "../../util"
import {Command} from "./index"
import {client} from "../index"

export const RestartCommand: Command = {
	name: "restart",
	description: "Internal stuff",
	executor: async msg => {
		if(adminList.indexOf(msg.author.id) >= 0){
			await msg.react("😴")
			await client.user.setActivity("bot restart", {type: "PLAYING"})
			process.exit(0)
		}
		await msg.react("😡")
		await msg.reply("Who do you think you are?")
	},
}
