from flask import Flask, request, jsonify
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import os
from huggingface_hub import InferenceClient

app = Flask(__name__)

UPLOAD_FOLDER = 'C:/Users/msi01/Desktop/Project/backend/uploads/photo'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

client = InferenceClient(
    "meta-llama/Meta-Llama-3-8B-Instruct",
    token="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",
)

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

        # Use the text as input to the LLM for spell-checking
        corrected_text = ""
        for message in client.chat_completion(
            messages=[{"role": "user", "content": f"Correct the spelling mistakes in the following text and send out only the corrected text, without any additional messages, especially not 'Here is the corrected text:'.And display all messages, even if they are duplicates.: {text}"}],
            max_tokens=500,
            stream=True,
        ):
            corrected_text += message.choices[0].delta.content

        return corrected_text
        # return text

    except Exception as e:
        print(f"An error occurred: {e}")
        return None

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

        corrected_text = pdf_to_text(pdf_data)
        if corrected_text is not None:
            return jsonify({'text': corrected_text}), 200
        else:
            return jsonify({'error': 'Failed to process the PDF file'}), 500

    except Exception as e:
        print(f"An error occurred in the /ocr endpoint: {e}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
