/**
 * PokerNow GTO Copilot - Core Poker Engine
 * Handles hand evaluation, card parsing, and poker math
 */

class PokerEngine {
    constructor() {
        this.suits = ['♠', '♥', '♦', '♣', 's', 'h', 'd', 'c'];
        this.ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
        this.rankValues = {
            '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
            'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
        };
        
        // Hand strength rankings
        this.handRankings = {
            'HIGH_CARD': 1,
            'PAIR': 2,
            'TWO_PAIR': 3,
            'THREE_OF_A_KIND': 4,
            'STRAIGHT': 5,
            'FLUSH': 6,
            'FULL_HOUSE': 7,
            'FOUR_OF_A_KIND': 8,
            'STRAIGHT_FLUSH': 9,
            'ROYAL_FLUSH': 10
        };
    }

    /**
     * Parse a card string like "As", "Kh", "Qd", "Jc"
     */
    parseCard(cardStr) {
        if (!cardStr || cardStr.length < 2) return null;
        
        const rank = cardStr[0].toUpperCase();
        const suit = cardStr[1].toLowerCase();
        
        if (!this.ranks.includes(rank)) return null;
        if (!['s', 'h', 'd', 'c'].includes(suit)) return null;
        
        return {
            rank: rank,
            suit: suit,
            value: this.rankValues[rank],
            card: rank + suit
        };
    }

    /**
     * Parse multiple cards from various formats
     */
    parseCards(cardsStr) {
        if (!cardsStr) return [];
        
        // Handle different formats: "As Kh", "As,Kh", "AsKh"
        let cards = cardsStr.replace(/[,\s]+/g, ' ').trim().split(' ');
        
        return cards.map(card => this.parseCard(card)).filter(card => card !== null);
    }

    /**
     * Evaluate hand strength - returns hand type and strength value
     */
    evaluateHand(cards) {
        if (!cards || cards.length < 5) {
            return { type: 'INSUFFICIENT_CARDS', strength: 0, description: 'Need at least 5 cards' };
        }

        // Sort cards by value (highest first)
        const sortedCards = [...cards].sort((a, b) => b.value - a.value);
        
        // Count ranks and suits
        const rankCounts = {};
        const suitCounts = {};
        
        cards.forEach(card => {
            rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
            suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
        });

        const rankCountValues = Object.values(rankCounts).sort((a, b) => b - a);
        const isFlush = Object.values(suitCounts).some(count => count >= 5);
        const isStraight = this.checkStraight(sortedCards);

        // Check for each hand type (highest to lowest)
        if (isStraight && isFlush) {
            const straightCards = this.getStraightCards(sortedCards);
            const flushSuit = Object.keys(suitCounts).find(suit => suitCounts[suit] >= 5);
            const straightFlushCards = straightCards.filter(card => card.suit === flushSuit);
            
            if (straightFlushCards.length >= 5) {
                const highCard = Math.max(...straightFlushCards.map(c => c.value));
                if (highCard === 14) { // Ace high straight flush
                    return { type: 'ROYAL_FLUSH', strength: 10000, description: 'Royal Flush' };
                }
                return { type: 'STRAIGHT_FLUSH', strength: 9000 + highCard, description: 'Straight Flush' };
            }
        }

        if (rankCountValues[0] === 4) {
            const quadRank = Object.keys(rankCounts).find(rank => rankCounts[rank] === 4);
            return { 
                type: 'FOUR_OF_A_KIND', 
                strength: 8000 + this.rankValues[quadRank], 
                description: `Four of a Kind - ${quadRank}s` 
            };
        }

        if (rankCountValues[0] === 3 && rankCountValues[1] === 2) {
            const tripRank = Object.keys(rankCounts).find(rank => rankCounts[rank] === 3);
            const pairRank = Object.keys(rankCounts).find(rank => rankCounts[rank] === 2);
            return { 
                type: 'FULL_HOUSE', 
                strength: 7000 + this.rankValues[tripRank] * 13 + this.rankValues[pairRank], 
                description: `Full House - ${tripRank}s over ${pairRank}s` 
            };
        }

        if (isFlush) {
            const flushSuit = Object.keys(suitCounts).find(suit => suitCounts[suit] >= 5);
            const flushCards = cards.filter(card => card.suit === flushSuit)
                                  .sort((a, b) => b.value - a.value)
                                  .slice(0, 5);
            const strength = 6000 + flushCards.reduce((sum, card, index) => 
                sum + card.value * Math.pow(13, 4 - index), 0);
            return { type: 'FLUSH', strength, description: 'Flush' };
        }

        if (isStraight) {
            const straightCards = this.getStraightCards(sortedCards);
            const highCard = Math.max(...straightCards.map(c => c.value));
            return { 
                type: 'STRAIGHT', 
                strength: 5000 + highCard, 
                description: 'Straight' 
            };
        }

        if (rankCountValues[0] === 3) {
            const tripRank = Object.keys(rankCounts).find(rank => rankCounts[rank] === 3);
            return { 
                type: 'THREE_OF_A_KIND', 
                strength: 4000 + this.rankValues[tripRank], 
                description: `Three of a Kind - ${tripRank}s` 
            };
        }

        if (rankCountValues[0] === 2 && rankCountValues[1] === 2) {
            const pairs = Object.keys(rankCounts).filter(rank => rankCounts[rank] === 2)
                               .sort((a, b) => this.rankValues[b] - this.rankValues[a]);
            return { 
                type: 'TWO_PAIR', 
                strength: 3000 + this.rankValues[pairs[0]] * 13 + this.rankValues[pairs[1]], 
                description: `Two Pair - ${pairs[0]}s and ${pairs[1]}s` 
            };
        }

        if (rankCountValues[0] === 2) {
            const pairRank = Object.keys(rankCounts).find(rank => rankCounts[rank] === 2);
            return { 
                type: 'PAIR', 
                strength: 2000 + this.rankValues[pairRank], 
                description: `Pair of ${pairRank}s` 
            };
        }

        // High card
        const highCardStrength = sortedCards.slice(0, 5).reduce((sum, card, index) => 
            sum + card.value * Math.pow(13, 4 - index), 0);
        return { 
            type: 'HIGH_CARD', 
            strength: 1000 + highCardStrength, 
            description: `High Card - ${sortedCards[0].rank}` 
        };
    }

