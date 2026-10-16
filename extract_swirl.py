from PIL import Image
import numpy as np

def extract_swirl(img_path, out_path):
    # Load image and convert to RGBA
    img = Image.open(img_path).convert("RGBA")
    data = np.array(img)
    
    # We want to isolate the O. It has cyan, purple, and blue.
    # But wait, it's surrounded by white and cyan text.
    # The O is the only part with purple pixels! Let's find the bounding box of purple.
    r = data[:, :, 0]
    g = data[:, :, 1]
    b = data[:, :, 2]
    a = data[:, :, 3]
    
    # Find purple: R > 100, B > 150, G < 150 (approximate)
    is_purple = (r > 100) & (b > 150) & (g < 170)
    
    # Get rows and cols where purple is found
    rows = np.any(is_purple, axis=1)
    cols = np.any(is_purple, axis=0)
    
    if not np.any(rows):
        print("No purple found!")
        # Fallback: assume the O is in the center-ish, let's just crop by ratio
        h, w = data.shape[:2]
        # O is usually at X between 45% and 60% of the logo text width
        pass
    else:
        ymin, ymax = np.where(rows)[0][[0, -1]]
        xmin, xmax = np.where(cols)[0][[0, -1]]
        
        # The swirl is roughly circular, so its width and height should be similar.
        # We know xmin, xmax of the purple part, but the swirl also has cyan on the left.
        # Let's expand the bounding box to form a square based on the height of the swirl.
        height = ymax - ymin
        
        # Center of purple horizontally is around the right side of the swirl
        # Let's just find the bounding box of the entire swirl by checking for ANY non-dark pixel in a square region.
        # It's safer to just crop a square of size (height * 1.2) centered vertically, 
        # and horizontally starting a bit left of the purple.
        
        y_center = (ymin + ymax) // 2
        x_center = xmax - (height // 2) # purple is on the right of the O
        
        size = int(height * 1.2)
        half = size // 2
        
        box_ymin = max(0, y_center - half)
        box_ymax = min(data.shape[0], y_center + half)
        box_xmin = max(0, x_center - half)
        box_xmax = min(data.shape[1], x_center + half)
        
        swirl = data[box_ymin:box_ymax, box_xmin:box_xmax]
        
        # Mask out dark background (make transparent)
        sr = swirl[:, :, 0]
        sg = swirl[:, :, 1]
        sb = swirl[:, :, 2]
        
        # If pixel is dark (all channels < 50), make transparent
        is_dark = (sr < 40) & (sg < 40) & (sb < 40)
        swirl[is_dark, 3] = 0 # set alpha to 0
        
        out_img = Image.fromarray(swirl)
        out_img.save(out_path)
        print(f"Saved extracted swirl to {out_path}")

extract_swirl(
    r"C:\Users\VED SUTARIYA\.gemini\antigravity\brain\1bb97216-9a0a-420d-88e6-29580aa99d16\media__1784621211616.png", 
    r"D:\ShipNova\frontend\public\swirl.png"
)
