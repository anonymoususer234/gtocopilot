from datasets import load_dataset

# load the TRAIN split
ds = load_dataset("RZ412/PokerBench", split="train")

# peek at a few examples
print(ds[0])
