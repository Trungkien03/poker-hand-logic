/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CardData,
  HandRankEvaluation,
  HandRankResult,
  PlayerHand,
  WinnerResult,
} from "./types";
import {
  compareHandValues,
  convertToCard,
  convertToCardCode,
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
export function getBestHandCombination(cards: CardData[]): HandRankResult {
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
    const cardKey = `${card.rank}-${card.suit}`;
    if (cardSet.has(cardKey)) {
      throw new Error(`Duplicate card found: ${convertToCardCode(card)}`);
    }
    cardSet.add(cardKey);
  });

  // For hands with less than 5 cards, evaluate directly
  if (cards.length < 5) {
    const evaluation = evaluateHandRank(cards);
    return {
      handRankTitle: evaluation.handRankTitle,
      handRankLevel: evaluation.handRankLevel,
      handRankDescription: evaluation.handRankDescription,
      bestFiveCards: evaluation.rankingCards,
    };
  }

  // For 5 or more cards, get all combinations of 5 cards
  const combinations = getCombinations(cards, 5);
  let bestHand: HandRankEvaluation | null = null;

  // Evaluate each combination
  for (const combination of combinations) {
    try {
      const evaluation = evaluateHandRank(combination);

      if (!bestHand || evaluation.handRankLevel < bestHand.handRankLevel) {
        bestHand = evaluation;
      } else if (evaluation.handRankLevel === bestHand.handRankLevel) {
        // Compare comparison values for same hand rank
        const currentValue = evaluation.rankingCards;
        const bestValue = bestHand.rankingCards;

        if (compareHandValues(currentValue, bestValue) > 0) {
          bestHand = evaluation;
        }
      }
    } catch (error) {
      console.error("Error evaluating hand combination:", error);
      continue;
    }
  }

  if (!bestHand) {
    throw new Error("Failed to evaluate any valid hand combination");
  }

  return {
    handRankTitle: bestHand.handRankTitle,
    handRankLevel: bestHand.handRankLevel,
    handRankDescription: bestHand.handRankDescription,
    bestFiveCards: bestHand.rankingCards,
  };
}

/**
 * Evaluates winners among multiple players
 * @param {PlayerHand[]} players - Array of player hands to evaluate
 * @returns {WinnerResult} The result containing winners and their hand details
 * @throws {Error} If input is invalid
 * @private
 */
export function evaluateWinners(players: PlayerHand[]): WinnerResult {
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
  const winners = playerResults.filter((player) => {
    // Check if hand rank level is the same
    if (player.handRank.handRankLevel !== highestHand.handRank.handRankLevel) {
      return false;
    }
    // For same hand rank, check if the hands are equal
    const comparison = compareHandValues(
      highestHand.bestCombineCards,
      player.bestCombineCards
    );
    return comparison === 0;
  });

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
function getBestHand(cardCodes: number[]): HandRankResult {
  const cards = cardCodes.map((code) => convertToCard(code));
  const result = getBestHandCombination(cards);

  return {
    handRankTitle: result.handRankTitle,
    handRankLevel: result.handRankLevel,
    handRankDescription: result.handRankDescription,
    bestFiveCards: result.bestFiveCards,
  };
}

function evaluateHandRank(cards: CardData[]): HandRankEvaluation {
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
        rankingCards: sortedCards,
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
        rankingCards: sortedCards,
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
        rankingCards: sortedCards,
      };
    }

    // High Card for remaining cards
    return {
      handRankTitle: "High Card",
      handRankLevel: 10,
      handRankDescription: "If no other hand is made, the highest card plays.",
      rankingCards: sortedCards,
    };
  }

  // For 5 cards, evaluate all possible hand types
  const isFlushResult = isFlush(cards);
  const isStraightResult = isStraight(cards);

  // Royal Flush (10, J, Q, K, A of the same suit)
  if (
    isFlushResult &&
    isStraightResult &&
    cards.some((card) => getActualRank(card.rank) === 14) &&
    cards.some((card) => getActualRank(card.rank) === 13)
  ) {
    return {
      handRankTitle: "Royal Flush",
      handRankLevel: 1,
      handRankDescription: "A, K, Q, J, 10 of the same suit.",
      rankingCards: sortedCards,
    };
  }

  // Straight Flush (5 cards in sequence and all cards have the same suit)
  if (isFlushResult && isStraightResult) {
    return {
      handRankTitle: "Straight Flush",
      handRankLevel: 2,
      handRankDescription: "Five cards in rank sequence, all of the same suit",
      rankingCards: sortedCards,
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
      rankingCards: sortedCards,
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
      handRankDescription: "Three of a kind and a pair.",
      rankingCards: sortedCards,
    };
  }

  // Flush (5 cards of the same suit)
  if (isFlushResult) {
    return {
      handRankTitle: "Flush",
      handRankLevel: 5,
      handRankDescription: "Five cards of the same suit, not in a sequence.",
      rankingCards: sortedCards,
    };
  }

  // Straight (5 cards in sequence)
  if (isStraightResult) {
    return {
      handRankTitle: "Straight",
      handRankLevel: 6,
      handRankDescription:
        "Five cards in rank sequence, not all of the same suit.",
      rankingCards: sortedCards,
    };
  }

  // Three of a Kind (3 cards of the same rank)
  if (threeOfAKindRank) {
    return {
      handRankTitle: "Three of a Kind",
      handRankLevel: 7,
      handRankDescription: "Three cards of the same rank.",
      rankingCards: sortedCards,
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
      handRankDescription: "Two pairs of the same rank.",
      rankingCards: sortedCards,
    };
  }

  // One Pair (2 cards of the same rank)
  if (pairs.length === 1) {
    return {
      handRankTitle: "One Pair",
      handRankLevel: 9,
      handRankDescription: "Two cards of the same rank.",
      rankingCards: sortedCards,
    };
  }

  return {
    handRankTitle: "High Card",
    handRankLevel: 10,
    handRankDescription: "If no other hand is made, the highest card plays.",
    rankingCards: sortedCards,
  };
}
