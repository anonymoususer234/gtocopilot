/**
 * PokerNow GTO Copilot - Equity Calculator
 * Calculates hand equity, outs, and winning probabilities
 */

class EquityCalculator {
    constructor(pokerEngine) {
        this.engine = pokerEngine;
        this.standardDeck = this.createDeck();
    }

    /**
     * Create a standard 52-card deck
     */
    createDeck() {
        const deck = [];
        const suits = ['s', 'h', 'd', 'c'];
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
        
        for (const suit of suits) {
            for (const rank of ranks) {
                deck.push(this.engine.parseCard(rank + suit));
            }
        }
        return deck;
    }

    /**
     * Get available cards (not in hole cards or board)
     */
    getAvailableCards(holeCards = [], boardCards = []) {
        const usedCards = [...holeCards, ...boardCards];
        const usedCardStrings = usedCards.map(card => card.card);
        
        return this.standardDeck.filter(card => !usedCardStrings.includes(card.card));
    }

    /**
     * Calculate outs - cards that improve the hand
     */
    calculateOuts(holeCards, boardCards = []) {
        if (!holeCards || holeCards.length !== 2) {
            return { outs: 0, description: 'Invalid hole cards' };
        }

        const availableCards = this.getAvailableCards(holeCards, boardCards);
        const currentHand = this.engine.evaluateHand([...holeCards, ...boardCards]);
        const currentStrength = currentHand.strength;

        let outs = 0;
        const improvingCards = [];
        const outTypes = {
            pair: 0,
            twoPair: 0,
            trips: 0,
            straight: 0,
            flush: 0,
            fullHouse: 0,
            quads: 0
        };

        // Test each available card to see if it improves the hand
        for (const card of availableCards) {
            const newBoard = [...boardCards, card];
            const newHand = this.engine.evaluateHand([...holeCards, ...newBoard]);
            
            if (newHand.strength > currentStrength) {
                outs++;
                improvingCards.push(card);
                
                // Categorize the type of improvement
                const improvement = this.categorizeImprovement(currentHand, newHand);
                if (outTypes[improvement] !== undefined) {
                    outTypes[improvement]++;
                }
            }
        }

        return {
            outs: outs,
            improvingCards: improvingCards,
            outTypes: outTypes,
            description: this.getOutsDescription(outs, outTypes)
        };
    }

    /**
     * Categorize the type of hand improvement
     */
    categorizeImprovement(oldHand, newHand) {
        if (newHand.type === 'FOUR_OF_A_KIND') return 'quads';
        if (newHand.type === 'FULL_HOUSE') return 'fullHouse';
        if (newHand.type === 'FLUSH') return 'flush';
        if (newHand.type === 'STRAIGHT') return 'straight';
        if (newHand.type === 'THREE_OF_A_KIND') return 'trips';
        if (newHand.type === 'TWO_PAIR') return 'twoPair';
        if (newHand.type === 'PAIR') return 'pair';
        return 'other';
    }

    /**
     * Generate description of outs
     */
    getOutsDescription(outs, outTypes) {
        if (outs === 0) return 'No outs - drawing dead';
        
        const descriptions = [];
        if (outTypes.quads > 0) descriptions.push(`${outTypes.quads} quads`);
        if (outTypes.fullHouse > 0) descriptions.push(`${outTypes.fullHouse} full house`);
        if (outTypes.flush > 0) descriptions.push(`${outTypes.flush} flush`);
        if (outTypes.straight > 0) descriptions.push(`${outTypes.straight} straight`);
        if (outTypes.trips > 0) descriptions.push(`${outTypes.trips} trips`);
        if (outTypes.twoPair > 0) descriptions.push(`${outTypes.twoPair} two pair`);
        if (outTypes.pair > 0) descriptions.push(`${outTypes.pair} pair`);
        
        return `${outs} outs: ${descriptions.join(', ')}`;
    }

    /**
     * Calculate hand equity against a range of opponent hands
     */
    calculateEquity(heroCards, villainRange, boardCards = [], simulations = 1000) {
        if (!heroCards || heroCards.length !== 2) {
            return { equity: 0, description: 'Invalid hero cards' };
        }

        let wins = 0;
        let ties = 0;
        let losses = 0;

        // Generate opponent hands from range
        const oppHands = this.generateHandsFromRange(villainRange, heroCards, boardCards);
        
        if (oppHands.length === 0) {
            return { equity: 50, description: 'No valid opponent hands' };
        }

        // Run simulations
        for (let sim = 0; sim < simulations; sim++) {
            // Pick random opponent hand
            const oppHand = oppHands[Math.floor(Math.random() * oppHands.length)];
            
            // Complete the board if needed
            const finalBoard = this.completeBoard(boardCards, [...heroCards, ...oppHand]);
            
            // Evaluate both hands
            const heroResult = this.engine.evaluateHand([...heroCards, ...finalBoard]);
            const villainResult = this.engine.evaluateHand([...oppHand, ...finalBoard]);
            
            if (heroResult.strength > villainResult.strength) {
                wins++;
            } else if (heroResult.strength === villainResult.strength) {
                ties++;
            } else {
                losses++;
            }
        }

        const equity = ((wins + ties / 2) / simulations) * 100;
        
        return {
            equity: Math.round(equity * 10) / 10,
            wins: wins,
            ties: ties,
            losses: losses,
            simulations: simulations,
            description: `${Math.round(equity)}% equity`
        };
    }