    /**
     * Check if cards form a straight
     */
    checkStraight(sortedCards) {
        const uniqueRanks = [...new Set(sortedCards.map(card => card.value))].sort((a, b) => b - a);
        
        // Check for regular straight
        for (let i = 0; i <= uniqueRanks.length - 5; i++) {
            let consecutive = 1;
            for (let j = i + 1; j < uniqueRanks.length && consecutive < 5; j++) {
                if (uniqueRanks[j] === uniqueRanks[j-1] - 1) {
                    consecutive++;
                } else {
                    break;
                }
            }
            if (consecutive >= 5) return true;
        }
        
        // Check for Ace-low straight (A-2-3-4-5)
        if (uniqueRanks.includes(14) && uniqueRanks.includes(5) && 
            uniqueRanks.includes(4) && uniqueRanks.includes(3) && uniqueRanks.includes(2)) {
            return true;
        }
        
        return false;
    }

    /**
     * Get the cards that form a straight
     */
    getStraightCards(sortedCards) {
        const uniqueRanks = [...new Set(sortedCards.map(card => card.value))].sort((a, b) => b - a);
        
        // Find the straight
        for (let i = 0; i <= uniqueRanks.length - 5; i++) {
            let consecutive = 1;
            let straightRanks = [uniqueRanks[i]];
            
            for (let j = i + 1; j < uniqueRanks.length && consecutive < 5; j++) {
                if (uniqueRanks[j] === uniqueRanks[j-1] - 1) {
                    consecutive++;
                    straightRanks.push(uniqueRanks[j]);
                } else {
                    break;
                }
            }
            
            if (consecutive >= 5) {
                return sortedCards.filter(card => straightRanks.includes(card.value));
            }
        }
        
        // Check for Ace-low straight
        if (uniqueRanks.includes(14) && uniqueRanks.includes(5) && 
            uniqueRanks.includes(4) && uniqueRanks.includes(3) && uniqueRanks.includes(2)) {
            return sortedCards.filter(card => [14, 5, 4, 3, 2].includes(card.value));
        }
        
        return [];
    }

    /**
     * Calculate hand strength percentage (0-100)
     */
    getHandStrengthPercentage(holeCards, boardCards = []) {
        if (!holeCards || holeCards.length !== 2) return 0;
        
        const allCards = [...holeCards, ...boardCards];
        const handEval = this.evaluateHand(allCards);
        
        // Convert strength to percentage based on hand type
        const strengthPercentages = {
            'HIGH_CARD': 10,
            'PAIR': 25,
            'TWO_PAIR': 45,
            'THREE_OF_A_KIND': 65,
            'STRAIGHT': 80,
            'FLUSH': 85,
            'FULL_HOUSE': 92,
            'FOUR_OF_A_KIND': 97,
            'STRAIGHT_FLUSH': 99,
            'ROYAL_FLUSH': 100
        };
        
        return strengthPercentages[handEval.type] || 0;
    }

    /**
     * Get preflop hand strength for hole cards
     */
    getPreflopStrength(holeCards) {
        if (!holeCards || holeCards.length !== 2) return { strength: 0, description: 'Invalid hand' };
        
        const [card1, card2] = holeCards;
        const isPair = card1.rank === card2.rank;
        const isSuited = card1.suit === card2.suit;
        
        const rank1 = this.rankValues[card1.rank];
        const rank2 = this.rankValues[card2.rank];
        const highRank = Math.max(rank1, rank2);
        const lowRank = Math.min(rank1, rank2);
        
        let strength = 0;
        let description = '';
        
        if (isPair) {
            // Pocket pairs
            strength = 50 + (highRank - 2) * 4; // 54-98
            description = `Pocket ${card1.rank}s`;
            
            if (highRank >= 10) strength += 10; // Premium pairs
            if (highRank >= 13) strength += 5;  // AA, KK
        } else {
            // Unpaired hands
            const gap = highRank - lowRank - 1;
            
            strength = (highRank + lowRank) * 2; // Base on card ranks
            
            if (isSuited) {
                strength += 8;
                description = `${card1.rank}${card2.rank} suited`;
            } else {
                description = `${card1.rank}${card2.rank} offsuit`;
            }
            
            // Adjustments
            if (gap === 0) strength += 5; // Connected
            if (gap === 1) strength += 3; // One gap
            if (gap >= 4) strength -= 5;  // Wide gap
            
            // Premium hands
            if ((highRank === 14 && lowRank >= 10) || (highRank === 13 && lowRank >= 11)) {
                strength += 15; // AK, AQ, AJ, AT, KQ, KJ
            }
        }
        
        return {
            strength: Math.min(Math.max(strength, 0), 100),
            description: description,
            isPair: isPair,
            isSuited: isSuited
        };
    }
}

// Export for use in other modules
window.PokerEngine = PokerEngine; 