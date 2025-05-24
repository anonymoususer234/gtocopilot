/**
 * PokerNow GTO Copilot - Main Content Script
 * Initializes and coordinates all copilot components
 */

console.log('🎯 PokerNow GTO Copilot - Content Script Loading...');

// Global copilot object
window.PokerCopilot = {
    initialized: false,
    engine: null,
    equity: null,
    advisor: null,
    parser: null,
    ui: null,
    
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
            
            // Also run HTML inspection
            if (debugEnabled) {
                window.inspectPokerNowHTML();
            }
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

// Add comprehensive PokerNow HTML inspection function
window.inspectPokerNowHTML = function() {
    console.log('🔍 COMPREHENSIVE PokerNow HTML Inspector Running...');
    console.log('📋 Current page URL:', window.location.href);
    console.log('📋 Page title:', document.title);
    
    // 1. Find ALL images that might be cards
    console.log('\n🖼️ === CARD IMAGES ===');
    const images = document.querySelectorAll('img');
    let cardImages = [];
    images.forEach((img, i) => {
        const src = img.src || '';
        const alt = img.alt || '';
        const className = img.className || '';
        const id = img.id || '';
        
        // Check if image might be a card
        if (src.includes('card') || alt.includes('card') || className.includes('card') ||
            src.includes('suit') || alt.includes('suit') || className.includes('suit') ||
            /[A-K2-9][sdch]/.test(src) || /[A-K2-9][sdch]/.test(alt)) {
            cardImages.push({
                index: i,
                src: src.substring(src.lastIndexOf('/') + 1),
                alt,
                className,
                id,
                element: img
            });
        }
    });
    
    console.log(`Found ${cardImages.length} potential card images:`, cardImages);
    if (cardImages.length > 0) {
        console.log('First few card images:', cardImages.slice(0, 5));
    }
    
    // 2. Find ALL SVG elements that might be cards
    console.log('\n🎨 === CARD SVGs ===');
    const svgs = document.querySelectorAll('svg, [class*="svg"], [class*="icon"]');
    let cardSvgs = [];
    svgs.forEach((svg, i) => {
        const className = svg.className?.baseVal || svg.className || '';
        const id = svg.id || '';
        
        if (className.includes('card') || className.includes('suit') || id.includes('card')) {
            cardSvgs.push({
                index: i,
                className,
                id,
                innerHTML: svg.innerHTML.substring(0, 100),
                element: svg
            });
        }
    });
    
    console.log(`Found ${cardSvgs.length} potential card SVGs:`, cardSvgs);
    
    // 3. Look for data attributes that might contain card info
    console.log('\n📊 === DATA ATTRIBUTES ===');
    const allElements = document.querySelectorAll('*');
    let cardDataElements = [];
    
    allElements.forEach((el, i) => {
        const attrs = el.attributes;
        for (let attr of attrs) {
            const name = attr.name.toLowerCase();
            const value = attr.value.toLowerCase();
            
            if ((name.includes('card') || name.includes('rank') || name.includes('suit') ||
                 value.includes('card') || value.includes('rank') || value.includes('suit')) &&
                cardDataElements.length < 20) { // Limit to first 20
                
                cardDataElements.push({
                    tagName: el.tagName,
                    attribute: name,
                    value: attr.value,
                    className: el.className,
                    textContent: el.textContent?.trim().substring(0, 50),
                    element: el
                });
            }
        }
    });
    
    console.log(`Found ${cardDataElements.length} elements with card-related data attributes:`, cardDataElements);
    
    // 4. Look for specific PokerNow class patterns
    console.log('\n🎯 === POKERNOW SPECIFIC CLASSES ===');
    const pokerNowClasses = [];
    const classPatterns = [
        /poker/i, /hand/i, /hole/i, /board/i, /flop/i, /turn/i, /river/i,
        /suit/i, /rank/i, /clubs?/i, /hearts?/i, /diamonds?/i, /spades?/i,
        /table/i, /game/i, /action/i, /bet/i, /pot/i
    ];
    
    allElements.forEach(el => {
        const className = el.className || '';
        if (className && classPatterns.some(pattern => pattern.test(className))) {
            pokerNowClasses.push({
                tagName: el.tagName,
                className,
                id: el.id,
                textContent: el.textContent?.trim().substring(0, 50),
                children: el.children.length,
                element: el
            });
        }
    });
    
    console.log(`Found ${pokerNowClasses.length} PokerNow-specific elements:`, pokerNowClasses.slice(0, 10));
    
    // 5. Look for elements with card symbols in Unicode
    console.log('\n♠️ === UNICODE CARD SYMBOLS ===');
    const unicodeCardElements = [];
    const cardSymbols = /[♠♥♦♣]/;
    
    allElements.forEach(el => {
        const text = el.textContent || '';
        if (cardSymbols.test(text) && el.children.length <= 2) {
            unicodeCardElements.push({
                tagName: el.tagName,
                textContent: text.trim(),
                className: el.className,
                id: el.id,
                element: el
            });
        }
    });
    
    console.log(`Found ${unicodeCardElements.length} elements with card symbols:`, unicodeCardElements);
    
    // 6. Look for React/Vue component props or data structures
    console.log('\n⚛️ === REACT/VUE DATA ===');
    allElements.forEach(el => {
        // Check for React fiber
        const reactKey = Object.keys(el).find(key => key.startsWith('__reactInternalInstance') || key.startsWith('_reactInternalFiber'));
        if (reactKey && el[reactKey]) {
            const props = el[reactKey].memoizedProps || el[reactKey].pendingProps;
            if (props && (JSON.stringify(props).includes('card') || JSON.stringify(props).includes('suit'))) {
                console.log('React element with card data:', {
                    element: el,
                    props: props,
                    className: el.className
                });
            }
        }
    });
    
    // 7. Look for JavaScript variables that might contain game state
    console.log('\n💾 === WINDOW VARIABLES ===');
    const windowVars = [];
    for (let key in window) {
        try {
            const value = window[key];
            if (typeof value === 'object' && value !== null) {
                const jsonStr = JSON.stringify(value).toLowerCase();
                if (jsonStr.includes('card') || jsonStr.includes('suit') || jsonStr.includes('poker')) {
                    windowVars.push({
                        key,
                        type: typeof value,
                        hasCards: jsonStr.includes('card'),
                        preview: JSON.stringify(value).substring(0, 200)
                    });
                }
            }
        } catch (e) {
            // Skip variables that can't be serialized
        }
    }
    
    console.log(`Found ${windowVars.length} window variables with poker data:`, windowVars);
    
    // 8. Inspect the actual DOM tree structure
    console.log('\n🌳 === DOM TREE STRUCTURE ===');
    const findDeepElements = (element, depth = 0, maxDepth = 5) => {
        if (depth > maxDepth) return;
        
        const className = element.className || '';
        const id = element.id || '';
        const tagName = element.tagName || '';
        
        // Look for container elements that might hold cards
        if (className.includes('hand') || className.includes('board') || 
            className.includes('card') || className.includes('game')) {
            
            console.log(`${'  '.repeat(depth)}${tagName}.${className}#${id}`, {
                children: element.children.length,
                textContent: element.textContent?.trim().substring(0, 30),
                element: element
            });
            
            // Inspect direct children
            Array.from(element.children).forEach(child => {
                findDeepElements(child, depth + 1, maxDepth);
            });
        }
    };
    
    findDeepElements(document.body);
    
    // 9. Try to find elements by common poker terms
    console.log('\n🔍 === POKER TERM SEARCH ===');
    const pokerTerms = ['hole', 'pocket', 'board', 'flop', 'turn', 'river', 'hand', 'card'];
    
    pokerTerms.forEach(term => {
        const elements = document.querySelectorAll(`[class*="${term}"], [id*="${term}"], [data-*="${term}"]`);
        if (elements.length > 0) {
            console.log(`"${term}" elements:`, Array.from(elements).slice(0, 3).map(el => ({
                tagName: el.tagName,
                className: el.className,
                id: el.id,
                textContent: el.textContent?.trim().substring(0, 30),
                element: el
            })));
        }
    });
    
    // 10. Look for canvas elements (some sites draw cards on canvas)
    console.log('\n🎨 === CANVAS ELEMENTS ===');
    const canvases = document.querySelectorAll('canvas');
    console.log(`Found ${canvases.length} canvas elements:`, Array.from(canvases).map(canvas => ({
        className: canvas.className,
        id: canvas.id,
        width: canvas.width,
        height: canvas.height,
        element: canvas
    })));
    
    console.log('\n✅ === INSPECTION COMPLETE ===');
    console.log('👆 Look through the logs above to find where PokerNow stores card information!');
    console.log('🔧 Use this info to update the parser selectors.');
    
    return {
        cardImages,
        cardSvgs,
        cardDataElements,
        pokerNowClasses,
        unicodeCardElements,
        windowVars,
        canvases
    };
};

// Listen for game state updates and log them in debug mode
document.addEventListener('pokerGameStateUpdate', (event) => {
    const isDebug = localStorage.getItem('pokerCopilotDebug') === 'true';
    if (isDebug) {
        console.log('🎮 Real-time game update:', event.detail);
    }
});

// Start initialization
initializeCopilot(); 