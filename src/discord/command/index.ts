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

import {Message} from "discord.js"
import {RestartCommand} from "./restart"
import {GamesCommand} from "./games"
import {IgnoreCommand} from "./ignore"
import {TopCommand} from "./top"
import {StatusCommand} from "./status"
import {config} from "../../config"
import {registerActivityCommands} from "./activity"

export interface Command{
	name: string
	description: string
	executor: (msg: Message, args: string[]) => Promise<void>
}

export const commands = {} as {[name: string]: Command}

function registerCommand(command: Command){
	commands[command.name] = command
}

registerCommand({
	name: "help",
	description: "Shows this help page",
	executor: async msg => {
		const lines = [
			`Invite link: https://discordapp.com/oauth2/authorize?scope=bot&client_id=${config.discord.clientId}`,
			"**Available commands:**",
		]
		for(const name in commands){
			lines.push(`,${name}: ${commands[name].description}`)
		}
		await msg.reply(lines.join("\n"))
	},
})
registerCommand(RestartCommand)
registerCommand(GamesCommand)
registerCommand(TopCommand)
registerCommand(StatusCommand)
registerCommand(IgnoreCommand)
for(const cmd of registerActivityCommands()){
	registerCommand(cmd)
}

export function parseUser(arg: string): string | null{
	if(arg.match(/^[0-9]{10,}$/)) return arg
	if(arg.match(/^<@[0-9]{10,}>$/)) return arg.substring(2, arg.length - 1)
	return null
}
