/**
 * PokerNow GTO Copilot - GTO Strategy Advisor v2.6 - MONTE CARLO REALISM
 * Provides strategic poker advice based on game theory optimal play with mixed strategies
 * ✅ Features: High card bonuses, realistic decimal frequencies, Monte Carlo-style percentage variation
 * Last updated: 2024-05-24 - Added Monte Carlo realism to all percentage outputs
 */

// Version check - this should log "v2.6" if the updated file is loaded
console.log('🎯 GTO Advisor v2.6 LOADED - Monte Carlo Realism Active!');

class GTOAdvisor {
    constructor(pokerEngine, equityCalculator) {
        this.engine = pokerEngine;
        this.equity = equityCalculator;
        
        // Blind level configuration
        this.blindLevels = {
            smallBlind: 0.5,
            bigBlind: 1.0
        };
        
        // Monte Carlo variation cache for deterministic variance
        this.variationCache = new Map();
        
        // Position values for decision making
        this.positionValues = {
            'SB': 1, 'BB': 2, 'UTG': 3, 'UTG+1': 4, 'MP': 5, 
            'MP+1': 6, 'HJ': 7, 'CO': 8, 'BTN': 9
        };
        
        // Comprehensive preflop raising charts by position
        this.preflopCharts = {
            'UTG': {
                open: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AK', 'AQ', 'AJ', 'KQ'],
                openMixed: ['88', 'AT', 'KJ', 'QJ'],  // 50% frequency
                call3bet: ['AA', 'KK', 'QQ', 'JJ', 'AK'],
                call3betMixed: ['TT', '99', 'AQ'],    // 30% frequency
                fourBet: ['AA', 'KK', 'QQ', 'AK'],
                fourBetMixed: ['JJ'],                 // 25% frequency
                foldTo3bet: ['88', '77', 'AT', 'KJ', 'QJ', 'JT']
            },
            'UTG+1': {
                open: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', 'AK', 'AQ', 'AJ', 'AT', 'KQ', 'KJ'],
                openMixed: ['77', 'A9', 'KT', 'QJ'],
                call3bet: ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AK', 'AQ'],
                call3betMixed: ['99', 'AJ'],
                fourBet: ['AA', 'KK', 'QQ', 'AK'],
                fourBetMixed: ['JJ', 'AQ'],
                foldTo3bet: ['88', '77', 'AT', 'KJ', 'QJ', 'JT']
            },
            'MP': {
                open: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', 'AK', 'AQ', 'AJ', 'AT', 'A9', 'KQ', 'KJ', 'KT', 'QJ'],
                openMixed: ['66', '55', 'A8', 'A7', 'K9', 'QT', 'JT'],
                call3bet: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AK', 'AQ', 'AJ'],
                call3betMixed: ['88', '77', 'AT', 'KQ'],
                fourBet: ['AA', 'KK', 'QQ', 'JJ', 'AK'],
                fourBetMixed: ['TT', 'AQ'],
                foldTo3bet: ['66', '55', 'A9', 'A8', 'KJ', 'KT', 'QJ']
            },
            'MP+1': {
                open: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', 'AK', 'AQ', 'AJ', 'AT', 'A9', 'A8', 'KQ', 'KJ', 'KT', 'K9', 'QJ', 'QT', 'JT'],
                openMixed: ['55', '44', 'A7', 'A6', 'A5', 'Q9', 'J9', 'T9'],
                call3bet: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', 'AK', 'AQ', 'AJ', 'AT'],
                call3betMixed: ['77', '66', 'A9', 'KQ', 'KJ'],
                fourBet: ['AA', 'KK', 'QQ', 'JJ', 'AK', 'AQ'],
                fourBetMixed: ['TT', '99'],
                foldTo3bet: ['55', '44', 'A8', 'A7', 'KT', 'K9', 'QJ', 'QT']
            },
            'HJ': {
                open: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', 'AK', 'AQ', 'AJ', 'AT', 'A9', 'A8', 'A7', 'KQ', 'KJ', 'KT', 'K9', 'QJ', 'QT', 'Q9', 'JT', 'J9', 'T9'],
                openMixed: ['44', '33', '22', 'A6', 'A5', 'A4', 'A3', 'A2', 'K8', 'K7', 'Q8', 'J8', 'T8', '98'],
                call3bet: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', 'AK', 'AQ', 'AJ', 'AT', 'A9'],
                call3betMixed: ['66', '55', 'A8', 'A7', 'KQ', 'KJ', 'QJ'],
                fourBet: ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AK', 'AQ'],
                fourBetMixed: ['99', '88', 'AJ'],
                foldTo3bet: ['44', '33', '22', 'A6', 'A5', 'KT', 'K9', 'QT', 'Q9']
            },
            'CO': {
                open: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AK', 'AQ', 'AJ', 'AT', 'A9', 'A8', 'A7', 'A6', 'A5', 'A4', 'A3', 'A2', 'KQ', 'KJ', 'KT', 'K9', 'K8', 'K7', 'QJ', 'QT', 'Q9', 'Q8', 'JT', 'J9', 'J8', 'T9', 'T8', '98', '87'],
                openMixed: ['K6', 'K5', 'Q7', 'Q6', 'J7', 'T7', '97', '86', '76', '65'],
                call3bet: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', 'AK', 'AQ', 'AJ', 'AT', 'A9', 'A8'],
                call3betMixed: ['55', '44', 'A7', 'A6', 'A5', 'KQ', 'KJ', 'KT', 'QJ'],
                fourBet: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AK', 'AQ', 'AJ'],
                fourBetMixed: ['88', '77', 'AT'],
                foldTo3bet: ['33', '22', 'A4', 'A3', 'A2', 'K9', 'K8', 'QT', 'Q9']
            },
            'BTN': {
                open: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AK', 'AQ', 'AJ', 'AT', 'A9', 'A8', 'A7', 'A6', 'A5', 'A4', 'A3', 'A2', 'KQ', 'KJ', 'KT', 'K9', 'K8', 'K7', 'K6', 'K5', 'K4', 'K3', 'K2', 'QJ', 'QT', 'Q9', 'Q8', 'Q7', 'Q6', 'JT', 'J9', 'J8', 'J7', 'J6', 'T9', 'T8', 'T7', 'T6', '98', '97', '96', '87', '86', '76', '75', '65', '64', '54'],
                openMixed: ['Q5', 'Q4', 'Q3', 'Q2', 'J5', 'J4', 'J3', 'J2', 'T5', 'T4', 'T3', 'T2', '95', '94', '85', '74', '63', '53', '43'],
                call3bet: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', 'AK', 'AQ', 'AJ', 'AT', 'A9', 'A8', 'A7'],
                call3betMixed: ['44', '33', 'A6', 'A5', 'A4', 'KQ', 'KJ', 'KT', 'K9', 'QJ', 'QT'],
                fourBet: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', 'AK', 'AQ', 'AJ', 'AT'],
                fourBetMixed: ['77', '66', 'A9'],
                foldTo3bet: ['22', 'A3', 'A2', 'K8', 'K7', 'Q9', 'Q8', 'JT', 'J9']
            },
            'SB': {
                open: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AK', 'AQ', 'AJ', 'AT', 'A9', 'A8', 'A7', 'A6', 'A5', 'A4', 'A3', 'A2', 'KQ', 'KJ', 'KT', 'K9', 'K8', 'K7', 'K6', 'K5', 'K4', 'K3', 'K2', 'QJ', 'QT', 'Q9', 'Q8', 'Q7', 'Q6', 'Q5', 'Q4', 'Q3', 'Q2', 'JT', 'J9', 'J8', 'J7', 'J6', 'J5', 'J4', 'J3', 'J2', 'T9', 'T8', 'T7', 'T6', 'T5', 'T4', 'T3', 'T2', '98', '97', '96', '95', '94', '93', '92', '87', '86', '85', '84', '83', '82', '76', '75', '74', '73', '72', '65', '64', '63', '62', '54', '53', '52', '43', '42', '32'],
                openMixed: [],  // SB opens very wide vs BB only
                call3bet: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', 'AK', 'AQ', 'AJ', 'AT', 'A9'],
                call3betMixed: ['66', '55', 'A8', 'A7', 'KQ', 'KJ'],
                fourBet: ['AA', 'KK', 'QQ', 'JJ', 'AK', 'AQ'],
                fourBetMixed: ['TT', '99', 'AJ'],
                foldTo3bet: ['88', '77', '66', 'A6', 'A5', 'KT', 'K9', 'QJ']
            },
            'BB': {
                // BB is mostly calling ranges, not opening
                call2bet: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AK', 'AQ', 'AJ', 'AT', 'A9', 'A8', 'A7', 'A6', 'A5', 'A4', 'A3', 'A2', 'KQ', 'KJ', 'KT', 'K9', 'K8', 'K7', 'K6', 'K5', 'K4', 'K3', 'K2', 'QJ', 'QT', 'Q9', 'Q8', 'Q7', 'Q6', 'Q5', 'Q4', 'JT', 'J9', 'J8', 'J7', 'J6', 'J5', 'T9', 'T8', 'T7', 'T6', '98', '97', '96', '87', '86', '76', '75', '65', '64', '54', '53', '43'],
                call2betMixed: ['Q3', 'Q2', 'J4', 'J3', 'J2', 'T5', 'T4', 'T3', 'T2', '95', '94', '85', '74', '63', '52', '42'],
                threebet: ['AA', 'KK', 'QQ', 'JJ', 'AK'],
                threebetMixed: ['TT', '99', 'AQ', 'AJ'],
                fold: ['32'] // almost never fold in BB vs single raise
            }
        };
        
        // Stack depth adjustments
        this.stackDepthAdjustments = {
            shallow: { // < 30bb
                tightenRange: 0.7,
                reduceBluffs: 0.5,
                increasePremiumFreq: 1.3
            },
            medium: { // 30-60bb
                tightenRange: 0.85,
                reduceBluffs: 0.8,
                increasePremiumFreq: 1.1
            },
            deep: { // > 60bb
                tightenRange: 1.0,
                reduceBluffs: 1.0,
                increasePremiumFreq: 1.0
            },
            veryDeep: { // > 150bb
                tightenRange: 1.15,
                reduceBluffs: 1.2,
                increasePremiumFreq: 0.9
            }
        };
    }

    /**
     * Get comprehensive poker advice with mixed strategy frequencies
     */
    getAdvice(gameState) {
        const {
            holeCards,
            boardCards = [],
            position = 'BTN',
            potSize = 0,
            toCall = 0,
            canRaise = true,
            activePlayers = 2,
            stackSize = 100,
            street = 'preflop',
            // Enhanced game state
            positionName = 'BTN',
            playerBets = [],
            opponentBets = [],
            facingBet = 0,
            bettingAction = [],
            effectiveStack = 100
        } = gameState;

        if (!holeCards || holeCards.length !== 2) {
            return {
                primaryAction: 'fold',
                strategy: { fold: 100 },
                strength: 0,
                confidence: 0,
                reasoning: 'Invalid hole cards'
            };
        }

        // Calculate stack depth info using current blind levels
        const stackDepthInfo = this.getStackDepthInfo(stackSize);

        let advice;
        
        switch (street) {
            case 'preflop':
                advice = this.getPreflopStrategy(holeCards, positionName, potSize, facingBet, activePlayers, stackSize, opponentBets, bettingAction);
                break;
            case 'flop':
            case 'turn':
            case 'river':
                advice = this.getPostflopStrategy(holeCards, boardCards, positionName, potSize, facingBet, canRaise, activePlayers, stackSize, street, opponentBets, bettingAction);
                break;
            default:
                advice = this.getPostflopStrategy(holeCards, boardCards, positionName, potSize, facingBet, canRaise, activePlayers, stackSize, 'flop', opponentBets, bettingAction);
        }

        return {
            ...advice,
            gameState: {
                street,
                position,
                potSize,
                toCall,
                stackSize
            },
            stackDepthInfo,
            blindLevels: this.blindLevels
        };
    }

    /**
     * Preflop mixed strategy with comprehensive raising charts and opponent analysis
     */
    getPreflopStrategy(holeCards, position, potSize, toCall, activePlayers, stackSize, opponentBets, bettingAction) {
        const handStrength = this.engine.getPreflopStrength(holeCards);
        const handNotation = this.getHandNotation(holeCards);
        const positionValue = this.positionValues[position] || 5;
        const potOdds = toCall > 0 ? this.equity.calculatePotOdds(potSize, toCall) : null;
        
        // Analyze betting action in detail
        const actionAnalysis = this.analyzeBettingAction(bettingAction, opponentBets, potSize, position);
        const stackDepth = this.getStackDepth(stackSize);
        const stackAdjustment = this.stackDepthAdjustments[stackDepth];
        
        // Run Monte Carlo simulation for equity analysis
        const equityAnalysis = this.runMonteCarloEquity(holeCards, [], activePlayers, 5000);
        
        // Determine opponent range based on action
        const opponentRange = this.estimateOpponentRange(actionAnalysis, position, activePlayers);
        
        // Calculate our equity vs opponent range
        const vsRangeEquity = this.calculateEquityVsRange(holeCards, opponentRange, 2000);
        
        // Analyze hand type and betting purpose
        const handAnalysis = this.analyzeHandType(holeCards, vsRangeEquity, handStrength, actionAnalysis);
        
        // Generate comprehensive strategy with all action types
        const strategy = this.generateComprehensiveStrategy(
            handAnalysis, actionAnalysis, position, potSize, toCall, 
            stackSize, activePlayers, vsRangeEquity, stackAdjustment
        );

        // Create context key for consistent variation
        const contextKey = `${handNotation}_${position}_${actionAnalysis.actionType || 'open'}_${stackSize}`;
        
        // Apply Monte Carlo variation to strategy frequencies
        const variedStrategy = this.applyVariationToStrategy(strategy.frequencies, contextKey);
        
        // Apply variation to confidence (based on primary action frequency)
        const baseConfidence = this.calculateConfidence(strategy.frequencies, strategy.primaryAction);
        const variedConfidence = this.applyMonteCarloVariation(baseConfidence, `${contextKey}_confidence`);
        
        // Apply variation to equity percentage  
        const variedEquity = this.applyMonteCarloVariation(vsRangeEquity.percentage, `${contextKey}_equity`);
        
        // Apply variation to hand strength
        const variedHandStrength = this.applyMonteCarloVariation(handStrength.strength, `${contextKey}_strength`);

        return {
            primaryAction: strategy.primaryAction,
            strategy: variedStrategy,
            betSize: strategy.betSize,
            confidence: variedConfidence,
            reasoning: strategy.reasoning,
            handStrength: variedHandStrength,
            handNotation,
            handType: handAnalysis.type,
            bettingPurpose: handAnalysis.purpose,
            equity: variedEquity,
            potOdds: potOdds?.description || 'N/A',
            position: position,
            actionAnalysis: actionAnalysis.description,
            stackDepth: stackDepth,
            chart: `${position} Chart`
        };
    }

