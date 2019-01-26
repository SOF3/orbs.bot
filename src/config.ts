import {async} from "./util"
import * as fs from "fs"

export let config: {
	discord: {
		clientId: string
		clientSecret: string
		token: string
		weeklyFeed: string
	}

	mysql: {
		host: string
		username: string
		password: string
		database: string
	}

	orbs: {
		username: string
		password: string
		guid: number
	}
}

export async function loadConfig(){
	config = JSON.parse(await async(cb =>
		fs.readFile("/orbs/config/config.json", {encoding: "utf8"}, cb)))
}
