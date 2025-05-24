/**
 * PokerNow GTO Copilot - Main Content Script
 * Initializes and coordinates all copilot components
 * Version: 2.1 - Enhanced Detection & Debugging
 */

// === EARLY DIAGNOSTIC LOGGING ===
console.log('🎯 PokerNow GTO Copilot Content Script Loading...');
console.log('📍 URL:', window.location.href);
console.log('📍 Hostname:', window.location.hostname);
console.log('📍 Title:', document.title);
console.log('📍 Loading time:', new Date().toISOString());

// Check if we're on the right domain early
if (!window.location.hostname.includes('pokernow.club')) {
    console.log('❌ Not on PokerNow domain - content script will not activate');
} else {
    console.log('✅ On PokerNow domain - proceeding with initialization');
}

// Add a simple test function that popup can call to verify content script is loaded
window.testContentScript = function() {
    console.log('🧪 Content script test function called - content script is loaded!');
    return {
        loaded: true,
        timestamp: Date.now(),
        url: window.location.href,
        hostname: window.location.hostname,
        copilotExists: !!window.PokerCopilot,
        copilotInitialized: window.PokerCopilot ? window.PokerCopilot.initialized : false
    };
};

console.log('🎯 Starting copilot initialization v2.1...');

// Global copilot object
window.PokerCopilot = {
    initialized: false,
    engine: null,
    equity: null,
    advisor: null,
    parser: null,
    ui: null,
    version: '2.1',
    
    // Initialize the copilot
    async init() {
        try {
            console.log('🎯 Initializing PokerNow GTO Copilot...');
            
            // Check if we're on PokerNow
            if (!window.location.hostname.includes('pokernow.club')) {
                console.log('❌ Not on PokerNow.com - Copilot disabled');
                return false;
            }
            console.log('✅ On PokerNow.com');
            
            // Check if required classes are available
            if (typeof PokerEngine === 'undefined') {
                console.error('❌ PokerEngine class not found');
                return false;
            }
            if (typeof EquityCalculator === 'undefined') {
                console.error('❌ EquityCalculator class not found');
                return false;
            }
            if (typeof GTOAdvisor === 'undefined') {
                console.error('❌ GTOAdvisor class not found');
                return false;
            }
            if (typeof PokerNowParser === 'undefined') {
                console.error('❌ PokerNowParser class not found');
                return false;
            }
            if (typeof CopilotUI === 'undefined') {
                console.error('❌ CopilotUI class not found');
                return false;
            }
            console.log('✅ All required classes found');
            
            // Initialize poker engine components
            console.log('🔧 Initializing poker engine...');
            this.engine = new PokerEngine();
            console.log('✅ PokerEngine created');
            
            this.equity = new EquityCalculator(this.engine);
            console.log('✅ EquityCalculator created');
            
            this.advisor = new GTOAdvisor(this.engine, this.equity);
            console.log('✅ GTOAdvisor created');
            
            console.log('✅ Poker engine initialized');
            
            // Initialize PokerNow parser
            console.log('🔧 Initializing PokerNow parser...');
            this.parser = new PokerNowParser(this.engine);
            console.log('✅ PokerNowParser created');
            
            // Initialize UI with advisor and parser
            console.log('🔧 Initializing UI...');
            this.ui = new CopilotUI(this.advisor, this.parser);
            console.log('✅ CopilotUI created');
            
            // Set up communication between components
            console.log('🔧 Setting up communication...');
            this.parser.onGameStateChange = (gameState) => {
                this.handleGameStateChange(gameState);
            };
            console.log('✅ Communication setup complete');
            
            // Start monitoring
            console.log('🔧 Starting parser monitoring...');
            this.parser.startMonitoring();
            console.log('✅ Parser monitoring started');
            
            // Initialize UI
            console.log('🔧 Initializing UI display...');
            this.ui.initialize();
            console.log('✅ UI initialized');
            
            this.initialized = true;
            
            console.log('🎯 PokerNow GTO Copilot - Fully Initialized!');
            
            // Show welcome message
            console.log('🔧 Showing welcome message...');
            this.ui.showWelcomeMessage();
            console.log('✅ Welcome message shown');
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize copilot:', error);
            console.error('Stack trace:', error.stack);
            return false;
        }
    },
    
    // Handle game state changes with real-time updates
    handleGameStateChange(gameState) {
        if (!this.initialized) return;
        
        try {
            console.log('🎯 Game state changed:', gameState);
            
            // Update UI with game state
            this.ui.updateGameState(gameState);
            
            // Get GTO advice with mixed strategies if we have enough information
            if (gameState.holeCards && gameState.holeCards.length === 2) {
                const advice = this.advisor.getAdvice(gameState);
                console.log('🎯 GTO Mixed Strategy:', {
                    primaryAction: advice.primaryAction,
                    strategy: advice.strategy,
                    confidence: advice.confidence,
                    reasoning: advice.reasoning
                });
                
                // Update UI with advice
                this.ui.updateAdvice(gameState);
            } else {
                this.ui.clearAdvice();
            }
            
        } catch (error) {
            console.error('❌ Error handling game state change:', error);
        }
    },
    
    // Get current status
    getStatus() {
        return {
            initialized: this.initialized,
            gameState: this.parser ? this.parser.getGameState() : null,
            error: null,
            features: {
                mixedStrategies: true,
                realTimeUpdates: true,
                frequencies: true,
                visualBars: true
            }
        };
    },
    
    // Toggle debug mode
    toggleDebugMode() {
        const isDebug = localStorage.getItem('pokerCopilotDebug') === 'true';
        localStorage.setItem('pokerCopilotDebug', (!isDebug).toString());
        
        if (!isDebug) {
            console.log('🔧 Debug mode enabled - Mixed strategy frequencies will be logged');
            // Enable debug mode in parser
            if (this.parser) {
                this.parser.enableDebugMode();
            }
            if (this.ui && this.ui.showDebugInfo) {
                this.ui.showDebugInfo(true);
            }
        } else {
            console.log('🔧 Debug mode disabled');
            // Disable debug mode in parser
            if (this.parser) {
                this.parser.disableDebugMode();
            }
            if (this.ui && this.ui.showDebugInfo) {
                this.ui.showDebugInfo(false);
            }
        }
        
        return !isDebug;
    },
    
    // Get current game analysis
    getCurrentAnalysis() {
        if (!this.initialized || !this.parser) return null;
        
        const gameState = this.parser.getGameState();
        if (!gameState.isActive || gameState.holeCards.length !== 2) return null;
        
        const advice = this.advisor.getAdvice(gameState);
        
        return {
            gameState,
            advice,
            timestamp: Date.now()
        };
    }
};

