from flask import Flask, request, jsonify
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import os
from llm import spell_check
from pdf_to_image import pdf_to_images  # Import pdf_to_images function

app = Flask(__name__)

UPLOAD_FOLDER = 'C:/Users/msi01/Desktop/Project/backend/uploads/photo'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def pdf_to_text(pdf_data):
    try:
        pdf_path = os.path.join(UPLOAD_FOLDER, 'temp.pdf')
        with open(pdf_path, 'wb') as f:
            f.write(pdf_data)

        # แปลง PDF เป็นภาพ
        output_dir = os.path.join(UPLOAD_FOLDER, 'images')
        pdf_to_images(pdf_path, output_dir)

        text = ""
        for image_file in os.listdir(output_dir):
            if image_file.lower().endswith('.png'):
                img_path = os.path.join(output_dir, image_file)
                img = Image.open(img_path)

                # Perform OCR on the image
                ocr_result = pytesseract.image_to_string(img, config='--psm 6')
                if not ocr_result.strip():
                    print(f"OCR failed on image {image_file}. Skipping.")
                    continue

                text += ocr_result

        if not text.strip():
            print("OCR did not extract any text.")
            return None, None

        # Print OCR text before spell check
        print(f"OCR Text (Before Spell Check): {text}")

        # Call the spell_check function to correct the text
        corrected_text = spell_check(text)

        # Print corrected text
        print(f"Corrected Text: {corrected_text}")

        return text, corrected_text

    except Exception as e:
        print(f"An error occurred: {e}")
        return None, None


@app.route('/ocr', methods=['POST'])
def ocr():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Invalid file type. Only PDF files are allowed.'}), 400

        pdf_data = file.read()
        if not pdf_data:
            return jsonify({'error': 'Empty file received'}), 400

        ocr_text, corrected_text = pdf_to_text(pdf_data)
        if ocr_text is not None and corrected_text is not None:
            return jsonify({'ocrText': ocr_text, 'text': corrected_text}), 200
        else:
            return jsonify({'error': 'Failed to process the PDF file'}), 500
    
    except Exception as e:
        print(f"An error occurred in the /ocr endpoint: {e}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/spellcheck', methods=['POST'])
def spell_check_route():
    data = request.get_json()
    text = data.get('text', '')
    corrected_text = spell_check(text)
    return jsonify({'text': corrected_text})

if __name__ == "__main__":
    app.run(debug=True)
