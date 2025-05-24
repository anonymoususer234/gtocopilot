/**
 * PokerNow GTO Copilot - PokerNow-Specific Parser
 * Extracts game state information from PokerNow's exact HTML structure
 */

class PokerNowParser {
    constructor(pokerEngine) {
        this.engine = pokerEngine;
        this.gameState = {
            isActive: false,
            holeCards: [],
            boardCards: [],
            position: null,
            potSize: 0,
            toCall: 0,
            canRaise: true,
            activePlayers: 0,
            stackSize: 0,
            street: 'preflop',
            isMyTurn: false,
            lastUpdate: 0
        };
        
        // PokerNow-specific selectors based on the provided HTML
        this.selectors = {
            // Player cards (hole cards)
            playerCards: '.table-player.you-player .table-player-cards',
            cardValue: '.card .value',
            cardSuit: '.card .suit:not(.sub-suit)',
            cardContainer: '.card-container',
            
            // Board cards
            boardCards: '.table-cards',
            
            // Pot and money
            potSize: '.table-pot-size .add-on .normal-value', // "total" pot
            mainPot: '.table-pot-size .main-value .normal-value', // main pot
            playerStack: '.table-player.you-player .table-player-stack .normal-value',
            betAmount: '.table-player-bet-value .normal-value',
            
            // Action buttons and turn detection
            actionButtons: '.action-buttons button.action-button',
            yourTurnSignal: '.action-signal:contains("Your Turn")',
            currentPlayer: '.table-player.decision-current.you-player',
            
            // Game info
            blinds: '.blind-value .normal-value',
            gameType: '.table-game-type'
        };
        
        this.lastGameLogLength = 0;
        this.observerActive = false;
        this.debugMode = false;
    }

