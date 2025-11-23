#!/usr/bin/env python3
"""Regenerate screenshots with correct aspect ratios (no stretching)."""

import os
from google import genai
from PIL import Image

API_KEY = "AIzaSyBWra8P16hFq95avoNI8owez0agLvK23EM"
client = genai.Client(api_key=API_KEY)
SCREENSHOT_DIR = "store-assets/screenshots"

def generate_and_crop(prompt: str, output_path: str, final_width: int, final_height: int):
    """Generate image and crop to correct aspect ratio (no stretching)."""
    print(f"\nGenerating: {output_path}")
    print(f"Target size: {final_width}x{final_height}")

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=[prompt],
        )

        for part in response.parts:
            if part.inline_data is not None:
                # Save original first
                temp_path = f"{output_path}.temp.png"
                pil_image = part.as_image()
                pil_image.save(temp_path)

                # Open with PIL
                image = Image.open(temp_path)
                orig_width, orig_height = image.size
                print(f"Generated: {orig_width}x{orig_height}")

                # Calculate target aspect ratio
                target_ratio = final_width / final_height  # 1.6 for 1280x800
                orig_ratio = orig_width / orig_height

                # Crop to correct aspect ratio (center crop)
                if orig_ratio > target_ratio:
                    # Image is wider, crop width
                    new_width = int(orig_height * target_ratio)
                    left = (orig_width - new_width) // 2
                    image_cropped = image.crop((left, 0, left + new_width, orig_height))
                else:
                    # Image is taller, crop height
                    new_height = int(orig_width / target_ratio)
                    top = (orig_height - new_height) // 2
                    image_cropped = image.crop((0, top, orig_width, top + new_height))

                # Resize to exact dimensions
                image_final = image_cropped.resize((final_width, final_height), Image.Resampling.LANCZOS)
                image_final.save(output_path)

                # Clean up temp file
                if os.path.exists(temp_path):
                    os.remove(temp_path)

                print(f"✓ Saved: {output_path}\n")
                return True

    except Exception as e:
        print(f"✗ Error: {e}\n")
        return False

    return False

os.makedirs(SCREENSHOT_DIR, exist_ok=True)

print("=" * 80)
print("REGENERATING SCREENSHOTS WITH CORRECT ASPECT RATIO (NO STRETCHING)")
print("=" * 80)

# Screenshot 1 - Side Panel Overview
print("\n1. SCREENSHOT 1 - SIDE PANEL OVERVIEW")
print("-" * 80)
screenshot1_prompt = """Create a professional Chrome browser mockup screenshot in wide 1.6:1 aspect ratio.
Layout (LEFT 60%, RIGHT 40%):
- LEFT: ChatGPT interface with conversation visible
- RIGHT: Side panel titled "AI Search Inspector"
- Side panel shows:
  * "Table of Contents" header
  * "Event #1" with timestamp
  * Search query: "latest AI developments 2025"
  * Structured results list below
- Realistic Chrome browser UI with proper window chrome
- Professional color scheme with good contrast
- Clear, readable text throughout
- Modern, clean design
- IMPORTANT: Design for wide 1.6:1 horizontal format"""

generate_and_crop(screenshot1_prompt, f"{SCREENSHOT_DIR}/screenshot1-1280x800.png", 1280, 800)

# Screenshot 2 - Real-time Monitoring
print("\n2. SCREENSHOT 2 - REAL-TIME MONITORING")
print("-" * 80)
screenshot2_prompt = """Create a Chrome browser mockup showing active monitoring in wide 1.6:1 aspect ratio.
Layout:
- ChatGPT on left asking a research question
- Side panel "AI Search Inspector" on right capturing multiple queries
- Show 2-3 search events with timestamps
- Visual indicators of live monitoring (subtle pulse/glow effects)
- Professional interface design
- Tech-focused color scheme
- IMPORTANT: Wide horizontal 1.6:1 layout
- Realistic browser chrome and shadows"""

generate_and_crop(screenshot2_prompt, f"{SCREENSHOT_DIR}/screenshot2-1280x800.png", 1280, 800)

# Screenshot 3 - Structured Results
print("\n3. SCREENSHOT 3 - STRUCTURED RESULTS")
print("-" * 80)
screenshot3_prompt = """Create a Chrome screenshot focusing on detailed results view in wide 1.6:1 aspect ratio.
Focus on side panel showing:
- Hierarchical display of search results
- Multiple result items with:
  * Titles in bold
  * URLs in lighter text
  * Snippet text
- "Copy" buttons next to results
- Clean table/list layout
- Professional typography
- Technical but user-friendly
- IMPORTANT: Optimized for wide 1.6:1 horizontal format
- Modern UI elements"""

generate_and_crop(screenshot3_prompt, f"{SCREENSHOT_DIR}/screenshot3-1280x800.png", 1280, 800)

# Screenshot 4 - Table of Contents
print("\n4. SCREENSHOT 4 - TABLE OF CONTENTS")
print("-" * 80)
screenshot4_prompt = """Create a Chrome screenshot highlighting navigation in wide 1.6:1 aspect ratio.
Show side panel with:
- "Table of Contents" section prominently expanded
- List of 4-5 events and queries with:
  * Event numbers
  * Timestamps
  * Query preview text
- Clickable navigation items with hover states
- Clear visual hierarchy
- Professional design
- Easy-to-scan layout
- IMPORTANT: Wide 1.6:1 horizontal format
- Modern Chrome extension styling"""

generate_and_crop(screenshot4_prompt, f"{SCREENSHOT_DIR}/screenshot4-1280x800.png", 1280, 800)

# Screenshot 5 - Raw JSON View
print("\n5. SCREENSHOT 5 - RAW JSON VIEW")
print("-" * 80)
screenshot5_prompt = """Create a Chrome screenshot showing technical JSON view in wide 1.6:1 aspect ratio.
Display in side panel:
- "Show Raw JSON" toggle activated
- Formatted JSON data with:
  * Syntax highlighting (keys in blue, values in green/orange)
  * Proper indentation
  * Expandable/collapsible sections
- Professional code editor aesthetic
- Dark or light theme (consistent with design)
- Line numbers optional
- IMPORTANT: Wide horizontal 1.6:1 layout
- For developers and power users
- Clean, readable code presentation"""

generate_and_crop(screenshot5_prompt, f"{SCREENSHOT_DIR}/screenshot5-1280x800.png", 1280, 800)

print("=" * 80)
print("SCREENSHOTS REGENERATED WITH CORRECT PROPORTIONS!")
print("=" * 80)
print(f"\nAll screenshots saved to: {SCREENSHOT_DIR}/")
print("Dimensions: 1280x800 (aspect ratio 1.6:1)")
print("\nNo stretching - images are properly cropped and resized!")