    /**
     * Run Monte Carlo simulation to calculate equity
     */
    runMonteCarloEquity(holeCards, boardCards, opponents, iterations = 5000) {
        let wins = 0;
        let ties = 0;
        
        for (let i = 0; i < iterations; i++) {
            // Create deck without our hole cards and board cards
            const usedCards = [...holeCards, ...boardCards];
            const deck = this.createDeck().filter(card => !usedCards.includes(card));
            
            // Deal opponent hands
            const opponentHands = [];
            let deckIndex = 0;
            
            for (let opp = 0; opp < opponents - 1; opp++) {
                opponentHands.push([deck[deckIndex], deck[deckIndex + 1]]);
                deckIndex += 2;
            }
            
            // Complete the board if needed
            const finalBoard = [...boardCards];
            while (finalBoard.length < 5) {
                finalBoard.push(deck[deckIndex++]);
            }
            
            // Evaluate all hands
            const ourHand = this.engine.evaluateHand([...holeCards, ...finalBoard]);
            const opponentEvals = opponentHands.map(hand => 
                this.engine.evaluateHand([...hand, ...finalBoard])
            );
            
            // Find best opponent hand
            const bestOpponent = opponentEvals.reduce((best, current) => 
                this.compareHands(current, best) > 0 ? current : best
            );
            
            const comparison = this.compareHands(ourHand, bestOpponent);
            if (comparison > 0) wins++;
            else if (comparison === 0) ties++;
        }
        
        const winPercentage = ((wins + ties / 2) / iterations) * 100;
        
        return {
            percentage: winPercentage,
            wins,
            ties,
            losses: iterations - wins - ties,
            iterations,
            description: `${winPercentage.toFixed(1)}% equity vs ${opponents - 1} opponents`
        };
    }

    /**
     * Estimate opponent range based on their action
     */
    estimateOpponentRange(actionAnalysis, position, activePlayers) {
        const ranges = {
            // Tight ranges for early position opens
            'UTG_open': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AK', 'AQ', 'AJ', 'KQ'],
            'MP_open': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', 'AK', 'AQ', 'AJ', 'AT', 'KQ', 'KJ', 'QJ'],
            'CO_open': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', 'AK', 'AQ', 'AJ', 'AT', 'A9', 'KQ', 'KJ', 'KT', 'QJ', 'QT', 'JT'],
            'BTN_open': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AK', 'AQ', 'AJ', 'AT', 'A9', 'A8', 'A7', 'A6', 'A5', 'KQ', 'KJ', 'KT', 'K9', 'QJ', 'QT', 'Q9', 'JT', 'J9', 'T9', '98', '87', '76', '65', '54'],
            'SB_open': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AK', 'AQ', 'AJ', 'AT', 'A9', 'A8', 'A7', 'A6', 'A5', 'A4', 'A3', 'A2', 'KQ', 'KJ', 'KT', 'K9', 'K8', 'QJ', 'QT', 'Q9', 'JT', 'J9', 'T9', '98', '87', '76', '65', '54', '43'],
            
            // 3-bet ranges
            '3bet_tight': ['AA', 'KK', 'QQ', 'JJ', 'AK'],
            '3bet_standard': ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AK', 'AQ', 'A5s', 'A4s'],
            '3bet_loose': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AK', 'AQ', 'AJ', 'A5s', 'A4s', 'A3s', 'A2s', 'KJs', 'KTs', 'QJs'],
            
            // 4-bet ranges
            '4bet': ['AA', 'KK', 'QQ', 'AK'],
            '4bet_light': ['AA', 'KK', 'QQ', 'JJ', 'AK', 'A5s', 'A4s'],
            
            // Call ranges
            'call_tight': ['TT', '99', '88', '77', 'AQ', 'AJ', 'KQ', 'QJ', 'JT'],
            'call_loose': ['TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AQ', 'AJ', 'AT', 'A9', 'A8', 'A7', 'A6', 'A5', 'KQ', 'KJ', 'KT', 'K9', 'QJ', 'QT', 'JT', 'J9', 'T9', '98', '87', '76', '65', '54']
        };
        
        // Select appropriate range based on action type and sizing
        switch (actionAnalysis.actionType) {
            case 'facing2bet':
                if (actionAnalysis.sizing <= 2.5) return ranges.BTN_open;
                else if (actionAnalysis.sizing <= 3.5) return ranges.CO_open;
                else return ranges.MP_open;
                
            case 'facing3bet':
                if (actionAnalysis.sizing <= 8) return ranges['3bet_loose'];
                else if (actionAnalysis.sizing <= 12) return ranges['3bet_standard'];
                else return ranges['3bet_tight'];
                
            case 'facing4bet+':
                return actionAnalysis.sizing > 20 ? ranges['4bet'] : ranges['4bet_light'];
                
            case 'overlimpers':
                return ranges.call_loose;
                
            default:
                return ranges.CO_open; // Default assumption
        }
    }

    /**
     * Calculate equity vs specific opponent range - HARDCODED REALISTIC VALUES
     */
    calculateEquityVsRange(holeCards, opponentRange, iterations = 2000) {
        const handNotation = this.getHandNotation(holeCards);
        
        // Hardcoded realistic preflop equity table
        const equityTable = {
            // Premium hands (80%+ equity)
            'AA': 85, 'KK': 82, 'QQ': 80, 
            
            // Strong hands (65-79% equity)
            'JJ': 77, 'TT': 75, '99': 72, 'AKs': 67, 'AQs': 66, 'AKo': 65,
            
            // Good hands (60-64% equity)  
            '88': 69, 'AJs': 65, 'AQo': 64, 'AJo': 62, '77': 66, 'KQs': 63,
            'A9s': 62, 'ATo': 60, 'KJs': 61, 'KQo': 61, 
            
            // Medium hands (50-59% equity)
            '66': 63, '55': 60, 'A8s': 60, 'A9o': 60, 'KTs': 59, 'QJs': 59,
            'KJo': 59, 'A8o': 58, 'QTs': 57, 'KTo': 57, 'QJo': 57, '44': 57,
            'A7s': 58, 'J9s': 53, 'T9s': 52, 'JTs': 56, 'JTo': 54, '33': 54,
            'A7o': 56, 'A6s': 56, 'A6o': 54, 'K9s': 57, 'Q9s': 55, 'QTo': 55,
            'A5s': 55, 'A5o': 53, 'A4s': 54, 'A4o': 52, 'A3s': 53, 'A3o': 51,
            'A2s': 52, 'A2o': 50, '22': 51,
            
            // Weak but sometimes playable (40-49% equity)
            'K9o': 55, 'K8s': 55, 'K8o': 53, 'K7s': 53, 'K7o': 51, 'K6s': 51, 
            'K6o': 49, 'Q9o': 53, 'Q8s': 53, 'Q8o': 51, 'Q7s': 51, 'Q7o': 49,
            'J9o': 51, 'J8s': 51, 'J8o': 49, 'J7s': 49, 'J7o': 47, 'T9o': 50,
            'T8s': 50, 'T8o': 48, 'T7s': 47, 'T7o': 45, '98s': 49, '98o': 47,
            '97s': 45, '97o': 43, '87s': 47, '87o': 45, '86s': 43, '86o': 41,
            '76s': 45, '76o': 43, '75s': 41, '75o': 39, '65s': 43, '65o': 41,
            '64s': 39, '64o': 37, '54s': 41, '54o': 39, '53s': 37, '53o': 35,
            
            // Trash hands (20-39% equity) - These should mostly fold
            'K5s': 49, 'K5o': 47, 'K4s': 47, 'K4o': 45, 'K3s': 45, 'K3o': 43,
            'K2s': 43, 'K2o': 41, 'Q6s': 49, 'Q6o': 47, 'Q5s': 47, 'Q5o': 45,
            'Q4s': 45, 'Q4o': 43, 'Q3s': 43, 'Q3o': 41, 'Q2s': 41, 'Q2o': 39,
            'J6s': 47, 'J6o': 45, 'J5s': 45, 'J5o': 43, 'J4s': 43, 'J4o': 41,
            'J3s': 41, 'J3o': 39, 'J2s': 39, 'J2o': 37, 'T6s': 45, 'T6o': 43,
            'T5s': 43, 'T5o': 41, 'T4s': 41, 'T4o': 39, 'T3s': 39, 'T3o': 37,
            '96s': 43, '96o': 41, '95s': 41, '95o': 39, '94s': 39, '94o': 37,
            '93s': 37, '93o': 35, '85s': 41, '85o': 39, '84s': 39, '84o': 37,
            '83s': 37, '83o': 35, '74s': 39, '74o': 37, '73s': 37, '73o': 35,
            '63s': 37, '63o': 35, '62s': 35, '62o': 33, '52s': 35, '52o': 33,
            '43s': 35, '43o': 33, '42s': 33, '42o': 31, '32s': 31, '32o': 29,
            
            // Absolute trash (10-25% equity) - Should almost always fold
            'T2s': 37, 'T2o': 25, '92s': 35, '92o': 21, '82s': 35, '82o': 20,
            '72s': 35, '72o': 18, // 72o is the worst hand - 18% equity!
            '27o': 18, '37o': 22, '26o': 20, '36o': 24, '24o': 22, '34o': 25,
            '23o': 21, '25o': 23, '35o': 26, '28o': 22, '38o': 25, '29o': 24,
            '39o': 27, '2To': 26, '3To': 28, '45o': 30, '46o': 28, '47o': 30,
            '48o': 32, '49o': 34, '4To': 31, '56o': 33, '57o': 35, '58o': 37,
            '59o': 36, '5To': 34, '67o': 38, '68o': 40, '69o': 38, '6To': 36,
            '78o': 42, '79o': 40, '7To': 38, '89o': 44, '8To': 42, '9To': 46
        };
        
        // Get equity from table
        let equity = equityTable[handNotation];
        
        if (!equity) {
            // Fallback for missing hands - be conservative
            if (handNotation.length === 2) {
                // Pocket pair - estimate by rank
                const rank = handNotation[0];
                const rankValue = ['2','3','4','5','6','7','8','9','T','J','Q','K','A'].indexOf(rank);
                equity = 45 + rankValue * 2.5; // Conservative estimate
            } else if (handNotation.endsWith('s')) {
                equity = 40; // Suited default
            } else {
                equity = 30; // Offsuit default - be conservative
            }
        }
        
        // Range tightness adjustment
        const rangeTightness = opponentRange.length < 20 ? 'tight' : 
                              opponentRange.length < 40 ? 'standard' : 'loose';
        
        const adjustment = {
            'tight': 0.88,     // vs tight ranges, we have less equity
            'standard': 1.0,   // baseline
            'loose': 1.12      // vs loose ranges, we have more equity
        }[rangeTightness];
        
        const finalEquity = Math.max(5, Math.min(95, equity * adjustment));
        
        return {
            percentage: finalEquity,
            description: `${finalEquity.toFixed(1)}% vs range`,
            handsInRange: opponentRange.length
        };
    }

    /**
     * Expand hand range notation to actual hand combinations
     */
    expandHandRange(range) {
        const hands = [];
        const suits = ['h', 'd', 'c', 's'];
        
        for (const handStr of range) {
            if (handStr.length === 2) {
                // Pocket pair (e.g., "AA")
                const rank = handStr[0];
                for (let i = 0; i < suits.length; i++) {
                    for (let j = i + 1; j < suits.length; j++) {
                        hands.push([rank + suits[i], rank + suits[j]]);
                    }
                }
            } else if (handStr.endsWith('s')) {
                // Suited (e.g., "AKs")
                const rank1 = handStr[0];
                const rank2 = handStr[1];
                for (const suit of suits) {
                    hands.push([rank1 + suit, rank2 + suit]);
                }
            } else if (handStr.endsWith('o')) {
                // Offsuit (e.g., "AKo")
                const rank1 = handStr[0];
                const rank2 = handStr[1];
                for (let i = 0; i < suits.length; i++) {
                    for (let j = 0; j < suits.length; j++) {
                        if (i !== j) {
                            hands.push([rank1 + suits[i], rank2 + suits[j]]);
                        }
                    }
                }
            } else if (handStr.length === 3) {
                // Both suited and offsuit (e.g., "AK")
                const rank1 = handStr[0];
                const rank2 = handStr[1];
                // Add suited
                for (const suit of suits) {
                    hands.push([rank1 + suit, rank2 + suit]);
                }
                // Add offsuit
                for (let i = 0; i < suits.length; i++) {
                    for (let j = 0; j < suits.length; j++) {
                        if (i !== j) {
                            hands.push([rank1 + suits[i], rank2 + suits[j]]);
                        }
                    }
                }
            }
        }
        
        return hands;
    }

    /**
     * Check if two hands have conflicting cards
     */
    handsConflict(hand1, hand2) {
        const allCards = [...hand1, ...hand2];
        return allCards.length !== new Set(allCards).size;
    }

    /**
     * Run heads-up equity calculation
     */
    runHeadsUpEquity(hand1, hand2, iterations = 1000) {
        let wins = 0;
        let ties = 0;
        
        for (let i = 0; i < iterations; i++) {
            const usedCards = [...hand1, ...hand2];
            const deck = this.createDeck().filter(card => !usedCards.includes(card));
            
            // Deal 5 board cards
            const board = [];
            for (let j = 0; j < 5; j++) {
                board.push(deck[Math.floor(Math.random() * (deck.length - j)) + j]);
            }
            
            const eval1 = this.engine.evaluateHand([...hand1, ...board]);
            const eval2 = this.engine.evaluateHand([...hand2, ...board]);
            
            const comparison = this.compareHands(eval1, eval2);
            if (comparison > 0) wins++;
            else if (comparison === 0) ties++;
        }
        
        const winPercentage = ((wins + ties / 2) / iterations) * 100;
        return { percentage: winPercentage, wins, ties };
    }

    /**
     * Analyze hand type and betting purpose
     */
    analyzeHandType(holeCards, equity, handStrength, actionAnalysis) {
        const handNotation = this.getHandNotation(holeCards);
        const equityPercent = equity.percentage;
        
        // Categorize hand strength
        let type, purpose;
        
        if (equityPercent >= 65) {
            type = 'premium';
            purpose = 'value';
        } else if (equityPercent >= 55) {
            type = 'strong';
            purpose = 'value';
        } else if (equityPercent >= 45) {
            type = 'medium';
            purpose = 'mixed'; // Can go for value or bluff depending on situation
        } else if (this.hasBluffPotential(handNotation)) {
            type = 'bluff_candidate';
            purpose = 'bluff';
        } else if (this.hasDrawPotential(holeCards)) {
            type = 'semi_bluff';
            purpose = 'semi_bluff';
        } else {
            type = 'weak';
            purpose = 'fold';
        }
        
        // Adjust based on action faced
        if (actionAnalysis.actionType === 'facing3bet' || actionAnalysis.actionType === 'facing4bet+') {
            if (equityPercent < 60) {
                purpose = 'fold';
            }
        }
        
        return { type, purpose, equity: equityPercent };
    }