    /**
     * Generate hands from a simple range string
     */
    generateHandsFromRange(range, heroCards, boardCards) {
        const hands = [];
        const usedCards = [...heroCards, ...boardCards];
        const usedCardStrings = usedCards.map(card => card.card);
        
        // Simple range parsing - expand this for more complex ranges
        const rangeHands = this.parseSimpleRange(range);
        
        for (const handStr of rangeHands) {
            const handCards = this.generateHandCombinations(handStr);
            for (const combo of handCards) {
                // Check if any cards conflict with used cards
                const conflicted = combo.some(card => usedCardStrings.includes(card.card));
                if (!conflicted) {
                    hands.push(combo);
                }
            }
        }
        
        return hands;
    }

    /**
     * Parse simple range like "AA,KK,QQ,AK,AQ"
     */
    parseSimpleRange(range) {
        if (!range) return ['random']; // Default to any two cards
        
        return range.split(',').map(hand => hand.trim());
    }

    /**
     * Generate all combinations for a hand like "AK" or "AA"
     */
    generateHandCombinations(handStr) {
        const combinations = [];
        
        if (handStr === 'random') {
            // Generate some random hands - simplified
            const availableCards = this.getAvailableCards();
            for (let i = 0; i < 10; i++) {
                const card1 = availableCards[Math.floor(Math.random() * availableCards.length)];
                const card2 = availableCards[Math.floor(Math.random() * availableCards.length)];
                if (card1.card !== card2.card) {
                    combinations.push([card1, card2]);
                }
            }
            return combinations;
        }
        
        if (handStr.length === 2) {
            const rank1 = handStr[0];
            const rank2 = handStr[1];
            
            if (rank1 === rank2) {
                // Pocket pair - generate all suit combinations
                const suits = ['s', 'h', 'd', 'c'];
                for (let i = 0; i < suits.length; i++) {
                    for (let j = i + 1; j < suits.length; j++) {
                        const card1 = this.engine.parseCard(rank1 + suits[i]);
                        const card2 = this.engine.parseCard(rank2 + suits[j]);
                        if (card1 && card2) {
                            combinations.push([card1, card2]);
                        }
                    }
                }
            } else {
                // Two different ranks - generate suited and offsuit
                const suits = ['s', 'h', 'd', 'c'];
                for (const suit1 of suits) {
                    for (const suit2 of suits) {
                        if (suit1 !== suit2) { // Offsuit combinations
                            const card1 = this.engine.parseCard(rank1 + suit1);
                            const card2 = this.engine.parseCard(rank2 + suit2);
                            if (card1 && card2) {
                                combinations.push([card1, card2]);
                            }
                        }
                    }
                }
            }
        }
        
        return combinations;
    }

    /**
     * Complete the board with random cards
     */
    completeBoard(currentBoard, usedCards) {
        const targetSize = 5;
        if (currentBoard.length >= targetSize) {
            return currentBoard.slice(0, targetSize);
        }
        
        const availableCards = this.getAvailableCards(usedCards, currentBoard);
        const newBoard = [...currentBoard];
        
        while (newBoard.length < targetSize && availableCards.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableCards.length);
            const randomCard = availableCards.splice(randomIndex, 1)[0];
            newBoard.push(randomCard);
        }
        
        return newBoard;
    }

    /**
     * Calculate pot odds
     */
    calculatePotOdds(potSize, betSize) {
        if (!potSize || !betSize || betSize <= 0) {
            return { potOdds: 0, percentage: 0, description: 'Invalid bet sizing' };
        }
        
        const totalPot = potSize + betSize;
        const potOdds = betSize / totalPot;
        const percentage = potOdds * 100;
        
        return {
            potOdds: Math.round(potOdds * 100) / 100,
            percentage: Math.round(percentage * 10) / 10,
            description: `${Math.round(percentage)}% pot odds`
        };
    }

    /**
     * Calculate implied odds based on outs
     */
    calculateImpliedOdds(outs, cardsTocome = 1) {
        if (outs <= 0 || cardsTocome <= 0) {
            return { probability: 0, percentage: 0, description: 'No outs' };
        }
        
        const cardsRemaining = 52 - 2 - (5 - cardsTocome); // Approximate
        const probability = 1 - this.combination(cardsRemaining - outs, cardsTocome) / 
                              this.combination(cardsRemaining, cardsTocome);
        
        const percentage = probability * 100;
        
        return {
            probability: Math.round(probability * 1000) / 1000,
            percentage: Math.round(percentage * 10) / 10,
            description: `${Math.round(percentage)}% chance to improve`
        };
    }

    /**
     * Calculate combinations (n choose k)
     */
    combination(n, k) {
        if (k > n) return 0;
        if (k === 0 || k === n) return 1;
        
        let result = 1;
        for (let i = 0; i < k; i++) {
            result = result * (n - i) / (i + 1);
        }
        return result;
    }
}

// Export for use in other modules
window.EquityCalculator = EquityCalculator; 