// Popup Script for PokerNow GTO Copilot
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Popup loading...');
    
    // Get current tab and check copilot status
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        
        // Check if we're on PokerNow
        if (currentTab.url && currentTab.url.includes('pokernow.club')) {
            updateStatus('Connected', 'connected');
            
            // Try to get status from content script
            chrome.tabs.sendMessage(currentTab.id, {action: 'getStatus'}, function(response) {
                if (chrome.runtime.lastError) {
                    console.log('Content script not responding, checking alternative methods...');
                    // Try alternative detection
                    checkAlternativeStatus(currentTab.id);
                    return;
                }
                
                if (response && response.success) {
                    console.log('📊 Got copilot status:', response);
                    
                    if (response.gameState && response.gameState.isActive) {
                        updateGameDetection('Active game detected', 'active');
                        updateExtensionStatus('Active', 'active');
                        
                        // Show game details if available
                        if (response.gameState.holeCards && response.gameState.holeCards.length > 0) {
                            showGameDetails(response.gameState);
                        }
                    } else {
                        // Check if copilot is at least initialized
                        if (response.initialized) {
                            updateGameDetection('Waiting for game...', 'waiting');
                            updateExtensionStatus('Ready', 'ready');
                        } else {
                            updateGameDetection('No game data', 'inactive');
                            updateExtensionStatus('Initializing...', 'initializing');
                        }
                    }
                } else {
                    updateGameDetection('No game data', 'inactive');
                    updateExtensionStatus('Initializing...', 'initializing');
                }
            });
        } else {
            updateStatus('Not on PokerNow', 'disconnected');
            updateGameDetection('Not on PokerNow', 'inactive');
            updateExtensionStatus('Not Available', 'inactive');
        }
    });

    // Alternative status checking method
    function checkAlternativeStatus(tabId) {
        // Inject a script to check if the copilot exists
        chrome.tabs.executeScript(tabId, {
            code: `
                try {
                    if (window.PokerCopilot && window.PokerCopilot.initialized) {
                        const status = window.PokerCopilot.getStatus();
                        const gameState = window.PokerCopilot.parser ? window.PokerCopilot.parser.getGameState() : null;
                        ({ success: true, initialized: true, gameState, status });
                    } else if (document.getElementById('pokernow-copilot')) {
                        // Copilot UI exists, so it's probably working
                        ({ success: true, initialized: true, uiExists: true });
                    } else {
                        ({ success: false, error: 'Copilot not found' });
                    }
                } catch(e) {
                    ({ success: false, error: e.message });
                }
            `
        }, function(result) {
            if (result && result[0]) {
                const response = result[0];
                console.log('📊 Alternative status check:', response);
                
                if (response.success && response.initialized) {
                    updateExtensionStatus('Active', 'active');
                    
                    if (response.gameState && response.gameState.isActive) {
                        updateGameDetection('Game detected', 'active');
                        showGameDetails(response.gameState);
                    } else if (response.uiExists) {
                        updateGameDetection('UI Active', 'ready');
                    } else {
                        updateGameDetection('Ready, waiting for game', 'ready');
                    }
                } else {
                    updateExtensionStatus('Error: ' + (response.error || 'Unknown'), 'error');
                }
            }
        });
    }

    function showGameDetails(gameState) {
        // This function can be expanded to show more game details
        console.log('🎮 Game details:', gameState);
    }

    // Button event listeners
    document.getElementById('toggle-copilot').addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleCopilot'}, function(response) {
                if (response && response.success) {
                    console.log('✅ Copilot toggled successfully');
                } else {
                    console.log('❌ Failed to toggle copilot');
                }
            });
        });
    });

    document.getElementById('refresh-state').addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'refreshState'}, function(response) {
                if (response && response.success) {
                    console.log('✅ State refreshed successfully');
                    // Reload popup to show updated state
                    location.reload();
                } else {
                    console.log('❌ Failed to refresh state');
                }
            });
        });
    });

    document.getElementById('debug-mode').addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleDebug'}, function(response) {
                if (response && response.success) {
                    console.log('✅ Debug mode toggled');
                    this.textContent = response.debugEnabled ? 'DISABLE DEBUG' : 'DEBUG MODE';
                } else {
                    console.log('❌ Failed to toggle debug mode');
                }
            });
        });
    });

    document.getElementById('open-pokernow').addEventListener('click', function() {
        chrome.tabs.create({url: 'https://www.pokernow.club/start-game'});
    });

    // Update status indicators
    function updateStatus(text, status) {
        const statusElement = document.querySelector('.status-item:nth-child(2) .status-value');
        const dotElement = document.querySelector('.status-item:nth-child(2) .status-dot');
        
        if (statusElement) statusElement.textContent = text;
        if (dotElement) {
            dotElement.className = 'status-dot';
            if (status === 'connected') dotElement.classList.add('connected');
            else if (status === 'disconnected') dotElement.classList.add('disconnected');
        }
    }

    function updateGameDetection(text, status) {
        const statusElement = document.querySelector('.status-item:nth-child(3) .status-value');
        const dotElement = document.querySelector('.status-item:nth-child(3) .status-dot');
        
        if (statusElement) statusElement.textContent = text;
        if (dotElement) {
            dotElement.className = 'status-dot';
            if (status === 'active') dotElement.classList.add('active');
            else if (status === 'ready') dotElement.classList.add('ready');
            else if (status === 'waiting') dotElement.classList.add('waiting');
            else dotElement.classList.add('inactive');
        }
    }

    function updateExtensionStatus(text, status) {
        const statusElement = document.querySelector('.status-item:nth-child(1) .status-value');
        const dotElement = document.querySelector('.status-item:nth-child(1) .status-dot');
        
        if (statusElement) statusElement.textContent = text;
        if (dotElement) {
            dotElement.className = 'status-dot';
            if (status === 'active') dotElement.classList.add('active');
            else if (status === 'ready') dotElement.classList.add('ready');
            else if (status === 'error') dotElement.classList.add('error');
            else dotElement.classList.add('initializing');
        }
    }

    // Auto-refresh status every 3 seconds
    setInterval(function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && tabs[0].url && tabs[0].url.includes('pokernow.club')) {
                checkAlternativeStatus(tabs[0].id);
            }
        });
    }, 3000);
}); 