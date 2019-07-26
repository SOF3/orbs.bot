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

import {Command} from "./index"
import {EMOJI_LIST} from "../../orbs"
import {Message} from "discord.js"
import {secondsToString} from "../../util"

export const ReplayCommand: Command = {
	name: "replay",
	description: "Replay game by game ID",
	executor: async(msg) => {
	},
}
/*
function createMessage() {
	for()
	let output = `Replaying game ${id} on ${new Date(startTime).toISOString()}: ${secondsToString(elapsed)} of ${secondsToString(endGameTime)}\n`

	output += `\nPlayers: ${players.map((p, i) => EMOJI_LIST[i] + p.name + (p.isBot ? "🤖" : "")).join(" · ")}\n`

}*/
