#!/usr/bin/env python3
"""Generate promotional images for Chrome Web Store submission using Gemini API."""

import os
from google import genai
from PIL import Image

# API key
API_KEY = "AIzaSyBWra8P16hFq95avoNI8owez0agLvK23EM"

# Initialize client
client = genai.Client(api_key=API_KEY)

# Output directories
PROMO_DIR = "store-assets/promotional-images"
SCREENSHOT_DIR = "store-assets/screenshots"

def generate_image(prompt: str, output_path: str, model="gemini-2.5-flash-image"):
    """Generate an image from a text prompt using Gemini."""
    print(f"Generating: {output_path}")
    print(f"Prompt: {prompt}\n")

    try:
        response = client.models.generate_content(
            model=model,
            contents=[prompt],
        )

        # Save the generated image
        for part in response.parts:
            if part.text is not None:
                print(f"Response text: {part.text}")
            elif part.inline_data is not None:
                image = part.as_image()
                image.save(output_path)
                print(f"✓ Saved: {output_path}\n")
                return True

    except Exception as e:
        print(f"✗ Error: {e}\n")
        return False

    return False

def resize_image(input_path: str, output_path: str, size: tuple):
    """Resize an image to specific dimensions."""
    print(f"Resizing {input_path} to {size[0]}x{size[1]}...")
    img = Image.open(input_path)
    img_resized = img.resize(size, Image.Resampling.LANCZOS)
    img_resized.save(output_path)
    print(f"✓ Saved resized: {output_path}\n")

# Create output directories
os.makedirs(PROMO_DIR, exist_ok=True)
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

print("=" * 80)
print("GENERATING CHROME WEB STORE PROMOTIONAL IMAGES")
print("=" * 80)
print()

# 1. Small Promotional Tile (440x280)
print("1. SMALL PROMOTIONAL TILE (440x280)")
print("-" * 80)
small_promo_prompt = """Create a professional Chrome extension promotional banner image, 440x280 pixels.
The image should show:
- Title: "AI Search Inspector" in large, bold, modern font
- A sleek magnifying glass icon with AI neural network nodes inside
- Gradient background from deep purple to blue
- Tagline: "See What ChatGPT Searches" in smaller text below title
- Modern, minimalist design with clean lines
- Tech-focused color scheme: purples, blues, whites
- Professional quality suitable for Chrome Web Store
- No people, just icons and text"""

generate_image(small_promo_prompt, f"{PROMO_DIR}/small-promo-440x280-original.png")
# Resize to exact dimensions if needed
if os.path.exists(f"{PROMO_DIR}/small-promo-440x280-original.png"):
    resize_image(f"{PROMO_DIR}/small-promo-440x280-original.png",
                 f"{PROMO_DIR}/small-promo-440x280.png", (440, 280))

# 2. Marquee Promotional Tile (1400x560)
print("2. MARQUEE PROMOTIONAL TILE (1400x560)")
print("-" * 80)
marquee_prompt = """Create a premium wide Chrome extension banner image, 1400x560 pixels.
The image should show:
- Left side: Large "AI Search Inspector" logo/title in modern font
- Center: Sleek illustration of a browser window with ChatGPT interface
- Right side: Magnifying glass revealing search query data and results
- Background: Smooth gradient from dark purple to blue
- Visual elements showing: search queries, JSON data snippets, API calls
- Professional, high-tech aesthetic
- Include small text: "by Franz Enzenhofer" at bottom
- Color scheme: purples, blues, teals, white accents
- Premium quality, suitable for Chrome Web Store featured section"""

generate_image(marquee_prompt, f"{PROMO_DIR}/marquee-1400x560-original.png")
if os.path.exists(f"{PROMO_DIR}/marquee-1400x560-original.png"):
    resize_image(f"{PROMO_DIR}/marquee-1400x560-original.png",
                 f"{PROMO_DIR}/marquee-1400x560.png", (1400, 560))

# 3. Screenshot 1 - Side Panel Overview (1280x800)
print("3. SCREENSHOT 1 - SIDE PANEL OVERVIEW (1280x800)")
print("-" * 80)
screenshot1_prompt = """Create a realistic Chrome browser screenshot mockup, 1280x800 pixels.
Show:
- Left: ChatGPT interface with a conversation about web search
- Right: Side panel titled "AI Search Inspector" showing captured search data
- Side panel contains:
  - "Table of Contents" section at top
  - Event #1 with timestamp
  - Search query: "latest tech news 2024"
  - Structured search results displayed below
- Modern browser UI with realistic shadows and spacing
- Professional color scheme
- Clear, readable text
- High quality mockup suitable for Chrome Web Store"""

