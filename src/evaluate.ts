import {
  BestHandResult,
  Card,
  HandRankResult,
  PlayerHand,
  PlayerHandDto,
  WinnerResult,
} from "./types";
import {
  compareHandValues,
  convertToCard,
  getActualRank,
  getCombinations,
  getRankCountsAndKickers,
  isFlush,
  isStraight,
  isValidCard,
  sortCardsByRank,
} from "./utils";

/**
 * Gets the best possible hand combination from a set of cards
 * @param {Card[]} cards - Array of cards to evaluate
 * @returns {HandRankResult} The best hand combination result
 * @throws {Error} If input is invalid or no valid hand can be made
 * @example
 * // Get best hand from 7 cards
 * getBestHandCombination([{cardRank: 1014, cardSuit: 1}, ...])
 */
export function getBestHandCombination(cards: Card[]): HandRankResult {
  // 1. validate input cards
  if (!cards || !Array.isArray(cards)) {
    throw new Error("Invalid input: cards must be an array");
  }

  if (cards.length === 0) {
    return {
      handRankTitle: "No Hand",
      handRankLevel: 0,
      handRankDescription: "No hand is made.",
      bestFiveCards: [],
    };
  }

  if (cards.length < 2) {
    return {
      handRankTitle: "High Card",
      handRankLevel: 10,
      handRankDescription: "If no other hand is made, the highest card plays.",
      bestFiveCards: cards,
    };
  }

  if (cards.length > 10) {
    throw new Error("Invalid input: 1-10 cards required");
  }

  // Check for duplicate cards
  const cardSet = new Set<string>();
  cards.forEach((card, index) => {
    if (!isValidCard(card)) {
      throw new Error(`Invalid card at index ${index}`);
    }
    const cardKey = `${card.cardRank}-${card.cardSuit}`;
    if (cardSet.has(cardKey)) {
      throw new Error(`Duplicate card found ${card.cardRank}`);
    }
    cardSet.add(cardKey);
  });

  // For hands with less than 5 cards, evaluate directly
  if (cards.length < 5) {
    return evaluateHandRank(cards);
  }

  // For 5 or more cards, get all combinations of 5 cards
  const combinations = getCombinations(cards, 5);
  let bestHand: HandRankResult | null = null;

  // Evaluate each combination
  for (const combination of combinations) {
    try {
      const evaluation = evaluateHandRank(combination);

      if (!bestHand || evaluation.handRankLevel < bestHand.handRankLevel) {
        bestHand = evaluation;
      } else if (evaluation.handRankLevel === bestHand.handRankLevel) {
        // Compare comparison values for same hand rank
        const currentValue = evaluation.bestFiveCards;
        const bestValue = bestHand.bestFiveCards;

        if (compareHandValues(currentValue, bestValue) > 0) {
          bestHand = evaluation;
        }
      }
    } catch (error) {
      console.error("Error evaluating hand combination:", error);
      continue;
    }
  }

  // Find the best hand combination
  if (!bestHand) {
    throw new Error("Failed to evaluate any valid hand combination");
  }

  return bestHand;
}

/**
 * Evaluates winners among multiple players
 * @param {PlayerHand[]} players - Array of player hands to evaluate
 * @returns {WinnerResult} The result containing winners and their hand details
 * @throws {Error} If input is invalid
 * @private
 */
function evaluateWinners(players: PlayerHand[]): WinnerResult {
  // 1. validate input
  if (!players || !Array.isArray(players) || players.length === 0) {
    throw new Error("Invalid input: players must be a non-empty array");
  }

  // 2. calculate best hand for each player
  const playerResults = players.map((player) => {
    const bestHand = getBestHandCombination(player.allCards);
    return {
      playerID: player.playerID,
      bestCombineCards: bestHand.bestFiveCards,
      allCards: player.allCards,
      handRank: {
        handRankTitle: bestHand.handRankTitle,
        handRankLevel: bestHand.handRankLevel,
      },
    };
  });

  // 3. sort players by hand rank level and comparison value
  playerResults.sort((a, b) => {
    if (a.handRank.handRankLevel !== b.handRank.handRankLevel) {
      return a.handRank.handRankLevel - b.handRank.handRankLevel;
    }
    // For same hand rank, compare using the new suit order
    return compareHandValues(b.bestCombineCards, a.bestCombineCards);
  });

  // 4. find winners (players with the same highest hand)
  const highestHand = playerResults[0];
  const winners = playerResults.filter(
    (player) =>
      player.handRank.handRankLevel === highestHand.handRank.handRankLevel &&
      compareHandValues(
        player.bestCombineCards,
        highestHand.bestCombineCards
      ) === 0
  );

  return {
    winCount: winners.length,
    winners: winners,
  };
}