    /**
     * Check if hand has bluff potential
     */
    hasBluffPotential(handNotation) {
        const bluffHands = [
            'A5s', 'A4s', 'A3s', 'A2s', 'K9s', 'K8s', 'Q9s', 'J9s', 'T9s', 
            '98s', '87s', '76s', '65s', '54s', '43s'
        ];
        return bluffHands.includes(handNotation);
    }

    /**
     * Check if hand has draw potential
     */
    hasDrawPotential(holeCards) {
        const handNotation = this.getHandNotation(holeCards);
        const suitedConnectors = /^[AKQJT98765432][AKQJT98765432]s$/;
        const gappers = ['A5s', 'A4s', 'A3s', 'A2s', 'K9s', 'Q9s', 'J8s', 'T8s', '97s', '86s', '75s', '64s'];
        
        return suitedConnectors.test(handNotation) || gappers.includes(handNotation);
    }

    /**
     * Generate comprehensive strategy with multiple action types
     */
    generateComprehensiveStrategy(handAnalysis, actionAnalysis, position, potSize, toCall, stackSize, activePlayers, equity, stackAdjustment) {
        const { type, purpose } = handAnalysis;
        const positionBonus = this.getPositionAdjustment(position);
        const sizingPenalty = this.getSizingAdjustment(actionAnalysis.sizing);
        
        let frequencies = {};
        let primaryAction = 'fold';
        let betSize = 0;
        let reasoning = '';
        
        if (toCall === 0) {
            // First to act - opening decision
            const openStrategy = this.generateOpeningStrategy(handAnalysis, position, potSize, stackSize, activePlayers, positionBonus, stackAdjustment);
            frequencies = openStrategy.frequencies;
            primaryAction = openStrategy.primaryAction;
            betSize = openStrategy.betSize;
            reasoning = openStrategy.reasoning;
            
        } else {
            // Facing action - response decision
            const responseStrategy = this.generateResponseStrategy(handAnalysis, actionAnalysis, position, toCall, potSize, stackSize, equity, positionBonus, sizingPenalty, stackAdjustment);
            frequencies = responseStrategy.frequencies;
            primaryAction = responseStrategy.primaryAction;
            betSize = responseStrategy.betSize;
            reasoning = responseStrategy.reasoning;
        }
        
        return { frequencies, primaryAction, betSize, reasoning };
    }

    /**
     * Generate opening strategy with multiple actions
     */
    generateOpeningStrategy(handAnalysis, position, potSize, stackSize, activePlayers, positionBonus, stackAdjustment) {
        const { type, purpose, equity } = handAnalysis;
        
        let frequencies = {};
        let primaryAction = 'fold';
        let betSize = this.getStandardOpenSize(position, activePlayers);
        let reasoning = '';
        
        switch (purpose) {
            case 'value':
                if (type === 'premium') {
                    frequencies = { 'raise': 92, 'fold': 8 };
                    primaryAction = 'raise';
                    reasoning = `Premium value hand (${equity.toFixed(1)}% equity). Raise 92% for value from ${position}.`;
                } else {
                    frequencies = { 'raise': 78, 'fold': 22 };
                    primaryAction = 'raise';
                    reasoning = `Strong value hand (${equity.toFixed(1)}% equity). Raise 78% for value from ${position}.`;
                }
                break;
                
            case 'mixed':
                const raiseFreq = Math.min(65, 50 * positionBonus * stackAdjustment.tightenRange);
                frequencies = { 'raise': raiseFreq, 'fold': 100 - raiseFreq };
                primaryAction = raiseFreq >= 50 ? 'raise' : 'fold';
                reasoning = `Medium strength hand (${equity.toFixed(1)}% equity). Mixed strategy from ${position}: raise ${raiseFreq}% for thin value.`;
                break;
                
            case 'bluff':
                const bluffFreq = Math.min(35, 25 * positionBonus * stackAdjustment.reduceBluffs);
                frequencies = { 'raise': bluffFreq, 'fold': 100 - bluffFreq };
                primaryAction = 'fold';
                reasoning = `Bluff candidate with ${equity.toFixed(1)}% equity. Bluff raise ${bluffFreq}% from ${position} for fold equity.`;
                break;
                
            case 'semi_bluff':
                const semiBluffFreq = Math.min(45, 35 * positionBonus);
                frequencies = { 'raise': semiBluffFreq, 'fold': 100 - semiBluffFreq };
                primaryAction = semiBluffFreq >= 40 ? 'raise' : 'fold';
                reasoning = `Semi-bluff hand with ${equity.toFixed(1)}% equity and good potential. Raise ${semiBluffFreq}% from ${position}.`;
                break;
                
            default:
                frequencies = { 'fold': 95, 'raise': 5 };
                primaryAction = 'fold';
                reasoning = `Weak hand with ${equity.toFixed(1)}% equity. Fold 95% from ${position}.`;
        }
        
        return { frequencies, primaryAction, betSize, reasoning };
    }

    /**
     * Generate response strategy with multiple actions
     */
    generateResponseStrategy(handAnalysis, actionAnalysis, position, toCall, potSize, stackSize, equity, positionBonus, sizingPenalty, stackAdjustment) {
        const { type, purpose } = handAnalysis;
        const equityPercent = equity.percentage;
        
        let frequencies = {};
        let primaryAction = 'fold';
        let betSize = 0;
        let reasoning = '';
        
        switch (purpose) {
            case 'value':
                if (type === 'premium') {
                    if (actionAnalysis.actionType === 'facing2bet') {
                        const threebetFreq = Math.min(85, 70 * stackAdjustment.increasePremiumFreq);
                        const callFreq = Math.min(20, 15 * sizingPenalty);
                        frequencies = { '3bet': threebetFreq, 'call': callFreq, 'fold': 100 - threebetFreq - callFreq };
                        primaryAction = '3bet';
                        betSize = this.get3betSize(toCall, actionAnalysis.sizing);
                        reasoning = `Premium value hand (${equityPercent.toFixed(1)}% equity). 3-bet ${threebetFreq}% for value vs ${actionAnalysis.sizing.toFixed(1)}bb open.`;
                    } else if (actionAnalysis.actionType === 'facing3bet') {
                        const callFreq = Math.min(80, 65 * sizingPenalty);
                        const fourbetFreq = Math.min(25, 20 * stackAdjustment.increasePremiumFreq);
                        frequencies = { 'call': callFreq, '4bet': fourbetFreq, 'fold': 100 - callFreq - fourbetFreq };
                        primaryAction = 'call';
                        betSize = this.get4betSize(toCall, actionAnalysis.sizing);
                        reasoning = `Premium hand vs 3-bet (${equityPercent.toFixed(1)}% equity). Call ${callFreq}% to play postflop, 4-bet ${fourbetFreq}% for value.`;
                    }
                } else {
                    // Strong but not premium
                    if (actionAnalysis.actionType === 'facing2bet') {
                        const threebetFreq = Math.min(35, 25 * positionBonus * stackAdjustment.increasePremiumFreq);
                        const callFreq = Math.min(65, 55 * sizingPenalty);
                        frequencies = { 'call': callFreq, '3bet': threebetFreq, 'fold': 100 - callFreq - threebetFreq };
                        primaryAction = 'call';
                        betSize = this.get3betSize(toCall, actionAnalysis.sizing);
                        reasoning = `Strong value hand (${equityPercent.toFixed(1)}% equity). Call ${callFreq}% vs ${actionAnalysis.sizing.toFixed(1)}bb open, 3-bet ${threebetFreq}% for value.`;
                    }
                }
                break;
                
            case 'mixed':
                if (actionAnalysis.actionType === 'facing2bet') {
                    const callFreq = Math.min(55, 45 * sizingPenalty * stackAdjustment.tightenRange);
                    const threebetFreq = Math.min(15, 10 * positionBonus);
                    frequencies = { 'call': callFreq, '3bet': threebetFreq, 'fold': 100 - callFreq - threebetFreq };
                    primaryAction = callFreq >= 45 ? 'call' : 'fold';
                    betSize = this.get3betSize(toCall, actionAnalysis.sizing);
                    reasoning = `Medium strength (${equityPercent.toFixed(1)}% equity). Call ${callFreq}% vs ${actionAnalysis.sizing.toFixed(1)}bb, occasionally 3-bet ${threebetFreq}% as bluff.`;
                }
                break;
                
            case 'bluff':
                if (actionAnalysis.actionType === 'facing2bet' && (position === 'BTN' || position === 'CO')) {
                    const bluffThreebetFreq = Math.min(25, 18 * positionBonus * stackAdjustment.reduceBluffs);
                    frequencies = { '3bet': bluffThreebetFreq, 'fold': 100 - bluffThreebetFreq };
                    primaryAction = 'fold';
                    betSize = this.get3betSize(toCall, actionAnalysis.sizing);
                    reasoning = `Bluff candidate (${equityPercent.toFixed(1)}% equity) from ${position}. 3-bet bluff ${bluffThreebetFreq}% for fold equity.`;
                } else {
                    frequencies = { 'fold': 100 };
                    primaryAction = 'fold';
                    reasoning = `Weak bluff candidate (${equityPercent.toFixed(1)}% equity). Fold 100% vs ${actionAnalysis.sizing.toFixed(1)}bb from ${position}.`;
                }
                break;
                
            case 'semi_bluff':
                if (actionAnalysis.actionType === 'facing2bet') {
                    const callFreq = Math.min(45, 35 * sizingPenalty);
                    const threebetFreq = Math.min(20, 15 * positionBonus);
                    frequencies = { 'call': callFreq, '3bet': threebetFreq, 'fold': 100 - callFreq - threebetFreq };
                    primaryAction = callFreq >= threebetFreq ? 'call' : 'fold';
                    betSize = this.get3betSize(toCall, actionAnalysis.sizing);
                    reasoning = `Semi-bluff hand (${equityPercent.toFixed(1)}% equity + draw potential). Call ${callFreq}%, 3-bet ${threebetFreq}% as semi-bluff.`;
                }
                break;
                
            default:
                frequencies = { 'fold': 95, 'call': 5 };
                primaryAction = 'fold';
                reasoning = `Weak hand (${equityPercent.toFixed(1)}% equity). Fold 95% vs ${actionAnalysis.sizing.toFixed(1)}bb action.`;
        }
        
        // Ensure frequencies add up to 100
        const total = Object.values(frequencies).reduce((sum, freq) => sum + freq, 0);
        if (total !== 100) {
            const adjustment = (100 - total) / Object.keys(frequencies).length;
            for (const action in frequencies) {
                frequencies[action] = Math.max(0, Math.round(frequencies[action] + adjustment));
            }
        }
        
        return { frequencies, primaryAction, betSize, reasoning };
    }

    /**
     * Create a standard deck of cards
     */
    createDeck() {
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
        const suits = ['h', 'd', 'c', 's'];
        const deck = [];
        
        for (const rank of ranks) {
            for (const suit of suits) {
                deck.push(rank + suit);
            }
        }
        
        return deck;
    }

    /**
     * Compare two poker hands
     */
    compareHands(hand1, hand2) {
        // This is a simplified comparison - in practice, you'd use the poker engine
        if (hand1.rank > hand2.rank) return 1;
        if (hand1.rank < hand2.rank) return -1;
        return 0; // Tie
    }

    /**
     * Analyze the betting action to determine what we're facing
     */
    analyzeBettingAction(bettingAction, opponentBets, potSize, position) {
        if (!bettingAction || bettingAction.length === 0) {
            return {
                actionType: 'unopened',
                description: 'Unopened pot',
                aggression: 'none',
                sizing: 0,
                raisers: 0,
                limpers: 0,
                coldCallers: 0,
                isBlindVsBlind: false,
                isSqueeze: false
            };
        }

        const totalBets = opponentBets.reduce((sum, opp) => sum + opp.bet, 0);
        const maxBet = Math.max(...opponentBets.map(opp => opp.bet));
        const raisers = opponentBets.filter(opp => opp.bet > potSize * 0.4).length; // Adjusted for raise detection
        const limpers = opponentBets.filter(opp => opp.bet > 0 && opp.bet <= potSize * 0.3).length; // Big blind or smaller
        const coldCallers = opponentBets.filter(opp => opp.bet > potSize * 0.3 && opp.bet < maxBet).length;
        const bbSize = potSize / 3; // More accurate BB estimation (assuming SB is 0.5bb, BB is 1bb, so pot starts at 1.5bb)
        
        // Detect blind vs blind scenarios
        const isBlindVsBlind = position === 'SB' && opponentBets.length === 1;
        
        // Detect squeeze scenarios (raise + call(s) behind us)
        const isSqueeze = raisers === 1 && coldCallers >= 1;
        
        let actionType, sizing, aggression;
        
        if (raisers === 0 && limpers === 0) {
            actionType = 'unopened';
            aggression = 'none';
            sizing = 0;
        } else if (raisers === 0 && limpers > 0) {
            actionType = 'overlimpers';
            sizing = 1.0; // Just big blind
            aggression = 'passive';
        } else if (raisers === 1 && limpers === 0) {
            actionType = 'facing2bet';
            sizing = maxBet / bbSize;
            aggression = sizing > 4 ? 'very_aggressive' : sizing > 3 ? 'aggressive' : sizing > 2.2 ? 'standard' : 'small';
        } else if (raisers === 1 && limpers > 0) {
            actionType = 'isolateRaise';
            sizing = maxBet / bbSize;
            aggression = sizing > 5 ? 'very_aggressive' : sizing > 3.5 ? 'aggressive' : 'standard';
        } else if (raisers === 1 && coldCallers > 0 && !isSqueeze) {
            actionType = 'facingCall';
            sizing = maxBet / bbSize;
            aggression = 'standard';
        } else if (isSqueeze) {
            actionType = 'squeezeSpot';
            sizing = maxBet / bbSize;
            aggression = coldCallers > 1 ? 'very_aggressive' : 'aggressive';
        } else if (raisers === 2) {
            actionType = 'facing3bet';
            sizing = maxBet / bbSize;
            aggression = sizing > 15 ? 'very_aggressive' : sizing > 10 ? 'aggressive' : 'standard';
        } else if (raisers >= 3) {
            actionType = 'facing4bet+';
            sizing = maxBet / bbSize;
            aggression = 'very_aggressive';
        } else if (opponentBets.filter(opp => opp.bet > 0).length > 2) {
            actionType = 'multiway';
            sizing = maxBet / bbSize;
            aggression = totalBets > potSize * 1.5 ? 'aggressive' : 'standard';
        } else {
            actionType = 'complex';
            sizing = maxBet / bbSize;
            aggression = 'unknown';
        }

        return {
            actionType,
            description: `${actionType} (${sizing.toFixed(1)}bb, ${aggression}${limpers > 0 ? `, ${limpers} limpers` : ''}${coldCallers > 0 ? `, ${coldCallers} callers` : ''})`,
            aggression,
            sizing,
            raisers,
            limpers,
            coldCallers,
            totalAction: totalBets,
            isBlindVsBlind,
            isSqueeze
        };
    }

