from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel
import os

app = FastAPI(title="Poker AI API", description="API for optimal poker decision making")

# Global variables for model and tokenizer
model = None
tokenizer = None

class PokerRequest(BaseModel):
    game_state: str
    
class PokerResponse(BaseModel):
    optimal_action: str
    confidence: float = 1.0

def load_poker_model():
    """Load the trained poker model"""
    global model, tokenizer
    
    model_path = "./poker-phi3-final"
    base_model_name = "microsoft/Phi-3-mini-4k-instruct"
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Trained model not found at {model_path}. Please train the model first.")
    
    print("Loading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(model_path, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token
    
    print("Loading base model...")
    base_model = AutoModelForCausalLM.from_pretrained(
        base_model_name,
        torch_dtype=torch.float32,
        device_map="auto" if torch.cuda.is_available() else None,
        trust_remote_code=True
    )
    
    print("Loading LoRA adapter...")
    model = PeftModel.from_pretrained(base_model, model_path)
    model.eval()
    
    print("Model loaded successfully!")

def format_poker_prompt(instruction):
    """Format poker instruction for inference"""
    return f"### Poker Decision Request:\n{instruction}\n\n### Optimal Action:"

def get_poker_decision(game_state: str) -> str:
    """Get optimal poker decision from the model"""
    if model is None or tokenizer is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    # Format the prompt
    prompt = format_poker_prompt(game_state)
    
    # Tokenize
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512)
    
    # Generate response
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=10,  # Poker actions are typically short
            do_sample=True,
            temperature=0.1,  # Low temperature for more deterministic outputs
            pad_token_id=tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id,
        )
    
    # Decode the response
    full_response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Extract just the action part
    action_start = full_response.find("### Optimal Action:") + len("### Optimal Action:")
    action = full_response[action_start:].strip()
    
    # Clean up the action (remove any extra text)
    action_lines = action.split('\n')
    if action_lines:
        action = action_lines[0].strip()
    
    return action

@app.on_event("startup")
async def startup_event():
    """Load the model when the API starts"""
    try:
        load_poker_model()
    except Exception as e:
        print(f"Error loading model: {e}")
        print("API started without model. Train the model first.")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Poker AI API is running", 
        "model_loaded": model is not None
    }

@app.post("/poker/decision", response_model=PokerResponse)
async def get_optimal_decision(request: PokerRequest):
    """Get optimal poker decision for a given game state"""
    try:
        action = get_poker_decision(request.game_state)
        return PokerResponse(optimal_action=action)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating decision: {str(e)}")

@app.get("/poker/health")
async def health_check():
    """Check if the model is loaded and ready"""
    return {
        "model_loaded": model is not None,
        "tokenizer_loaded": tokenizer is not None,
        "status": "ready" if (model is not None and tokenizer is not None) else "not_ready"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 