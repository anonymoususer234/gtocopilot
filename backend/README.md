# 🃏 Poker AI - Professional Texas Hold'em Decision Engine

A specialized AI trained on the PokerBench dataset to make optimal poker decisions. This system uses Microsoft's Phi-3-mini model fine-tuned with LoRA for lightweight, efficient poker strategy.

## 🎯 Features

- **Specialized Model**: Fine-tuned exclusively for poker decision making
- **Lightweight**: Uses LoRA for efficient training and inference
- **Fast API**: RESTful API for real-time poker decisions
- **Local Dataset**: Pre-processed data for faster training iterations
- **Production Ready**: Optimized for deployment

## 📊 Dataset

- **Training Set**: 563,200 poker scenarios
- **Test Set**: 11,000 poker scenarios
- **Actions**: 185 unique poker actions (fold, call, check, bet X, raise X)
- **Source**: RZ412/PokerBench dataset

## 🚀 Quick Start

### 1. Setup Environment

**For CPU training:**

```bash
pip install -r requirements.txt
```

**For GPU training (MUCH FASTER - recommended):**

```bash
# Install CUDA-enabled PyTorch first
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Then install other requirements
pip install -r requirements.txt
```

**Verify GPU setup:**

```python
import torch
print(f"CUDA available: {torch.cuda.is_available()}")
print(f"GPU count: {torch.cuda.device_count()}")
```

### 2. Prepare Dataset (One-time setup)

```bash
python explore_dataset.py
```

This downloads and saves the dataset locally, so you don't need to re-download it every time.

### 3. Train the Model

```bash
python train_poker_model.py
```

**Training Details:**

- Uses 10,000 training examples (subset for speed)
- LoRA fine-tuning on Phi-3-mini
- ~30 minutes on M1 Mac, faster with GPU
- Model saved to `./poker-phi3-final`

### 4. Start the API

```bash
python poker_api.py
```

The API will be available at `http://localhost:8000`

### 5. Test the API

```bash
python test_api.py
```

## 🔌 API Usage

### Health Check

```bash
curl http://localhost:8000/poker/health
```

### Get Poker Decision

```bash
curl -X POST "http://localhost:8000/poker/decision" \
     -H "Content-Type: application/json" \
     -d '{
       "game_state": "Your poker scenario description here..."
     }'
```

### Example Response

```json
{
  "optimal_action": "bet 18",
  "confidence": 1.0
}
```

## 📝 Game State Format

The AI expects detailed poker scenarios like:

```
You are a specialist in playing 6-handed No Limit Texas Holdem.
Position: HJ (Hijack)
Your cards: [King of Diamond and Jack of Spade]
Blinds: 0.5/1 chips
Current pot: 24.0 chips
Board: [King Of Spade, Seven Of Heart, Two Of Diamond, Jack Of Club, Seven Of Club]
Action history: [detailed betting sequence]
Your turn to act.
```

## 🎮 Supported Actions

The AI can output:

- `fold` - Fold your hand
- `call` - Call the current bet
- `check` - Check (when no bet to call)
- `bet X` - Bet X chips
- `raise X` - Raise to X total chips

## ⚙️ Model Architecture

- **Base Model**: Microsoft Phi-3-mini-4k-instruct (3.8B parameters)
- **Fine-tuning**: LoRA (Low-Rank Adaptation)
- **Trainable Parameters**: ~16M (0.4% of total)
- **Memory**: Efficient - runs on 8GB RAM

## 📁 File Structure

```
POKERLLM/
├── explore_dataset.py      # Dataset exploration and local saving
├── train_poker_model.py    # Model training script
├── poker_api.py           # FastAPI server
├── test_api.py            # API testing script
├── requirements.txt       # Dependencies
├── README.md             # This file
├── poker_train_dataset.pkl # Local training data
├── poker_test_dataset.pkl  # Local test data
└── poker-phi3-final/      # Trained model (after training)
```

## 🔧 Configuration

### Training Parameters (in `train_poker_model.py`)

```python
# Dataset size (adjust based on your hardware)
train_subset = 10000  # Use more for better performance
test_subset = 1000

# LoRA configuration
r=16,              # Rank (higher = more parameters)
lora_alpha=32,     # Scaling factor
lora_dropout=0.1   # Dropout rate

# Training arguments
num_train_epochs=3
per_device_train_batch_size=4
learning_rate=2e-4
```

## 🚨 Performance Notes

- **Training Time**: 30-60 minutes for 10k examples
- **Memory Usage**: 6-8GB RAM during training
- **Inference Speed**: ~1-2 seconds per decision
- **Model Size**: ~400MB (LoRA adapter only)

## 🔬 Advanced Usage

### Full Dataset Training

To use the complete 563k training examples:

```python
# In train_poker_model.py, change:
train_subset = train_ds  # Use full dataset
```

### GPU Acceleration

The code automatically detects and uses GPU if available. For better performance:

```bash
# Install CUDA version of PyTorch
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### Custom Scenarios

You can test custom poker scenarios by modifying `test_api.py` or sending POST requests directly to the API.

## 🐛 Troubleshooting

### Model Not Found Error

```
FileNotFoundError: Trained model not found at ./poker-phi3-final
```

**Solution**: Run `python train_poker_model.py` first to train the model.

### CUDA Out of Memory

**Solution**: Reduce batch size in training arguments:

```python
per_device_train_batch_size=2  # Reduce from 4
gradient_accumulation_steps=8  # Increase to maintain effective batch size
```

### API Connection Error

**Solution**: Make sure the API is running:

```bash
python poker_api.py
```

## 📈 Future Improvements

1. **Larger Training Set**: Use full 563k examples
2. **Multi-Modal**: Add card image recognition
3. **Real-time Integration**: Connect to poker platforms
4. **Advanced Strategies**: Tournament vs cash game models
5. **Ensemble Models**: Combine multiple specialized models

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test your changes
4. Submit a pull request

## 📄 License

This project is for educational purposes. Please use responsibly and in accordance with applicable gambling laws.

---

**Happy Poker Playing! 🎰**
