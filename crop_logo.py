from PIL import Image

def crop_transparent(image_path):
    img = Image.open(image_path).convert("RGBA")
    # Get the bounding box of the non-zero alpha channel
    bbox = img.getbbox()
    if bbox:
        # Crop the image to the bounding box
        cropped_img = img.crop(bbox)
        cropped_img.save(image_path)
        print("Cropped successfully to bounding box:", bbox)
    else:
        print("Image is entirely transparent or bounding box not found.")

crop_transparent(r"D:\ShipNova\frontend\public\logo.png")
