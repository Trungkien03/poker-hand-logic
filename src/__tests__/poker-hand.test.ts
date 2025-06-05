import {
	convertToCard,
	isFlush,
	isStraight,
	isValidCard,
	sortCardsByRank,
} from '../index'
import {CardData, Rank, Suit} from '../types'

describe('Poker Hand Evaluation', () => {
	describe('Card Validation', () => {
		test('should validate valid cards', () => {
			expect(isValidCard({suit: 1 as Suit, rank: 2 as Rank})).toBe(true)
			expect(isValidCard({suit: 2 as Suit, rank: 14 as Rank})).toBe(true)
			expect(isValidCard({suit: 3 as Suit, rank: 10 as Rank})).toBe(true)
		})

		test('should reject invalid cards', () => {
			expect(isValidCard({suit: 1 as Suit, rank: 1 as Rank})).toBe(false)
			expect(isValidCard({suit: 5 as Suit, rank: 2 as Rank})).toBe(false)
			expect(isValidCard({suit: 1 as Suit, rank: 15 as Rank})).toBe(false)
		})
	})

	describe('Card Conversion', () => {
		test('should convert card codes to card objects', () => {
			const card = convertToCard(1002) // 1 (suit) * 1000 + 2 (rank)
			expect(card).toEqual({
				rank: 2,
				suit: 1,
			})
		})
	})

	describe('Hand Evaluation', () => {
		test('should detect a flush', () => {
			const cards: CardData[] = [
				{suit: 1 as Suit, rank: 2 as Rank},
				{suit: 1 as Suit, rank: 5 as Rank},
				{suit: 1 as Suit, rank: 7 as Rank},
				{suit: 1 as Suit, rank: 9 as Rank},
				{suit: 1 as Suit, rank: 13 as Rank},
			]
			expect(isFlush(cards)).toBe(true)
		})

		test('should detect a straight', () => {
			const cards: CardData[] = [
				{suit: 1 as Suit, rank: 2 as Rank},
				{suit: 2 as Suit, rank: 3 as Rank},
				{suit: 3 as Suit, rank: 4 as Rank},
				{suit: 4 as Suit, rank: 5 as Rank},
				{suit: 1 as Suit, rank: 6 as Rank},
			]
			expect(isStraight(cards)).toBe(true)
		})

		test('should sort cards by rank', () => {
			const cards: CardData[] = [
				{suit: 1 as Suit, rank: 2 as Rank},
				{suit: 2 as Suit, rank: 14 as Rank},
				{suit: 3 as Suit, rank: 13 as Rank},
				{suit: 4 as Suit, rank: 3 as Rank},
				{suit: 1 as Suit, rank: 10 as Rank},
			]
			const sorted = sortCardsByRank(cards)
			expect(sorted[0].rank).toBe(14)
			expect(sorted[4].rank).toBe(2)
		})
	})
})
