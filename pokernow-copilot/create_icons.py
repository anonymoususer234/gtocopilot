#!/usr/bin/env python3
from PIL import Image, ImageDraw
import os

def create_icons():
    # Create icons directory if it doesn't exist
    os.makedirs('icons', exist_ok=True)
    
    # Create three simple icons
    sizes = [16, 48, 128]
    for size in sizes:
        # Create a new image with transparent background
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Draw a simple circle background (green)
        margin = max(1, size // 8)
        draw.ellipse([margin, margin, size-margin, size-margin], 
                    fill=(76, 175, 80, 255), outline=(255, 255, 255, 200), width=max(1, size//16))
        
        # Add a simple 'P' for Poker in the center
        font_size = max(8, size // 3)
        text = 'P'
        
        # Calculate text position to center it
        bbox = draw.textbbox((0, 0), text)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (size - text_width) // 2
        y = (size - text_height) // 2
        
        # Draw the text
        draw.text((x, y), text, fill='white')
        
        # Save the icon
        filename = f'icons/icon{size}.png'
        img.save(filename, 'PNG')
        print(f'Created {filename}')

if __name__ == '__main__':
    try:
        create_icons()
        print('All icons created successfully!')
    except ImportError:
        print('PIL not available, creating simple placeholder icons...')
        # Fallback: create minimal icons
        sizes = [16, 48, 128]
        for size in sizes:
            # Create a simple colored square as fallback
            img = Image.new('RGB', (size, size), (76, 175, 80))
            filename = f'icons/icon{size}.png'
            img.save(filename, 'PNG')
            print(f'Created simple {filename}') 