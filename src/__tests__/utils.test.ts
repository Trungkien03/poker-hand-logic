import {
	convertToCard,
	convertToCardCode,
	isValidCard,
	getActualRank,
	sortCardsByRank,
	isFlush,
	isStraight,
	compareHandValues,
	getRankCountsAndKickers,
	getCombinations,
} from '../utils'
import {CardData, Rank, Suit} from '../types'

describe('Poker Utils', () => {
	describe('Card Conversion', () => {
		test('should convert card code to card object', () => {
			const card = convertToCard(1002) // 1 (suit) * 1000 + 2 (rank)
			expect(card).toEqual({
				rank: 2,
				suit: 1,
			})
		})

		test('should convert card object to card code', () => {
			const card: CardData = {rank: 2, suit: 1}
			const code = convertToCardCode(card)
			expect(code).toBe(1002)
		})

		test('should throw error for invalid card code', () => {
			expect(() => convertToCard(0)).toThrow('Invalid card code')
			expect(() => convertToCard(5000)).toThrow('Invalid card code')
		})
	})

	describe('Card Validation', () => {
		test('should validate valid cards', () => {
			expect(isValidCard({suit: 1 as Suit, rank: 2 as Rank})).toBe(true)
			expect(isValidCard({suit: 4 as Suit, rank: 14 as Rank})).toBe(true)
		})

		test('should reject invalid cards', () => {
			expect(isValidCard({suit: 0 as Suit, rank: 2 as Rank})).toBe(false)
			expect(isValidCard({suit: 5 as Suit, rank: 2 as Rank})).toBe(false)
			expect(isValidCard({suit: 1 as Suit, rank: 1 as Rank})).toBe(false)
			expect(isValidCard({suit: 1 as Suit, rank: 15 as Rank})).toBe(false)
		})
	})

	describe('Card Ranking', () => {
		test('should get actual rank', () => {
			expect(getActualRank(14)).toBe(14)
			expect(getActualRank(2)).toBe(2)
		})

		test('should sort cards by rank', () => {
			const cards: CardData[] = [
				{suit: 1, rank: 2},
				{suit: 2, rank: 14},
				{suit: 3, rank: 7},
			]
			const sorted = sortCardsByRank(cards)
			expect(sorted[0].rank).toBe(14)
			expect(sorted[1].rank).toBe(7)
			expect(sorted[2].rank).toBe(2)
		})
	})

	describe('Hand Evaluation', () => {
		test('should detect flush', () => {
			const cards: CardData[] = [
				{suit: 1, rank: 2},
				{suit: 1, rank: 5},
				{suit: 1, rank: 7},
				{suit: 1, rank: 9},
				{suit: 1, rank: 13},
			]
			expect(isFlush(cards)).toBe(true)
		})

		test('should detect non-flush', () => {
			const cards: CardData[] = [
				{suit: 1, rank: 2},
				{suit: 2, rank: 5},
				{suit: 1, rank: 7},
				{suit: 1, rank: 9},
				{suit: 1, rank: 13},
			]
			expect(isFlush(cards)).toBe(false)
		})

		test('should detect straight', () => {
			const cards: CardData[] = [
				{suit: 1, rank: 2},
				{suit: 2, rank: 3},
				{suit: 3, rank: 4},
				{suit: 4, rank: 5},
				{suit: 1, rank: 6},
			]
			expect(isStraight(cards)).toBe(true)
		})

		test('should detect ace-low straight', () => {
			const cards: CardData[] = [
				{suit: 1, rank: 14},
				{suit: 2, rank: 2},
				{suit: 3, rank: 3},
				{suit: 4, rank: 4},
				{suit: 1, rank: 5},
			]
			expect(isStraight(cards)).toBe(true)
		})

		test('should detect non-straight', () => {
			const cards: CardData[] = [
				{suit: 1, rank: 2},
				{suit: 2, rank: 4},
				{suit: 3, rank: 6},
				{suit: 4, rank: 8},
				{suit: 1, rank: 10},
			]
			expect(isStraight(cards)).toBe(false)
		})
	})

	describe('Hand Comparison', () => {
		test('should compare hands correctly', () => {
			const hand1: CardData[] = [
				{suit: 1, rank: 14},
				{suit: 1, rank: 13},
				{suit: 1, rank: 12},
				{suit: 1, rank: 11},
				{suit: 1, rank: 10},
			]
			const hand2: CardData[] = [
				{suit: 2, rank: 14},
				{suit: 2, rank: 13},
				{suit: 2, rank: 12},
				{suit: 2, rank: 11},
				{suit: 2, rank: 9},
			]
			expect(compareHandValues(hand1, hand2)).toBe(1)
			expect(compareHandValues(hand2, hand1)).toBe(-1)
			expect(compareHandValues(hand1, hand1)).toBe(0)
		})
	})

	describe('Rank Analysis', () => {
		test('should get rank counts and kickers', () => {
			const cards: CardData[] = [
				{suit: 1, rank: 14},
				{suit: 2, rank: 14},
				{suit: 3, rank: 14},
				{suit: 4, rank: 2},
				{suit: 1, rank: 2},
			]
			const result = getRankCountsAndKickers(cards)
			expect(result.rankCounts[14]).toBe(3)
			expect(result.rankCounts[2]).toBe(2)
			expect(result.kickers).toEqual([])
		})
	})

	describe('Combinations', () => {
		test('should generate combinations', () => {
			const cards: CardData[] = [
				{suit: 1, rank: 14},
				{suit: 2, rank: 13},
				{suit: 3, rank: 12},
			]
			const combinations = getCombinations(cards, 2)
			expect(combinations).toHaveLength(3)
			expect(combinations[0]).toHaveLength(2)
		})
	})
})
