/**
 * PokerNow GTO Copilot - Extension Popup
 * Handles popup UI interactions and status monitoring
 */

class PopupManager {
    constructor() {
        this.isPokerNowTab = false;
        this.copilotStatus = null;
        this.updateInterval = null;
        
        // DOM elements
        this.elements = {
            extensionStatus: document.getElementById('extension-status'),
            extensionText: document.getElementById('extension-text'),
            pokernowStatus: document.getElementById('pokernow-status'),
            pokernowText: document.getElementById('pokernow-text'),
            gameStatus: document.getElementById('game-status'),
            gameText: document.getElementById('game-text'),
            errorContainer: document.getElementById('error-container'),
            successContainer: document.getElementById('success-container'),
            toggleCopilot: document.getElementById('toggle-copilot'),
            toggleText: document.getElementById('toggle-text'),
            toggleLoading: document.getElementById('toggle-loading'),
            refreshState: document.getElementById('refresh-state'),
            refreshText: document.getElementById('refresh-text'),
            refreshLoading: document.getElementById('refresh-loading'),
            toggleDebug: document.getElementById('toggle-debug'),
            openPokernow: document.getElementById('open-pokernow')
        };
    }

    /**
     * Initialize popup
     */
    init() {
        console.log('🎯 Popup: Initializing...');
        
        this.setupEventListeners();
        this.checkCurrentTab();
        this.startStatusUpdates();
        
        console.log('🎯 Popup: Initialized');
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Toggle copilot button
        this.elements.toggleCopilot.addEventListener('click', () => {
            this.toggleCopilot();
        });

        // Refresh state button
        this.elements.refreshState.addEventListener('click', () => {
            this.refreshGameState();
        });

        // Toggle debug button
        this.elements.toggleDebug.addEventListener('click', () => {
            this.toggleDebugMode();
        });

        // Open PokerNow button
        this.elements.openPokernow.addEventListener('click', () => {
            this.openPokerNow();
        });
    }

