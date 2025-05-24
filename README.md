# TexasSolver GTO API

A REST API wrapper for the [TexasSolver](https://github.com/bupticybee/TexasSolver) that provides Game Theory Optimal (GTO) poker strategies. Perfect for creating poker copilots, analyzing hands, or integrating GTO analysis into poker applications like PokerNow.

## Features

- ✅ REST API for GTO poker solving
- ✅ Support for Texas Hold'em and Short Deck
- ✅ Configurable betting sizes and solver parameters  
- ✅ Python client library for easy integration
- ✅ Flop, turn, and river analysis
- ✅ Custom range support
- ✅ Mock solver for testing (when TexasSolver binary not available)
- ✅ CORS enabled for frontend integration

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Start the API Server

```bash
python main.py
```

The API will be available at `http://localhost:8000`

### 3. Use the Python Client

```python
from client import GTOSolverClient

# Initialize client
client = GTOSolverClient()

# Solve a flop hand
result = client.get_flop_strategy(
    board="Qs,Jh,2h",
    pot_size=10,
    effective_stack=95,
    position="oop"
)

print(f"GTO Advice: {client.get_simple_advice(result)}")
```

### 4. Use the REST API Directly

```bash
curl -X POST "http://localhost:8000/solve" \
  -H "Content-Type: application/json" \
  -d '{
    "board": "Qs,Jh,2h",
    "oop_range": "AA,KK,QQ,JJ,AK",
    "ip_range": "22+,A2s+,K9s+,Q9s+,J9s+,T8s+,98s,87s,76s,65s,54s",
    "pot_size": 10,
    "effective_stack": 95,
    "position": "oop"
  }'
```

## API Documentation

### POST /solve

Solve a poker hand using GTO principles.

**Request Body:**
```json
{
  "board": "Qs,Jh,2h",
  "oop_range": "AA,KK,QQ:0.5,AK",
  "ip_range": "22+,A2s+,K9s+",
  "pot_size": 10.0,
  "effective_stack": 95.0,
  "position": "oop",
  "accuracy": 0.3,
  "max_iterations": 200,
  "thread_count": 4
}
```

**Response:**
```json
{
  "success": true,
  "strategy": {
    "board": "Qs,Jh,2h",
    "street": "flop",
    "position": "oop",
    "strategy": {
      "fold": 0.2,
      "check/call": 0.6,
      "bet/raise": 0.2
    },
    "actions": [
      {"action": "fold", "frequency": 0.2, "ev": -5.0},
      {"action": "call", "frequency": 0.6, "ev": 0.0},
      {"action": "bet", "frequency": 0.2, "ev": 3.0}
    ]
  },
  "computation_time": 1.5,
  "convergence": 0.275
}
```

### GET /health

Check API health and TexasSolver availability.

**Response:**
```json
{
  "status": "healthy",
  "solver_available": false,
  "solver_path": null,
  "resources_path": "/path/to/TexasSolver/resources"
}
```

## Range Format

Ranges use standard poker notation:

- **Pairs:** `AA`, `KK`, `22`
- **Suited:** `AKs`, `KQs`, `87s`
- **Offsuit:** `AKo`, `KQo`, `87o`
- **Mixed:** `AK` (includes both suited/offsuit)
- **Frequencies:** `AA:0.5` (play 50% of AA)
- **Plus notation:** `22+` (all pairs 22 and higher)
- **Range combos:** `A2s+` (A2s through AKs)

**Example ranges:**
```
# Tight range
"AA,KK,QQ,JJ,AK:0.8,AQ:0.5"

# Wide range  
"22+,A2s+,A5o+,K9s+,KTo+,Q9s+,QJo,J9s+,T8s+,98s,87s,76s,65s,54s"

# Balanced range with frequencies
"AA:0.9,KK,QQ:0.75,JJ:0.5,TT:0.25,AK:0.8,AQ:0.6,AJ:0.4"
```

## Board Format

Board cards use standard notation with comma separation:

- **Flop:** `"Qs,Jh,2h"`
- **Turn:** `"Qs,Jh,2h,8c"`
- **River:** `"Qs,Jh,2h,8c,3d"`

Card format: `[Rank][Suit]` where rank is `2-9,T,J,Q,K,A` and suit is `c,d,h,s`.

## Integration Examples

### PokerNow Copilot

```python
from client import GTOSolverClient

class PokerNowCopilot:
    def __init__(self):
        self.gto_client = GTOSolverClient()
    
    def analyze_current_situation(self, board, position, pot_size, stack_size):
        # Get GTO recommendation
        result = self.gto_client.get_flop_strategy(
            board=board,
            pot_size=pot_size,
            effective_stack=stack_size,
            position=position
        )
        
        return self.gto_client.get_simple_advice(result)

# Usage
copilot = PokerNowCopilot()
advice = copilot.analyze_current_situation("Qs,Jh,2h", "oop", 15, 100)
print(f"GTO recommends: {advice}")
```

### Custom Range Analysis

```python
client = GTOSolverClient()

# Analyze tight vs loose ranges
result = client.solve_hand(
    board="As,Kh,7c",
    oop_range="AA:0.5,KK,AK,AQ:0.3",  # Tight value range
    ip_range="22+,A2s+,K9s+,Q9s+",    # Wide calling range
    pot_size=20,
    effective_stack=100,
    position="oop"
)

print(f"Strategy: {result.strategy}")
```

## Building TexasSolver (Optional)

For better performance, you can build the actual TexasSolver:

```bash
# Clone TexasSolver (already done in this project)
cd TexasSolver

# Build console version (requires Qt and CMake)
# Instructions depend on your OS - see TexasSolver documentation
```

## Project Structure

```
├── backend/
│   ├── main.py          # FastAPI server
│   ├── client.py        # Python client library
│   └── requirements.txt # Dependencies
├── frontend/            # (Future frontend implementation)
├── TexasSolver/         # TexasSolver repository
└── README.md           # This file
```

## Configuration

### Environment Variables

- `SOLVER_PATH`: Path to TexasSolver executable
- `RESOURCES_PATH`: Path to TexasSolver resources directory
- `API_HOST`: API host (default: 0.0.0.0)
- `API_PORT`: API port (default: 8000)

### Solver Parameters

- **accuracy**: Lower values = more precise but slower (0.1-1.0)
- **max_iterations**: Maximum solver iterations (100-1000)
- **thread_count**: Number of CPU threads to use
- **use_isomorphism**: Enable card isomorphism for speed

## Performance Notes

- First solve takes longer due to initialization
- More complex betting trees = longer solve times
- Higher accuracy = exponentially longer solve times
- Use mock solver for testing/development

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is provided under the same license as TexasSolver (AGPL-3.0). See the [TexasSolver repository](https://github.com/bupticybee/TexasSolver) for details.

## Support

- Check the `/health` endpoint for API status
- Enable debug logging for troubleshooting
- See TexasSolver documentation for solver-specific issues
- Create GitHub issues for API-related problems 