/**
 * Evaluates the best poker hand from a set of card codes
 * @param {number[]} cardCodes - Array of card codes to evaluate
 * @returns {BestHandResult} The best hand result with rank, level, and best five cards
 * @throws {Error} If input is invalid
 * @example
 * // Evaluates a royal flush
 * getBestHand([1014, 1013, 1012, 1011, 1010])
 */
function getBestHand(cardCodes: number[]): BestHandResult {
  const cards = cardCodes.map((code) => convertToCard(code));
  const result = getBestHandCombination(cards);

  return {
    handRank: result.handRankTitle,
    handRankLevel: result.handRankLevel,
    bestFiveCards: result.bestFiveCards.map((card) => card.cardRank),
    description: result.handRankDescription,
  };
}

/**
 * Evaluates winners among multiple players in a poker game
 * @param {PlayerHandDto[]} players - Array of players with their card codes
 * @returns {WinnerResult} The result containing winners and their hand details
 * @throws {Error} If input is invalid
 * @example
 * // Evaluates winners between two players
 * evaluateWinnerHands([
 *   { playerID: "player1", allCards: [1014, 1013, 1012, 1011, 1010] },
 *   { playerID: "player2", allCards: [2014, 2013, 2012, 2011, 2010] }
 * ])
 */
export function evaluateWinnerHands(players: PlayerHandDto[]): WinnerResult {
  const playerHands: PlayerHand[] = players.map((player) => ({
    playerID: player.playerID,
    allCards: player.allCards.map((code) => convertToCard(code)),
  }));

  return evaluateWinners(playerHands);
}

/**
 * Evaluates the rank of a poker hand
 * @param {Card[]} cards - Array of cards to evaluate
 * @returns {HandRankResult} The result containing hand rank information
 * @throws {Error} If input is invalid or cards are invalid
 * @private
 */
