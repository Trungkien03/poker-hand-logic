/**
 * Represents a playing card with rank and suit
 * @interface Card
 */
export interface Card {
  /** The rank of the card (2-14, where 14 represents Ace) */
  cardRank: number;
  /** The suit of the card (1-4, where 1=Hearts, 2=Diamonds, 3=Clubs, 4=Spades) */
  cardSuit: number;
}

/**
 * Represents the result of evaluating a poker hand
 * @interface HandRankResult
 */
export interface HandRankResult {
  /** The title of the hand rank (e.g., "Royal Flush", "Full House") */
  handRankTitle: string;
  /** The level of the hand rank (1-10, where 1 is highest) */
  handRankLevel: number;
  /** Description of the hand rank */
  handRankDescription: string;
  /** The best five cards that make up the hand */
  bestFiveCards: Card[];
}

/**
 * Represents a player's hand in a poker game
 * @interface PlayerHand
 */
export interface PlayerHand {
  /** Unique identifier for the player */
  playerID: string;
  /** Array of all cards in the player's hand */
  allCards: Card[];
}

export interface PlayerHandDto {
  playerID: string;
  allCards: number[];
}

/**
 * Represents the result of evaluating winners in a poker game
 * @interface WinnerResult
 */
export interface WinnerResult {
  /** Number of winners */
  winCount: number;
  /** Array of winning players with their hand details */
  winners: {
    playerID: string;
    bestCombineCards: Card[];
    allCards: Card[];
    handRank: {
      handRankTitle: string;
      handRankLevel: number;
    };
  }[];
}

/**
 * Represents the result of getting the best hand from a set of cards
 * @interface BestHandResult
 */
export interface BestHandResult {
  /** The title of the hand rank */
  handRank: string;
  /** The level of the hand rank */
  handRankLevel: number;
  /** Array of card codes representing the best five cards */
  bestFiveCards: number[];
  /** Description of the hand rank */
  description: string;
}
