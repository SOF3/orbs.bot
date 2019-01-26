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

import {initDiscord} from "./discord"
import {initOrbs} from "./orbs"
import {initDb} from "./db"
import {loadConfig} from "./config"

async function main(){
	console.log("Loading config...")
	await loadConfig()

	console.log("Connecting to db")
	await initDb()
	console.log("Connecting to Discord")
	await initDiscord()
	console.log("Connecting to orbs")
	await initOrbs()
}

main().catch(err => {
	console.error(err)
})
