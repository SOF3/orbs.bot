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

// Information on this page was extracted from a sample on January 25, 2019

export type ListedOrb = {
	id: number
	ownerId: number // -1 implies not owned
	changedOwnerTime: number
	orbitBaseAng: number
	orbitDist: {
		distX: number
		baseDistYCycleAng: number
		distYMin: number
		distYMax: number
		distYRange: number
		distYChangeSpeed: number
	}
	sprite: {
		position: {
			x: number
			y: number
		}
	}
}

export type ListedPlayerBase = {
	id: number
	score: number // always 1 somehow
	name: string
	lastFiredTime: number
	lastFiredFromOrbId: number
}

export type ListedHumanPlayer = ListedPlayerBase & {
	isBot: false
	ws: number
}
export type ListedBotPlayer = ListedPlayerBase & {
	isBot: true
	nid: number
	thinkCyclesWithoutFiring: number
}

export type ListedPlayer = ListedHumanPlayer | ListedBotPlayer
