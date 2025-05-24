/**
 * PokerNow GTO Copilot - Background Script
 * Handles Claude API calls since content scripts can't make CORS requests
 */

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'callClaudeAPI') {
        handleClaudeAPICall(request.data)
            .then(response => {
                sendResponse({ success: true, data: response });
            })
            .catch(error => {
                console.error('Background script Claude API error:', error);
                sendResponse({ 
                    success: false, 
                    error: error.message || 'Unknown error occurred' 
                });
            });
        
        // Return true to indicate we'll respond asynchronously
        return true;
    }
});

/**
 * Handle Claude API call from background script
 */
async function handleClaudeAPICall({ userMessage, gameContext, apiKey }) {
    console.log('🤖 Background: Making Claude API call...');
    console.log('API Key (first 20 chars):', apiKey.substring(0, 20) + '...');
    console.log('User message:', userMessage);
    
    // Build system prompt
    const systemPrompt = buildSystemPrompt(gameContext);
    console.log('System prompt length:', systemPrompt.length);
    
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: 'claude-3-7-sonnet-20250219',
                max_tokens: 1000,
                system: systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: userMessage
                    }
                ]
            })
        });

        console.log('Background: Response status:', response.status);
        console.log('Background: Response ok:', response.ok);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Background: API Error Response:', errorText);
            throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Background: Claude response:', data);
        return data.content[0].text;
        
    } catch (error) {
        console.error('Background: Fetch error:', error);
        throw error;
    }
}

/**
 * Build system prompt with game context (copied from UI script)
 */
function buildSystemPrompt(gameContext) {
    let prompt = `You are a professional poker GTO (Game Theory Optimal) assistant integrated into the PokerNow Copilot. You have deep knowledge of poker strategy, mathematics, and optimal play.

CURRENT GAME CONTEXT:
`;

    if (gameContext.gameState.isActive) {
        prompt += `
🎯 ACTIVE HAND ANALYSIS:
- Position: ${gameContext.gameState.positionName}
- Hole Cards: ${gameContext.gameState.holeCards?.map(card => typeof card === 'object' ? `${card.rank}${card.suit}` : card).join(', ') || 'Not visible'}
- Board: ${gameContext.gameState.boardCards?.map(card => typeof card === 'object' ? `${card.rank}${card.suit}` : card).join(', ') || 'Preflop'}
- Street: ${gameContext.gameState.street}
- Pot Size: $${gameContext.gameState.potSize}
- To Call: $${gameContext.gameState.toCall}
- Stack Size: $${gameContext.gameState.stackSize}
- Active Players: ${gameContext.gameState.activePlayers}
- Your Turn: ${gameContext.gameState.isMyTurn ? 'YES' : 'NO'}

💰 BLIND LEVELS:
- Small Blind: $${gameContext.blindLevels.smallBlind}
- Big Blind: $${gameContext.blindLevels.bigBlind}
- Stack in BBs: ${Math.round(gameContext.gameState.stackSize / gameContext.blindLevels.bigBlind)}

`;

        if (gameContext.gtoAdvice) {
            prompt += `🧠 CURRENT GTO RECOMMENDATION:
- Primary Action: ${gameContext.gtoAdvice.primaryAction} (${gameContext.gtoAdvice.confidence}% confidence)
- Strategy Mix: ${Object.entries(gameContext.gtoAdvice.strategy).map(([action, freq]) => `${action}: ${Math.round(freq)}%`).join(', ')}
- Hand Strength: ${Math.round(gameContext.gtoAdvice.handStrength)}%
- Hand Type: ${gameContext.gtoAdvice.handType}
- Betting Purpose: ${gameContext.gtoAdvice.bettingPurpose}
- Equity: ${Math.round(gameContext.gtoAdvice.equity)}%
- Reasoning: ${gameContext.gtoAdvice.reasoning}

`;
        }

        if (gameContext.gameState.opponentBets?.length > 0) {
            prompt += `👥 OPPONENT ACTION:
${gameContext.gameState.opponentBets.map(bet => `- ${bet.name}: $${bet.bet}`).join('\n')}

`;
        }
    } else {
        prompt += `
⏳ WAITING FOR HAND:
- No active hand detected
- Monitoring for game activity
- Ready to provide real-time analysis

`;
    }

    prompt += `
INSTRUCTIONS:
- Provide expert poker analysis and strategy advice
- Reference the current game context when relevant
- Explain GTO concepts clearly and concisely
- Use poker terminology appropriately
- Be helpful, analytical, and strategic
- If asked about the current hand, use the provided context
- Format responses clearly with bullet points or sections when helpful
- Keep responses focused and actionable

The user may ask about:
- Current hand analysis and strategy
- GTO theory and concepts
- Opponent range analysis
- Bet sizing and frequencies
- Position play and stack depth considerations
- General poker strategy questions

Remember: You have access to real-time game data and GTO analysis, so provide specific, contextual advice when possible.`;

    return prompt;
} 