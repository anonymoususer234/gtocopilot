/**
 * PokerNow GTO Copilot - UI Component
 * Creates and manages the copilot sidebar interface
 */

class CopilotUI {
    constructor(gtoAdvisor, parser) {
        this.advisor = gtoAdvisor;
        this.parser = parser;
        this.isVisible = true;
        this.isMinimized = false;
        this.currentAdvice = null;
        
        this.ui = {
            container: null,
            header: null,
            content: null,
            advice: null,
            gameInfo: null,
            toggleButton: null
        };
        
        this.animations = {
            fadeIn: 'copilot-fade-in 0.3s ease-out',
            slideIn: 'copilot-slide-in 0.3s ease-out',
            pulse: 'copilot-pulse 1s infinite'
        };
    }

    /**
     * Initialize and inject the copilot UI
     */
    initialize() {
        console.log('🎯 PokerNow Copilot: Initializing UI...');
        
        this.createCopilotContainer();
        this.setupEventListeners();
        this.startAdviceUpdates();
        
        console.log('🎯 PokerNow Copilot: UI active!');
    }

    /**
     * Create the main copilot container and UI elements
     */
    createCopilotContainer() {
        // Remove any existing copilot
        const existingCopilot = document.getElementById('pokernow-copilot');
        if (existingCopilot) {
            existingCopilot.remove();
        }

        // Create main container
        this.ui.container = document.createElement('div');
        this.ui.container.id = 'pokernow-copilot';
        this.ui.container.className = 'copilot-container';
        
        // Create header
        this.ui.header = document.createElement('div');
        this.ui.header.className = 'copilot-header';
        this.ui.header.innerHTML = `
            <div class="copilot-title">
                <span class="copilot-icon">🎯</span>
                <span class="copilot-title-text">GTO Copilot</span>
                <div class="copilot-status">
                    <span class="status-indicator"></span>
                    <span class="status-text">Analyzing...</span>
                </div>
            </div>
            <div class="copilot-controls">
                <button class="copilot-btn copilot-minimize" title="Minimize">−</button>
                <button class="copilot-btn copilot-close" title="Close">×</button>
            </div>
        `;

        // Create content area
        this.ui.content = document.createElement('div');
        this.ui.content.className = 'copilot-content';
        
        // Create game info section
        this.ui.gameInfo = document.createElement('div');
        this.ui.gameInfo.className = 'copilot-game-info';
        this.ui.gameInfo.innerHTML = `
            <div class="game-status">
                <div class="game-indicator">
                    <span class="game-status-dot"></span>
                    <span class="game-status-text">Waiting for game...</span>
                </div>
            </div>
            <div class="hand-info" style="display: none;">
                <div class="cards-display">
                    <div class="hole-cards">
                        <span class="label">Your Cards:</span>
                        <div class="cards"></div>
                    </div>
                    <div class="board-cards">
                        <span class="label">Board:</span>
                        <div class="cards"></div>
                    </div>
                </div>
                <div class="game-stats">
                    <div class="stat">
                        <span class="stat-label">Pot:</span>
                        <span class="stat-value pot-size">$0</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">To Call:</span>
                        <span class="stat-value to-call">$0</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Stack:</span>
                        <span class="stat-value stack-size">$100</span>
                    </div>
                </div>
            </div>
        `;

        // Create advice section
        this.ui.advice = document.createElement('div');
        this.ui.advice.className = 'copilot-advice';
        this.ui.advice.innerHTML = `
            <div class="advice-header">
                <h3>Recommended Action</h3>
                <div class="confidence-badge">
                    <span class="confidence-level">--</span>
                    <span class="confidence-text">Confidence</span>
                </div>
            </div>
            <div class="advice-content">
                <div class="primary-action">
                    <div class="action-recommendation">
                        <span class="action-text">Waiting for hand...</span>
                        <span class="action-amount"></span>
                    </div>
                    <div class="action-reasoning">
                        Connect to a poker game to receive GTO advice
                    </div>
                </div>
                <div class="detailed-stats" style="display: none;">
                    <div class="stat-row">
                        <span class="stat-name">Hand Strength:</span>
                        <span class="stat-value hand-strength">--</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-name">Equity:</span>
                        <span class="stat-value equity">--</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-name">Outs:</span>
                        <span class="stat-value outs">--</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-name">Pot Odds:</span>
                        <span class="stat-value pot-odds">--</span>
                    </div>
                </div>
            </div>
            <div class="advice-footer">
                <button class="copilot-btn-secondary toggle-details">Show Details</button>
                <button class="copilot-btn-primary force-update">Refresh</button>
            </div>
        `;

        // Assemble the UI
        this.ui.content.appendChild(this.ui.gameInfo);
        this.ui.content.appendChild(this.ui.advice);
        this.ui.container.appendChild(this.ui.header);
        this.ui.container.appendChild(this.ui.content);

        // Inject into page
        document.body.appendChild(this.ui.container);

        // Store references to frequently used elements
        this.cacheUIElements();
        
        // Show with animation
        this.ui.container.style.animation = this.animations.slideIn;
    }

