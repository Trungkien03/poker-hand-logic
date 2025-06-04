import { Card } from "./types";

/**
 * Converts a card code to a Card object
 * @param {number} cardCode - The card code (e.g., 1014 for Ace of Hearts)
 * @returns {Card} The corresponding Card object
 * @throws {Error} If the card code is invalid
 * @example
 * // Returns {cardRank: 14, cardSuit: 1} for Ace of Hearts
 * convertToCard(1014)
 */
export function convertToCard(cardCode: number): Card {
  const cardSuit = Math.floor(cardCode / 1000);
  const cardRank = cardCode % 1000;
  if (cardRank < 2 || cardRank > 14 || cardSuit < 1 || cardSuit > 4) {
    throw new Error("Invalid card code");
  }
  return { cardRank: cardCode, cardSuit };
}

/**
 * Converts a Card object to a card code
 * @param {Card} card - The Card object to convert
 * @returns {number} The corresponding card code
 * @throws {Error} If the card is invalid
 * @example
 * // Returns 1014 for Ace of Hearts
 * convertToCardCode({cardRank: 14, cardSuit: 1})
 */
export function convertToCardCode(card: Card): number {
  if (!isValidCard(card)) {
    throw new Error("Invalid card");
  }
  return card.cardRank;
}

/**
 * Validates if a card object is valid
 * @param {Card} card - The card to validate
 * @returns {boolean} True if the card is valid, false otherwise
 */
export function isValidCard(card: Card): boolean {
  if (!card || typeof card !== "object") return false;
  const rank = getActualRank(card.cardRank);
  return (
    typeof card.cardRank === "number" &&
    typeof card.cardSuit === "number" &&
    rank >= 2 &&
    rank <= 14 &&
    card.cardSuit >= 1 &&
    card.cardSuit <= 4
  );
}

/**
 * Gets the actual rank of a card from its card code
 * @param {number} cardCode - The card code
 * @returns {number} The actual rank (2-14)
 */
export function getActualRank(cardCode: number): number {
  return cardCode % 1000;
}

/**
 * Sorts cards by rank in descending order
 * @param {Card[]} cards - Array of cards to sort
 * @returns {Card[]} Sorted array of cards
 * @private
 */
export function sortCardsByRank(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => {
    const rankA = getActualRank(a.cardRank);
    const rankB = getActualRank(b.cardRank);
    return rankB - rankA;
  });
}

/**
 * Checks if all cards are of the same suit (Flush)
 * @param {Card[]} cards - Array of cards to check
 * @returns {boolean} True if all cards are of the same suit
 */
export function isFlush(cards: Card[]): boolean {
  const firstSuit = cards[0].cardSuit;
  return cards.every((card) => card.cardSuit === firstSuit);
}

/**
 * Checks if cards form a straight sequence
 * @param {Card[]} cards - Array of cards to check
 * @returns {boolean} True if cards form a straight
 */
export function isStraight(cards: Card[]): boolean {
  const sortedCards = sortCardsByRank(cards);
  const ranks = sortedCards.map((card) => getActualRank(card.cardRank));

  // Special case for A-5 straight
  if (ranks.join(",") === "14,5,4,3,2") {
    return true;
  }

  // Check for regular straight
  for (let i = 1; i < ranks.length; i++) {
    if (ranks[i - 1] !== ranks[i] + 1) {
      return false;
    }
  }
  return true;
}

/**
 * Compares two hands to determine which is better
 * @param {Card[]} cards1 - First hand to compare
 * @param {Card[]} cards2 - Second hand to compare
 * @returns {number} 1 if cards1 is better, -1 if cards2 is better, 0 if equal
 */
export function compareHandValues(cards1: Card[], cards2: Card[]): number {
  if (!cards1 && !cards2) return 0;
  if (!cards1) return -1;
  if (!cards2) return 1;

  // Compare only the highest card's rank and suit
  const rank1 = getActualRank(cards1[0].cardRank);
  const rank2 = getActualRank(cards2[0].cardRank);
  if (rank1 > rank2) return 1;
  if (rank1 < rank2) return -1;
  // If ranks are equal, compare suits
  if (rank1 === rank2) {
    const suit1 = cards1[0].cardSuit;
    const suit2 = cards2[0].cardSuit;
    if (suit1 !== suit2) {
      // Hearts (1) > Diamonds (2) > Clubs (3) > Spades (4)
      const suitOrder = { 1: 4, 2: 3, 3: 2, 4: 1 };
      return (suitOrder as any)[suit1] - (suitOrder as any)[suit2];
    }
  }
  return 0;
}

/**
 * Gets the count of each rank and kicker cards
 * @param {Card[]} cards - Array of cards to analyze
 * @returns {{rankCounts: {[key: number]: number}, kickers: number[]}} Object containing rank counts and kickers
 * @private
 */
export function getRankCountsAndKickers(cards: Card[]): {
  rankCounts: { [key: number]: number };
  kickers: number[];
} {
  const rankCounts: { [key: number]: number } = {};
  cards.forEach((card) => {
    const rank = getActualRank(card.cardRank);
    rankCounts[rank] = (rankCounts[rank] || 0) + 1;
  });

  const kickers = Object.entries(rankCounts)
    .filter(([_, count]) => count === 1)
    .map(([rank]) => parseInt(rank))
    .sort((a, b) => b - a);

  return { rankCounts, kickers };
}

/**
 * Generates all possible combinations of cards of a given size
 * @param {Card[]} cards - Array of cards to generate combinations from
 * @param {number} size - Size of each combination
 * @returns {Card[][]} Array of card combinations
 */
export function getCombinations(cards: Card[], size: number): Card[][] {
  const combinations: Card[][] = [];

  const combine = (current: Card[], start: number) => {
    if (current.length === size) {
      combinations.push([...current]);
      return;
    }

    for (let i = start; i < cards.length; i++) {
      current.push(cards[i]);
      combine(current, i + 1);
      current.pop();
    }
  };

  combine([], 0);
  return combinations;
}
