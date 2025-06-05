import {CardData, Rank, Suit} from './types'

export function convertToCard(cardCode: number): CardData {
	const suit = Math.floor(cardCode / 1000) as Suit
	const rank = (cardCode % 1000) as Rank
	if (rank < 2 || rank > 14 || suit < 1 || suit > 4) {
		throw new Error('Invalid card code')
	}
	return {rank, suit}
}

export function convertToCardCode(card: CardData): number {
	if (!isValidCard(card)) {
		throw new Error('Invalid card')
	}
	return card.suit * 1000 + card.rank
}

export function isValidCard(card: CardData): boolean {
	if (!card || typeof card !== 'object') return false
	const rank = getActualRank(card.rank)
	return (
		typeof card.rank === 'number' &&
		typeof card.suit === 'number' &&
		rank >= 2 &&
		rank <= 14 &&
		card.suit >= 1 &&
		card.suit <= 4
	)
}

/**
 * Gets the actual rank of a card from its card code
 * @param {number} cardCode - The card code
 * @returns {number} The actual rank (2-14)
 */
export function getActualRank(rank: number): number {
	return rank
}

export function sortCardsByRank(cards: CardData[]): CardData[] {
	return [...cards].sort((a, b) => {
		const rankA = getActualRank(a.rank)
		const rankB = getActualRank(b.rank)
		return rankB - rankA
	})
}

export function isFlush(cards: CardData[]): boolean {
	const firstSuit = cards[0].suit
	return cards.every((card) => card.suit === firstSuit)
}

export function isStraight(cards: CardData[]): boolean {
	const sortedCards = sortCardsByRank(cards)
	const ranks = sortedCards.map((card) => getActualRank(card.rank))

	if (ranks.join(',') === '14,5,4,3,2') {
		return true
	}

	for (let i = 1; i < ranks.length; i++) {
		if (ranks[i - 1] !== ranks[i] + 1) {
			return false
		}
	}
	return true
}

/**
 * Compares two hands to determine which is better
 * @param {CardData[]} cards1 - First hand to compare
 * @param {CardData[]} cards2 - Second hand to compare
 * @returns {number} 1 if cards1 is better, -1 if cards2 is better, 0 if equal
 */
export function compareHandValues(
	cards1: CardData[],
	cards2: CardData[],
): number {
	if (!cards1 && !cards2) return 0
	if (!cards1) return -1
	if (!cards2) return 1

	const sortedCards1 = sortCardsByRank(cards1)
	const sortedCards2 = sortCardsByRank(cards2)

	for (let i = 0; i < sortedCards1.length && i < sortedCards2.length; i++) {
		const rank1 = getActualRank(sortedCards1[i].rank)
		const rank2 = getActualRank(sortedCards2[i].rank)
		if (rank1 !== rank2) {
			return rank1 > rank2 ? 1 : -1
		}
	}

	// If ranks are equal, compare suits for the highest card
	const suit1 = sortedCards1[0].suit
	const suit2 = sortedCards2[0].suit
	if (suit1 !== suit2) {
		const suitOrder: {[key: number]: number} = {
			1: 4, // Hearts
			2: 3, // Diamonds
			3: 2, // Clubs
			4: 1, // Spades
		}
		return suitOrder[suit1] - suitOrder[suit2]
	}

	return 0
}

export function getRankCountsAndKickers(cards: CardData[]): {
	rankCounts: {[key: number]: number}
	kickers: number[]
} {
	const rankCounts: {[key: number]: number} = {}
	cards.forEach((card) => {
		const rank = getActualRank(card.rank)
		rankCounts[rank] = (rankCounts[rank] || 0) + 1
	})

	const kickers = Object.entries(rankCounts)
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		.filter(([_, count]) => count === 1)
		.map(([rank]) => parseInt(rank))
		.sort((a, b) => b - a)

	return {rankCounts, kickers}
}

/**
 * Generates all possible combinations of cards of a given size
 * @param {CardData[]} cards - Array of cards to generate combinations from
 * @param {number} size - Size of each combination
 * @returns {CardData[][]} Array of card combinations
 */
export function getCombinations(cards: CardData[], size: number): CardData[][] {
	const combinations: CardData[][] = []

	const combine = (current: CardData[], start: number) => {
		if (current.length === size) {
			combinations.push([...current])
			return
		}

		for (let i = start; i < cards.length; i++) {
			current.push(cards[i])
			combine(current, i + 1)
			current.pop()
		}
	}

	combine([], 0)
	return combinations
}