    /**
     * Cache frequently used UI elements
     */
    cacheUIElements() {
        this.elements = {
            statusIndicator: this.ui.container.querySelector('.status-indicator'),
            statusText: this.ui.container.querySelector('.status-text'),
            gameStatusDot: this.ui.container.querySelector('.game-status-dot'),
            gameStatusText: this.ui.container.querySelector('.game-status-text'),
            handInfo: this.ui.container.querySelector('.hand-info'),
            holeCards: this.ui.container.querySelector('.hole-cards .cards'),
            boardCards: this.ui.container.querySelector('.board-cards .cards'),
            potSize: this.ui.container.querySelector('.pot-size'),
            toCall: this.ui.container.querySelector('.to-call'),
            stackSize: this.ui.container.querySelector('.stack-size'),
            confidenceLevel: this.ui.container.querySelector('.confidence-level'),
            confidenceBadge: this.ui.container.querySelector('.confidence-badge'),
            actionText: this.ui.container.querySelector('.action-text'),
            actionAmount: this.ui.container.querySelector('.action-amount'),
            actionReasoning: this.ui.container.querySelector('.action-reasoning'),
            detailedStats: this.ui.container.querySelector('.detailed-stats'),
            handStrength: this.ui.container.querySelector('.hand-strength'),
            equity: this.ui.container.querySelector('.equity'),
            outs: this.ui.container.querySelector('.outs'),
            potOdds: this.ui.container.querySelector('.pot-odds')
        };
    }