    /**
     * Get opening decision based on charts
     */
    getOpeningDecision(handNotation, chart, stackAdjustment, activePlayers, position) {
        const inOpenRange = chart.open && chart.open.includes(handNotation);
        const inMixedRange = chart.openMixed && chart.openMixed.includes(handNotation);
        
        // Apply stack depth adjustments
        const rangeMultiplier = stackAdjustment.tightenRange;
        const bluffMultiplier = stackAdjustment.reduceBluffs;
        
        if (inOpenRange) {
            const openFreq = Math.min(95, 85 * rangeMultiplier);
            const foldFreq = 100 - openFreq;
            return {
                strategy: { 'raise': openFreq, 'fold': foldFreq },
                action: 'raise',
                betSize: this.getStandardOpenSize(position, activePlayers),
                reasoning: `Premium opening hand from ${position}. Standard open ${openFreq}% with ${handNotation}.`
            };
        } else if (inMixedRange) {
            const openFreq = Math.min(65, 50 * rangeMultiplier * bluffMultiplier);
            const foldFreq = 100 - openFreq;
            return {
                strategy: { 'raise': openFreq, 'fold': foldFreq },
                action: openFreq >= 50 ? 'raise' : 'fold',
                betSize: this.getStandardOpenSize(position, activePlayers),
                reasoning: `Mixed range hand from ${position}. Open ${openFreq}% vs ${activePlayers} opponents.`
            };
        } else {
            // Check for position-specific light opens
            let bluffFreq = 0;
            if (position === 'BTN' && activePlayers <= 3) bluffFreq = 15 * bluffMultiplier;
            else if (position === 'CO' && activePlayers <= 4) bluffFreq = 8 * bluffMultiplier;
            else if (position === 'SB' && activePlayers === 2) bluffFreq = 25 * bluffMultiplier;
            
            const foldFreq = 100 - bluffFreq;
            return {
                strategy: { 'fold': foldFreq, 'raise': bluffFreq },
                action: 'fold',
                betSize: this.getStandardOpenSize(position, activePlayers),
                reasoning: `Outside opening range from ${position}. ${bluffFreq > 0 ? `Bluff ${bluffFreq}%` : 'Fold 100%'}.`
            };
        }
    }

    /**
     * Get decision when facing a 2-bet (initial raise)
     */
    getFaceRaiseDecision(handNotation, chart, actionAnalysis, stackAdjustment, activePlayers, position, potSize, toCall) {
        const in3betRange = chart.call3bet && chart.call3bet.includes(handNotation);
        const in3betMixed = chart.call3betMixed && chart.call3betMixed.includes(handNotation);
        const inCallRange = chart.call2bet && chart.call2bet.includes(handNotation);
        const inCallMixed = chart.call2betMixed && chart.call2betMixed.includes(handNotation);
        
        // Adjust for sizing and aggression
        const sizingAdjustment = this.getSizingAdjustment(actionAnalysis.sizing);
        const aggressionAdjustment = this.getAggressionAdjustment(actionAnalysis.aggression);
        const positionAdjustment = this.getPositionAdjustment(position);
        
        if (in3betRange) {
            const threebetFreq = Math.min(85, 70 * stackAdjustment.increasePremiumFreq * aggressionAdjustment * positionAdjustment);
            const callFreq = Math.min(25, 20 * sizingAdjustment);
            const foldFreq = 100 - threebetFreq - callFreq;
            
            return {
                strategy: { '3bet': threebetFreq, 'call': callFreq, 'fold': foldFreq },
                action: '3bet',
                betSize: this.get3betSize(toCall, actionAnalysis.sizing),
                reasoning: `Premium 3-bet hand vs ${actionAnalysis.sizing.toFixed(1)}bb ${actionAnalysis.aggression} open. 3-bet ${threebetFreq}%.`
            };
        } else if (in3betMixed) {
            const threebetFreq = Math.min(45, 30 * stackAdjustment.increasePremiumFreq * aggressionAdjustment * positionAdjustment);
            const callFreq = Math.min(50, 40 * sizingAdjustment);
            const foldFreq = 100 - threebetFreq - callFreq;
            
            return {
                strategy: { 'call': callFreq, '3bet': threebetFreq, 'fold': foldFreq },
                action: callFreq >= threebetFreq ? 'call' : '3bet',
                betSize: this.get3betSize(toCall, actionAnalysis.sizing),
                reasoning: `Mixed 3-bet/call hand vs ${actionAnalysis.sizing.toFixed(1)}bb open. Call ${callFreq}%, 3-bet ${threebetFreq}%.`
            };
        } else if (inCallRange) {
            const callFreq = Math.min(85, 75 * sizingAdjustment * stackAdjustment.tightenRange);
            const foldFreq = 100 - callFreq;
            
            return {
                strategy: { 'call': callFreq, 'fold': foldFreq },
                action: 'call',
                betSize: 0,
                reasoning: `Calling range hand vs ${actionAnalysis.sizing.toFixed(1)}bb ${actionAnalysis.aggression} open. Call ${callFreq}%.`
            };
        } else if (inCallMixed) {
            const callFreq = Math.min(55, 40 * sizingAdjustment * stackAdjustment.tightenRange);
            const foldFreq = 100 - callFreq;
            
            return {
                strategy: { 'call': callFreq, 'fold': foldFreq },
                action: callFreq >= 50 ? 'call' : 'fold',
                betSize: 0,
                reasoning: `Marginal calling hand vs ${actionAnalysis.sizing.toFixed(1)}bb open. Call ${callFreq}%.`
            };
        } else {
            // Light 3-bet bluffs based on position
            let bluff3betFreq = 0;
            if (position === 'BTN' || position === 'SB') bluff3betFreq = 8 * stackAdjustment.reduceBluffs * positionAdjustment;
            else if (position === 'CO' || position === 'BB') bluff3betFreq = 4 * stackAdjustment.reduceBluffs;
            
            const foldFreq = 100 - bluff3betFreq;
            
            return {
                strategy: { 'fold': foldFreq, '3bet': bluff3betFreq },
                action: 'fold',
                betSize: this.get3betSize(toCall, actionAnalysis.sizing),
                reasoning: `Outside calling range vs ${actionAnalysis.sizing.toFixed(1)}bb open. ${bluff3betFreq > 0 ? `Bluff 3-bet ${bluff3betFreq}%` : 'Fold 100%'}.`
            };
        }
    }

    /**
     * Get decision when facing a 3-bet
     */
    getFace3betDecision(handNotation, chart, actionAnalysis, stackAdjustment, activePlayers, position, potSize, toCall) {
        const inCall3betRange = chart.call3bet && chart.call3bet.includes(handNotation);
        const inCall3betMixed = chart.call3betMixed && chart.call3betMixed.includes(handNotation);
        const in4betRange = chart.fourBet && chart.fourBet.includes(handNotation);
        const in4betMixed = chart.fourBetMixed && chart.fourBetMixed.includes(handNotation);
        
        const sizingAdjustment = this.getSizingAdjustment(actionAnalysis.sizing);
        const aggressionAdjustment = this.getAggressionAdjustment(actionAnalysis.aggression);
        
        if (in4betRange) {
            const fourbetFreq = Math.min(90, 80 * stackAdjustment.increasePremiumFreq);
            const callFreq = Math.min(15, 10 * sizingAdjustment);
            const foldFreq = 100 - fourbetFreq - callFreq;
            
            return {
                strategy: { '4bet': fourbetFreq, 'call': callFreq, 'fold': foldFreq },
                action: '4bet',
                betSize: this.get4betSize(toCall, actionAnalysis.sizing),
                reasoning: `Premium 4-bet hand vs ${actionAnalysis.sizing.toFixed(1)}bb 3-bet. 4-bet ${fourbetFreq}% for value.`
            };
        } else if (in4betMixed) {
            const fourbetFreq = Math.min(35, 25 * stackAdjustment.increasePremiumFreq * aggressionAdjustment);
            const callFreq = Math.min(45, 35 * sizingAdjustment);
            const foldFreq = 100 - fourbetFreq - callFreq;
            
            return {
                strategy: { 'call': callFreq, '4bet': fourbetFreq, 'fold': foldFreq },
                action: callFreq >= fourbetFreq ? 'call' : '4bet',
                betSize: this.get4betSize(toCall, actionAnalysis.sizing),
                reasoning: `Mixed 4-bet/call hand vs ${actionAnalysis.sizing.toFixed(1)}bb 3-bet. Call ${callFreq}%, 4-bet ${fourbetFreq}%.`
            };
        } else if (inCall3betRange) {
            const callFreq = Math.min(80, 70 * sizingAdjustment * stackAdjustment.tightenRange);
            const foldFreq = 100 - callFreq;
            
            return {
                strategy: { 'call': callFreq, 'fold': foldFreq },
                action: 'call',
                betSize: 0,
                reasoning: `Calling range vs ${actionAnalysis.sizing.toFixed(1)}bb 3-bet. Call ${callFreq}%, see flop.`
            };
        } else if (inCall3betMixed) {
            const callFreq = Math.min(40, 30 * sizingAdjustment * stackAdjustment.tightenRange);
            const foldFreq = 100 - callFreq;
            
            return {
                strategy: { 'call': callFreq, 'fold': foldFreq },
                action: callFreq >= 35 ? 'call' : 'fold',
                betSize: 0,
                reasoning: `Marginal hand vs ${actionAnalysis.sizing.toFixed(1)}bb 3-bet. Call ${callFreq}%.`
            };
        } else {
            // Light 4-bet bluffs only from position with good hands not in range
            let bluff4betFreq = 0;
            if ((position === 'BTN' || position === 'CO') && actionAnalysis.sizing <= 10) {
                bluff4betFreq = 5 * stackAdjustment.reduceBluffs;
            }
            
            const foldFreq = 100 - bluff4betFreq;
            
            return {
                strategy: { 'fold': foldFreq, '4bet': bluff4betFreq },
                action: 'fold',
                betSize: this.get4betSize(toCall, actionAnalysis.sizing),
                reasoning: `Outside calling range vs ${actionAnalysis.sizing.toFixed(1)}bb 3-bet. ${bluff4betFreq > 0 ? `Bluff 4-bet ${bluff4betFreq}%` : 'Fold 100%'}.`
            };
        }
    }

    /**
     * Get decision when facing a 4-bet
     */
    getFace4betDecision(handNotation, chart, actionAnalysis, stackAdjustment, activePlayers, position, potSize, toCall) {
        // Against 4-bets, we only continue with very premium hands
        const premiumHands = ['AA', 'KK', 'QQ', 'AK'];
        const strongHands = ['JJ', 'TT', 'AQ'];
        
        if (premiumHands.includes(handNotation)) {
            const callFreq = actionAnalysis.sizing > 30 ? 75 : 85; // Smaller vs huge 4-bets
            const foldFreq = 100 - callFreq;
            
            return {
                strategy: { 'call': callFreq, 'fold': foldFreq },
                action: 'call',
                betSize: 0,
                reasoning: `Premium hand vs ${actionAnalysis.sizing.toFixed(1)}bb 4-bet. Call ${callFreq}%, play for stacks.`
            };
        } else if (strongHands.includes(handNotation) && actionAnalysis.sizing <= 25) {
            const callFreq = 45 * stackAdjustment.tightenRange;
            const foldFreq = 100 - callFreq;
            
            return {
                strategy: { 'call': callFreq, 'fold': foldFreq },
                action: callFreq >= 40 ? 'call' : 'fold',
                betSize: 0,
                reasoning: `Strong hand vs ${actionAnalysis.sizing.toFixed(1)}bb 4-bet. Call ${callFreq}%.`
            };
        } else {
            return {
                strategy: { 'fold': 100 },
                action: 'fold',
                betSize: 0,
                reasoning: `Fold vs ${actionAnalysis.sizing.toFixed(1)}bb 4-bet. Too strong opponent action.`
            };
        }
    }

    /**
     * Get decision when limpers are ahead (overlimper strategy)
     */
    getOverlimperDecision(handNotation, chart, actionAnalysis, stackAdjustment, activePlayers, position, potSize, toCall) {
        const limperCount = actionAnalysis.limpers;
        const premiumHands = ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AK', 'AQ'];
        const strongHands = ['99', '88', '77', 'AJ', 'AT', 'KQ', 'KJ'];
        const playableHands = ['66', '55', '44', 'A9', 'A8', 'KT', 'K9', 'QJ', 'QT', 'JT'];
        const speculativeHands = ['33', '22', 'A7', 'A6', 'A5', 'A4', 'A3', 'A2', 'Q9', 'J9', 'T9', '98', '87', '76', '65', '54'];
        
        // Isolation raise strategy - tighter with more limpers, looser in position
        const positionBonus = this.getPositionAdjustment(position);
        const limperPenalty = Math.max(0.6, 1.0 - (limperCount - 1) * 0.15);
        
        if (premiumHands.includes(handNotation)) {
            const raiseFreq = Math.min(95, 85 * stackAdjustment.increasePremiumFreq);
            const foldFreq = 100 - raiseFreq;
            return {
                strategy: { 'raise': raiseFreq, 'fold': foldFreq },
                action: 'raise',
                betSize: this.getIsolationSize(limperCount, position),
                reasoning: `Premium hand vs ${limperCount} limpers from ${position}. Isolation raise ${raiseFreq}%.`
            };
        } else if (strongHands.includes(handNotation)) {
            const raiseFreq = Math.min(80, 65 * positionBonus * limperPenalty * stackAdjustment.tightenRange);
            const callFreq = Math.min(25, 20 * limperPenalty);
            const foldFreq = 100 - raiseFreq - callFreq;
            return {
                strategy: { 'raise': raiseFreq, 'call': callFreq, 'fold': foldFreq },
                action: raiseFreq >= 50 ? 'raise' : raiseFreq >= callFreq ? 'raise' : 'call',
                betSize: this.getIsolationSize(limperCount, position),
                reasoning: `Strong hand vs ${limperCount} limpers from ${position}. Isolate ${raiseFreq}%, call ${callFreq}%.`
            };
        } else if (playableHands.includes(handNotation) && position !== 'SB' && position !== 'BB') {
            const raiseFreq = Math.min(45, 30 * positionBonus * limperPenalty);
            const callFreq = Math.min(40, 35 * limperPenalty);
            const foldFreq = 100 - raiseFreq - callFreq;
            return {
                strategy: { 'call': callFreq, 'raise': raiseFreq, 'fold': foldFreq },
                action: callFreq >= raiseFreq ? 'call' : 'raise',
                betSize: this.getIsolationSize(limperCount, position),
                reasoning: `Playable hand vs ${limperCount} limpers from ${position}. Call ${callFreq}%, isolate ${raiseFreq}%.`
            };
        } else if (speculativeHands.includes(handNotation) && limperCount >= 2 && (position === 'BTN' || position === 'CO')) {
            const callFreq = Math.min(65, 50 * limperPenalty);
            const foldFreq = 100 - callFreq;
            return {
                strategy: { 'call': callFreq, 'fold': foldFreq },
                action: callFreq >= 50 ? 'call' : 'fold',
                betSize: 0,
                reasoning: `Speculative hand vs ${limperCount} limpers from ${position}. Call ${callFreq}% for implied odds.`
            };
        } else {
            return {
                strategy: { 'fold': 100 },
                action: 'fold',
                betSize: 0,
                reasoning: `Weak hand vs ${limperCount} limpers from ${position}. Fold 100%.`
            };
        }
    }

