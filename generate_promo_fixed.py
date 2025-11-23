#!/usr/bin/env python3
"""Regenerate promotional images with correct aspect ratios."""

import os
from google import genai
from PIL import Image

API_KEY = "AIzaSyBWra8P16hFq95avoNI8owez0agLvK23EM"
client = genai.Client(api_key=API_KEY)
PROMO_DIR = "store-assets/promotional-images"

def generate_and_crop(prompt: str, output_path: str, final_width: int, final_height: int):
    """Generate image and crop to correct aspect ratio."""
    print(f"\nGenerating: {output_path}")
    print(f"Target size: {final_width}x{final_height}")
    print(f"Prompt: {prompt}\n")

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

                # Now open with PIL to get proper Image object
                image = Image.open(temp_path)

                # Get original size (likely 1024x1024)
                orig_width, orig_height = image.size
                print(f"Generated: {orig_width}x{orig_height}")

                # Calculate target aspect ratio
                target_ratio = final_width / final_height
                orig_ratio = orig_width / orig_height

                # Crop to correct aspect ratio first
                if orig_ratio > target_ratio:
                    # Image is wider than target, crop width
                    new_width = int(orig_height * target_ratio)
                    left = (orig_width - new_width) // 2
                    image_cropped = image.crop((left, 0, left + new_width, orig_height))
                else:
                    # Image is taller than target, crop height
                    new_height = int(orig_width / target_ratio)
                    top = (orig_height - new_height) // 2
                    image_cropped = image.crop((0, top, orig_width, top + new_height))

                # Now resize to exact dimensions
                image_final = image_cropped.resize((final_width, final_height), Image.Resampling.LANCZOS)
                image_final.save(output_path)

                # Clean up temp file
                if os.path.exists(temp_path):
                    os.remove(temp_path)

                print(f"✓ Saved: {output_path} ({final_width}x{final_height})\n")
                return True

    except Exception as e:
        print(f"✗ Error: {e}\n")
        return False

    return False

os.makedirs(PROMO_DIR, exist_ok=True)

print("=" * 80)
print("REGENERATING PROMOTIONAL IMAGES WITH CORRECT ASPECT RATIOS")
print("=" * 80)

# Small Promotional Tile (440x280) - aspect ratio 1.57:1
print("\n1. SMALL PROMOTIONAL TILE (440x280, ratio 1.57:1)")
print("-" * 80)
small_promo_prompt = """Create a professional wide rectangular banner for a Chrome extension, aspect ratio 1.57:1.
Design specifications:
- Title "AI Search Inspector" in large, bold, modern sans-serif font
- Sleek magnifying glass icon with AI neural network nodes glowing inside
- Gradient background flowing from deep purple (#764ba2) to royal blue (#667eea)
- Subtitle "See What ChatGPT Searches" in clean, readable font
- Modern tech aesthetic with clean lines and professional spacing
- Color palette: purples, blues, white text
- No people, only icons and text
- Wide horizontal layout optimized for 1.57:1 aspect ratio
- Professional quality for Chrome Web Store
- Centered composition with balanced elements"""

generate_and_crop(
    small_promo_prompt,
    f"{PROMO_DIR}/small-promo-440x280.png",
    440,
    280
)

# Marquee Promotional Tile (1400x560) - aspect ratio 2.5:1
print("\n2. MARQUEE PROMOTIONAL TILE (1400x560, ratio 2.5:1)")
print("-" * 80)
marquee_prompt = """Create a premium ultra-wide banner for a Chrome extension, aspect ratio 2.5:1.
Design specifications:
- LEFT THIRD: "AI Search Inspector" title in bold modern font with magnifying glass logo
- CENTER: Sleek illustration of ChatGPT interface showing search activity
- RIGHT THIRD: Visual representation of captured search data with JSON-style text snippets
- Background: Smooth gradient from dark purple (#764ba2) to deep blue (#667eea)
- Include floating elements: search queries, data nodes, connection lines
- Bottom corner: Small text "by Franz Enzenhofer"
- Professional high-tech aesthetic with depth and dimension
- Color scheme: purples, blues, teals, white highlights
- Ultra-wide 2.5:1 horizontal layout with balanced composition
- Premium quality suitable for Chrome Web Store featured carousel
- No people, only technical/UI elements
- Modern, sleek, professional design"""

generate_and_crop(
    marquee_prompt,
    f"{PROMO_DIR}/marquee-1400x560.png",
    1400,
    560
)

print("=" * 80)
print("PROMOTIONAL IMAGES REGENERATED!")
print("=" * 80)
print(f"\nImages saved to: {PROMO_DIR}/")
print("\nPlease check the images - they should now have correct proportions!")
