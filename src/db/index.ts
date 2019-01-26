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

import * as mysql from "mysql"
import {FieldInfo, MysqlError} from "mysql"
import {config} from "../index"

export let db: ReturnType<typeof mysql.createPool>

export function initDb(){
	db = mysql.createPool({
		host: config.mysql.host,
		user: config.mysql.username,
		password: config.mysql.password,
		database: config.mysql.database,
		connectionLimit: 16,
	})
}

export type RCell = number | string | Date
export type RRow<ResultCellType extends RCell> = {[column: string]: ResultCellType}
type RRD = RRow<RCell>

export function query<T extends RRD = RRD>(sql: string, args: any[], wantFields: true): Promise<{results: T[], fields: FieldInfo[]}>
export function query<T extends RRD = RRD>(sql: string, args?: any[], wantFields?: false): Promise<T[]>
export function query<T extends RRD = RRD>(sql: string, args: any[] = [], wantFields: boolean = false): Promise<{results: T[], fields: FieldInfo[]} | T[]>{
	console.debug(`SQL: ${sql} -- ${JSON.stringify(args)}`)
	return new Promise((resolve, reject) => {
		db.query({
			sql: sql,
			values: args,
		}, (err: MysqlError | null, results?: any, fields?: FieldInfo[]) => {
			if(err){
				reject(err)
			}else{
				resolve(wantFields ? {results: results, fields: fields} : results)
			}
		})
	})
}

export async function selectOne<T extends RRow<any>>(sql: string, args: any[]): Promise<T | null>{
	const result = await query<T>(sql, args)
	return result.length > 0 ? result[0] : null
}