    /**
     * Check current tab and initialize status
     */
    async checkCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab) {
                this.isPokerNowTab = tab.url.includes('pokernow.club');
                
                if (this.isPokerNowTab) {
                    this.updatePokerNowStatus('active', 'Connected');
                    this.updateExtensionStatus('active', 'Ready');
                } else {
                    this.updatePokerNowStatus('error', 'Not on PokerNow');
                    this.updateExtensionStatus('error', 'Wrong tab');
                }
            }
        } catch (error) {
            console.error('Error checking current tab:', error);
            this.updateExtensionStatus('error', 'Error');
        }
    }

    /**
     * Start periodic status updates
     */
    startStatusUpdates() {
        this.updateInterval = setInterval(() => {
            this.updateCopilotStatus();
        }, 2000);

        // Initial update
        setTimeout(() => {
            this.updateCopilotStatus();
        }, 500);
    }

    /**
     * Update copilot status
     */
    async updateCopilotStatus() {
        if (!this.isPokerNowTab) return;

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab) {
                // Execute script to get copilot status
                const results = await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: () => {
                        if (window.PokerCopilot && window.PokerCopilot.getStatus) {
                            return window.PokerCopilot.getStatus();
                        }
                        return { initialized: false, error: 'Copilot not found' };
                    }
                });

                if (results && results[0] && results[0].result) {
                    this.copilotStatus = results[0].result;
                    this.updateStatusDisplay();
                } else {
                    this.updateExtensionStatus('error', 'Not initialized');
                    this.updateGameStatus('error', 'No data');
                }
            }
        } catch (error) {
            console.error('Error updating copilot status:', error);
            this.updateExtensionStatus('error', 'Connection error');
        }
    }

    /**
     * Update status display based on copilot status
     */
    updateStatusDisplay() {
        if (!this.copilotStatus) return;

        // Update extension status
        if (this.copilotStatus.initialized) {
            this.updateExtensionStatus('active', 'Active');
        } else {
            this.updateExtensionStatus('error', 'Initializing...');
        }

        // Update game status
        if (this.copilotStatus.gameState) {
            const gameState = this.copilotStatus.gameState;
            
            if (gameState.isActive) {
                if (gameState.isMyTurn) {
                    this.updateGameStatus('active', 'Your turn!');
                } else {
                    this.updateGameStatus('active', 'In game');
                }
            } else {
                this.updateGameStatus('', 'Waiting...');
            }
        } else {
            this.updateGameStatus('', 'No game data');
        }
    }

    /**
     * Update extension status indicator
     */
    updateExtensionStatus(type, text) {
        this.elements.extensionStatus.className = `status-dot ${type}`;
        this.elements.extensionText.textContent = text;
    }

    /**
     * Update PokerNow status indicator
     */
    updatePokerNowStatus(type, text) {
        this.elements.pokernowStatus.className = `status-dot ${type}`;
        this.elements.pokernowText.textContent = text;
    }

    /**
     * Update game status indicator
     */
    updateGameStatus(type, text) {
        this.elements.gameStatus.className = `status-dot ${type}`;
        this.elements.gameText.textContent = text;
    }

    /**
     * Toggle copilot visibility
     */
    async toggleCopilot() {
        if (!this.isPokerNowTab) {
            this.showError('Please navigate to PokerNow first');
            return;
        }

        this.setButtonLoading('toggle', true);

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab) {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: () => {
                        if (window.PokerCopilot && window.PokerCopilot.ui) {
                            window.PokerCopilot.ui.toggle();
                            return 'success';
                        }
                        return 'error';
                    }
                });

                this.showSuccess('Copilot toggled');
            }
        } catch (error) {
            console.error('Error toggling copilot:', error);
            this.showError('Failed to toggle copilot');
        } finally {
            this.setButtonLoading('toggle', false);
        }
    }

    /**
     * Refresh game state
     */
    async refreshGameState() {
        if (!this.isPokerNowTab) {
            this.showError('Please navigate to PokerNow first');
            return;
        }

        this.setButtonLoading('refresh', true);

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab) {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: () => {
                        if (window.PokerCopilot && window.PokerCopilot.parser) {
                            window.PokerCopilot.parser.forceUpdate();
                            return 'success';
                        }
                        return 'error';
                    }
                });

                this.showSuccess('Game state refreshed');
                
                // Force status update
                setTimeout(() => {
                    this.updateCopilotStatus();
                }, 1000);
            }
        } catch (error) {
            console.error('Error refreshing game state:', error);
            this.showError('Failed to refresh state');
        } finally {
            this.setButtonLoading('refresh', false);
        }
    }

    /**
     * Toggle debug mode
     */
    async toggleDebugMode() {
        if (!this.isPokerNowTab) {
            this.showError('Please navigate to PokerNow first');
            return;
        }

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab) {
                const results = await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: () => {
                        if (window.PokerCopilot && window.PokerCopilot.toggleDebugMode) {
                            window.PokerCopilot.toggleDebugMode();
                            const isDebug = localStorage.getItem('pokerCopilotDebug') === 'true';
                            return isDebug ? 'enabled' : 'disabled';
                        }
                        return 'error';
                    }
                });

                if (results && results[0] && results[0].result !== 'error') {
                    const status = results[0].result;
                    this.showSuccess(`Debug mode ${status}`);
                    this.elements.toggleDebug.textContent = 
                        status === 'enabled' ? 'Disable Debug' : 'Enable Debug';
                } else {
                    this.showError('Failed to toggle debug mode');
                }
            }
        } catch (error) {
            console.error('Error toggling debug mode:', error);
            this.showError('Failed to toggle debug mode');
        }
    }

    /**
     * Open PokerNow in new tab
     */
    async openPokerNow() {
        try {
            await chrome.tabs.create({
                url: 'https://www.pokernow.club/',
                active: true
            });
            
            this.showSuccess('PokerNow opened');
            
            // Close popup after short delay
            setTimeout(() => {
                window.close();
            }, 1000);
        } catch (error) {
            console.error('Error opening PokerNow:', error);
            this.showError('Failed to open PokerNow');
        }
    }

    /**
     * Set button loading state
     */
    setButtonLoading(buttonType, loading) {
        if (buttonType === 'toggle') {
            this.elements.toggleLoading.classList.toggle('hidden', !loading);
            this.elements.toggleText.style.visibility = loading ? 'hidden' : 'visible';
            this.elements.toggleCopilot.disabled = loading;
        } else if (buttonType === 'refresh') {
            this.elements.refreshLoading.classList.toggle('hidden', !loading);
            this.elements.refreshText.style.visibility = loading ? 'hidden' : 'visible';
            this.elements.refreshState.disabled = loading;
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        this.elements.errorContainer.innerHTML = `<div class="error-message">${message}</div>`;
        this.elements.errorContainer.classList.remove('hidden');
        this.elements.successContainer.classList.add('hidden');
        
        setTimeout(() => {
            this.elements.errorContainer.classList.add('hidden');
        }, 3000);
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        this.elements.successContainer.innerHTML = `<div class="success-message">${message}</div>`;
        this.elements.successContainer.classList.remove('hidden');
        this.elements.errorContainer.classList.add('hidden');
        
        setTimeout(() => {
            this.elements.successContainer.classList.add('hidden');
        }, 2000);
    }

    /**
     * Cleanup on popup close
     */
    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const popupManager = new PopupManager();
    popupManager.init();
    
    // Cleanup on window unload
    window.addEventListener('beforeunload', () => {
        popupManager.cleanup();
    });
});

// Handle popup visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Popup is being hidden, cleanup if needed
    } else {
        // Popup is being shown, refresh status
        setTimeout(() => {
            if (window.popupManager) {
                window.popupManager.updateCopilotStatus();
            }
        }, 100);
    }
}); 