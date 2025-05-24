# 🎯 PokerNow GTO Copilot

Real-time GTO poker advice for PokerNow.com

## Features

- **Real-time GTO Analysis**: Get optimal play advice while you play
- **Mixed Strategy Frequencies**: See exact percentages for each action
- **Comprehensive Range Analysis**: Understand opponent ranges and your equity
- **Stack Depth Adjustments**: Strategy adapts to short/medium/deep stacks
- **Position-aware Advice**: Recommendations change based on your position
- **Mathematical Analysis**: Pot odds, implied odds, and equity calculations
- **🤖 Claude Chat Assistant**: Interactive AI coach with full game context
- **Smart Context Sharing**: Sends complete game state to Claude for analysis
- **Secure API Management**: Local storage with connection testing
- **Professional Chat UI**: Beautiful interface with typing indicators

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `pokernow-copilot` folder
5. Navigate to PokerNow.com and start playing!

## Usage

The copilot will automatically appear when you join a poker game. It provides:

- **Primary Action**: The mathematically optimal play with confidence percentage
- **Strategy Mix**: Full frequency breakdown for mixed strategies
- **Hand Analysis**: Strength, equity, outs, and hand categorization
- **Opponent Analysis**: Range estimation and action analysis
- **Detailed Reasoning**: Clear explanations for each recommendation

## Controls

- **Minimize/Maximize**: Click the minimize button (−/+)
- **Close**: Click the × button to hide the copilot
- **Refresh**: Force update the analysis
- **Keyboard Shortcut**: Ctrl+Shift+P to toggle visibility

## 🤖 Claude Chat Assistant Setup

The copilot includes an advanced AI chat assistant powered by Claude. To use this feature:

### 1. Get Claude API Key