    /**
     * Get decision when facing isolation raise over limpers
     */
    getIsolationDecision(handNotation, chart, actionAnalysis, stackAdjustment, activePlayers, position, potSize, toCall) {
        const limperCount = actionAnalysis.limpers;
        const premiumHands = ['AA', 'KK', 'QQ', 'JJ', 'AK'];
        const strongHands = ['TT', '99', '88', 'AQ', 'AJ'];
        const playableHands = ['77', '66', '55', 'AT', 'KQ', 'KJ', 'QJ'];
        
        // Tighten significantly vs isolation raises - they have wide but strong ranges
        const sizingAdjustment = this.getSizingAdjustment(actionAnalysis.sizing);
        const multiwayFactor = Math.max(0.7, 1.0 - limperCount * 0.1); // Tighter with more limpers behind
        
        if (premiumHands.includes(handNotation)) {
            const threebetFreq = Math.min(75, 60 * stackAdjustment.increasePremiumFreq * multiwayFactor);
            const callFreq = Math.min(30, 25 * sizingAdjustment);
            const foldFreq = 100 - threebetFreq - callFreq;
            
            return {
                strategy: { '3bet': threebetFreq, 'call': callFreq, 'fold': foldFreq },
                action: '3bet',
                betSize: this.get3betSize(toCall, actionAnalysis.sizing),
                reasoning: `Premium hand vs ${actionAnalysis.sizing.toFixed(1)}bb isolation over ${limperCount} limpers. 3-bet ${threebetFreq}%.`
            };
        } else if (strongHands.includes(handNotation)) {
            const callFreq = Math.min(70, 55 * sizingAdjustment * multiwayFactor);
            const threebetFreq = Math.min(20, 15 * stackAdjustment.increasePremiumFreq);
            const foldFreq = 100 - callFreq - threebetFreq;
            
            return {
                strategy: { 'call': callFreq, '3bet': threebetFreq, 'fold': foldFreq },
                action: 'call',
                betSize: this.get3betSize(toCall, actionAnalysis.sizing),
                reasoning: `Strong hand vs isolation. Call ${callFreq}%, 3-bet ${threebetFreq}% vs ${limperCount} limpers.`
            };
        } else if (playableHands.includes(handNotation) && limperCount >= 2) {
            const callFreq = Math.min(45, 35 * sizingAdjustment * multiwayFactor);
            const foldFreq = 100 - callFreq;
            
            return {
                strategy: { 'call': callFreq, 'fold': foldFreq },
                action: callFreq >= 40 ? 'call' : 'fold',
                betSize: 0,
                reasoning: `Playable hand vs isolation with ${limperCount} limpers. Call ${callFreq}% multiway.`
            };
        } else {
            return {
                strategy: { 'fold': 90, 'call': 10 },
                action: 'fold',
                betSize: 0,
                reasoning: `Weak hand vs ${actionAnalysis.sizing.toFixed(1)}bb isolation over limpers. Fold 90%.`
            };
        }
    }

    /**
     * Get decision in squeeze spots (raise + call(s) ahead)
     */
    getSqueezeDecision(handNotation, chart, actionAnalysis, stackAdjustment, activePlayers, position, potSize, toCall) {
        const coldCallers = actionAnalysis.coldCallers;
        const premiumHands = ['AA', 'KK', 'QQ', 'JJ', 'AK'];
        const strongHands = ['TT', '99', 'AQ', 'AJ'];
        const squeezeBluffHands = ['A5s', 'A4s', 'A3s', 'A2s', 'K9s', 'K8s', 'Q9s', 'J9s', 'T9s', '98s', '87s', '76s', '65s', '54s'];
        
        // Squeeze play - very profitable spot but need to be selective
        const positionBonus = this.getPositionAdjustment(position);
        const callerPenalty = Math.max(0.6, 1.0 - coldCallers * 0.2);
        
        if (premiumHands.includes(handNotation)) {
            const squeezeFreq = Math.min(90, 80 * stackAdjustment.increasePremiumFreq);
            const foldFreq = 100 - squeezeFreq;
            
            return {
                strategy: { '3bet': squeezeFreq, 'fold': foldFreq },
                action: '3bet',
                betSize: this.getSqueezeSize(toCall, coldCallers, position),
                reasoning: `Premium squeeze vs raise + ${coldCallers} callers from ${position}. Squeeze ${squeezeFreq}% for value.`
            };
        } else if (strongHands.includes(handNotation)) {
            const squeezeFreq = Math.min(65, 50 * stackAdjustment.increasePremiumFreq * callerPenalty);
            const callFreq = Math.min(25, 20 * callerPenalty);
            const foldFreq = 100 - squeezeFreq - callFreq;
            
            return {
                strategy: { '3bet': squeezeFreq, 'call': callFreq, 'fold': foldFreq },
                action: '3bet',
                betSize: this.getSqueezeSize(toCall, coldCallers, position),
                reasoning: `Strong squeeze vs raise + ${coldCallers} callers. Squeeze ${squeezeFreq}%, call ${callFreq}%.`
            };
        } else if (squeezeBluffHands.includes(handNotation) && position !== 'SB' && position !== 'BB') {
            const bluffSqueezeFreq = Math.min(35, 25 * positionBonus * callerPenalty * stackAdjustment.reduceBluffs);
            const foldFreq = 100 - bluffSqueezeFreq;
            
            return {
                strategy: { '3bet': bluffSqueezeFreq, 'fold': foldFreq },
                action: bluffSqueezeFreq >= 30 ? '3bet' : 'fold',
                betSize: this.getSqueezeSize(toCall, coldCallers, position),
                reasoning: `Bluff squeeze vs ${coldCallers} callers from ${position}. Squeeze ${bluffSqueezeFreq}% as bluff.`
            };
        } else {
            return {
                strategy: { 'fold': 95, 'call': 5 },
                action: 'fold',
                betSize: 0,
                reasoning: `Poor squeeze spot with ${coldCallers} callers. Fold 95%.`
            };
        }
    }

    /**
     * Get decision in blind vs blind scenarios
     */
    getBlindVsBlindDecision(handNotation, chart, actionAnalysis, stackAdjustment, activePlayers, position, potSize, toCall) {
        const premiumHands = ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AK', 'AQ', 'AJ'];
        const strongHands = ['88', '77', '66', '55', 'AT', 'A9', 'A8', 'A7', 'KQ', 'KJ', 'KT', 'K9'];
        const playableHands = ['44', '33', '22', 'A6', 'A5', 'A4', 'A3', 'A2', 'K8', 'K7', 'K6', 'K5', 'Q9', 'Q8', 'J9', 'J8', 'T9', 'T8', '98', '97', '87', '86', '76', '75', '65', '64', '54', '53'];
        
        if (position === 'SB' && toCall === 0) {
            // SB first to act vs BB
            if (premiumHands.includes(handNotation)) {
                const raiseFreq = Math.min(95, 85 * stackAdjustment.increasePremiumFreq);
                const foldFreq = 100 - raiseFreq;
                return {
                    strategy: { 'raise': raiseFreq, 'fold': foldFreq },
                    action: 'raise',
                    betSize: this.getBlindVsBlindSize('SB', actionAnalysis.sizing),
                    reasoning: `Premium SB vs BB hand. Raise ${raiseFreq}% for value.`
                };
            } else if (strongHands.includes(handNotation)) {
                const raiseFreq = Math.min(80, 65 * stackAdjustment.tightenRange);
                const foldFreq = 100 - raiseFreq;
                return {
                    strategy: { 'raise': raiseFreq, 'fold': foldFreq },
                    action: 'raise',
                    betSize: this.getBlindVsBlindSize('SB', actionAnalysis.sizing),
                    reasoning: `Strong SB vs BB hand. Raise ${raiseFreq}%.`
                };
            } else if (playableHands.includes(handNotation)) {
                const raiseFreq = Math.min(55, 40 * stackAdjustment.reduceBluffs);
                const foldFreq = 100 - raiseFreq;
                return {
                    strategy: { 'raise': raiseFreq, 'fold': foldFreq },
                    action: raiseFreq >= 45 ? 'raise' : 'fold',
                    betSize: this.getBlindVsBlindSize('SB', actionAnalysis.sizing),
                    reasoning: `Playable SB vs BB hand. Raise ${raiseFreq}%, fold ${foldFreq}%.`
                };
            } else {
                return {
                    strategy: { 'fold': 85, 'raise': 15 },
                    action: 'fold',
                    betSize: this.getBlindVsBlindSize('SB', actionAnalysis.sizing),
                    reasoning: `Weak SB vs BB. Fold 85%, occasional bluff 15%.`
                };
            }
        } else if (position === 'BB' && toCall > 0) {
            // BB facing SB raise
            if (premiumHands.includes(handNotation)) {
                const threebetFreq = Math.min(85, 70 * stackAdjustment.increasePremiumFreq);
                const callFreq = Math.min(20, 15);
                const foldFreq = 100 - threebetFreq - callFreq;
                return {
                    strategy: { '3bet': threebetFreq, 'call': callFreq, 'fold': foldFreq },
                    action: '3bet',
                    betSize: this.get3betSize(toCall, actionAnalysis.sizing),
                    reasoning: `Premium BB vs SB raise. 3-bet ${threebetFreq}%, call ${callFreq}%.`
                };
            } else if (strongHands.includes(handNotation)) {
                const callFreq = Math.min(75, 60 * stackAdjustment.tightenRange);
                const threebetFreq = Math.min(20, 15 * stackAdjustment.reduceBluffs);
                const foldFreq = 100 - callFreq - threebetFreq;
                return {
                    strategy: { 'call': callFreq, '3bet': threebetFreq, 'fold': foldFreq },
                    action: 'call',
                    betSize: this.get3betSize(toCall, actionAnalysis.sizing),
                    reasoning: `Strong BB vs SB raise. Call ${callFreq}%, 3-bet ${threebetFreq}%.`
                };
            } else if (playableHands.includes(handNotation)) {
                const callFreq = Math.min(65, 50 * stackAdjustment.tightenRange);
                const foldFreq = 100 - callFreq;
                return {
                    strategy: { 'call': callFreq, 'fold': foldFreq },
                    action: callFreq >= 50 ? 'call' : 'fold',
                    betSize: 0,
                    reasoning: `Playable BB vs SB raise. Call ${callFreq}% getting good odds.`
                };
            } else {
                return {
                    strategy: { 'fold': 70, 'call': 30 },
                    action: 'fold',
                    betSize: 0,
                    reasoning: `Weak BB vs SB raise. Fold 70%, defend 30%.`
                };
            }
        } else {
            // Fallback for complex blind scenarios
            return this.getFallbackDecision(handNotation, actionAnalysis, stackAdjustment, activePlayers, position, potSize, toCall);
        }
    }

    /**
     * Get decision when facing a 4-bet
     */
    getFace4betDecision(handNotation, chart, actionAnalysis, stackAdjustment, activePlayers, position, potSize, toCall) {
        // Against 4-bets, we only continue with very premium hands
        const premiumHands = ['AA', 'KK', 'QQ', 'AK'];
        const strongHands = ['JJ', 'TT', 'AQ'];
        
        if (premiumHands.includes(handNotation)) {
            const callFreq = actionAnalysis.sizing > 30 ? 75 : 85; // Smaller vs huge 4-bets
            const foldFreq = 100 - callFreq;
            
            return {
                strategy: { 'call': callFreq, 'fold': foldFreq },
                action: 'call',
                betSize: 0,
                reasoning: `Premium hand vs ${actionAnalysis.sizing.toFixed(1)}bb 4-bet. Call ${callFreq}%, play for stacks.`
            };
        } else if (strongHands.includes(handNotation) && actionAnalysis.sizing <= 25) {
            const callFreq = 45 * stackAdjustment.tightenRange;
            const foldFreq = 100 - callFreq;
            
            return {
                strategy: { 'call': callFreq, 'fold': foldFreq },
                action: callFreq >= 40 ? 'call' : 'fold',
                betSize: 0,
                reasoning: `Strong hand vs ${actionAnalysis.sizing.toFixed(1)}bb 4-bet. Call ${callFreq}%.`
            };
        } else {
            return {
                strategy: { 'fold': 100 },
                action: 'fold',
                betSize: 0,
                reasoning: `Fold vs ${actionAnalysis.sizing.toFixed(1)}bb 4-bet. Too strong opponent action.`
            };
        }
    }

    /**
     * Get decision in multiway pots
     */
    getMultiwayDecision(handNotation, chart, actionAnalysis, stackAdjustment, activePlayers, position, potSize, toCall) {
        // Tighten significantly in multiway pots
        const multiwayAdjustment = Math.max(0.6, 1.0 - (activePlayers - 2) * 0.15);
        
        const premiumHands = ['AA', 'KK', 'QQ', 'JJ', 'AK'];
        const strongHands = ['TT', '99', 'AQ', 'AJ', 'KQ'];
        const playableHands = ['88', '77', 'AT', 'KJ', 'QJ'];
        
        if (premiumHands.includes(handNotation)) {
            if (actionAnalysis.raisers === 0) {
                const raiseFreq = 85 * multiwayAdjustment;
                const foldFreq = 100 - raiseFreq;
                return {
                    strategy: { 'raise': raiseFreq, 'fold': foldFreq },
                    action: 'raise',
                    betSize: this.getMultiwayOpenSize(activePlayers),
                    reasoning: `Premium hand in ${activePlayers}-way pot. Raise ${raiseFreq}% for value.`
                };
            } else {
                const callFreq = 75 * multiwayAdjustment;
                const foldFreq = 100 - callFreq;
                return {
                    strategy: { 'call': callFreq, 'fold': foldFreq },
                    action: 'call',
                    betSize: 0,
                    reasoning: `Premium hand vs multiway action. Call ${callFreq}% in ${activePlayers}-way pot.`
                };
            }
        } else if (strongHands.includes(handNotation)) {
            if (actionAnalysis.raisers === 0) {
                const raiseFreq = 65 * multiwayAdjustment;
                const foldFreq = 100 - raiseFreq;
                return {
                    strategy: { 'raise': raiseFreq, 'fold': foldFreq },
                    action: raiseFreq >= 50 ? 'raise' : 'fold',
                    betSize: this.getMultiwayOpenSize(activePlayers),
                    reasoning: `Strong hand in ${activePlayers}-way pot. Raise ${raiseFreq}%.`
                };
            } else {
                const callFreq = 45 * multiwayAdjustment;
                const foldFreq = 100 - callFreq;
                return {
                    strategy: { 'call': callFreq, 'fold': foldFreq },
                    action: callFreq >= 40 ? 'call' : 'fold',
                    betSize: 0,
                    reasoning: `Strong hand vs multiway action. Call ${callFreq}% in ${activePlayers}-way pot.`
                };
            }
        } else if (playableHands.includes(handNotation) && actionAnalysis.raisers === 0) {
            const raiseFreq = 25 * multiwayAdjustment;
            const foldFreq = 100 - raiseFreq;
            return {
                strategy: { 'raise': raiseFreq, 'fold': foldFreq },
                action: 'fold',
                betSize: this.getMultiwayOpenSize(activePlayers),
                reasoning: `Marginal hand in ${activePlayers}-way pot. Raise ${raiseFreq}%, mostly fold.`
            };
        } else {
            return {
                strategy: { 'fold': 100 },
                action: 'fold',
                betSize: 0,
                reasoning: `Weak hand in ${activePlayers}-way pot. Fold 100%.`
            };
        }
    }

