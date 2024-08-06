import fitz  # PyMuPDF
import os
from PIL import Image

def pdf_to_images(pdf_path, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    pdf_document = fitz.open(pdf_path)
    
    for page_number in range(len(pdf_document)):
        page = pdf_document.load_page(page_number)
        pix = page.get_pixmap()
        img_path = os.path.join(output_dir, f"page_{page_number + 1}.png")
        pix.save(img_path)
        print(f"Saved image: {img_path}")

if __name__ == "__main__":
    import sys
    pdf_path = sys.argv[1]
    output_dir = "backend/uploads/photo"  # Path where images will be saved
    pdf_to_images(pdf_path, output_dir)
