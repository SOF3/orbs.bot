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

import {Command} from "./index"
import * as process from "process"

export const ReloadCommand: Command = {
	name: "reload",
	description: "Don't use this command.",
	args: "",
	executor: async(msg) => {
		if(msg.author.id === "390090409159950338"){
			process.exit(0)
		}else{
			await msg.react("😡")
			await msg.reply("Who do you think you are?")
		}
	},
}
