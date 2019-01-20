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

export function delay(ms){
	return new Promise(resolve => setTimeout(resolve, ms))
}

export function logConsole(message: String){
	console.info(`[${new Date().toISOString()}] ${message}`)
}

export function cb2promise<T>(fn: (fn: (err: any, result?: T) => void) => void): Promise<T>{
	return new Promise((resolve, reject) => {
		fn((err, result) => {
			if(err){
				reject(err)
			}else{
				resolve(result)
			}
		})
	})
}

export function plot2(parameters: {
	title: string,
	colorBg: string,
	x: number[],
	labelX: string,
	colorX: string,
	y1: number[],
	labelY1: string,
	colorY1: string,
	y2: number[],
	labelY2: string,
	colorY2: string
}){
	let {title, colorBg, x, labelX, colorX, y1, labelY1, colorY1, y2, labelY2, colorY2} = parameters
	let result = ""

	const width = x.length
	let height1 = 0
	for(const datum of y1){
		if(datum > height1){
			height1 = datum
		}
	}
	let height2 = 0
	for(const datum of y2){
		if(datum > height2){
			height2 = datum
		}
	}

	const plotWidth = 500
	const plotHeight = 100
	const paddingTop = 50
	const paddingBottom = 50
	const paddingLeft = 50
	const paddingRight = 50
	const textPadding = 10

	const unitWidth = plotWidth / width
	const unitHeight1 = plotHeight / height1
	const unitHeight2 = plotHeight / height2

	result += `<?xml version="1.0" encoding="utf-8" ?>`
	result += `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="${plotWidth + paddingLeft + paddingRight}" height="${plotHeight + paddingTop + paddingBottom}">`

	result += `<rect width="100%" height="100%" fill="${colorBg}"/>`

	result += `<text x="${paddingLeft + plotWidth / 2 - title.length * 4}" y="${paddingTop - textPadding}" stroke="${colorX}">${title}</text>`
	result += `<text x="${paddingLeft + plotWidth / 2 - labelX.length * 4}" y="${paddingTop + plotHeight + paddingBottom - textPadding}" stroke="${colorX}">${labelX}</text>`

	result += `<text x="${textPadding}" y="${paddingTop}" stroke="${colorY1}">${height1}</text>`
	result += `<text x="${paddingLeft + plotWidth + textPadding}" y="${paddingTop}" stroke="${colorY2}">${height2}</text>`

	result += `<text x="${textPadding}" y="${paddingTop + plotHeight / 2}" stroke="${colorY1}">${labelY1}</text>`
	result += `<text x="${paddingLeft + plotWidth + textPadding}" y="${paddingTop + plotHeight / 2}" stroke="${colorY2}">${labelY2}</text>`

	result += `<line x1="${paddingLeft}" x2="${paddingLeft}" y1="${paddingTop}" y2="${paddingTop + plotHeight}" stroke="${colorX}"/>`
	result += `<line x1="${paddingLeft + plotWidth}" x2="${paddingLeft + plotWidth}" y1="${paddingTop}" y2="${paddingTop + plotHeight}" stroke="${colorX}"/>`
	result += `<line x1="${paddingLeft}" x2="${paddingLeft + plotWidth}" y1="${paddingTop + plotHeight}" y2="${paddingTop + plotHeight}" stroke="${colorX}"/>`

	for(let i = 1; i < width; i++){
		result += `<line x1="${paddingLeft + unitWidth * (i - 1)}" x2="${paddingLeft + unitWidth * i}"
				y1="${paddingTop + plotHeight - unitHeight1 * y1[i - 1]}"
				y2="${paddingTop + plotHeight - unitHeight1 * y1[i]}"
				stroke="${colorY1}"/>`

		result += `<line x1="${paddingLeft + unitWidth * (i - 1)}" x2="${paddingLeft + unitWidth * i}"
				y1="${paddingTop + plotHeight - unitHeight2 * y2[i - 1]}"
				y2="${paddingTop + plotHeight - unitHeight2 * y2[i]}"
				stroke="${colorY2}"/>`
	}

	result += `</svg>`

	return {
		string: result,
		width: paddingLeft + plotWidth + paddingRight,
		height: paddingTop + plotHeight + paddingBottom,
	}
}
