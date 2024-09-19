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
    prompt_template = ("Correct the spelling errors in the following message "
                       "and send only the corrected text, no additional text: {text}")

    # แบ่งข้อความเป็นส่วนย่อย ๆ เพื่อไม่ให้เกินขนาดการตอบสนองของ LLM
    max_chunk_size = 1000  # ปรับขนาดได้ตามเหมาะสม
    chunks = [text[i:i + max_chunk_size] for i in range(0, len(text), max_chunk_size)]

    corrected_text = ""
    try:
        for chunk in chunks:
            prompt = prompt_template.format(text=chunk)
            response = client.chat_completion(
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,
                stream=False
            )
            # รวมข้อความที่แก้ไขแล้ว
            corrected_text += response.choices[0].message['content']
        return corrected_text
    except Exception as e:
        print(f"An error occurred during spell check: {e}")
        return text  # ถ้าเกิดข้อผิดพลาด ให้คืนข้อความต้นฉบับแทน
