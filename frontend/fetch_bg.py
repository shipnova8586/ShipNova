import urllib.request
import re

html_url = "https://shipnova.com/contact"
req = urllib.request.Request(html_url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    # Find all CSS file links
    css_links = re.findall(r'<link[^>]+rel="stylesheet"[^>]+href="(https://cdn\.prod\.website-files\.com[^"]+\.css)"', html)
    print(f"Found {len(css_links)} CSS files.")
    
    for link in css_links:
        try:
            css = urllib.request.urlopen(urllib.request.Request(link, headers={'User-Agent': 'Mozilla/5.0'})).read().decode('utf-8')
            images = re.findall(r'url\([\'"]?(https://cdn\.prod\.website-files\.com[^\'")]+)[\'"]?\)', css)
            for img in images:
                if img.endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    print(img)
        except Exception as e:
            pass
            
    # Also look for inline background images
    inline_images = re.findall(r'background-image:[^;]*url\([\'"]?(https://[^\'")]+\.(?:jpg|jpeg|png|webp))[\'"]?\)', html)
    for img in inline_images:
        print("INLINE:", img)
except Exception as e:
    print(e)
