export type Suit = 1 | 2 | 3 | 4
export type Rank =
	| 14
	| 2
	| 3
	| 4
	| 5
	| 6
	| 7
	| 8
	| 9
	| 10
	| 11
	| 12
	| 13
	| 999
	| 9999

export interface CardData {
	suit: Suit
	rank: Rank
}

/**
 * Represents the result of evaluating a poker hand
 * @interface HandRankResult
 */
export interface HandRankResult {
	handRankTitle: string
	handRankLevel: number
	handRankDescription: string
	bestFiveCards: CardData[]
}

export interface HandRankEvaluation {
	handRankTitle: string
	handRankLevel: number
	handRankDescription: string
	rankingCards: CardData[]
}

/**
 * Represents a player's hand in a poker game
 * @interface PlayerHand
 */
export interface PlayerHand {
	playerID: string
	allCards: CardData[]
}

/**
 * Represents the result of evaluating winners in a poker game
 * @interface WinnerResult
 */
export interface WinnerResult {
	winCount: number
	winners: {
		playerID: string
		bestCombineCards: CardData[]
		allCards: CardData[]
		handRank: {
			handRankTitle: string
			handRankLevel: number
		}
	}[]
}
