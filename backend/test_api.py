import requests
import json

# Example poker game state from the dataset
example_game_state = """
You are a specialist in playing 6-handed No Limit Texas Holdem. The following will be a game scenario and you need to make the optimal decision.

Here is a game summary:

The small blind is 0.5 chips and the big blind is 1 chips. Everyone started with 100 chips.
The player positions involved in this game are UTG, HJ, CO, BTN, SB, BB.
In this hand, your position is HJ, and your holding is [King of Diamond and Jack of Spade].
Before the flop, HJ raise 2.0 chips, and BB call. Assume that all other players that is not mentioned folded.
The flop comes King Of Spade, Seven Of Heart, and Two Of Diamond, then BB check, and HJ check.
The turn comes Jack Of Club, then BB check, HJ bet 3 chips, BB raise 10 chips, and HJ call.
The river comes Seven Of Club, then BB check.

Now it is your turn to make a move.
To remind you, the current pot size is 24.0 chips, and your holding is [King of Diamond and Jack of Spade].

Decide on an action based on the strength of your hand on this board, your position, and actions before you. Do not explain your answer.
Your optimal action is:
"""

def test_api():
    """Test the poker API"""
    url = "http://localhost:8000"
    
    # Test health check
    print("Testing health check...")
    try:
        response = requests.get(f"{url}/poker/health")
        print(f"Health check status: {response.status_code}")
        print(f"Response: {response.json()}")
    except requests.exceptions.ConnectionError:
        print("❌ API server is not running. Start it with: python poker_api.py")
        return
    
    # Test poker decision
    print("\nTesting poker decision...")
    try:
        response = requests.post(
            f"{url}/poker/decision",
            json={"game_state": example_game_state.strip()}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Poker decision successful!")
            print(f"Optimal action: {result['optimal_action']}")
            print(f"Confidence: {result.get('confidence', 'N/A')}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing API: {e}")

def test_custom_scenario():
    """Test with a custom poker scenario"""
    custom_scenario = """
    You are playing 6-handed No Limit Texas Hold'em.
    Position: Button
    Your cards: [Ace of Spades, King of Spades]
    Blinds: 1/2 chips
    Current pot: 7 chips
    Board: [Queen of Hearts, Jack of Diamonds, Ten of Clubs]
    Action: UTG bets 5 chips, all others fold to you.
    """
    
    url = "http://localhost:8000/poker/decision"
    
    print("\nTesting custom scenario...")
    try:
        response = requests.post(
            url,
            json={"game_state": custom_scenario.strip()}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Custom scenario successful!")
            print(f"Optimal action: {result['optimal_action']}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🃏 Testing Poker AI API...")
    print("=" * 50)
    test_api()
    test_custom_scenario() 