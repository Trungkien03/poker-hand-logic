import {getBestHandCombination, evaluateWinners} from '../evaluate'
import {CardData, PlayerHand, Suit, Rank} from '../types'

describe('Poker Hand Evaluation', () => {
	describe('getBestHandCombination', () => {
		test('should throw error for invalid input', () => {
			expect(() => getBestHandCombination(null as any)).toThrow(
				'Invalid input: cards must be an array',
			)
			expect(() => getBestHandCombination([])).not.toThrow()
			expect(() => getBestHandCombination([{suit: 1, rank: 2}])).not.toThrow()
			expect(() =>
				getBestHandCombination(Array(11).fill({suit: 1, rank: 2})),
			).toThrow('Invalid input: 1-10 cards required')
		})

		test('should handle empty hand', () => {
			const result = getBestHandCombination([])
			expect(result).toEqual({
				handRankTitle: 'No Hand',
				handRankLevel: 0,
				handRankDescription: 'No hand is made.',
				bestFiveCards: [],
			})
		})

		test('should handle single card hand', () => {
			const result = getBestHandCombination([{suit: 1, rank: 14}])
			expect(result).toEqual({
				handRankTitle: 'High Card',
				handRankLevel: 10,
				handRankDescription:
					'If no other hand is made, the highest card plays.',
				bestFiveCards: [{suit: 1, rank: 14}],
			})
		})

		test('should detect royal flush', () => {
			const cards: CardData[] = [
				{suit: 1, rank: 14}, // Ace
				{suit: 1, rank: 13}, // King
				{suit: 1, rank: 12}, // Queen
				{suit: 1, rank: 11}, // Jack
				{suit: 1, rank: 10}, // Ten
			]
			const result = getBestHandCombination(cards)
			expect(result.handRankTitle).toBe('Royal Flush')
			expect(result.handRankLevel).toBe(1)
		})

		test('should detect straight flush', () => {
			const cards: CardData[] = [
				{suit: 1, rank: 9},
				{suit: 1, rank: 8},
				{suit: 1, rank: 7},
				{suit: 1, rank: 6},
				{suit: 1, rank: 5},
			]
			const result = getBestHandCombination(cards)
			expect(result.handRankTitle).toBe('Straight Flush')
			expect(result.handRankLevel).toBe(2)
		})

		test('should detect four of a kind', () => {
			const cards: CardData[] = [
				{suit: 1, rank: 14},
				{suit: 2, rank: 14},
				{suit: 3, rank: 14},
				{suit: 4, rank: 14},
				{suit: 1, rank: 2},
			]
			const result = getBestHandCombination(cards)
			expect(result.handRankTitle).toBe('Four of a Kind')
			expect(result.handRankLevel).toBe(3)
		})

		test('should detect full house', () => {
			const cards: CardData[] = [
				{suit: 1, rank: 14},
				{suit: 2, rank: 14},
				{suit: 3, rank: 14},
				{suit: 1, rank: 2},
				{suit: 2, rank: 2},
			]
			const result = getBestHandCombination(cards)
			expect(result.handRankTitle).toBe('Full House')
			expect(result.handRankLevel).toBe(4)
		})

		test('should detect flush', () => {
			const cards: CardData[] = [
				{suit: 1, rank: 14},
				{suit: 1, rank: 11},
				{suit: 1, rank: 8},
				{suit: 1, rank: 5},
				{suit: 1, rank: 2},
			]
			const result = getBestHandCombination(cards)
			expect(result.handRankTitle).toBe('Flush')
			expect(result.handRankLevel).toBe(5)
		})

		test('should detect straight', () => {
			const cards: CardData[] = [
				{suit: 1, rank: 9},
				{suit: 2, rank: 8},
				{suit: 3, rank: 7},
				{suit: 4, rank: 6},
				{suit: 1, rank: 5},
			]
			const result = getBestHandCombination(cards)
			expect(result.handRankTitle).toBe('Straight')
			expect(result.handRankLevel).toBe(6)
		})

		test('should detect three of a kind', () => {
			const cards: CardData[] = [
				{suit: 1, rank: 14},
				{suit: 2, rank: 14},
				{suit: 3, rank: 14},
				{suit: 1, rank: 2},
				{suit: 2, rank: 3},
			]
			const result = getBestHandCombination(cards)
			expect(result.handRankTitle).toBe('Three of a Kind')
			expect(result.handRankLevel).toBe(7)
		})

		test('should detect two pair', () => {
			const cards: CardData[] = [
				{suit: 1, rank: 14},
				{suit: 2, rank: 14},
				{suit: 3, rank: 13},
				{suit: 1, rank: 13},
				{suit: 2, rank: 2},
			]
			const result = getBestHandCombination(cards)
			expect(result.handRankTitle).toBe('Two Pair')
			expect(result.handRankLevel).toBe(8)
		})

		test('should detect one pair', () => {
			const cards: CardData[] = [
				{suit: 1, rank: 14},
				{suit: 2, rank: 14},
				{suit: 3, rank: 13},
				{suit: 1, rank: 12},
				{suit: 2, rank: 11},
			]
			const result = getBestHandCombination(cards)
			expect(result.handRankTitle).toBe('One Pair')
			expect(result.handRankLevel).toBe(9)
		})

		test('should detect high card', () => {
			const cards: CardData[] = [
				{suit: 1, rank: 14},
				{suit: 2, rank: 13},
				{suit: 3, rank: 12},
				{suit: 1, rank: 11},
				{suit: 2, rank: 9},
			]
			const result = getBestHandCombination(cards)
			expect(result.handRankTitle).toBe('High Card')
			expect(result.handRankLevel).toBe(10)
		})

		test('should handle duplicate cards', () => {
			const cards: CardData[] = [
				{suit: 1 as Suit, rank: 14 as Rank},
				{suit: 1 as Suit, rank: 14 as Rank},
				{suit: 3 as Suit, rank: 12 as Rank},
				{suit: 1 as Suit, rank: 11 as Rank},
				{suit: 2 as Suit, rank: 9 as Rank},
			]
			expect(() => getBestHandCombination(cards)).toThrow(
				'Duplicate card found',
			)
		})

		test('should handle less than 5 cards', () => {
			const cards: CardData[] = [
				{suit: 1 as Suit, rank: 14 as Rank},
				{suit: 2 as Suit, rank: 14 as Rank},
				{suit: 3 as Suit, rank: 14 as Rank},
			]
			const result = getBestHandCombination(cards)
			expect(result.handRankTitle).toBe('Three of a Kind')
			expect(result.handRankLevel).toBe(7)
		})
	})

	describe('evaluateWinners', () => {
		test('should throw error for invalid input', () => {
			expect(() => evaluateWinners(null as any)).toThrow(
				'Invalid input: players must be a non-empty array',
			)
			expect(() => evaluateWinners([])).toThrow(
				'Invalid input: players must be a non-empty array',
			)
		})

		test('should evaluate single winner', () => {
			const players: PlayerHand[] = [
				{
					playerID: '1',
					allCards: [
						{suit: 1 as Suit, rank: 14 as Rank},
						{suit: 1 as Suit, rank: 13 as Rank},
						{suit: 1 as Suit, rank: 12 as Rank},
						{suit: 1 as Suit, rank: 11 as Rank},
						{suit: 1 as Suit, rank: 10 as Rank},
					],
				},
				{
					playerID: '2',
					allCards: [
						{suit: 2 as Suit, rank: 14 as Rank},
						{suit: 2 as Suit, rank: 13 as Rank},
						{suit: 2 as Suit, rank: 12 as Rank},
						{suit: 2 as Suit, rank: 11 as Rank},
						{suit: 2 as Suit, rank: 9 as Rank},
					],
				},
			]
			const result = evaluateWinners(players)
			expect(result.winCount).toBe(1)
			expect(result.winners[0].playerID).toBe('1')
		})

		test('should evaluate multiple winners with same royal flush', () => {
			const players: PlayerHand[] = [
				{
					playerID: '1',
					allCards: [
						{suit: 1 as Suit, rank: 14 as Rank},
						{suit: 1 as Suit, rank: 13 as Rank},
						{suit: 1 as Suit, rank: 12 as Rank},
						{suit: 1 as Suit, rank: 11 as Rank},
						{suit: 1 as Suit, rank: 10 as Rank},
					],
				},
				{
					playerID: '2',
					allCards: [
						{suit: 1 as Suit, rank: 14 as Rank},
						{suit: 1 as Suit, rank: 13 as Rank},
						{suit: 1 as Suit, rank: 12 as Rank},
						{suit: 1 as Suit, rank: 11 as Rank},
						{suit: 1 as Suit, rank: 10 as Rank},
					],
				},
			]
			const result = evaluateWinners(players)
			expect(result.winCount).toBe(2)
			expect(result.winners.map((w) => w.playerID).sort()).toEqual(['1', '2'])
		})

		test('should evaluate multiple winners with same straight flush', () => {
			const players: PlayerHand[] = [
				{
					playerID: '1',
					allCards: [
						{suit: 1 as Suit, rank: 9 as Rank},
						{suit: 1 as Suit, rank: 8 as Rank},
						{suit: 1 as Suit, rank: 7 as Rank},
						{suit: 1 as Suit, rank: 6 as Rank},
						{suit: 1 as Suit, rank: 5 as Rank},
					],
				},
				{
					playerID: '2',
					allCards: [
						{suit: 1 as Suit, rank: 9 as Rank},
						{suit: 1 as Suit, rank: 8 as Rank},
						{suit: 1 as Suit, rank: 7 as Rank},
						{suit: 1 as Suit, rank: 6 as Rank},
						{suit: 1 as Suit, rank: 5 as Rank},
					],
				},
			]
			const result = evaluateWinners(players)
			expect(result.winCount).toBe(2)
			expect(result.winners.map((w) => w.playerID).sort()).toEqual(['1', '2'])
		})

		test('should evaluate multiple winners with same four of a kind', () => {
			const players: PlayerHand[] = [
				{
					playerID: '1',
					allCards: [
						{suit: 1 as Suit, rank: 14 as Rank},
						{suit: 2 as Suit, rank: 14 as Rank},
						{suit: 3 as Suit, rank: 14 as Rank},
						{suit: 4 as Suit, rank: 14 as Rank},
						{suit: 1 as Suit, rank: 2 as Rank},
					],
				},
				{
					playerID: '2',
					allCards: [
						{suit: 1 as Suit, rank: 14 as Rank},
						{suit: 2 as Suit, rank: 14 as Rank},
						{suit: 3 as Suit, rank: 14 as Rank},
						{suit: 4 as Suit, rank: 14 as Rank},
						{suit: 2 as Suit, rank: 2 as Rank},
					],
				},
			]
			const result = evaluateWinners(players)
			expect(result.winCount).toBe(2)
			expect(result.winners.map((w) => w.playerID).sort()).toEqual(['1', '2'])
		})

		test('should evaluate multiple winners with same full house', () => {
			const players: PlayerHand[] = [
				{
					playerID: '1',
					allCards: [
						{suit: 1, rank: 14},
						{suit: 2, rank: 14},
						{suit: 3, rank: 14},
						{suit: 1, rank: 2},
						{suit: 2, rank: 2},
					],
				},
				{
					playerID: '2',
					allCards: [
						{suit: 1, rank: 14},
						{suit: 2, rank: 14},
						{suit: 3, rank: 14},
						{suit: 1, rank: 2},
						{suit: 2, rank: 2},
					],
				},
			]
			const result = evaluateWinners(players)
			expect(result.winCount).toBe(2)
			expect(result.winners.map((w) => w.playerID).sort()).toEqual(['1', '2'])
		})

		test('should evaluate multiple winners with same flush', () => {
			const players: PlayerHand[] = [
				{
					playerID: '1',
					allCards: [
						{suit: 1, rank: 14},
						{suit: 1, rank: 11},
						{suit: 1, rank: 8},
						{suit: 1, rank: 5},
						{suit: 1, rank: 2},
					],
				},
				{
					playerID: '2',
					allCards: [
						{suit: 1, rank: 14},
						{suit: 1, rank: 11},
						{suit: 1, rank: 8},
						{suit: 1, rank: 5},
						{suit: 1, rank: 2},
					],
				},
			]
			const result = evaluateWinners(players)
			expect(result.winCount).toBe(2)
			expect(result.winners.map((w) => w.playerID).sort()).toEqual(['1', '2'])
		})

		test('should evaluate multiple winners with same straight', () => {
			const players: PlayerHand[] = [
				{
					playerID: '1',
					allCards: [
						{suit: 1, rank: 9},
						{suit: 2, rank: 8},
						{suit: 3, rank: 7},
						{suit: 4, rank: 6},
						{suit: 1, rank: 5},
					],
				},
				{
					playerID: '2',
					allCards: [
						{suit: 1, rank: 9},
						{suit: 2, rank: 8},
						{suit: 3, rank: 7},
						{suit: 4, rank: 6},
						{suit: 2, rank: 5},
					],
				},
			]
			const result = evaluateWinners(players)
			expect(result.winCount).toBe(2)
			expect(result.winners.map((w) => w.playerID).sort()).toEqual(['1', '2'])
		})
	})
})