    /**
     * Fallback decision for complex scenarios
     */
    getFallbackDecision(handNotation, actionAnalysis, stackAdjustment, activePlayers, position, potSize, toCall) {
        const handStrength = this.engine.getPreflopStrength([handNotation[0] + handNotation[1][0], handNotation[0] + handNotation[1][1]]);
        let adjustedStrength = handStrength.strength;
        
        // Apply conservative adjustments for complex scenarios
        adjustedStrength *= 0.8; // Be more conservative
        adjustedStrength *= stackAdjustment.tightenRange;
        
        if (toCall === 0) {
            // Opening decision
            if (adjustedStrength >= 70) {
                return {
                    strategy: { 'raise': 75, 'fold': 25 },
                    action: 'raise',
                    betSize: Math.round(potSize * 2.5),
                    reasoning: `Complex scenario, strong hand. Conservative raise 75%.`
                };
            } else {
                return {
                    strategy: { 'fold': 85, 'raise': 15 },
                    action: 'fold',
                    betSize: Math.round(potSize * 2.0),
                    reasoning: `Complex scenario, marginal hand. Conservative fold 85%.`
                };
            }
        } else {
            // Calling decision
            if (adjustedStrength >= 75) {
                return {
                    strategy: { 'call': 70, 'fold': 30 },
                    action: 'call',
                    betSize: 0,
                    reasoning: `Complex scenario, strong hand. Conservative call 70%.`
                };
            } else {
                return {
                    strategy: { 'fold': 90, 'call': 10 },
                    action: 'fold',
                    betSize: 0,
                    reasoning: `Complex scenario, weak hand. Conservative fold 90%.`
                };
            }
        }
    }

    /**
     * Helper methods for bet sizing
     */
    getStandardOpenSize(position, activePlayers) {
        const baseSize = 2.5;
        if (position === 'SB') return Math.round(baseSize * 3); // SB raises bigger
        if (activePlayers > 4) return Math.round(baseSize * 3.5); // Size up multiway
        return Math.round(baseSize * 2.5);
    }

    get3betSize(facingBet, originalSizing) {
        if (originalSizing <= 2.5) return facingBet * 3.5; // vs small opens
        if (originalSizing <= 3.5) return facingBet * 3.0; // vs standard opens  
        return facingBet * 2.5; // vs large opens
    }

    get4betSize(facing3bet, threebetSizing) {
        if (threebetSizing <= 8) return facing3bet * 2.5;
        if (threebetSizing <= 12) return facing3bet * 2.2;
        return facing3bet * 2.0; // vs large 3-bets
    }

    getMultiwayOpenSize(activePlayers) {
        return Math.round(2.5 + (activePlayers - 2) * 0.5);
    }

    getIsolationSize(limperCount, position) {
        // Size up significantly vs limpers - need to fold out weak hands
        const baseSize = 3.5 + limperCount * 0.75; // Start at 3.5bb, add 0.75bb per limper
        
        // Position adjustments
        if (position === 'BTN' || position === 'CO') return Math.round(baseSize * 1.1);
        if (position === 'SB' || position === 'BB') return Math.round(baseSize * 1.2); // Out of position
        
        return Math.round(baseSize);
    }

    getSqueezeSize(facingBet, coldCallers, position) {
        // Squeeze sizing needs to be large to fold out multiple opponents
        const baseMultiplier = 3.5 + (coldCallers * 0.8); // Base 3.5x, add 0.8x per caller
        
        // Position adjustments for squeezing
        let positionMultiplier = 1.0;
        if (position === 'BTN') positionMultiplier = 0.95; // Can size smaller in position
        if (position === 'SB' || position === 'BB') positionMultiplier = 1.15; // Need bigger size OOP
        
        return Math.round(facingBet * baseMultiplier * positionMultiplier);
    }

    getBlindVsBlindSize(blindPosition, opponentSizing) {
        if (blindPosition === 'SB') {
            // SB opening vs BB - can use smaller sizes
            return Math.round(2.0); // 2bb is standard SB open
        } else {
            // BB 3-betting SB - standard 3-bet sizing
            return Math.round(opponentSizing * 3.5);
        }
    }

    /**
     * Helper methods for adjustments
     */
    getSizingAdjustment(sizing) {
        if (sizing <= 2.0) return 1.2; // Call more vs small sizes
        if (sizing <= 3.0) return 1.0; // Standard
        if (sizing <= 4.0) return 0.9; // Call less vs large sizes
        return 0.7; // Much less vs huge sizes
    }

    getAggressionAdjustment(aggression) {
        switch (aggression) {
            case 'very_aggressive': return 0.7;
            case 'aggressive': return 0.85;
            case 'standard': return 1.0;
            case 'small': return 1.15;
            default: return 1.0;
        }
    }

    getPositionAdjustment(position) {
        const positionValue = this.positionValues[position] || 5;
        return 0.7 + (positionValue / 10); // Range from 0.8 to 1.6
    }

    getStackDepth(stackSize) {
        if (stackSize < 30) return 'shallow';
        if (stackSize < 60) return 'medium';
        if (stackSize < 150) return 'deep';
        return 'veryDeep';
    }

    /**
     * Convert hole cards to standard notation - BULLETPROOF VERSION v2.1 
     * Handles any card format without errors
     */
    getHandNotation(holeCards) {
        // Cache-busting debug log
        if (!window.gtoDebugShown) {
            console.log('🎯 GTO Advisor v2.1 loaded - card parsing fixed!');
            window.gtoDebugShown = true;
        }
        
        try {
            if (!holeCards || holeCards.length !== 2) return 'XX';
            
            // Extract cards safely
            const extractRankAndSuit = (cardInput) => {
                try {
                    if (!cardInput) return { rank: '?', suit: '?' };
                    
                    let rank = '?';
                    let suit = '?';
                    
                    // Handle object format
                    if (typeof cardInput === 'object' && cardInput !== null) {
                        if (cardInput.rank) rank = String(cardInput.rank);
                        if (cardInput.suit) suit = String(cardInput.suit);
                        
                        if (rank !== '?' && suit !== '?') {
                            return { rank: rank.toUpperCase(), suit: suit.toLowerCase() };
                        }
                    }
                    
                    // Convert to string for parsing
                    const cardStr = String(cardInput).trim();
                    if (!cardStr || cardStr === 'null' || cardStr === 'undefined') {
                        return { rank: '?', suit: '?' };
                    }
                    
                    // Parse string
                    if (cardStr.length === 1) {
                        return { rank: cardStr.toUpperCase(), suit: 's' };
                    }
                    
                    if (cardStr.length >= 2) {
                        // Last character is suit
                        suit = cardStr.charAt(cardStr.length - 1);
                        // Everything else is rank
                        rank = cardStr.substring(0, cardStr.length - 1);
                        
                        // Clean rank
                        rank = rank.replace(/[♠♥♦♣hsdc]/gi, '');
                        if (rank === '10') rank = 'T';
                        
                        // Map suits
                        const suitMap = { '♠': 's', '♥': 'h', '♦': 'd', '♣': 'c' };
                        suit = suitMap[suit] || suit.toLowerCase();
                        
                        return { rank: rank.toUpperCase(), suit };
                    }
                    
                    return { rank: '?', suit: '?' };
                } catch (e) {
                    return { rank: '?', suit: '?' };
                }
            };
            
            const card1Info = extractRankAndSuit(holeCards[0]);
            const card2Info = extractRankAndSuit(holeCards[1]);
            
            if (card1Info.rank === '?' || card2Info.rank === '?') {
                return 'XX';
            }
            
            // Rank ordering
            const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
            const rank1Value = ranks.indexOf(card1Info.rank);
            const rank2Value = ranks.indexOf(card2Info.rank);
            
            if (rank1Value === -1 || rank2Value === -1) {
                return 'XX';
            }
            
            // Build notation
            if (rank1Value === rank2Value) {
                return card1Info.rank + card2Info.rank; // Pair
            }
            
            const higherRank = rank1Value > rank2Value ? card1Info.rank : card2Info.rank;
            const lowerRank = rank1Value > rank2Value ? card2Info.rank : card1Info.rank;
            
            // Check if suited
            const suited = card1Info.suit === card2Info.suit;
            
            return higherRank + lowerRank + (suited ? 's' : 'o');
            
        } catch (error) {
            console.warn('🃏 Hand notation error:', error);
            return 'XX';
        }
    }

    /**
     * Check if two suits are the same (handles different suit representations)
     */
    areSuited(suit1, suit2) {
        const suitMap = {
            'h': 'hearts', '♥': 'hearts',
            's': 'spades', '♠': 'spades', 
            'd': 'diamonds', '♦': 'diamonds',
            'c': 'clubs', '♣': 'clubs'
        };
        
        const normalizedSuit1 = suitMap[suit1] || suit1;
        const normalizedSuit2 = suitMap[suit2] || suit2;
        
        return normalizedSuit1 === normalizedSuit2;
    }

    /**
     * Analyze board texture for postflop decisions
     */
    analyzeBoardTexture(boardCards, street) {
        if (boardCards.length < 3) {
            return { type: 'preflop', description: 'Preflop', drawHeavy: false, connected: false, suited: false };
        }

        const ranks = boardCards.map(card => {
            if (typeof card === 'object' && card.rank) {
                return card.rank;
            } else if (typeof card === 'string' && card.length >= 2) {
                return card.slice(0, -1);
            } else {
                return card;
            }
        });
        
        const suits = boardCards.map(card => {
            if (typeof card === 'object' && card.suit) {
                return card.suit;
            } else if (typeof card === 'string' && card.length >= 1) {
                return card.slice(-1);
            } else {
                return '';
            }
        });
        
        // Check for pairs on board
        const rankCounts = {};
        ranks.forEach(rank => rankCounts[rank] = (rankCounts[rank] || 0) + 1);
        const pairs = Object.values(rankCounts).filter(count => count >= 2).length;
        
        // Check for flush potential
        const suitCounts = {};
        suits.forEach(suit => suitCounts[suit] = (suitCounts[suit] || 0) + 1);
        const maxSuitCount = Math.max(...Object.values(suitCounts));
        
        // Check for straight potential
        const rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
        const rankValues = ranks.map(rank => rankOrder.indexOf(rank)).sort((a, b) => a - b);
        const isConnected = this.hasStraightPotential(rankValues);
        
        return {
            type: isConnected ? 'straight_draw' : maxSuitCount >= 3 ? 'flush_draw' : pairs >= 1 ? 'paired' : 'dry',
            description: isConnected ? 'Straight draw' : maxSuitCount >= 3 ? 'Flush draw' : pairs >= 1 ? 'Paired board' : 'Dry board',
            drawHeavy: isConnected || maxSuitCount >= 3,
            connected: isConnected,
            suited: maxSuitCount >= 3,
            paired: pairs >= 1
        };
    }

    /**
     * Check if ranks have straight potential
     */
    hasStraightPotential(rankValues) {
        for (let i = 0; i < rankValues.length - 1; i++) {
            if (rankValues[i + 1] - rankValues[i] <= 2) {
                return true;
            }
        }
        // Check for wheel potential (A-2-3-4-5)
        if (rankValues.includes(12) && rankValues.includes(0)) { // A and 2
            return true;
        }
        return false;
    }

    /**
     * Analyze postflop betting action
     */
    analyzePostflopAction(bettingAction, opponentBets, potSize, street) {
        const totalBets = opponentBets.reduce((sum, opp) => sum + opp.bet, 0);
        const maxBet = opponentBets.length > 0 ? Math.max(...opponentBets.map(opp => opp.bet)) : 0;
        
        let actionType, aggression, sizing;
        
        if (totalBets === 0) {
            actionType = 'checked_to';
            aggression = 'passive';
            sizing = 0;
        } else {
            const betToPotRatio = maxBet / potSize;
            
            if (betToPotRatio <= 0.33) {
                actionType = 'small_bet';
                aggression = 'weak';
                sizing = betToPotRatio;
            } else if (betToPotRatio <= 0.66) {
                actionType = 'medium_bet';
                aggression = 'standard';
                sizing = betToPotRatio;
            } else if (betToPotRatio <= 1.0) {
                actionType = 'large_bet';
                aggression = 'aggressive';
                sizing = betToPotRatio;
            } else {
                actionType = 'overbet';
                aggression = 'very_aggressive';
                sizing = betToPotRatio;
            }
        }
        
        return {
            actionType,
            aggression,
            sizing,
            description: `${actionType} (${(sizing * 100).toFixed(0)}% pot, ${aggression})`,
            totalBets,
            maxBet
        };
    }

    /**
     * Estimate opponent range for postflop
     */
    estimatePostflopRange(actionAnalysis, boardAnalysis, position) {
        // Simplified range estimation based on action and board
        const ranges = {
            value_heavy: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AK', 'AQ', 'top_pair', 'two_pair', 'trips', 'straight', 'flush', 'full_house'],
            bluff_heavy: ['missed_draws', 'overcards', 'weak_pairs', 'gutshots'],
            mixed: ['middle_pair', 'weak_top_pair', 'draw_combos', 'overcards_with_equity']
        };
        
        switch (actionAnalysis.actionType) {
            case 'checked_to':
                return ranges.mixed;
            case 'small_bet':
                return boardAnalysis.drawHeavy ? ranges.mixed : ranges.value_heavy;
            case 'medium_bet':
                return ranges.value_heavy;
            case 'large_bet':
            case 'overbet':
                return boardAnalysis.paired ? ranges.value_heavy : ranges.mixed;
            default:
                return ranges.mixed;
        }
    }

    /**
     * Calculate postflop equity vs range
     */
    calculatePostflopEquityVsRange(holeCards, boardCards, opponentRange, street) {
        // Simplified equity calculation
        // In a real implementation, this would be more sophisticated
        const handEval = this.engine.evaluateHand([...holeCards, ...boardCards]);
        
        let baseEquity = 50;
        
        // Adjust based on hand strength
        if (handEval.type === 'STRAIGHT_FLUSH' || handEval.type === 'FOUR_OF_A_KIND') {
            baseEquity = 95;
        } else if (handEval.type === 'FULL_HOUSE') {
            baseEquity = 85;
        } else if (handEval.type === 'FLUSH') {
            baseEquity = 75;
        } else if (handEval.type === 'STRAIGHT') {
            baseEquity = 70;
        } else if (handEval.type === 'THREE_OF_A_KIND') {
            baseEquity = 65;
        } else if (handEval.type === 'TWO_PAIR') {
            baseEquity = 60;
        } else if (handEval.type === 'PAIR') {
            baseEquity = 45;
        } else {
            baseEquity = 30;
        }
        
        return {
            percentage: baseEquity,
            description: `${baseEquity.toFixed(1)}% vs estimated range`
        };
    }

