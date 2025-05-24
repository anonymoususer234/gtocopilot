import pickle
import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM, 
    TrainingArguments, 
    Trainer,
    DataCollatorForLanguageModeling
)
from peft import LoraConfig, get_peft_model, TaskType
from datasets import Dataset
import os

def load_local_dataset():
    """Load the locally saved poker dataset"""
    print("Loading local poker dataset...")
    with open('poker_train_dataset.pkl', 'rb') as f:
        train_ds = pickle.load(f)
    with open('poker_test_dataset.pkl', 'rb') as f:
        test_ds = pickle.load(f)
    return train_ds, test_ds

def format_poker_prompt(instruction, output=None):
    """Format poker instruction and output for training"""
    if output is None:
        return f"### Poker Decision Request:\n{instruction}\n\n### Optimal Action:"
    else:
        return f"### Poker Decision Request:\n{instruction}\n\n### Optimal Action:\n{output}<|endoftext|>"

def preprocess_dataset(dataset, tokenizer, max_length=512):
    """Preprocess the dataset for training"""
    def tokenize_function(examples):
        # Format the prompts
        formatted_texts = [
            format_poker_prompt(inst, out) 
            for inst, out in zip(examples['instruction'], examples['output'])
        ]
        
        # Tokenize
        tokenized = tokenizer(
            formatted_texts,
            truncation=True,
            padding=False,
            max_length=max_length,
            return_tensors=None
        )
        
        # Set labels (same as input_ids for causal LM)
        tokenized['labels'] = tokenized['input_ids'].copy()
        
        return tokenized
    
    # Convert to HuggingFace Dataset if it's not already
    if not isinstance(dataset, Dataset):
        dataset = Dataset.from_dict({
            'instruction': [item['instruction'] for item in dataset],
            'output': [item['output'] for item in dataset]
        })
    
    # Tokenize the dataset
    tokenized_dataset = dataset.map(
        tokenize_function,
        batched=True,
        remove_columns=dataset.column_names
    )
    
    return tokenized_dataset

def setup_model_and_tokenizer():
    """Setup Phi-3-mini model and tokenizer with LoRA"""
    model_name = "microsoft/Phi-3-mini-4k-instruct"
    
    print(f"Loading {model_name}...")
    
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token
    
    # Load model
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
        device_map="auto" if torch.cuda.is_available() else None,
        trust_remote_code=True
    )
    
    # Setup LoRA configuration
    lora_config = LoraConfig(
        task_type=TaskType.CAUSAL_LM,
        inference_mode=False,
        r=16,  # Rank
        lora_alpha=32,  # Scaling parameter
        lora_dropout=0.1,
        target_modules=["q_proj", "v_proj", "k_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]
    )
    
    # Apply LoRA to model
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()
    
    return model, tokenizer

def train_model():
    """Main training function"""
    # Load datasets
    train_ds, test_ds = load_local_dataset()
    
    # Take a smaller subset for initial training (you can increase this)
    print("Using subset of data for efficient training...")
    train_subset = train_ds.select(range(min(10000, len(train_ds))))  # Use 10k examples
    test_subset = test_ds.select(range(min(1000, len(test_ds))))      # Use 1k examples
    
    # Setup model and tokenizer
    model, tokenizer = setup_model_and_tokenizer()
    
    # Preprocess datasets
    print("Preprocessing datasets...")
    train_dataset = preprocess_dataset(train_subset, tokenizer)
    eval_dataset = preprocess_dataset(test_subset, tokenizer)
    
    # Data collator
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False,  # We're doing causal LM, not masked LM
    )
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir="./poker-phi3-lora",
        overwrite_output_dir=True,
        num_train_epochs=3,
        per_device_train_batch_size=4,
        per_device_eval_batch_size=4,
        gradient_accumulation_steps=4,
        warmup_steps=100,
        logging_steps=10,
        eval_steps=200,
        save_steps=500,
        evaluation_strategy="steps",
        save_strategy="steps",
        load_best_model_at_end=True,
        push_to_hub=False,
        report_to=None,  # Disable wandb/tensorboard
        lr_scheduler_type="cosine",
        learning_rate=2e-4,
        fp16=False,  # Use bf16 if available
        bf16=torch.cuda.is_available(),
        dataloader_num_workers=0,  # Avoid multiprocessing issues
    )
    
    # Initialize trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        data_collator=data_collator,
        tokenizer=tokenizer,
    )
    
    # Train the model
    print("Starting training...")
    trainer.train()
    
    # Save the final model
    print("Saving model...")
    trainer.save_model("./poker-phi3-final")
    tokenizer.save_pretrained("./poker-phi3-final")
    
    print("Training completed!")
    print("Model saved to ./poker-phi3-final")

if __name__ == "__main__":
    train_model() 