- Visit [console.anthropic.com](https://console.anthropic.com/)
- Create an account and obtain your API key
- Copy the API key (starts with `sk-ant-`)

### 2. Configure Extension

- Click the ⚙️ settings gear icon in the copilot header
- Paste your Claude API key in the settings modal
- Click "Test Connection" to verify it works
- Click "Save" to store the key locally

### 3. Start Chatting

- Click "Chat with your personal assistant" button
- Ask questions about your current hand or general poker strategy
- The assistant receives complete game context automatically

### Chat Examples

- "Analyze my current hand situation"
- "What's the opponent's likely range here?"
- "Should I call this bet on the turn?"
- "Explain the GTO strategy for this spot"
- "What are my pot odds and implied odds?"

The chat assistant automatically receives:

- Your hole cards and board cards
- Position, stack depth, and blind levels
- Current opponent action and bet sizing
- GTO copilot's current recommendation
- All relevant game state information

This creates a powerful poker coach that provides contextual, expert-level analysis for any situation!

## Technical Details

Built with modern poker theory and mathematical models:

- Monte Carlo simulations for equity calculations
- Comprehensive preflop ranges for all positions
- Postflop analysis with board texture recognition
- Real-time parsing of game state from PokerNow interface

## Legal Notice

This tool is for educational purposes. Please ensure compliance with the terms of service of any poker site you use it with.

## ✨ Features

### 🧠 Advanced Poker Engine

- **Complete hand evaluation** - Recognizes all poker hands from high card to royal flush
- **Preflop hand strength calculation** - Considers position, stack sizes, and opponent counts
- **Real-time equity calculation** - Monte Carlo simulations for accurate win probabilities
- **Outs counting** - Identifies cards that improve your hand with categorized improvements

### 🎯 GTO Strategy Advisor

- **Position-aware recommendations** - Adjusts strategy based on your table position
- **Pot odds calculations** - Compares required equity vs. hand strength
- **Street-specific advice** - Different strategies for preflop, flop, turn, and river
- **Confidence levels** - Color-coded recommendations with confidence percentages
- **Bet sizing suggestions** - Optimal bet amounts for value and bluffs

### 🖥️ Modern UI Design

- **AI code editor inspired interface** - Sleek, modern sidebar design
- **Real-time game state detection** - Automatically detects cards, pot size, and betting actions
- **Draggable and resizable** - Position the copilot wherever you want
- **Keyboard shortcuts** - Quick access with hotkeys
- **Debug mode** - Advanced monitoring for developers

### 🚀 Smart Integration

- **Automatic game detection** - Works seamlessly with PokerNow.com
- **Real-time DOM parsing** - Extracts game information without manual input
- **Health monitoring** - Self-healing system that recovers from errors
- **Non-intrusive** - Doesn't interfere with normal poker gameplay

## 📦 Installation

### Prerequisites

- Google Chrome or Chromium-based browser
- PokerNow.com account

### Step 1: Download the Extension

1. Download or clone this repository
2. Extract the files to a folder on your computer

### Step 2: Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top right)
3. Click **Load unpacked**
4. Select the `pokernow-copilot` folder
5. The extension should now appear in your extensions list

### Step 3: Verify Installation

1. You should see the 🎯 PokerNow GTO Copilot icon in your Chrome toolbar
2. Click the icon to open the popup and check the status
3. Navigate to [PokerNow.com](https://www.pokernow.club/)
4. The copilot should automatically activate and show a welcome message

## 🎮 Usage

### Getting Started

1. **Join a poker game** on PokerNow.com
2. **Wait for cards to be dealt** - The copilot will automatically detect your hole cards
3. **View recommendations** - Check the sidebar for GTO advice
4. **Follow the guidance** - Use the suggested actions to improve your play

### Understanding the Interface

#### 📊 Game Information Panel

- **Your Cards**: Shows your hole cards with suit colors
- **Board**: Displays community cards as they're revealed
- **Game Stats**: Pot size, amount to call, and your stack size
- **Street Indicator**: Shows current betting round (preflop/flop/turn/river)

#### 🎯 Recommendation Panel

- **Primary Action**: Main recommended move (fold, call, bet, raise)
- **Confidence Level**: Color-coded confidence percentage
  - 🟢 Green (80%+): High confidence, strong recommendation
  - 🟠 Orange (65-79%): Good confidence, solid play
  - 🟡 Yellow (50-64%): Moderate confidence, marginal decision
  - 🔴 Red (0-49%): Low confidence, difficult spot
- **Reasoning**: Explanation of why this action is recommended
- **Bet Size**: Suggested bet amount when applicable

#### 📈 Detailed Statistics (Expandable)

- **Hand Strength**: Your hand strength percentage
- **Equity**: Win probability against opponent ranges
- **Outs**: Cards that improve your hand
- **Pot Odds**: Required equity vs. betting action

### Keyboard Shortcuts

- `Ctrl + Shift + P`: Toggle copilot visibility
- `Ctrl + Shift + R`: Force refresh game state
- `Ctrl + Shift + D`: Toggle debug mode

### Extension Popup Controls

Click the 🎯 icon in your toolbar to access:

- **Status monitoring** - Check if everything is working
- **Quick actions** - Toggle copilot, refresh state
- **Settings** - Enable/disable debug mode
- **Direct PokerNow access** - Open PokerNow.com

## 🔧 Advanced Features

### Debug Mode

Enable debug mode for advanced monitoring:

1. Press `Ctrl + Shift + D` or use the popup
2. View real-time game state information
3. Monitor parsing accuracy and system health
4. Useful for troubleshooting or customization

### Customization

The copilot is highly customizable:

- **Position settings** - Drag the copilot anywhere on screen
- **Size adjustments** - Minimize or expand sections as needed
- **Confidence thresholds** - Modify confidence levels in the code
- **Strategy ranges** - Adjust preflop ranges and postflop logic

## 🛠️ Technical Details

### Architecture

```
PokerNow Copilot
├── Poker Engine          # Hand evaluation and math
├── Equity Calculator      # Monte Carlo simulations
├── GTO Advisor           # Strategic decision making
├── PokerNow Parser       # DOM parsing and game state
├── Copilot UI            # Modern interface
└── Content Script        # Chrome extension integration
```

### Technologies Used

- **Vanilla JavaScript** - No external dependencies
- **Chrome Extension API** - Manifest V3 compliance
- **CSS Grid & Flexbox** - Modern responsive design
- **DOM Mutation Observer** - Real-time game monitoring
- **Monte Carlo Methods** - Equity calculations

### Performance

- **Lightweight** - < 100KB total size
- **Fast calculations** - Equity simulations in < 100ms
- **Memory efficient** - Minimal impact on browser performance
- **Battery friendly** - Optimized for laptop usage

## 📜 Legal & Ethical Considerations

### Terms of Service Compliance

- **Read-only access** - Only reads game information, never modifies gameplay
- **No automation** - Requires manual decision-making from the player
- **Educational tool** - Designed to improve poker understanding
- **Personal use** - Intended for individual learning and improvement

### Responsible Gaming

- Use as a **learning tool** to understand GTO concepts
- Don't rely entirely on the copilot - develop your own skills
- Be aware of your local gambling laws and regulations
- Practice bankroll management and responsible gaming habits

### Fair Play

- The copilot provides the same type of analysis available in poker training software
- All calculations are based on visible information only
- No access to opponent cards or future board cards
- Equivalent to using a calculator for pot odds

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Bug Reports

1. Use the GitHub Issues tab
2. Include steps to reproduce
3. Provide browser and extension version
4. Enable debug mode and include console logs

### Feature Requests

1. Search existing issues first
2. Describe the feature clearly
3. Explain the poker theory behind it
4. Consider implementation complexity

### Code Contributions

1. Fork the repository
2. Create a feature branch
3. Follow the existing code style
4. Add comments and documentation
5. Test thoroughly before submitting
6. Create a pull request with detailed description

### Testing

Help us test on different:

- **Browsers** - Chrome, Edge, Brave, etc.
- **Operating systems** - Windows, macOS, Linux
- **PokerNow game types** - Cash games, tournaments, different stakes
- **Screen sizes** - Desktop, laptop, different resolutions

## 🐛 Troubleshooting

### Common Issues

#### Extension Not Loading

- Ensure Developer mode is enabled in Chrome
- Check that all files are in the correct folders
- Try reloading the extension in `chrome://extensions/`
- Clear browser cache and restart Chrome

#### Copilot Not Appearing on PokerNow

- Verify you're on a PokerNow.com page (not subdomain)
- Check the extension popup for status information
- Try refreshing the PokerNow page
- Press `Ctrl + Shift + P` to manually toggle

#### Incorrect Game State Detection

- Enable debug mode to see parsing information
- Try refreshing with `Ctrl + Shift + R`
- Check browser console for error messages
- Report specific scenarios where parsing fails

#### Performance Issues

- Close unnecessary browser tabs
- Disable other extensions temporarily
- Check available system memory
- Try restarting the browser

### Getting Help

1. **Check the console** - Press F12 and look for errors
2. **Enable debug mode** - Use `Ctrl + Shift + D` for detailed info
3. **Use the popup** - Check status indicators for issues
4. **Create an issue** - Include browser info and error messages

## 🎓 Poker Theory Background

### Game Theory Optimal (GTO) Play

GTO poker strategy aims to create an unexploitable playing style by using mathematical principles to make optimal decisions. Key concepts include:

- **Nash Equilibrium** - Balanced strategy where no player can improve by changing
- **Mixed Strategies** - Randomizing between actions with optimal frequencies
- **Range Construction** - Playing hands based on position and action
- **Bet Sizing** - Using mathematically sound bet sizes for value and bluffs

### Equity and Odds

Understanding poker math is crucial for GTO play:

- **Pot Equity** - Your percentage chance of winning the pot
- **Pot Odds** - Ratio of bet size to total pot size
- **Implied Odds** - Future betting considerations
- **Fold Equity** - Additional value from opponent folds

### Position and Ranges

Position is fundamental in poker strategy:

- **Early Position** - Tighter ranges, more value-focused
- **Late Position** - Wider ranges, more aggressive play
- **Button Play** - Maximum positional advantage
- **Blind Defense** - Pot odds considerations from big blind

## 📚 Learning Resources

### Recommended Reading

- **"Modern Poker Theory"** by Michael Acevedo
- **"The Theory of Poker"** by David Sklansky
- **"Applications of No-Limit Hold'em"** by Matthew Janda
- **"Play Optimal Poker"** by Andrew Brokos

### Online Training

- **PioSolver** - Professional GTO solver
- **MonkerSolver** - Advanced poker training
- **PokerCoaching.com** - Strategy videos and content
- **Red Chip Poker** - Fundamental concepts

### Practice Tools

- **PokerTracker** - Hand tracking and analysis
- **Hold'em Manager** - Database and HUD
- **Flopzilla** - Range and equity analysis
- **SnapShove** - Push/fold charts

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **PokerNow.com** - For providing an excellent online poker platform
- **Poker community** - For sharing GTO knowledge and strategies
- **Open source contributors** - For inspiring this project
- **Beta testers** - For helping improve the copilot

## ⚠️ Disclaimer

This software is provided for educational purposes only. Users are responsible for ensuring compliance with:

- Local gambling laws and regulations
- Online poker site terms of service
- Ethical gaming practices

The developers are not responsible for any consequences arising from the use of this software. Always gamble responsibly and within your means.

---

**Made with ❤️ for the poker community**

_Help improve your game, one hand at a time._
