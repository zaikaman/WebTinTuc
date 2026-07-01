import base64
import os

def main():
    img_path = "public/screen-3.png"
    out_path = "components/offlineImage.ts"
    
    if not os.path.exists(img_path):
        print(f"Error: {img_path} not found")
        return
        
    with open(img_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
        
    data_url = f"data:image/png;base64,{encoded_string}"
    
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(f'export const OFFLINE_IMAGE_BASE64 = "{data_url}";\n')
        
    print(f"Successfully generated {out_path}")

if __name__ == "__main__":
    main()
