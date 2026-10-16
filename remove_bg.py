from PIL import Image
import numpy as np

def remove_dark_background(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    rgb = data[:, :, :3]
    a = data[:, :, 3]
    
    # Calculate luminance/brightness of each pixel
    luminance = 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]
    
    min_luma = 25
    max_luma = 90
    
    new_alpha = np.clip((luminance - min_luma) * 255.0 / (max_luma - min_luma), 0, 255).astype(np.uint8)
    
    # If a pixel was fully transparent before, keep it transparent
    final_alpha = np.minimum(a, new_alpha)
    
    rgba = np.dstack((rgb, final_alpha))
    
    out_img = Image.fromarray(rgba, "RGBA")
    out_img.save(output_path)
    print("Saved transparent logo to", output_path)

remove_dark_background(
    r"C:\Users\VED SUTARIYA\.gemini\antigravity\brain\1bb97216-9a0a-420d-88e6-29580aa99d16\media__1784616859625.png",
    r"D:\ShipNova\frontend\public\logo.png"
)