// Wait for DOM to be ready
function waitForDOM() {
    return new Promise((resolve) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', resolve);
        } else {
            resolve();
        }
    });
}

// Wait for PokerNow to load with better detection
function waitForPokerNow() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 30; // 30 seconds max wait
        
        const checkPokerNow = () => {
            attempts++;
            
            // Look for PokerNow's main game elements
            const indicators = [
                document.querySelector('[class*="table"]'),
                document.querySelector('[class*="game"]'),
                document.querySelector('.hand-cards'),
                document.querySelector('[class*="poker"]'),
                document.querySelector('[class*="card"]'),
                document.getElementById('game-container'),
                document.querySelector('[data-testid*="game"]'),
                document.querySelector('.action-button, .poker-button')
            ];
            
            if (indicators.some(el => el !== null)) {
                console.log('🎯 PokerNow game interface detected');
                resolve();
            } else if (attempts >= maxAttempts) {
                console.log('🎯 PokerNow detection timeout - initializing anyway');
                resolve();
            } else {
                setTimeout(checkPokerNow, 1000);
            }
        };
        
        checkPokerNow();
    });
}

// Initialize copilot when ready
async function initializeCopilot() {
    try {
        console.log('🎯 Waiting for DOM...');
        await waitForDOM();
        
        console.log('🎯 Waiting for PokerNow to load...');
        await waitForPokerNow();
        
        console.log('🎯 Starting copilot initialization...');
        
        // Add detailed initialization logging
        try {
            const success = await window.PokerCopilot.init();
            
            if (success) {
                console.log('🎉 PokerNow GTO Copilot ready! Features:');
                console.log('  • Real-time mixed strategy frequencies');
                console.log('  • Auto-updates with every action');
                console.log('  • Visual frequency bars');
                console.log('  • Professional GTO advice');
                
                // Force a status update
                setTimeout(() => {
                    console.log('🔍 Final status check:', window.PokerCopilot.getStatus());
                }, 2000);
            } else {
                console.error('❌ Failed to initialize copilot - init returned false');
            }
        } catch (initError) {
            console.error('❌ Copilot initialization threw error:', initError);
            console.error('Stack trace:', initError.stack);
        }
        
    } catch (error) {
        console.error('❌ Copilot initialization error:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Enhanced keyboard shortcuts with better error handling
document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+P - Toggle copilot
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        e.stopPropagation();
        try {
            if (window.PokerCopilot && window.PokerCopilot.ui && window.PokerCopilot.ui.toggle) {
                window.PokerCopilot.ui.toggle();
                console.log('🎯 Copilot toggled via hotkey');
            } else {
                console.log('❌ Copilot UI not available');
            }
        } catch (error) {
            console.error('❌ Error toggling copilot:', error);
        }
    }
    
    // Ctrl+Shift+R - Refresh game state
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        e.stopPropagation();
        try {
            if (window.PokerCopilot && window.PokerCopilot.parser) {
                window.PokerCopilot.parser.forceUpdate();
                console.log('🔄 Game state refreshed manually');
            }
        } catch (error) {
            console.error('❌ Error refreshing game state:', error);
        }
    }
    
    // Ctrl+Shift+D - Toggle debug mode + Inspect PokerNow HTML
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        e.stopPropagation();
        try {
            const debugEnabled = window.PokerCopilot.toggleDebugMode();
            console.log(`🔧 Debug mode ${debugEnabled ? 'enabled' : 'disabled'}`);
            
            // Note: Removed automatic HTML inspection to prevent interference with PokerNow
            // Use Ctrl+Shift+I if you need to inspect elements
        } catch (error) {
            console.error('❌ Error toggling debug mode:', error);
        }
    }
    
    // Ctrl+Shift+A - Get current analysis
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        e.stopPropagation();
        try {
            const analysis = window.PokerCopilot.getCurrentAnalysis();
            if (analysis) {
                console.log('📊 Current Analysis:', analysis);
            } else {
                console.log('📊 No active game to analyze');
            }
        } catch (error) {
            console.error('❌ Error getting analysis:', error);
        }
    }
    
    // Ctrl+Shift+I - Inspect PokerNow HTML structure
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        e.stopPropagation();
        window.inspectPokerNowHTML();
    }
}, true); // Use capture mode to intercept events

