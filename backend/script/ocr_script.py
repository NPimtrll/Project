from flask import Flask, request, jsonify
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import os

app = Flask(__name__)

UPLOAD_FOLDER = 'E:/Project/backend/uploads/photo'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def pdf_to_text(pdf_data):
    try:
        pdf_document = fitz.open(stream=pdf_data, filetype="pdf")
        text = ""
        image_paths = []

        for page_number in range(len(pdf_document)):
            print(f"Processing page {page_number + 1}...")
            page = pdf_document.load_page(page_number)
            pix = page.get_pixmap()
            img = Image.open(io.BytesIO(pix.tobytes()))

            # Save the image to the uploads directory
            image_path = os.path.join(UPLOAD_FOLDER, f'page_{page_number + 1}.png')
            img.save(image_path)
            image_paths.append(image_path)

            # Perform OCR on the image
            text += pytesseract.image_to_string(img)

        return text

    except Exception as e:
        print(f"An error occurred: {e}")
        return None

@app.route('/ocr', methods=['POST'])
def ocr():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and file.filename.lower().endswith('.pdf'):
        try:
            pdf_data = io.BytesIO(file.read())
            text = pdf_to_text(pdf_data)
            if text:
                return jsonify({'text': text})
            else:
                return jsonify({'error': 'Failed to extract text'}), 500
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return jsonify({'error': 'Invalid file type'}), 400

if __name__ == "__main__":
    app.run(debug=True)
