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
import {Command, parseUser} from "./index"
import {ignoreList} from "../index"
import {Friendly} from "../../util/Friendly"

export const IgnoreCommand: Command = {
	name: "ignore",
	description: "Internal stuff",
	executor: async(msg, args) => {
		if(adminList.indexOf(msg.author.id) < 0){
			await msg.react("😡")
			await msg.reply("Who do you think you are?")
			return
		}

		const user = parseUser(args[0])
		if(user === null){
			throw new Friendly("Usage: ,ignore <user>")
		}
		ignoreList[user] = true
		await msg.reply(`Ignoring user <@${user}> until bot restarts`)
	},
}