generate_image(screenshot1_prompt, f"{SCREENSHOT_DIR}/screenshot1-original.png")
if os.path.exists(f"{SCREENSHOT_DIR}/screenshot1-original.png"):
    resize_image(f"{SCREENSHOT_DIR}/screenshot1-original.png",
                 f"{SCREENSHOT_DIR}/screenshot1-1280x800.png", (1280, 800))

# 4. Screenshot 2 - Real-time Monitoring (1280x800)
print("4. SCREENSHOT 2 - REAL-TIME MONITORING (1280x800)")
print("-" * 80)
screenshot2_prompt = """Create a Chrome browser screenshot mockup showing real-time search monitoring, 1280x800 pixels.
Show:
- ChatGPT asking a research question
- Side panel "AI Search Inspector" actively capturing multiple search queries
- Display 2-3 different search events with timestamps
- Visual indicators of live monitoring (subtle animations implied)
- Professional, clean interface
- Tech-focused color scheme
- Realistic browser chrome and window decorations"""

generate_image(screenshot2_prompt, f"{SCREENSHOT_DIR}/screenshot2-original.png")
if os.path.exists(f"{SCREENSHOT_DIR}/screenshot2-original.png"):
    resize_image(f"{SCREENSHOT_DIR}/screenshot2-original.png",
                 f"{SCREENSHOT_DIR}/screenshot2-1280x800.png", (1280, 800))

# 5. Screenshot 3 - Structured Results Display (1280x800)
print("5. SCREENSHOT 3 - STRUCTURED RESULTS (1280x800)")
print("-" * 80)
screenshot3_prompt = """Create a Chrome screenshot showing detailed search results view, 1280x800 pixels.
Focus on the side panel showing:
- Hierarchical display of search results
- Multiple result items with titles and URLs
- Clean, organized data structure
- "Copy" buttons next to results
- Professional table/list layout
- Technical but user-friendly design
- Modern UI elements
- Clear typography"""

generate_image(screenshot3_prompt, f"{SCREENSHOT_DIR}/screenshot3-original.png")
if os.path.exists(f"{SCREENSHOT_DIR}/screenshot3-original.png"):
    resize_image(f"{SCREENSHOT_DIR}/screenshot3-original.png",
                 f"{SCREENSHOT_DIR}/screenshot3-1280x800.png", (1280, 800))

# 6. Screenshot 4 - Table of Contents Navigation (1280x800)
print("6. SCREENSHOT 4 - TABLE OF CONTENTS (1280x800)")
print("-" * 80)
screenshot4_prompt = """Create a Chrome screenshot highlighting navigation features, 1280x800 pixels.
Show side panel with:
- Prominent "Table of Contents" section expanded
- List of multiple events and queries
- Clickable navigation items
- Visual hierarchy showing organization
- Clean, professional design
- Easy-to-use interface
- Modern Chrome extension styling"""

generate_image(screenshot4_prompt, f"{SCREENSHOT_DIR}/screenshot4-original.png")
if os.path.exists(f"{SCREENSHOT_DIR}/screenshot4-original.png"):
    resize_image(f"{SCREENSHOT_DIR}/screenshot4-original.png",
                 f"{SCREENSHOT_DIR}/screenshot4-1280x800.png", (1280, 800))

# 7. Screenshot 5 - Raw JSON View (1280x800)
print("7. SCREENSHOT 5 - RAW JSON VIEW (1280x800)")
print("-" * 80)
screenshot5_prompt = """Create a Chrome screenshot showing advanced technical view, 1280x800 pixels.
Display:
- Side panel with "Show Raw JSON" feature active
- Formatted JSON data displayed in code style
- Syntax highlighting for JSON (keys in one color, values in another)
- Professional code editor aesthetic
- Technical but clean presentation
- For developers and power users
- Dark theme or professional light theme"""

generate_image(screenshot5_prompt, f"{SCREENSHOT_DIR}/screenshot5-original.png")
if os.path.exists(f"{SCREENSHOT_DIR}/screenshot5-original.png"):
    resize_image(f"{SCREENSHOT_DIR}/screenshot5-original.png",
                 f"{SCREENSHOT_DIR}/screenshot5-1280x800.png", (1280, 800))

print("=" * 80)
print("IMAGE GENERATION COMPLETE!")
print("=" * 80)
print(f"\nPromo images saved to: {PROMO_DIR}/")
print(f"Screenshots saved to: {SCREENSHOT_DIR}/")