    /**
     * Set up event listeners for UI interactions
     */
    setupEventListeners() {
        // Header controls
        this.ui.container.querySelector('.copilot-minimize').addEventListener('click', () => {
            this.toggleMinimize();
        });

        this.ui.container.querySelector('.copilot-close').addEventListener('click', () => {
            this.hide();
        });

        // Advice controls
        this.ui.container.querySelector('.toggle-details').addEventListener('click', (e) => {
            this.toggleDetails();
        });

        this.ui.container.querySelector('.force-update').addEventListener('click', () => {
            this.forceUpdate();
        });

        // Game state updates
        document.addEventListener('pokerGameStateUpdate', (event) => {
            this.updateGameState(event.detail);
        });

        // Draggable functionality
        this.makeDraggable();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    /**
     * Make the copilot draggable
     */
    makeDraggable() {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        this.ui.header.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('copilot-btn')) return;
            
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            isDragging = true;
            this.ui.header.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;
                
                this.ui.container.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            this.ui.header.style.cursor = 'grab';
        });
    }

    /**
     * Update the UI with current game state
     */
    updateGameState(gameState) {
        // Update status with more detailed information
        if (gameState.isActive) {
            this.elements.gameStatusDot.className = 'game-status-dot active';
            
            let statusText = 'In Game';
            if (gameState.isMyTurn) {
                statusText = '🎯 Your Turn!';
            } else if (gameState.waitingForAction) {
                statusText = 'Opponent Acting...';
            }
            
            this.elements.gameStatusText.textContent = statusText;
            this.elements.handInfo.style.display = 'block';
            
            this.elements.statusIndicator.className = 'status-indicator active';
            this.elements.statusText.textContent = 'Analyzing';
        } else {
            this.elements.gameStatusDot.className = 'game-status-dot';
            this.elements.gameStatusText.textContent = 'Waiting for game...';
            this.elements.handInfo.style.display = 'none';
            
            this.elements.statusIndicator.className = 'status-indicator';
            this.elements.statusText.textContent = 'Idle';
        }

        // Update cards
        this.updateCards(gameState.holeCards, gameState.boardCards);

        // Update game stats
        this.elements.potSize.textContent = `$${gameState.potSize}`;
        this.elements.toCall.textContent = `$${gameState.toCall}`;
        this.elements.stackSize.textContent = `$${gameState.stackSize}`;

        // Get and update advice with frequencies
        if (gameState.isActive && gameState.holeCards.length === 2) {
            this.updateAdvice(gameState);
        } else {
            this.clearAdvice();
        }
    }

    /**
     * Update card displays
     */
    updateCards(holeCards, boardCards) {
        // Update hole cards
        this.elements.holeCards.innerHTML = '';
        holeCards.forEach(card => {
            const cardElement = this.createCardElement(card);
            this.elements.holeCards.appendChild(cardElement);
        });

        // Update board cards
        this.elements.boardCards.innerHTML = '';
        boardCards.forEach(card => {
            const cardElement = this.createCardElement(card);
            this.elements.boardCards.appendChild(cardElement);
        });

        // Add placeholders for missing board cards
        for (let i = boardCards.length; i < 5; i++) {
            const placeholder = document.createElement('div');
            placeholder.className = 'card-placeholder';
            this.elements.boardCards.appendChild(placeholder);
        }
    }

    /**
     * Create a card display element
     */
    createCardElement(card) {
        const cardEl = document.createElement('div');
        cardEl.className = 'poker-card';
        
        const suitSymbols = { 's': '♠', 'h': '♥', 'd': '♦', 'c': '♣' };
        const suitColors = { 's': '#000', 'h': '#e74c3c', 'd': '#e74c3c', 'c': '#000' };
        
        cardEl.innerHTML = `
            <span class="card-rank">${card.rank}</span>
            <span class="card-suit" style="color: ${suitColors[card.suit]}">${suitSymbols[card.suit]}</span>
        `;
        
        return cardEl;
    }

    /**
     * Update advice display with mixed strategy frequencies
     */
    updateAdvice(gameState) {
        const advice = this.advisor.getAdvice(gameState);
        this.currentAdvice = advice;

        // Update confidence (primary action frequency)
        this.elements.confidenceLevel.textContent = `${advice.confidence}%`;
        this.elements.confidenceBadge.style.background = this.advisor.getConfidenceColor(advice.confidence);

        // Update primary action with frequency
        const primaryActionDisplay = this.advisor.getPrimaryActionDisplay(advice.primaryAction, advice.strategy);
        this.elements.actionText.innerHTML = `
            <div class="primary-action-main">${primaryActionDisplay}</div>
            <div class="strategy-frequencies">${this.advisor.getStrategyDisplay(advice.strategy)}</div>
        `;
        
        if (advice.betSize && advice.betSize > 0) {
            this.elements.actionAmount.textContent = `$${advice.betSize}`;
            this.elements.actionAmount.style.display = 'inline';
        } else {
            this.elements.actionAmount.style.display = 'none';
        }

        this.elements.actionReasoning.textContent = advice.reasoning;

        // Update detailed stats
        if (advice.handStrength !== undefined) {
            this.elements.handStrength.textContent = `${Math.round(advice.handStrength)}%`;
        }
        if (advice.equity) {
            this.elements.equity.textContent = advice.equity;
        }
        if (advice.outs) {
            this.elements.outs.textContent = advice.outs;
        }
        if (advice.potOdds) {
            this.elements.potOdds.textContent = advice.potOdds;
        }

        // Add frequency bars for visual representation
        this.addFrequencyBars(advice.strategy);

        // Add urgency animation if it's player's turn
        if (gameState.isMyTurn) {
            this.elements.confidenceBadge.style.animation = this.animations.pulse;
        } else {
            this.elements.confidenceBadge.style.animation = 'none';
        }
    }

    /**
     * Add visual frequency bars for each action
     */
    addFrequencyBars(strategy) {
        // Remove existing frequency bars
        const existingBars = this.ui.advice.querySelector('.frequency-bars');
        if (existingBars) {
            existingBars.remove();
        }

        // Create frequency bars container
        const barsContainer = document.createElement('div');
        barsContainer.className = 'frequency-bars';
        
        // Sort actions by frequency
        const sortedActions = Object.entries(strategy)
            .filter(([action, freq]) => freq > 0)
            .sort(([,a], [,b]) => b - a);

        sortedActions.forEach(([action, frequency]) => {
            const barWrapper = document.createElement('div');
            barWrapper.className = 'frequency-bar-wrapper';
            
            const barLabel = document.createElement('div');
            barLabel.className = 'frequency-bar-label';
            barLabel.textContent = `${this.advisor.capitalizeAction(action)}: ${frequency}%`;
            
            const barContainer = document.createElement('div');
            barContainer.className = 'frequency-bar-container';
            
            const bar = document.createElement('div');
            bar.className = 'frequency-bar';
            bar.style.width = `${frequency}%`;
            bar.style.backgroundColor = this.advisor.getActionColor(action, frequency);
            
            barContainer.appendChild(bar);
            barWrapper.appendChild(barLabel);
            barWrapper.appendChild(barContainer);
            barsContainer.appendChild(barWrapper);
        });

        // Insert after the action recommendation
        const actionRecommendation = this.ui.advice.querySelector('.action-recommendation');
        actionRecommendation.insertAdjacentElement('afterend', barsContainer);
    }

    /**
     * Toggle detailed stats visibility
     */
    toggleDetails() {
        const detailsVisible = this.elements.detailedStats.style.display !== 'none';
        const button = this.ui.container.querySelector('.toggle-details');
        
        if (detailsVisible) {
            this.elements.detailedStats.style.display = 'none';
            button.textContent = 'Show Details';
        } else {
            this.elements.detailedStats.style.display = 'block';
            button.textContent = 'Hide Details';
        }
    }

    /**
     * Toggle minimize state
     */
    toggleMinimize() {
        const button = this.ui.container.querySelector('.copilot-minimize');
        
        if (this.isMinimized) {
            this.ui.content.style.display = 'block';
            button.textContent = '−';
            this.isMinimized = false;
        } else {
            this.ui.content.style.display = 'none';
            button.textContent = '+';
            this.isMinimized = true;
        }
    }

    /**
     * Toggle copilot visibility
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Show copilot
     */
    show() {
        if (this.ui.container) {
            this.ui.container.style.display = 'block';
            this.ui.container.style.animation = this.animations.slideIn;
            this.isVisible = true;
        }
    }

    /**
     * Hide copilot
     */
    hide() {
        if (this.ui.container) {
            this.ui.container.style.display = 'none';
            this.isVisible = false;
        }
    }

    /**
     * Force update advice
     */
    forceUpdate() {
        this.parser.forceUpdate();
        const button = this.ui.container.querySelector('.force-update');
        button.textContent = 'Refreshing...';
        
        setTimeout(() => {
            button.textContent = 'Refresh';
        }, 1000);
    }

    /**
     * Start periodic advice updates - now more frequent for real-time updates
     */
    startAdviceUpdates() {
        // Update advice every 1 second for real-time updates
        setInterval(() => {
            const gameState = this.parser.getGameState();
            if (gameState.isActive && gameState.holeCards.length === 2) {
                this.updateAdvice(gameState);
            }
        }, 1000);
    }

    /**
     * Show welcome message when copilot activates
     */
    showWelcomeMessage() {
        // Create welcome notification
        const welcome = document.createElement('div');
        welcome.className = 'copilot-welcome';
        welcome.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            z-index: 10001;
            font-family: 'Segoe UI', sans-serif;
            font-size: 14px;
            font-weight: 600;
            animation: ${this.animations.slideIn};
            cursor: pointer;
            max-width: 300px;
        `;
        
        welcome.innerHTML = `
            🎯 <strong>GTO Copilot Active!</strong><br>
            <small style="font-weight: 400; opacity: 0.9;">
                • Press Ctrl+Shift+P to toggle<br>
                • Real-time strategy frequencies<br>
                • Updates automatically with each action
            </small>
        `;
        
        document.body.appendChild(welcome);
        
        // Auto-remove after 6 seconds or on click
        const remove = () => {
            welcome.style.animation = 'copilot-fade-out 0.3s ease-out';
            setTimeout(() => welcome.remove(), 300);
        };
        
        welcome.addEventListener('click', remove);
        setTimeout(remove, 6000);
    }

    /**
     * Clear advice when not in game
     */
    clearAdvice() {
        this.elements.actionText.innerHTML = 'Waiting for hand...';
        this.elements.actionAmount.style.display = 'none';
        this.elements.actionReasoning.textContent = 'Join a poker game to receive real-time GTO strategy advice with frequencies';
        this.elements.confidenceLevel.textContent = '--';
        this.elements.confidenceBadge.style.background = '#6c757d';
        this.elements.confidenceBadge.style.animation = 'none';
        
        // Clear detailed stats
        this.elements.handStrength.textContent = '--';
        this.elements.equity.textContent = '--';
        this.elements.outs.textContent = '--';
        this.elements.potOdds.textContent = '--';

        // Remove frequency bars
        const existingBars = this.ui.advice.querySelector('.frequency-bars');
        if (existingBars) {
            existingBars.remove();
        }
    }
}

// Export for use in other modules
window.CopilotUI = CopilotUI; 