// Add lightweight PokerNow HTML inspection function - safe version
window.inspectPokerNowHTML = function() {
    console.log('🔍 PokerNow HTML Inspector - Safe Mode');
    console.log('📋 Current page URL:', window.location.href);
    console.log('📋 Page title:', document.title);
    
    // Only inspect specific game-related containers without affecting images
    const gameContainers = [
        '.game-main-container',
        '.table-player',
        '.table-pot',
        '[class*="hand"]',
        '[class*="board"]'
    ];
    
    console.log('\n🎯 === SAFE GAME ELEMENT SEARCH ===');
    gameContainers.forEach(selector => {
        try {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                console.log(`${selector}: Found ${elements.length} elements`);
                console.log('First element:', {
                    tagName: elements[0].tagName,
                    className: elements[0].className,
                    id: elements[0].id,
                    children: elements[0].children.length
                });
            }
        } catch (error) {
            console.log(`Error checking ${selector}:`, error.message);
        }
    });
    
    // Check for our copilot without affecting other elements
    const copilotUI = document.getElementById('pokernow-copilot');
    console.log('\n🤖 === COPILOT STATUS ===');
    console.log('Copilot UI present:', !!copilotUI);
    console.log('PokerCopilot object:', !!window.PokerCopilot);
    if (window.PokerCopilot) {
        console.log('Initialized:', window.PokerCopilot.initialized);
        console.log('Version:', window.PokerCopilot.version);
    }
    
    console.log('\n✅ === SAFE INSPECTION COMPLETE ===');
    console.log('🛡️ This inspection does not interfere with PokerNow\'s images or emoji rendering.');
    
    return {
        url: window.location.href,
        copilotPresent: !!copilotUI,
        copilotInitialized: window.PokerCopilot ? window.PokerCopilot.initialized : false
    };
};

// Listen for game state updates and log them in debug mode
document.addEventListener('pokerGameStateUpdate', (event) => {
    const isDebug = localStorage.getItem('pokerCopilotDebug') === 'true';
    if (isDebug) {
        console.log('🎮 Real-time game update:', event.detail);
    }
});

