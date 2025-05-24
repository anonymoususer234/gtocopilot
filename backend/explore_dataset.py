from datasets import load_dataset
import json
import pickle
from collections import Counter

# Load the dataset
print("Loading PokerBench dataset...")
ds = load_dataset("RZ412/PokerBench", split="train")
test_ds = load_dataset("RZ412/PokerBench", split="test")

# Explore dataset structure
print(f"Train set size: {len(ds)}")
print(f"Test set size: {len(test_ds)}")
print(f"Dataset features: {ds.features}")

# Look at a few examples
print("\n=== Sample Examples ===")
for i in range(3):
    print(f"\nExample {i+1}:")
    print(f"Instruction length: {len(ds[i]['instruction'])}")
    print(f"Output: {ds[i]['output']}")

# Analyze output patterns
outputs = [item['output'] for item in ds]
output_types = Counter(outputs)
print(f"\n=== Output Analysis ===")
print(f"Unique outputs: {len(output_types)}")
print("Most common outputs:")
for output, count in output_types.most_common(10):
    print(f"  '{output}': {count}")

# Save datasets locally
print("\nSaving datasets locally...")
with open('poker_train_dataset.pkl', 'wb') as f:
    pickle.dump(ds, f)
    
with open('poker_test_dataset.pkl', 'wb') as f:
    pickle.dump(test_ds, f)

# Also save as JSON for easier inspection
train_data = [{"instruction": item["instruction"], "output": item["output"]} for item in ds]
test_data = [{"instruction": item["instruction"], "output": item["output"]} for item in test_ds]

with open('poker_train_dataset.json', 'w') as f:
    json.dump(train_data[:1000], f, indent=2)  # Save first 1000 for inspection

print("Dataset saved locally!")
print("Files created:")
print("- poker_train_dataset.pkl (full training set)")
print("- poker_test_dataset.pkl (full test set)")  
print("- poker_train_dataset.json (first 1000 examples for inspection)") 