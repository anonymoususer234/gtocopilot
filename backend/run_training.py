#!/usr/bin/env python3
"""
Simple script to run the poker AI training pipeline
"""

import os
import sys

def check_files():
    """Check if required files exist"""
    required_files = [
        'poker_train_dataset.pkl',
        'poker_test_dataset.pkl'
    ]
    
    missing_files = []
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print("❌ Missing required dataset files:")
        for file in missing_files:
            print(f"  - {file}")
        print("\n🔧 Run this first to prepare the dataset:")
        print("   python explore_dataset.py")
        return False
    
    return True

def run_training():
    """Run the training process"""
    print("🃏 Starting Poker AI Training Pipeline")
    print("=" * 50)
    
    # Check if dataset files exist
    if not check_files():
        return
    
    print("✅ Dataset files found")
    print("🚀 Starting model training...")
    print("   This may take 30-60 minutes depending on your hardware")
    print("   Progress will be shown below:\n")
    
    # Import and run training
    try:
        from train_poker_model import train_model
        train_model()
        
        print("\n🎉 Training completed successfully!")
        print("📁 Model saved to: ./poker-phi3-final")
        print("\n🔌 Next steps:")
        print("   1. Start the API: python poker_api.py")
        print("   2. Test the API: python test_api.py")
        
    except ImportError as e:
        print(f"❌ Missing dependencies: {e}")
        print("🔧 Install them with: pip install -r requirements.txt")
    except Exception as e:
        print(f"❌ Training failed: {e}")
        print("💡 Check the error above and try again")

if __name__ == "__main__":
    run_training() 