    /**
     * Initialize the parser and start monitoring
     */
    initialize() {
        console.log('🎯 PokerNow Copilot: Initializing PokerNow-specific parser...');
        
        // Wait for page to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.startMonitoring());
        } else {
            this.startMonitoring();
        }
    }

    /**
     * Start monitoring the page for changes
     */
    startMonitoring() {
        // Initial parse
        this.parseGameState();
        
        // Set up mutation observer to watch for DOM changes
        this.setupMutationObserver();
        
        // Set up periodic updates
        this.setupPeriodicUpdates();
        
        console.log('🎯 PokerNow Copilot: PokerNow parser active and monitoring...');
    }

    /**
     * Set up mutation observer for real-time updates
     */
    setupMutationObserver() {
        if (this.observerActive) return;
        
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            
            mutations.forEach((mutation) => {
                // Check if relevant elements changed
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    const target = mutation.target;
                    
                    // Check if it's a card-related, pot-related, or action-related change
                    if (target.classList?.contains('table-player-cards') ||
                        target.classList?.contains('table-cards') ||
                        target.classList?.contains('table-pot-size') ||
                        target.classList?.contains('action-buttons') ||
                        target.classList?.contains('decision-current') ||
                        target.closest('.table-player-cards') ||
                        target.closest('.table-cards') ||
                        target.closest('.table-pot-size') ||
                        target.closest('.action-buttons')) {
                        shouldUpdate = true;
                    }
                }
            });
            
            if (shouldUpdate) {
                setTimeout(() => this.parseGameState(), 100); // Small delay to ensure DOM is updated
            }
        });
        
        // Observe the game container
        const gameContainer = document.querySelector('.game-main-container');
        if (gameContainer) {
            observer.observe(gameContainer, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'style']
            });
            this.observerActive = true;
        }
    }

    /**
     * Set up periodic updates as fallback
     */
    setupPeriodicUpdates() {
        setInterval(() => {
            this.parseGameState();
        }, 1000); // Update every 1 second for real-time feel
    }

    /**
     * Parse current game state from PokerNow DOM
     */
    parseGameState() {
        try {
            const newGameState = {
                isActive: this.isGameActive(),
                holeCards: this.parseHoleCards(),
                boardCards: this.parseBoardCards(),
                position: this.parsePosition(),
                potSize: this.parsePotSize(),
                toCall: this.parseToCall(),
                canRaise: this.canRaise(),
                activePlayers: this.parseActivePlayers(),
                stackSize: this.parseStackSize(),
                street: this.parseStreet(),
                isMyTurn: this.isMyTurn(),
                lastUpdate: Date.now()
            };
            
            // Debug logging
            if (this.debugMode) {
                console.log('🎮 PokerNow parsed game state:', newGameState);
            }
            
            // Only update if something changed
            if (this.hasStateChanged(newGameState)) {
                this.gameState = newGameState;
                
                // Dispatch custom event for the copilot UI
                this.dispatchGameStateUpdate();
            }
            
        } catch (error) {
            console.error('PokerNow Parser error:', error);
        }
    }

    /**
     * Check if we're in an active poker game
     */
    isGameActive() {
        // Check for PokerNow game indicators
        const indicators = [
            document.querySelector('.table'),
            document.querySelector('.game-main-container'),
            document.querySelector('.table-player'),
            document.querySelector('.action-buttons')
        ];
        
        return indicators.some(el => el !== null);
    }

    /**
     * Parse hole cards from PokerNow structure
     */
    parseHoleCards() {
        const cards = [];
        
        // Find the player's cards container
        const playerCardsContainer = document.querySelector(this.selectors.playerCards);
        if (!playerCardsContainer) {
            if (this.debugMode) {
                console.log('🃏 No player cards container found');
            }
            return cards;
        }
        
        // Find all card containers
        const cardContainers = playerCardsContainer.querySelectorAll(this.selectors.cardContainer);
        
        cardContainers.forEach((container, index) => {
            // Only parse flipped cards (revealed to player)
            if (container.classList.contains('flipped')) {
                const cardElement = container.querySelector('.card');
                if (cardElement) {
                    const valueElement = cardElement.querySelector(this.selectors.cardValue);
                    const suitElement = cardElement.querySelector(this.selectors.cardSuit);
                    
                    if (valueElement && suitElement) {
                        const value = valueElement.textContent.trim();
                        const suit = suitElement.textContent.trim();
                        
                        // Convert PokerNow format to our format
                        const card = this.convertToStandardCard(value, suit);
                        if (card) {
                            cards.push(card);
                        }
                    }
                }
            }
        });
        
        if (this.debugMode && cards.length > 0) {
            console.log('🃏 Found hole cards:', cards);
        }
        
        return cards.slice(0, 2); // Limit to 2 hole cards
    }

    /**
     * Parse board cards (flop, turn, river)
     */
    parseBoardCards() {
        const cards = [];
        
        const boardContainer = document.querySelector(this.selectors.boardCards);
        if (!boardContainer) {
            return cards;
        }
        
        // Find all card containers on the board
        const cardContainers = boardContainer.querySelectorAll(this.selectors.cardContainer);
        
        cardContainers.forEach((container) => {
            // Only parse visible/flipped cards
            if (container.classList.contains('flipped')) {
                const cardElement = container.querySelector('.card');
                if (cardElement) {
                    const valueElement = cardElement.querySelector(this.selectors.cardValue);
                    const suitElement = cardElement.querySelector(this.selectors.cardSuit);
                    
                    if (valueElement && suitElement) {
                        const value = valueElement.textContent.trim();
                        const suit = suitElement.textContent.trim();
                        
                        const card = this.convertToStandardCard(value, suit);
                        if (card) {
                            cards.push(card);
                        }
                    }
                }
            }
        });
        
        if (this.debugMode && cards.length > 0) {
            console.log('🃏 Found board cards:', cards);
        }
        
        return cards.slice(0, 5); // Max 5 board cards
    }

    /**
     * Convert PokerNow card format to standard format
     */
    convertToStandardCard(value, suit) {
        // Map PokerNow values to standard values
        const valueMap = {
            'A': 'A', 'K': 'K', 'Q': 'Q', 'J': 'J', 'T': 'T',
            '10': 'T', '9': '9', '8': '8', '7': '7', '6': '6',
            '5': '5', '4': '4', '3': '3', '2': '2'
        };
        
        // Map PokerNow suits to standard suits
        const suitMap = {
            'd': 'd', 'h': 'h', 's': 's', 'c': 'c',
            '♦': 'd', '♥': 'h', '♠': 's', '♣': 'c'
        };
        
        const standardValue = valueMap[value];
        const standardSuit = suitMap[suit];
        
        if (standardValue && standardSuit) {
            const cardString = standardValue + standardSuit;
            return this.engine.parseCard(cardString);
        }
        
        return null;
    }

    /**
     * Parse pot size from PokerNow
     */
    parsePotSize() {
        // Try to get the total pot first
        let potElement = document.querySelector(this.selectors.potSize);
        
        // If no total pot, try main pot
        if (!potElement) {
            potElement = document.querySelector(this.selectors.mainPot);
        }
        
        if (potElement) {
            const potText = potElement.textContent.trim();
            return this.extractAmount(potText);
        }
        
        return 0;
    }

    /**
     * Parse amount to call from action buttons
     */
    parseToCall() {
        const actionButtons = document.querySelectorAll(this.selectors.actionButtons);
        
        for (const button of actionButtons) {
            const buttonText = button.textContent.toLowerCase();
            
            // Look for "Call X" pattern
            if (buttonText.includes('call')) {
                const match = buttonText.match(/call\s+(\d+)/i);
                if (match) {
                    return parseInt(match[1]);
                }
            }
        }
        
        return 0;
    }

    /**
     * Parse player's stack size
     */
    parseStackSize() {
        const stackElement = document.querySelector(this.selectors.playerStack);
        
        if (stackElement) {
            const stackText = stackElement.textContent.trim();
            return this.extractAmount(stackText);
        }
        
        return 100; // Default
    }

    /**
     * Check if it's the player's turn
     */
    isMyTurn() {
        // Check if player has decision-current class
        const currentPlayer = document.querySelector(this.selectors.currentPlayer);
        
        // Also check for "Your Turn" signal
        const turnSignalElements = document.querySelectorAll('.action-signal');
        const hasTurnSignal = Array.from(turnSignalElements).some(el => 
            el.textContent.includes('Your Turn')
        );
        
        return currentPlayer !== null || hasTurnSignal;
    }

    /**
     * Check if player can raise
     */
    canRaise() {
        const actionButtons = document.querySelectorAll(this.selectors.actionButtons);
        
        for (const button of actionButtons) {
            const buttonText = button.textContent.toLowerCase();
            if ((buttonText.includes('raise') || buttonText.includes('bet')) && !button.disabled) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Parse current street based on board cards
     */
    parseStreet() {
        const boardCards = this.parseBoardCards();
        
        if (boardCards.length === 0) return 'preflop';
        if (boardCards.length === 3) return 'flop';
        if (boardCards.length === 4) return 'turn';
        if (boardCards.length === 5) return 'river';
        
        return 'preflop';
    }

    /**
     * Parse player position (simplified)
     */
    parsePosition() {
        // Could be enhanced by looking at dealer button position
        // For now, default to BTN
        return 'BTN';
    }

    /**
     * Count active players
     */
    parseActivePlayers() {
        const players = document.querySelectorAll('.table-player');
        return Math.max(2, players.length);
    }

    /**
     * Extract monetary amount from text
     */
    extractAmount(text) {
        if (!text) return 0;
        
        // Remove currency symbols and extract numbers
        const cleanText = text.replace(/[$,]/g, '');
        const match = cleanText.match(/(\d+(?:\.\d{2})?)/);
        
        return match ? parseFloat(match[1]) : 0;
    }

    /**
     * Check if game state has changed
     */
    hasStateChanged(newState) {
        const currentState = this.gameState;
        
        return (
            newState.isActive !== currentState.isActive ||
            newState.holeCards.length !== currentState.holeCards.length ||
            newState.boardCards.length !== currentState.boardCards.length ||
            newState.potSize !== currentState.potSize ||
            newState.toCall !== currentState.toCall ||
            newState.isMyTurn !== currentState.isMyTurn ||
            newState.street !== currentState.street ||
            JSON.stringify(newState.holeCards) !== JSON.stringify(currentState.holeCards) ||
            JSON.stringify(newState.boardCards) !== JSON.stringify(currentState.boardCards)
        );
    }

    /**
     * Dispatch game state update event
     */
    dispatchGameStateUpdate() {
        const event = new CustomEvent('pokerGameStateUpdate', {
            detail: this.gameState
        });
        
        document.dispatchEvent(event);
        
        if (this.debugMode) {
            console.log('🎯 PokerNow game state updated:', this.gameState);
        }
    }

    /**
     * Get current game state
     */
    getGameState() {
        return { ...this.gameState };
    }

    /**
     * Force update game state
     */
    forceUpdate() {
        this.parseGameState();
    }

    enableDebugMode() {
        this.debugMode = true;
        console.log('🔧 PokerNow parser debug mode enabled');
    }

    disableDebugMode() {
        this.debugMode = false;
        console.log('🔧 PokerNow parser debug mode disabled');
    }
}

// Export for use in other modules
window.PokerNowParser = PokerNowParser; 