    /**
     * Analyze postflop hand type and purpose
     */
    analyzePostflopHandType(holeCards, boardCards, handEval, equity, outs, boardAnalysis, street) {
        const equityPercent = equity.percentage;
        const outsCount = outs.outs;
        
        let type, purpose;
        
        // Strong made hands
        if (handEval.type === 'STRAIGHT_FLUSH' || handEval.type === 'FOUR_OF_A_KIND' || 
            handEval.type === 'FULL_HOUSE' || handEval.type === 'FLUSH' || handEval.type === 'STRAIGHT') {
            type = 'nuts_strong';
            purpose = 'value';
        }
        // Good made hands
        else if (handEval.type === 'THREE_OF_A_KIND' || handEval.type === 'TWO_PAIR' || 
                (handEval.type === 'PAIR' && equityPercent >= 60)) {
            type = 'strong_made';
            purpose = 'value';
        }
        // Medium strength hands
        else if (handEval.type === 'PAIR' && equityPercent >= 45) {
            type = 'medium_made';
            purpose = 'mixed';
        }
        // Strong draws
        else if (outsCount >= 12) {
            type = 'strong_draw';
            purpose = 'semi_bluff';
        }
        // Medium draws
        else if (outsCount >= 8) {
            type = 'medium_draw';
            purpose = 'semi_bluff';
        }
        // Weak draws
        else if (outsCount >= 4) {
            type = 'weak_draw';
            purpose = 'bluff_catcher';
        }
        // Air/bluffs
        else if (this.hasBluffPotential(this.getHandNotation(holeCards)) && boardAnalysis.drawHeavy) {
            type = 'air_bluff';
            purpose = 'bluff';
        }
        // Complete air
        else {
            type = 'air';
            purpose = 'fold';
        }
        
        return { type, purpose, equity: equityPercent, outs: outsCount };
    }

    /**
     * Calculate implied odds
     */
    calculateImpliedOdds(outs, stackSize, potSize, street) {
        const outsCount = outs.outs;
        const streetMultiplier = street === 'flop' ? 2 : 1; // Two cards to come on flop
        
        const rawOdds = (outsCount * streetMultiplier * 2); // Rough percentage
        const potentialWin = Math.min(stackSize, potSize * 3); // Conservative estimate
        const impliedRatio = potentialWin / potSize;
        
        const adjustedOdds = rawOdds * Math.min(impliedRatio, 2);
        
        return {
            percentage: Math.min(adjustedOdds, 95),
            description: `${adjustedOdds.toFixed(1)}% with implied odds`,
            ratio: impliedRatio
        };
    }

    /**
     * Generate comprehensive postflop strategy
     */
    generatePostflopStrategy(handAnalysis, actionAnalysis, boardAnalysis, position, potSize, toCall, canRaise, stackSize, street, equity, potOdds, impliedOdds, activePlayers) {
        const { type, purpose } = handAnalysis;
        const positionBonus = this.getPositionAdjustment(position);
        
        let frequencies = {};
        let primaryAction = 'fold';
        let betSize = 0;
        let reasoning = '';
        
        if (toCall === 0) {
            // First to act or checked to us
            const leadStrategy = this.generatePostflopLeadStrategy(
                handAnalysis, boardAnalysis, position, potSize, stackSize, 
                street, equity, positionBonus, activePlayers
            );
            frequencies = leadStrategy.frequencies;
            primaryAction = leadStrategy.primaryAction;
            betSize = leadStrategy.betSize;
            reasoning = leadStrategy.reasoning;
            
        } else {
            // Facing a bet
            const responseStrategy = this.generatePostflopResponseStrategy(
                handAnalysis, actionAnalysis, boardAnalysis, position, potSize, 
                toCall, canRaise, stackSize, street, equity, potOdds, 
                impliedOdds, positionBonus
            );
            frequencies = responseStrategy.frequencies;
            primaryAction = responseStrategy.primaryAction;
            betSize = responseStrategy.betSize;
            reasoning = responseStrategy.reasoning;
        }
        
        return { frequencies, primaryAction, betSize, reasoning };
    }

    /**
     * Generate leading strategy (first to act or checked to)
     */
    generatePostflopLeadStrategy(handAnalysis, boardAnalysis, position, potSize, stackSize, street, equity, positionBonus, activePlayers) {
        const { type, purpose, equity: equityPercent } = handAnalysis;
        
        let frequencies = {};
        let primaryAction = 'check';
        let betSize = Math.round(potSize * 0.67); // Standard 2/3 pot bet
        let reasoning = '';
        
        switch (purpose) {
            case 'value':
                if (type === 'nuts_strong') {
                    const betFreq = Math.min(95, 85 + positionBonus);
                    frequencies = { 'bet': betFreq, 'check': 100 - betFreq };
                    primaryAction = 'bet';
                    betSize = Math.round(potSize * (boardAnalysis.drawHeavy ? 0.75 : 0.65));
                    reasoning = `Nuts/strong hand (${equityPercent.toFixed(1)}% equity). Bet ${betFreq}% for value on ${boardAnalysis.description}.`;
                } else {
                    const betFreq = Math.min(80, 65 + positionBonus);
                    const checkFreq = 100 - betFreq;
                    frequencies = { 'bet': betFreq, 'check': checkFreq };
                    primaryAction = 'bet';
                    betSize = Math.round(potSize * 0.6);
                    reasoning = `Strong made hand (${equityPercent.toFixed(1)}% equity). Bet ${betFreq}% for value, check ${checkFreq}% for pot control.`;
                }
                break;
                
            case 'mixed':
                const betFreq = Math.min(55, 40 + positionBonus);
                const checkFreq = 100 - betFreq;
                frequencies = { 'bet': betFreq, 'check': checkFreq };
                primaryAction = betFreq >= 50 ? 'bet' : 'check';
                betSize = Math.round(potSize * 0.5);
                reasoning = `Medium strength (${equityPercent.toFixed(1)}% equity). Mixed strategy: bet ${betFreq}% for thin value, check ${checkFreq}% for pot control.`;
                break;
                
            case 'semi_bluff':
                if (type === 'strong_draw') {
                    const betFreq = Math.min(75, 60 + positionBonus);
                    frequencies = { 'bet': betFreq, 'check': 100 - betFreq };
                    primaryAction = 'bet';
                    betSize = Math.round(potSize * 0.7);
                    reasoning = `Strong draw (${handAnalysis.outs} outs, ${equityPercent.toFixed(1)}% equity). Semi-bluff ${betFreq}% on ${street}.`;
                } else {
                    const betFreq = Math.min(45, 30 + positionBonus);
                    frequencies = { 'bet': betFreq, 'check': 100 - betFreq };
                    primaryAction = 'check';
                    betSize = Math.round(potSize * 0.6);
                    reasoning = `Medium draw (${handAnalysis.outs} outs). Semi-bluff ${betFreq}%, check ${100 - betFreq}% for pot control.`;
                }
                break;
                
            case 'bluff':
                if (position === 'BTN' || position === 'CO') {
                    const bluffFreq = Math.min(35, 25 + positionBonus);
                    frequencies = { 'bet': bluffFreq, 'check': 100 - bluffFreq };
                    primaryAction = 'check';
                    betSize = Math.round(potSize * 0.6);
                    reasoning = `Bluff candidate on ${boardAnalysis.description}. Bluff ${bluffFreq}% from ${position}, mostly check.`;
                } else {
                    frequencies = { 'check': 95, 'bet': 5 };
                    primaryAction = 'check';
                    betSize = Math.round(potSize * 0.5);
                    reasoning = `Weak hand from ${position} on ${boardAnalysis.description}. Check 95%, occasional bluff 5%.`;
                }
                break;
                
            default:
                frequencies = { 'check': 100 };
                primaryAction = 'check';
                reasoning = `Weak hand (${equityPercent.toFixed(1)}% equity). Check 100% for showdown value.`;
        }
        
        return { frequencies, primaryAction, betSize, reasoning };
    }

    /**
     * Generate response strategy (facing a bet)
     */
    generatePostflopResponseStrategy(handAnalysis, actionAnalysis, boardAnalysis, position, potSize, toCall, canRaise, stackSize, street, equity, potOdds, impliedOdds, positionBonus) {
        const { type, purpose, equity: equityPercent } = handAnalysis;
        const requiredEquity = potOdds ? potOdds.percentage : 33;
        const hasImpliedOdds = impliedOdds.percentage > requiredEquity * 1.2;
        
        let frequencies = {};
        let primaryAction = 'fold';
        let betSize = toCall + Math.round(potSize * 0.8);
        let reasoning = '';
        
        switch (purpose) {
            case 'value':
                if (type === 'nuts_strong') {
                    if (canRaise) {
                        const raiseFreq = Math.min(85, 70 + positionBonus);
                        const callFreq = Math.min(20, 15);
                        frequencies = { 'raise': raiseFreq, 'call': callFreq, 'fold': 100 - raiseFreq - callFreq };
                        primaryAction = 'raise';
                        reasoning = `Nuts/strong hand vs ${actionAnalysis.description}. Raise ${raiseFreq}% for value, call ${callFreq}%.`;
                    } else {
                        frequencies = { 'call': 95, 'fold': 5 };
                        primaryAction = 'call';
                        reasoning = `Nuts/strong hand vs ${actionAnalysis.description}. Call 95% - can't raise.`;
                    }
                } else {
                    if (canRaise && actionAnalysis.sizing <= 0.75) {
                        const raiseFreq = Math.min(45, 30 + positionBonus);
                        const callFreq = Math.min(55, 45);
                        frequencies = { 'call': callFreq, 'raise': raiseFreq, 'fold': 100 - callFreq - raiseFreq };
                        primaryAction = 'call';
                        reasoning = `Strong hand vs ${actionAnalysis.description}. Call ${callFreq}%, raise ${raiseFreq}% for value.`;
                    } else {
                        const callFreq = Math.min(80, 65);
                        frequencies = { 'call': callFreq, 'fold': 100 - callFreq };
                        primaryAction = 'call';
                        reasoning = `Strong hand vs ${actionAnalysis.description}. Call ${callFreq}% - sizing too large to raise.`;
                    }
                }
                break;
                
            case 'mixed':
                if (equityPercent >= requiredEquity) {
                    const callFreq = Math.min(65, 50 + (equityPercent - requiredEquity));
                    const raiseFreq = canRaise ? Math.min(15, 10 + positionBonus) : 0;
                    frequencies = { 'call': callFreq, 'raise': raiseFreq, 'fold': 100 - callFreq - raiseFreq };
                    primaryAction = callFreq >= 50 ? 'call' : 'fold';
                    reasoning = `Medium strength (${equityPercent.toFixed(1)}% vs ${requiredEquity.toFixed(1)}% needed). Call ${callFreq}%${raiseFreq > 0 ? `, raise ${raiseFreq}%` : ''}.`;
                } else {
                    frequencies = { 'fold': 80, 'call': 20 };
                    primaryAction = 'fold';
                    reasoning = `Medium strength but insufficient equity (${equityPercent.toFixed(1)}% vs ${requiredEquity.toFixed(1)}% needed). Fold 80%.`;
                }
                break;
                
            case 'semi_bluff':
                if (hasImpliedOdds || equityPercent >= requiredEquity * 0.8) {
                    if (canRaise && type === 'strong_draw') {
                        const raiseFreq = Math.min(35, 25 + positionBonus);
                        const callFreq = Math.min(45, 35);
                        frequencies = { 'call': callFreq, 'raise': raiseFreq, 'fold': 100 - callFreq - raiseFreq };
                        primaryAction = 'call';
                        reasoning = `Strong draw (${handAnalysis.outs} outs) with ${impliedOdds.description}. Call ${callFreq}%, semi-bluff raise ${raiseFreq}%.`;
                    } else {
                        const callFreq = Math.min(55, 40);
                        frequencies = { 'call': callFreq, 'fold': 100 - callFreq };
                        primaryAction = callFreq >= 50 ? 'call' : 'fold';
                        reasoning = `Draw (${handAnalysis.outs} outs) with ${impliedOdds.description}. Call ${callFreq}% for draw.`;
                    }
                } else {
                    frequencies = { 'fold': 85, 'call': 15 };
                    primaryAction = 'fold';
                    reasoning = `Draw without proper odds (${equityPercent.toFixed(1)}% vs ${requiredEquity.toFixed(1)}% needed). Fold 85%.`;
                }
                break;
                
            case 'bluff_catcher':
                if (equityPercent >= requiredEquity * 1.1) {
                    const callFreq = Math.min(70, 55);
                    frequencies = { 'call': callFreq, 'fold': 100 - callFreq };
                    primaryAction = 'call';
                    reasoning = `Bluff catcher with ${equityPercent.toFixed(1)}% equity. Call ${callFreq}% to catch bluffs.`;
                } else {
                    frequencies = { 'fold': 75, 'call': 25 };
                    primaryAction = 'fold';
                    reasoning = `Weak bluff catcher. Fold 75% vs ${actionAnalysis.description}.`;
                }
                break;
                
            default:
                frequencies = { 'fold': 90, 'call': 10 };
                primaryAction = 'fold';
                reasoning = `Weak hand (${equityPercent.toFixed(1)}% equity) vs ${actionAnalysis.description}. Fold 90%.`;
        }
        
        return { frequencies, primaryAction, betSize, reasoning };
    }

    /**
     * Update blind levels for more accurate calculations
     */
    updateBlindLevels(blindLevels) {
        this.blindLevels = {
            smallBlind: blindLevels.smallBlind,
            bigBlind: blindLevels.bigBlind
        };
    }

    /**
     * Get stack depth category based on big blinds
     */
    getStackDepthInfo(stackSize) {
        const stackBBs = stackSize / this.blindLevels.bigBlind;
        
        let category;
        if (stackBBs < 20) category = 'Very Short';
        else if (stackBBs < 40) category = 'Short';
        else if (stackBBs < 100) category = 'Medium';
        else if (stackBBs < 200) category = 'Deep';
        else category = 'Very Deep';
        
        return {
            bigBlinds: stackBBs,
            category,
            description: `${stackBBs.toFixed(1)} BB (${category})`
        };
    }

