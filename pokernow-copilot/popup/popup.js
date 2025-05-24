// Popup Script for PokerNow GTO Copilot
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Popup loading...');
    
    // Check if extension context is valid
    function isExtensionContextValid() {
        try {
            return chrome.runtime && chrome.runtime.id;
        } catch (error) {
            return false;
        }
    }
    
    // Handle extension context invalidation
    function handleContextInvalidation() {
        console.log('❌ Extension context invalidated - showing recovery message');
        showMessage('Extension was reloaded. Please refresh the PokerNow page and try again.', 'error');
        
        // Disable all buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.disabled = true;
            button.style.opacity = '0.5';
        });
        
        // Show recovery instructions
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div style="font-size: 12px; line-height: 1.4;">
                    <strong>Extension Context Lost</strong><br>
                    1. Refresh the PokerNow page<br>
                    2. Wait a few seconds<br>
                    3. Try opening this popup again
                </div>
            `;
            errorContainer.classList.remove('hidden');
        }
    }
    
    // Enhanced message sending with context validation
    function sendMessageToContentScript(tabId, message, callback) {
        if (!isExtensionContextValid()) {
            handleContextInvalidation();
            return;
        }
        
        try {
            chrome.tabs.sendMessage(tabId, message, function(response) {
                if (chrome.runtime.lastError) {
                    const error = chrome.runtime.lastError.message;
                    console.log('❌ Message sending error:', error);
                    
                    if (error.includes('Extension context invalidated') || 
                        error.includes('receiving end does not exist')) {
                        handleContextInvalidation();
                        return;
                    }
                    
                    // Other errors
                    if (callback) callback(null, error);
                } else {
                    if (callback) callback(response, null);
                }
            });
        } catch (error) {
            console.log('❌ Exception sending message:', error);
            handleContextInvalidation();
        }
    }
    
    // Get current tab and check copilot status
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        
        // Check if we're on PokerNow
        if (currentTab.url && currentTab.url.includes('pokernow.club')) {
            updatePokerNowStatus('Connected', 'connected');
            
            // Try to get status from content script with better error handling
            sendMessageToContentScript(currentTab.id, {action: 'getStatus'}, function(response, error) {
                if (error) {
                    console.log('Content script not responding:', error);
                    updateExtensionStatus('Not Loaded', 'error');
                    updateGameDetection('Content script not loaded', 'inactive');
                    
                    showMessage('Content script not loaded. Try refreshing the page.', 'error');
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
            updatePokerNowStatus('Not on PokerNow', 'disconnected');
            updateGameDetection('Not on PokerNow', 'inactive');
            updateExtensionStatus('Not Available', 'inactive');
        }
    });

    // Alternative status checking method using Manifest V3 API
    function checkAlternativeStatus(tabId) {
        // Use the new chrome.scripting API for Manifest V3
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            func: () => {
                try {
                    if (window.PokerCopilot && window.PokerCopilot.initialized) {
                        const status = window.PokerCopilot.getStatus();
                        const gameState = window.PokerCopilot.parser ? window.PokerCopilot.parser.getGameState() : null;
                        return { success: true, initialized: true, gameState, status };
                    } else if (document.getElementById('pokernow-copilot')) {
                        // Copilot UI exists, so it's probably working
                        return { success: true, initialized: true, uiExists: true };
                    } else {
                        return { success: false, error: 'Copilot not found' };
                    }
                } catch(e) {
                    return { success: false, error: e.message };
                }
            }
        }, function(result) {
            if (result && result[0] && result[0].result) {
                const response = result[0].result;
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
            } else {
                updateExtensionStatus('Script Error', 'error');
            }
        });
    }

    function showGameDetails(gameState) {
        // This function can be expanded to show more game details
        console.log('🎮 Game details:', gameState);
        // Could add a success message here
        showMessage('Game detected! Copilot is active.', 'success');
    }

    // Fixed Button event listeners with correct IDs
    const toggleButton = document.getElementById('toggle-copilot');
    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            const button = this;
            const loadingSpinner = button.querySelector('.loading');
            const buttonText = button.querySelector('span:not(.loading)');
            
            // Show loading state
            if (loadingSpinner) loadingSpinner.classList.remove('hidden');
            if (buttonText) buttonText.textContent = 'Toggling...';
            button.disabled = true;
            
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleCopilot'}, function(response) {
                    // Reset button state
                    if (loadingSpinner) loadingSpinner.classList.add('hidden');
                    button.disabled = false;
                    
                    if (response && response.success) {
                        console.log('✅ Copilot toggled successfully');
                        if (buttonText) buttonText.textContent = 'Toggle Copilot';
                        showMessage('Copilot toggled successfully!', 'success');
                    } else {
                        console.log('❌ Failed to toggle copilot');
                        if (buttonText) buttonText.textContent = 'Toggle Copilot';
                        showMessage('Failed to toggle copilot. Make sure you\'re on PokerNow.', 'error');
                    }
                });
            });
        });
    }

    const refreshButton = document.getElementById('refresh-state');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            const button = this;
            const loadingSpinner = button.querySelector('.loading');
            const buttonText = button.querySelector('span:not(.loading)');
            
            // Show loading state
            if (loadingSpinner) loadingSpinner.classList.remove('hidden');
            if (buttonText) buttonText.textContent = 'Refreshing...';
            button.disabled = true;
            
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {action: 'refreshState'}, function(response) {
                    // Reset button state
                    if (loadingSpinner) loadingSpinner.classList.add('hidden');
                    button.disabled = false;
                    
                    if (response && response.success) {
                        console.log('✅ State refreshed successfully');
                        if (buttonText) buttonText.textContent = 'Refresh Game State';
                        showMessage('Game state refreshed!', 'success');
                        // Reload popup to show updated state
                        setTimeout(() => location.reload(), 1000);
                    } else {
                        console.log('❌ Failed to refresh state');
                        if (buttonText) buttonText.textContent = 'Refresh Game State';
                        showMessage('Failed to refresh state.', 'error');
                    }
                });
            });
        });
    }

    // Test communication button
    const testButton = document.getElementById('test-communication');
    if (testButton) {
        testButton.addEventListener('click', function() {
            const button = this;
            const loadingSpinner = button.querySelector('.loading');
            const buttonText = button.querySelector('span:not(.loading)');
            
            // Show loading state
            if (loadingSpinner) loadingSpinner.classList.remove('hidden');
            if (buttonText) buttonText.textContent = 'Testing...';
            button.disabled = true;
            
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                console.log('🧪 Testing communication with tab:', tabs[0].url);
                
                chrome.tabs.sendMessage(tabs[0].id, {action: 'test'}, function(response) {
                    // Reset button state
                    if (loadingSpinner) loadingSpinner.classList.add('hidden');
                    button.disabled = false;
                    if (buttonText) buttonText.textContent = 'Test Connection';
                    
                    if (chrome.runtime.lastError) {
                        console.log('❌ Runtime error:', chrome.runtime.lastError.message);
                        showMessage('Communication failed: ' + chrome.runtime.lastError.message, 'error');
                        return;
                    }
                    
                    if (response && response.success) {
                        console.log('✅ Communication test successful:', response);
                        showMessage('✅ Content script is working! ' + response.message, 'success');
                        
                        // Try to get status now that we know communication works
                        setTimeout(() => {
                            chrome.tabs.sendMessage(tabs[0].id, {action: 'getStatus'}, function(statusResponse) {
                                if (statusResponse && statusResponse.success) {
                                    console.log('📊 Status check after test:', statusResponse);
                                    if (statusResponse.initialized) {
                                        updateExtensionStatus('Initialized', 'active');
                                    } else {
                                        updateExtensionStatus('Loading...', 'initializing');
                                    }
                                }
                            });
                        }, 500);
                    } else {
                        console.log('❌ Communication test failed:', response);
                        showMessage('Communication failed: Content script not responding', 'error');
                    }
                });
            });
        });
    }

    // Fixed debug button event listener with correct ID
    const debugButton = document.getElementById('toggle-debug');
    if (debugButton) {
        debugButton.addEventListener('click', function() {
            const button = this;
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleDebug'}, function(response) {
                    if (response && response.success) {
                        console.log('✅ Debug mode toggled');
                        button.textContent = response.debugEnabled ? 'Disable Debug' : 'Debug Mode';
                        showMessage(`Debug mode ${response.debugEnabled ? 'enabled' : 'disabled'}!`, 'success');
                    } else {
                        console.log('❌ Failed to toggle debug mode');
                        showMessage('Failed to toggle debug mode.', 'error');
                    }
                });
            });
        });
    }

    const openPokerNowButton = document.getElementById('open-pokernow');
    if (openPokerNowButton) {
        openPokerNowButton.addEventListener('click', function() {
            chrome.tabs.create({url: 'https://www.pokernow.club/start-game'});
        });
    }

    // Updated status functions with correct DOM references
    function updatePokerNowStatus(text, status) {
        const statusRows = document.querySelectorAll('.status-row');
        if (statusRows.length >= 2) {
            const pokernowRow = statusRows[1]; // Second row is PokerNow Connection
            const statusText = pokernowRow.querySelector('.status-indicator span');
            const statusDot = pokernowRow.querySelector('.status-dot');
            
            if (statusText) statusText.textContent = text;
            if (statusDot) {
                statusDot.className = 'status-dot';
                if (status === 'connected') statusDot.classList.add('connected');
                else if (status === 'disconnected') statusDot.classList.add('disconnected');
            }
        }
    }

    function updateGameDetection(text, status) {
        const statusRows = document.querySelectorAll('.status-row');
        if (statusRows.length >= 3) {
            const gameRow = statusRows[2]; // Third row is Game Detection
            const statusText = gameRow.querySelector('.status-indicator span');
            const statusDot = gameRow.querySelector('.status-dot');
            
            if (statusText) statusText.textContent = text;
            if (statusDot) {
                statusDot.className = 'status-dot';
                if (status === 'active') statusDot.classList.add('active');
                else if (status === 'ready') statusDot.classList.add('ready');
                else if (status === 'waiting') statusDot.classList.add('waiting');
                else statusDot.classList.add('inactive');
            }
        }
    }

    function updateExtensionStatus(text, status) {
        const statusRows = document.querySelectorAll('.status-row');
        if (statusRows.length >= 1) {
            const extensionRow = statusRows[0]; // First row is Extension Status
            const statusText = extensionRow.querySelector('.status-indicator span');
            const statusDot = extensionRow.querySelector('.status-dot');
            
            if (statusText) statusText.textContent = text;
            if (statusDot) {
                statusDot.className = 'status-dot';
                if (status === 'active') statusDot.classList.add('active');
                else if (status === 'ready') statusDot.classList.add('ready');
                else if (status === 'error') statusDot.classList.add('error');
                else statusDot.classList.add('initializing');
            }
        }
    }

    // Message display function
    function showMessage(message, type) {
        const container = type === 'error' ? document.getElementById('error-container') : document.getElementById('success-container');
        if (container) {
            container.textContent = message;
            container.classList.remove('hidden');
            
            // Hide after 3 seconds
            setTimeout(() => {
                container.classList.add('hidden');
            }, 3000);
        }
    }

    // Auto-refresh status every 5 seconds (less frequent to avoid performance issues)
    setInterval(function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && tabs[0].url && tabs[0].url.includes('pokernow.club')) {
                checkAlternativeStatus(tabs[0].id);
            }
        });
    }, 5000);

    // Initial status check after a short delay
    setTimeout(() => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && tabs[0].url && tabs[0].url.includes('pokernow.club')) {
                checkAlternativeStatus(tabs[0].id);
            }
        });
    }, 1000);
}); 