function evaluateHandRank(cards: Card[]): HandRankResult {
  if (!cards || cards.length < 2) {
    throw new Error("Invalid input: at least 2 cards required");
  }

  // Validate all cards
  cards.forEach((card, index) => {
    if (!isValidCard(card)) {
      throw new Error(`Invalid card at index ${index}`);
    }
  });

  const sortedCards = sortCardsByRank(cards);
  const { rankCounts } = getRankCountsAndKickers(cards);

  // For hands with less than 5 cards, we can only evaluate certain hand types
  if (cards.length < 5) {
    // Check for Four of a Kind first
    const fourOfAKindRank = Object.entries(rankCounts).find(
      ([_, count]) => count === 4
    )?.[0];
    if (fourOfAKindRank) {
      return {
        handRankTitle: "Four of a Kind",
        handRankLevel: 3,
        handRankDescription: "Four cards of the same rank.",
        bestFiveCards: sortedCards,
      };
    }

    // Check for Three of a Kind
    const threeOfAKindRank = Object.entries(rankCounts).find(
      ([_, count]) => count === 3
    )?.[0];
    if (threeOfAKindRank) {
      return {
        handRankTitle: "Three of a Kind",
        handRankLevel: 7,
        handRankDescription: "Three cards of the same rank.",
        bestFiveCards: sortedCards,
      };
    }

    // Check for pairs
    const pairs = Object.entries(rankCounts)
      .filter(([_, count]) => count === 2)
      .map(([rank]) => parseInt(rank))
      .sort((a, b) => b - a);

    if (pairs.length > 0) {
      return {
        handRankTitle: "One Pair",
        handRankLevel: 9,
        handRankDescription: "Two cards of the same rank.",
        bestFiveCards: sortedCards,
      };
    }

    // High Card for remaining cards
    return {
      handRankTitle: "High Card",
      handRankLevel: 10,
      handRankDescription: "If no other hand is made, the highest card plays.",
      bestFiveCards: sortedCards,
    };
  }

  // For 5 cards, evaluate all possible hand types
  const isFlushResult = isFlush(cards);
  const isStraightResult = isStraight(cards);

  // Royal Flush (10, J, Q, K, A of the same suit)
  if (
    isFlushResult &&
    isStraightResult &&
    cards.some((card) => getActualRank(card.cardRank) === 14) &&
    cards.some((card) => getActualRank(card.cardRank) === 13)
  ) {
    return {
      handRankTitle: "Royal Flush",
      handRankLevel: 1,
      handRankDescription: "A, K, Q, J, 10 of the same suit.",
      bestFiveCards: sortedCards,
    };
  }

  // Straight Flush (5 cards in sequence and all cards have the same suit)
  if (isFlushResult && isStraightResult) {
    return {
      handRankTitle: "Straight Flush",
      handRankLevel: 2,
      handRankDescription: "Five cards in rank sequence, all of the same suit",
      bestFiveCards: sortedCards,
    };
  }

  // Four of a Kind (4 cards of the same rank)
  const fourOfAKindRank = Object.entries(rankCounts).find(
    ([_, count]) => count === 4
  )?.[0];
  if (fourOfAKindRank) {
    return {
      handRankTitle: "Four of a Kind",
      handRankLevel: 3,
      handRankDescription: "Four cards of the same rank.",
      bestFiveCards: sortedCards,
    };
  }

  // Full House (Three of a Kind and a Pair)
  const threeOfAKindRank = Object.entries(rankCounts).find(
    ([_, count]) => count === 3
  )?.[0];
  const pairRank = Object.entries(rankCounts).find(
    ([_, count]) => count === 2
  )?.[0];
  if (threeOfAKindRank && pairRank) {
    return {
      handRankTitle: "Full House",
      handRankLevel: 4,
      bestFiveCards: sortedCards,
      handRankDescription: "Three of a kind and a pair.",
    };
  }

  // Flush (5 cards of the same suit)
  if (isFlushResult) {
    return {
      handRankTitle: "Flush",
      handRankLevel: 5,
      bestFiveCards: sortedCards,
      handRankDescription: "Five cards of the same suit, not in a sequence.",
    };
  }

  // Straight (5 cards in sequence)
  if (isStraightResult) {
    return {
      handRankTitle: "Straight",
      handRankLevel: 6,
      bestFiveCards: sortedCards,
      handRankDescription:
        "Five cards in rank sequence, not all of the same suit.",
    };
  }

  // Three of a Kind (3 cards of the same rank)
  if (threeOfAKindRank) {
    return {
      handRankTitle: "Three of a Kind",
      handRankLevel: 7,
      bestFiveCards: sortedCards,
      handRankDescription: "Three cards of the same rank.",
    };
  }

  // Two Pair (2 pairs of the same rank)
  const pairs = Object.entries(rankCounts)
    .filter(([_, count]) => count === 2)
    .map(([rank]) => parseInt(rank))
    .sort((a, b) => b - a);

  if (pairs.length === 2) {
    return {
      handRankTitle: "Two Pair",
      handRankLevel: 8,
      bestFiveCards: sortedCards,
      handRankDescription: "Two pairs of the same rank.",
    };
  }

  // One Pair (2 cards of the same rank)
  if (pairs.length === 1) {
    return {
      handRankTitle: "One Pair",
      handRankLevel: 9,
      bestFiveCards: sortedCards,
      handRankDescription: "Two cards of the same rank.",
    };
  }

  // High Card (no other hand rank)
  return {
    handRankTitle: "High Card",
    handRankLevel: 10,
    bestFiveCards: sortedCards,
    handRankDescription: "If no other hand is made, the highest card plays.",
  };
}
