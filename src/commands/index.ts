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

import {Message} from "discord.js"
import {HelpCommand} from "./help"
import {TopCommand} from "./top"
import {GamesCommand} from "./games"
import {ActivityCommand, DayCommand, HourCommand} from "./activity"
import {ReloadCommand} from "./reload"

export interface Command{
	name: string
	description: string
	args: string
	executor: (msg: Message, args: string[]) => Promise<void>
}

export const commands = {} as {[name: string]: Command}

export function addCommand(cmd: Command){
	commands[cmd.name] = cmd
}

addCommand(HelpCommand)
addCommand(TopCommand)
addCommand(GamesCommand)
addCommand(HourCommand)
addCommand(DayCommand)
addCommand(ActivityCommand)
addCommand(ReloadCommand)
