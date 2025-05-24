/**
 * PokerNow GTO Copilot - GTO Strategy Advisor
 * Provides strategic poker advice based on game theory optimal play with mixed strategies
 */

class GTOAdvisor {
    constructor(pokerEngine, equityCalculator) {
        this.engine = pokerEngine;
        this.equity = equityCalculator;
        
        // Position values for decision making
        this.positionValues = {
            'SB': 1, 'BB': 2, 'UTG': 3, 'UTG+1': 4, 'MP': 5, 
            'MP+1': 6, 'HJ': 7, 'CO': 8, 'BTN': 9
        };
        
        // Preflop ranges for different positions
        this.preflopRanges = {
            tight: 'AA,KK,QQ,JJ,TT,99,AK,AQ,AJ,KQ',
            standard: 'AA,KK,QQ,JJ,TT,99,88,77,AK,AQ,AJ,AT,KQ,KJ,QJ,JT',
            loose: 'AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AK,AQ,AJ,AT,A9,A8,A7,A6,A5,KQ,KJ,KT,K9,QJ,QT,Q9,JT,J9,T9,98,87,76,65,54'
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
            street = 'preflop'
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

        let advice;
        
        switch (street) {
            case 'preflop':
                advice = this.getPreflopStrategy(holeCards, position, potSize, toCall, activePlayers, stackSize);
                break;
            case 'flop':
            case 'turn':
            case 'river':
                advice = this.getPostflopStrategy(holeCards, boardCards, position, potSize, toCall, canRaise, activePlayers, stackSize, street);
                break;
            default:
                advice = this.getPostflopStrategy(holeCards, boardCards, position, potSize, toCall, canRaise, activePlayers, stackSize, 'flop');
        }

        return {
            ...advice,
            gameState: {
                street,
                position,
                potSize,
                toCall,
                stackSize
            }
        };
    }

    /**
     * Preflop mixed strategy with frequencies
     */
    getPreflopStrategy(holeCards, position, potSize, toCall, activePlayers, stackSize) {
        const handStrength = this.engine.getPreflopStrength(holeCards);
        const positionValue = this.positionValues[position] || 5;
        const potOdds = toCall > 0 ? this.equity.calculatePotOdds(potSize, toCall) : null;
        
        // Adjust hand strength based on position and players
        let adjustedStrength = handStrength.strength;
        if (positionValue >= 7) adjustedStrength += 10; // Late position bonus
        if (positionValue <= 3) adjustedStrength -= 10; // Early position penalty
        if (activePlayers > 5) adjustedStrength -= 5;
        if (activePlayers <= 3) adjustedStrength += 5;
        
        const potSizeRatio = toCall / stackSize;
        if (potSizeRatio > 0.2) adjustedStrength -= 10;
        
        let strategy = {};
        let primaryAction = 'fold';
        let reasoning = '';
        let betSize = 0;

        if (toCall === 0) {
            // Opening action - mixed strategy based on hand strength
            if (adjustedStrength >= 75) {
                // Premium hands - almost always raise
                strategy = { raise: 95, fold: 5 };
                primaryAction = 'raise';
                betSize = Math.round(potSize * 2.5);
                reasoning = `Premium ${handStrength.description}. Raise 95% of time for value.`;
            } else if (adjustedStrength >= 60) {
                // Strong hands - raise most of time
                strategy = { raise: 80, fold: 20 };
                primaryAction = 'raise';
                betSize = Math.round(potSize * 2.2);
                reasoning = `Strong hand in ${position}. Raise 80% for value, fold 20% vs early position raises.`;
            } else if (adjustedStrength >= 45 && positionValue >= 7) {
                // Marginal hands in late position - mixed strategy
                strategy = { raise: 60, fold: 40 };
                primaryAction = 'raise';
                betSize = Math.round(potSize * 2.0);
                reasoning = `Marginal hand, late position. Raise 60% as steal, fold 40% vs resistance.`;
            } else if (adjustedStrength >= 35 && positionValue >= 8) {
                // Weak hands on button - occasional steal
                strategy = { raise: 35, fold: 65 };
                primaryAction = 'fold';
                betSize = Math.round(potSize * 1.8);
                reasoning = `Weak hand on button. Steal 35% of time, fold 65%.`;
            } else {
                // Very weak hands - mostly fold
                strategy = { fold: 95, raise: 5 };
                primaryAction = 'fold';
                reasoning = `Weak hand from ${position}. Fold 95%, occasional bluff 5%.`;
            }
        } else {
            // Facing a raise - 3-bet, call, or fold frequencies
            const callEquity = adjustedStrength;
            const requiredEquity = potOdds ? potOdds.percentage : 33;
            
            if (adjustedStrength >= 85) {
                // Premium hands - 3-bet for value
                strategy = { 'raise': 90, 'call': 8, 'fold': 2 };
                primaryAction = 'raise';
                betSize = Math.round(toCall * 3);
                reasoning = `Premium ${handStrength.description}. 3-bet 90% for value, call 8% for deception.`;
            } else if (adjustedStrength >= 70) {
                // Strong hands - mixed strategy
                if (positionValue >= 7) {
                    strategy = { 'raise': 70, 'call': 25, 'fold': 5 };
                    primaryAction = 'raise';
                    betSize = Math.round(toCall * 2.5);
                    reasoning = `Strong hand, good position. 3-bet 70%, call 25%, fold 5%.`;
                } else {
                    strategy = { 'call': 70, 'raise': 20, 'fold': 10 };
                    primaryAction = 'call';
                    reasoning = `Strong hand, poor position. Call 70%, 3-bet 20%, fold 10%.`;
                }
            } else if (adjustedStrength >= 55) {
                // Medium hands - mostly call
                strategy = { 'call': 65, 'fold': 25, 'raise': 10 };
                primaryAction = 'call';
                reasoning = `Medium strength. Call 65%, fold 25%, 3-bet bluff 10%.`;
            } else if (callEquity >= requiredEquity && adjustedStrength >= 40) {
                // Marginal hands with good odds
                strategy = { 'call': 55, 'fold': 40, 'raise': 5 };
                primaryAction = 'call';
                reasoning = `Marginal hand with good odds. Call 55%, fold 40%, bluff 5%.`;
            } else {
                // Weak hands - mostly fold
                strategy = { 'fold': 85, 'call': 10, 'raise': 5 };
                primaryAction = 'fold';
                reasoning = `Weak hand vs raise. Fold 85%, call 10%, bluff 3-bet 5%.`;
            }
        }

        return {
            primaryAction,
            strategy,
            betSize,
            confidence: this.calculateConfidence(strategy, primaryAction),
            reasoning,
            handStrength: handStrength.strength,
            adjustedStrength: Math.round(adjustedStrength),
            potOdds: potOdds?.description || 'N/A'
        };
    }

    /**
     * Postflop mixed strategy with frequencies
     */
    getPostflopStrategy(holeCards, boardCards, position, potSize, toCall, canRaise, activePlayers, stackSize, street) {
        const handEval = this.engine.evaluateHand([...holeCards, ...boardCards]);
        const handStrength = this.engine.getHandStrengthPercentage(holeCards, boardCards);
        const outs = this.equity.calculateOuts(holeCards, boardCards);
        const equity = this.equity.calculateEquity(holeCards, 'random', boardCards, 500);
        const potOdds = toCall > 0 ? this.equity.calculatePotOdds(potSize, toCall) : null;
        
        const positionValue = this.positionValues[position] || 5;
        
        let strategy = {};
        let primaryAction = 'fold';
        let reasoning = '';
        let betSize = 0;

        if (toCall === 0) {
            // First to act - check, bet frequencies
            if (handStrength >= 80 || handEval.type !== 'HIGH_CARD') {
                // Strong hands - bet for value
                strategy = { 'bet': 85, 'check': 15 };
                primaryAction = 'bet';
                betSize = Math.round(potSize * 0.75);
                reasoning = `Strong ${handEval.description}. Bet 85% for value, check 15% for pot control.`;
            } else if (outs.outs >= 12) {
                // Strong draws - aggressive
                strategy = { 'bet': 70, 'check': 30 };
                primaryAction = 'bet';
                betSize = Math.round(potSize * 0.6);
                reasoning = `Strong draw (${outs.outs} outs). Bet 70% semi-bluff, check 30%.`;
            } else if (outs.outs >= 8) {
                // Medium draws - mixed
                strategy = { 'bet': 45, 'check': 55 };
                primaryAction = 'check';
                betSize = Math.round(potSize * 0.5);
                reasoning = `Medium draw (${outs.outs} outs). Bet 45% semi-bluff, check 55%.`;
            } else if (handStrength >= 40) {
                // Marginal hands - position dependent
                if (positionValue >= 7) {
                    strategy = { 'bet': 40, 'check': 60 };
                    primaryAction = 'check';
                    betSize = Math.round(potSize * 0.4);
                    reasoning = `Marginal hand, good position. Bet 40% for value, check 60%.`;
                } else {
                    strategy = { 'check': 80, 'bet': 20 };
                    primaryAction = 'check';
                    betSize = Math.round(potSize * 0.3);
                    reasoning = `Marginal hand, poor position. Check 80%, bet 20%.`;
                }
            } else {
                // Weak hands - mostly check, occasional bluff
                if (positionValue >= 8 && activePlayers <= 2 && street === 'river') {
                    strategy = { 'check': 70, 'bet': 30 };
                    primaryAction = 'check';
                    betSize = Math.round(potSize * 0.4);
                    reasoning = `Weak hand heads-up on river. Check 70%, bluff 30%.`;
                } else {
                    strategy = { 'check': 90, 'bet': 10 };
                    primaryAction = 'check';
                    betSize = Math.round(potSize * 0.3);
                    reasoning = `Weak hand. Check 90%, occasional bluff 10%.`;
                }
            }
        } else {
            // Facing a bet - call, raise, fold frequencies
            const requiredEquity = potOdds ? potOdds.percentage : 33;
            const ourEquity = equity.percentage || handStrength;
            
            if (handStrength >= 80) {
                // Strong hands - raise for value
                strategy = { 'raise': 75, 'call': 20, 'fold': 5 };
                primaryAction = 'raise';
                betSize = toCall + Math.round(potSize * 0.8);
                reasoning = `Strong ${handEval.description}. Raise 75% for value, call 20%, never fold.`;
            } else if (handStrength >= 60) {
                // Good hands - mixed strategy
                strategy = { 'call': 60, 'raise': 25, 'fold': 15 };
                primaryAction = 'call';
                betSize = toCall + Math.round(potSize * 0.6);
                reasoning = `Good hand. Call 60%, raise 25% for value, fold 15% vs big bets.`;
            } else if (outs.outs >= 8 && ourEquity >= requiredEquity) {
                // Drawing hands with good odds
                strategy = { 'call': 70, 'raise': 20, 'fold': 10 };
                primaryAction = 'call';
                betSize = toCall + Math.round(potSize * 0.5);
                reasoning = `Good draw (${outs.outs} outs). Call 70%, semi-bluff raise 20%, fold 10%.`;
            } else if (ourEquity >= requiredEquity) {
                // Marginal hands with proper odds
                strategy = { 'call': 60, 'fold': 35, 'raise': 5 };
                primaryAction = 'call';
                reasoning = `Marginal hand with proper odds. Call 60%, fold 35%, bluff 5%.`;
            } else {
                // Weak hands - mostly fold
                strategy = { 'fold': 80, 'call': 15, 'raise': 5 };
                primaryAction = 'fold';
                reasoning = `Weak hand vs bet. Fold 80%, call 15% as bluff-catcher, raise 5% as bluff.`;
            }
        }

        return {
            primaryAction,
            strategy,
            betSize,
            confidence: this.calculateConfidence(strategy, primaryAction),
            reasoning,
            handStrength,
            handDescription: handEval.description,
            equity: equity.description,
            outs: outs.description,
            potOdds: potOdds?.description || 'N/A'
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
     * Get formatted strategy display
     */
    getStrategyDisplay(strategy) {
        const actions = Object.entries(strategy)
            .filter(([action, freq]) => freq > 0)
            .sort(([,a], [,b]) => b - a)
            .map(([action, freq]) => `${this.capitalizeAction(action)} ${freq}%`)
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
            'fold': 'Fold'
        };
        return actionMap[action] || action;
    }

    /**
     * Get primary action with frequency
     */
    getPrimaryActionDisplay(primaryAction, strategy) {
        const frequency = strategy[primaryAction] || 0;
        return `${this.capitalizeAction(primaryAction)} (${frequency}%)`;
    }

    /**
     * Quick action recommendation for fast play
     */
    getQuickAdvice(holeCards, boardCards = [], position = 'BTN', potSize = 0, toCall = 0) {
        const gameState = {
            holeCards,
            boardCards,
            position,
            potSize,
            toCall,
            canRaise: true,
            activePlayers: 2,
            stackSize: 100,
            street: boardCards.length === 0 ? 'preflop' : 
                   boardCards.length === 3 ? 'flop' :
                   boardCards.length === 4 ? 'turn' : 'river'
        };

        const advice = this.getAdvice(gameState);
        
        return {
            primaryAction: advice.primaryAction,
            strategy: advice.strategy,
            confidence: advice.confidence,
            reasoning: advice.reasoning.substring(0, 100) + (advice.reasoning.length > 100 ? '...' : '')
        };
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
}

// Export for use in other modules
window.GTOAdvisor = GTOAdvisor; 