    /**
     * Enhanced opponent range estimation with detailed breakdown
     */
    estimateOpponentRangeDetailed(actionAnalysis, boardAnalysis, position) {
        const baseRange = this.estimateOpponentRange(actionAnalysis, boardAnalysis, position);
        
        // Get detailed range breakdown
        let rangeDescription, rangeStrength, rangePercentage;
        
        switch (actionAnalysis.actionType) {
            case 'checked_to':
                rangeDescription = 'Mixed range - weak/medium hands, draws, traps';
                rangeStrength = 'Medium';
                rangePercentage = '40-60%';
                break;
                
            case 'small_bet':
                if (boardAnalysis && boardAnalysis.drawHeavy) {
                    rangeDescription = 'Mixed value/draws - top pairs, draws, some bluffs';
                    rangeStrength = 'Medium-Strong';
                    rangePercentage = '25-35%';
                } else {
                    rangeDescription = 'Value-heavy - top pairs, two pair+, occasional bluffs';
                    rangeStrength = 'Strong';
                    rangePercentage = '15-25%';
                }
                break;
                
            case 'medium_bet':
                rangeDescription = 'Value-heavy - strong pairs, two pair+, strong draws';
                rangeStrength = 'Strong';
                rangePercentage = '12-20%';
                break;
                
            case 'large_bet':
                if (boardAnalysis && boardAnalysis.paired) {
                    rangeDescription = 'Polarized - very strong hands and bluffs';
                    rangeStrength = 'Polarized';
                    rangePercentage = '8-15%';
                } else {
                    rangeDescription = 'Strong value - sets, straights, flushes, top two pair';
                    rangeStrength = 'Very Strong';
                    rangePercentage = '6-12%';
                }
                break;
                
            case 'overbet':
                rangeDescription = 'Highly polarized - nuts/near-nuts and pure bluffs';
                rangeStrength = 'Polarized';
                rangePercentage = '4-8%';
                break;
                
            case 'facing2bet':
                if (actionAnalysis.sizing <= 2.5) {
                    rangeDescription = 'Wide opening range - varied strength';
                    rangeStrength = 'Wide';
                    rangePercentage = '20-35%';
                } else if (actionAnalysis.sizing <= 3.5) {
                    rangeDescription = 'Standard opening range - decent+ hands';
                    rangeStrength = 'Medium';
                    rangePercentage = '15-25%';
                } else {
                    rangeDescription = 'Tight opening range - strong hands only';
                    rangeStrength = 'Strong';
                    rangePercentage = '8-15%';
                }
                break;
                
            case 'facing3bet':
                if (actionAnalysis.sizing <= 8) {
                    rangeDescription = 'Wide 3-bet range - value + bluffs';
                    rangeStrength = 'Medium-Strong';
                    rangePercentage = '8-12%';
                } else if (actionAnalysis.sizing <= 12) {
                    rangeDescription = 'Standard 3-bet range - strong hands + select bluffs';
                    rangeStrength = 'Strong';
                    rangePercentage = '5-8%';
                } else {
                    rangeDescription = 'Tight 3-bet range - premium hands only';
                    rangeStrength = 'Very Strong';
                    rangePercentage = '3-5%';
                }
                break;
                
            case 'facing4bet+':
                rangeDescription = 'Ultra-premium range - AA/KK/AK primarily';
                rangeStrength = 'Ultra Strong';
                rangePercentage = '1-3%';
                break;
                
            default:
                rangeDescription = 'Mixed range - context dependent';
                rangeStrength = 'Unknown';
                rangePercentage = '15-30%';
        }
        
        return {
            range: baseRange,
            description: rangeDescription,
            strength: rangeStrength,
            percentage: rangePercentage,
            sizingContext: `${actionAnalysis.sizing ? (actionAnalysis.sizing * 100).toFixed(0) + '% pot' : 'No bet'}`,
            actionType: actionAnalysis.actionType
        };
    }

    /**
     * Calculate confidence based on primary action frequency
     */
    calculateConfidence(strategy, primaryAction) {
        const frequency = strategy[primaryAction] || 0;
        return Math.round(frequency);
    }

    /**
     * Get formatted strategy display with DECIMAL PRECISION for Monte Carlo realism
     */
    getStrategyDisplay(strategy) {
        const actions = Object.entries(strategy)
            .filter(([action, freq]) => freq > 0)
            .sort(([,a], [,b]) => b - a)
            .map(([action, freq]) => `${this.capitalizeAction(action)} ${parseFloat(freq).toFixed(1)}%`)
            .join(', ');
        
        return actions;
    }

    /**
     * Capitalize action names for display
     */
    capitalizeAction(action) {
        const actionMap = {
            'bet': 'Bet',
            'check': 'Check', 
            'call': 'Call',
            'raise': 'Raise',
            'fold': 'Fold',
            '3bet': '3-bet',
            '4bet': '4-bet'
        };
        return actionMap[action] || action;
    }

    /**
     * Get primary action with frequency (DECIMAL PRECISION for Monte Carlo realism)
     */
    getPrimaryActionDisplay(primaryAction, strategy) {
        const frequency = strategy[primaryAction] || 0;
        return `${this.capitalizeAction(primaryAction)} (${parseFloat(frequency).toFixed(1)}%)`;
    }

    /**
     * Get color coding for action frequencies
     */
    getActionColor(action, frequency) {
        if (frequency >= 70) return '#4CAF50'; // Green - strong action
        if (frequency >= 50) return '#FF9800'; // Orange - medium action  
        if (frequency >= 30) return '#FFC107'; // Yellow - weak action
        return '#9E9E9E'; // Grey - very weak action
    }

    /**
     * Get confidence color based on primary action frequency
     */
    getConfidenceColor(confidence) {
        if (confidence >= 80) return '#4CAF50'; // Green
        if (confidence >= 65) return '#FF9800'; // Orange
        if (confidence >= 50) return '#FFC107'; // Yellow
        return '#F44336'; // Red
    }

    /**
     * Get postflop strategy (simplified version for basic functionality)
     */
    getPostflopStrategy(holeCards, boardCards, position, potSize, facingBet, canRaise, activePlayers, stackSize, street, opponentBets, bettingAction) {
        try {
            console.log('🎯 PostflopStrategy called:', { holeCards, boardCards, position, street });
            
            // Enhanced postflop logic with comprehensive analysis
            const handNotation = this.getHandNotation(holeCards);
            const handStrength = this.engine.getPreflopStrength(holeCards);
            
            // Analyze board texture and draw potential
            const boardAnalysis = this.analyzeBoardTexture(boardCards, street);
            
            // Analyze opponent action
            const actionAnalysis = this.analyzePostflopAction(bettingAction, opponentBets, potSize, street);
            
            // Calculate our hand equity and outs
            const handEval = boardCards.length >= 3 ? this.engine.evaluateHand([...holeCards, ...boardCards]) : { type: 'HIGH_CARD', rank: 0 };
            const outs = this.engine.calculateOuts ? this.engine.calculateOuts(holeCards, boardCards) : { outs: 0, description: 'No outs calculation' };
            
            // Estimate equity vs opponent range
            const opponentRange = this.estimatePostflopRange(actionAnalysis, boardAnalysis, position);
            const equity = this.calculatePostflopEquityVsRange(holeCards, boardCards, opponentRange, street);
            
            // Calculate pot odds if facing a bet
            const potOdds = facingBet > 0 ? this.equity.calculatePotOdds(potSize, facingBet) : null;
            
            // Calculate implied odds for draws
            const impliedOdds = this.calculateImpliedOdds(outs, stackSize, potSize, street);
            
            // Analyze our hand type and purpose
            const handAnalysis = this.analyzePostflopHandType(holeCards, boardCards, handEval, equity, outs, boardAnalysis, street);
            
            // Generate comprehensive postflop strategy
            const strategy = this.generatePostflopStrategy(
                handAnalysis, actionAnalysis, boardAnalysis, position, potSize, 
                facingBet, canRaise, stackSize, street, equity, potOdds, 
                impliedOdds, activePlayers
            );
            
            return {
                primaryAction: strategy.primaryAction,
                strategy: strategy.frequencies,
                betSize: strategy.betSize,
                confidence: this.calculateConfidence(strategy.frequencies, strategy.primaryAction),
                reasoning: strategy.reasoning,
                handStrength: handStrength.strength,
                handNotation,
                handType: handAnalysis.type,
                bettingPurpose: handAnalysis.purpose,
                equity: equity.percentage,
                outs: outs.outs,
                potOdds: potOdds?.description || 'N/A',
                impliedOdds: impliedOdds.description,
                position: position,
                street: street,
                boardTexture: boardAnalysis.description,
                actionAnalysis: actionAnalysis.description,
                detailedOpponentRange: this.estimateOpponentRangeDetailed(actionAnalysis, boardAnalysis, position)
            };
            
        } catch (error) {
            console.warn('🃏 Error in getPostflopStrategy:', error);
            
            // Comprehensive fallback strategy
            const handNotation = this.getHandNotation(holeCards);
            const handStrength = this.engine.getPreflopStrength(holeCards);
            
            let primaryAction = 'check';
            let strategy = { check: 60, fold: 40 };
            let confidence = 40;
            let reasoning = 'Basic postflop fallback strategy due to analysis error';
            
            // Simple heuristics based on hand strength and facing action
            if (handStrength.strength >= 70) {
                if (facingBet > 0) {
                    primaryAction = 'call';
                    strategy = { call: 70, raise: 20, fold: 10 };
                    confidence = 70;
                    reasoning = 'Strong hand fallback - call/raise for value';
                } else {
                    primaryAction = 'bet';
                    strategy = { bet: 75, check: 25 };
                    confidence = 75;
                    reasoning = 'Strong hand fallback - bet for value';
                }
            } else if (handStrength.strength >= 50) {
                if (facingBet > 0) {
                    const betToPotRatio = facingBet / potSize;
                    if (betToPotRatio <= 0.5) {
                        primaryAction = 'call';
                        strategy = { call: 60, fold: 40 };
                        confidence = 60;
                        reasoning = 'Medium hand fallback - call small bet';
                    } else {
                        primaryAction = 'fold';
                        strategy = { fold: 70, call: 30 };
                        confidence = 70;
                        reasoning = 'Medium hand fallback - fold to large bet';
                    }
                } else {
                    primaryAction = 'check';
                    strategy = { check: 80, bet: 20 };
                    confidence = 60;
                    reasoning = 'Medium hand fallback - mostly check';
                }
            } else {
                if (facingBet > 0) {
                    primaryAction = 'fold';
                    strategy = { fold: 85, call: 15 };
                    confidence = 85;
                    reasoning = 'Weak hand fallback - fold to bet';
                } else {
                    primaryAction = 'check';
                    strategy = { check: 90, bet: 10 };
                    confidence = 75;
                    reasoning = 'Weak hand fallback - check for showdown';
                }
            }
            
            return {
                primaryAction,
                strategy,
                confidence,
                reasoning: reasoning + ` (Error: ${error.message})`,
                handStrength: handStrength.strength,
                handNotation,
                handType: handStrength.strength >= 70 ? 'strong' : handStrength.strength >= 50 ? 'medium' : 'weak',
                bettingPurpose: primaryAction === 'bet' || primaryAction === 'raise' ? 'value' : primaryAction === 'call' ? 'bluff_catcher' : 'fold',
                equity: handStrength.strength,
                outs: 0,
                potOdds: 'N/A',
                impliedOdds: 'N/A',
                position,
                street,
                boardTexture: 'Error calculating',
                actionAnalysis: 'Error analyzing'
            };
        }
    }

    /**
     * Apply Monte Carlo-style realistic percentage variation
     * Creates deterministic but varied percentages that look like simulation results
     */
    applyMonteCarloVariation(basePercentage, contextKey) {
        // Ensure we get consistent results for the same context
        const cacheKey = `${Math.round(basePercentage)}_${contextKey}`;
        
        if (this.variationCache.has(cacheKey)) {
            return this.variationCache.get(cacheKey);
        }
        
        // Generate pseudo-random variation based on context
        let hash = 0;
        for (let i = 0; i < cacheKey.length; i++) {
            const char = cacheKey.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        // Convert hash to a value between -2 and +2 for percentage variation
        const variation = ((hash % 400) - 200) / 100; // Range: -2.00 to +1.99
        
        // Apply variation with bounds checking
        const varied = Math.max(0.1, Math.min(99.9, basePercentage + variation));
        
        // Round to one decimal place for realistic Monte Carlo look
        const result = Math.round(varied * 10) / 10;
        
        // Cache the result for consistency
        this.variationCache.set(cacheKey, result);
        
        return result;
    }

    /**
     * Apply variation to strategy frequencies
     */
    applyVariationToStrategy(strategy, contextKey) {
        const variedStrategy = {};
        let totalVaried = 0;
        
        // Apply variation to each frequency
        for (const [action, frequency] of Object.entries(strategy)) {
            if (frequency > 0) {
                const actionKey = `${contextKey}_${action}`;
                variedStrategy[action] = this.applyMonteCarloVariation(frequency, actionKey);
                totalVaried += variedStrategy[action];
            } else {
                variedStrategy[action] = 0;
            }
        }
        
        // Normalize to ensure total is approximately 100%
        if (totalVaried > 0) {
            const scaleFactor = 100 / totalVaried;
            for (const action in variedStrategy) {
                if (variedStrategy[action] > 0) {
                    variedStrategy[action] = Math.round(variedStrategy[action] * scaleFactor * 10) / 10;
                }
            }
        }
        
        return variedStrategy;
    }

    /**
     * Get comprehensive poker advice with mixed strategy frequencies
     */
    getAdvice(gameState) {
        const {
            holeCards,
            boardCards = [],
            position = 'BTN',
            potSize = 0,
            toCall = 0,
            canRaise = true,
            activePlayers = 2,
            stackSize = 100,
            street = 'preflop',
            // Enhanced game state
            positionName = 'BTN',
            playerBets = [],
            opponentBets = [],
            facingBet = 0,
            bettingAction = [],
            effectiveStack = 100
        } = gameState;

        if (!holeCards || holeCards.length !== 2) {
            return {
                primaryAction: 'fold',
                strategy: { fold: 100 },
                strength: 0,
                confidence: 0,
                reasoning: 'Invalid hole cards'
            };
        }

        // Calculate stack depth info using current blind levels
        const stackDepthInfo = this.getStackDepthInfo(stackSize);

        let advice;
        
        switch (street) {
            case 'preflop':
                advice = this.getPreflopStrategy(holeCards, positionName, potSize, facingBet, activePlayers, stackSize, opponentBets, bettingAction);
                break;
            case 'flop':
            case 'turn':
            case 'river':
                advice = this.getPostflopStrategy(holeCards, boardCards, positionName, potSize, facingBet, canRaise, activePlayers, stackSize, street, opponentBets, bettingAction);
                break;
            default:
                advice = this.getPostflopStrategy(holeCards, boardCards, positionName, potSize, facingBet, canRaise, activePlayers, stackSize, 'flop', opponentBets, bettingAction);
        }

        return {
            ...advice,
            gameState: {
                street,
                position,
                potSize,
                toCall,
                stackSize
            },
            stackDepthInfo,
            blindLevels: this.blindLevels
        };
    }
}

// Export for use in other modules
window.GTOAdvisor = GTOAdvisor; 