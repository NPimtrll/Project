# llm.py
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
import os

load_dotenv()

HF_TOKEN = os.getenv("HUGGING_FACE_API_KEY")

client = InferenceClient(
    "meta-llama/Meta-Llama-3-8B-Instruct",
    token=HF_TOKEN,
)

def spell_check(text: str) -> str:
    prompt = f"Correct the spelling errors in the following message and send only the corrected text, no additional text, especially 'This is the corrected text', and make sure to get the correct text on every line, even if it is repeated: {text}"
    try:
        response = client.chat_completion(
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,  # Adjust the max tokens if needed
            stream=False  # Get the complete response instead of streaming
        )
        corrected_text = response.choices[0].message['content']
        return corrected_text
    except Exception as e:
        print(f"An error occurred during spell check: {e}")
        return text  # Return original text if spell check fails