// Message handling for popup communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 Content script received message:', request);
    
    try {
        switch (request.action) {
            case 'test':
                // Simple test to verify content script communication
                console.log('🧪 Test message received from popup');
                sendResponse({
                    success: true,
                    message: 'Content script is working!',
                    timestamp: Date.now(),
                    url: window.location.href,
                    copilotStatus: window.PokerCopilot ? {
                        initialized: window.PokerCopilot.initialized,
                        version: window.PokerCopilot.version
                    } : null
                });
                break;
                
            case 'getStatus':
                const status = window.PokerCopilot ? window.PokerCopilot.getStatus() : null;
                sendResponse({
                    success: true,
                    initialized: window.PokerCopilot ? window.PokerCopilot.initialized : false,
                    gameState: status ? status.gameState : null,
                    features: status ? status.features : null,
                    version: window.PokerCopilot ? window.PokerCopilot.version : 'unknown'
                });
                break;
                
            case 'toggleCopilot':
                if (window.PokerCopilot && window.PokerCopilot.ui && window.PokerCopilot.ui.toggle) {
                    window.PokerCopilot.ui.toggle();
                    sendResponse({ success: true, message: 'Copilot toggled' });
                } else {
                    sendResponse({ success: false, error: 'Copilot UI not available' });
                }
                break;
                
            case 'refreshState':
                if (window.PokerCopilot && window.PokerCopilot.parser) {
                    window.PokerCopilot.parser.forceUpdate();
                    sendResponse({ success: true, message: 'State refreshed' });
                } else {
                    sendResponse({ success: false, error: 'Parser not available' });
                }
                break;
                
            case 'toggleDebug':
                if (window.PokerCopilot && window.PokerCopilot.toggleDebugMode) {
                    const debugEnabled = window.PokerCopilot.toggleDebugMode();
                    sendResponse({ 
                        success: true, 
                        debugEnabled, 
                        message: `Debug mode ${debugEnabled ? 'enabled' : 'disabled'}` 
                    });
                } else {
                    sendResponse({ success: false, error: 'Debug toggle not available' });
                }
                break;
                
            case 'getCurrentAnalysis':
                if (window.PokerCopilot && window.PokerCopilot.getCurrentAnalysis) {
                    const analysis = window.PokerCopilot.getCurrentAnalysis();
                    sendResponse({ 
                        success: true, 
                        analysis,
                        message: analysis ? 'Analysis available' : 'No active game to analyze'
                    });
                } else {
                    sendResponse({ success: false, error: 'Analysis not available' });
                }
                break;
                
            default:
                sendResponse({ success: false, error: 'Unknown action: ' + request.action });
        }
    } catch (error) {
        console.error('❌ Error handling message:', error);
        sendResponse({ success: false, error: error.message });
    }
    
    return true; // Keep message channel open for async response
});

// Also expose a global status function for debugging
window.getCopilotStatus = function() {
    if (window.PokerCopilot) {
        return {
            initialized: window.PokerCopilot.initialized,
            version: window.PokerCopilot.version,
            status: window.PokerCopilot.getStatus(),
            analysis: window.PokerCopilot.getCurrentAnalysis()
        };
    }
    return { error: 'PokerCopilot not found' };
};

// Add debug helper function
window.debugPokerNow = function() {
    console.log('🔍 PokerNow Debug Helper - Checking page elements...');
    
    const elements = {
        // Check for copilot
        copilotUI: document.getElementById('pokernow-copilot'),
        copilotStatus: window.PokerCopilot ? window.PokerCopilot.getStatus() : null,
        
        // Check for game elements
        gameContainer: document.querySelector('.game-main-container'),
        table: document.querySelector('.table'),
        players: document.querySelectorAll('.table-player'),
        yourPlayer: document.querySelector('.table-player.you-player'),
        yourCards: document.querySelector('.table-player.you-player .table-player-cards'),
        actionButtons: document.querySelectorAll('.action-button'),
        potSize: document.querySelector('.table-pot-size'),
        
        // Check for cards specifically
        cardContainers: document.querySelectorAll('.card-container'),
        flippedCards: document.querySelectorAll('.card-container.flipped'),
        cardValues: Array.from(document.querySelectorAll('.card .value')).map(el => el.textContent),
        cardSuits: Array.from(document.querySelectorAll('.card .suit')).map(el => el.textContent),
        
        // Check page state
        url: window.location.href,
        title: document.title,
        isPokerNow: window.location.hostname.includes('pokernow.club'),
        hasPokerTerms: document.body.textContent.includes('Fold') || document.body.textContent.includes('Call')
    };
    
    console.log('📊 Debug Results:', elements);
    
    // Check if we can parse cards manually
    if (elements.flippedCards.length > 0) {
        console.log('🃏 Found flipped cards:', Array.from(elements.flippedCards).map(card => {
            const value = card.querySelector('.value')?.textContent;
            const suit = card.querySelector('.suit')?.textContent;
            return { value, suit, element: card };
        }));
    }
    
    // Show current parsed game state
    if (window.PokerCopilot && window.PokerCopilot.parser) {
        console.log('🎮 Current game state:', window.PokerCopilot.parser.getGameState());
    }
    
    return elements;
};

// Start initialization
initializeCopilot(); 