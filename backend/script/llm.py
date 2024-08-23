from huggingface_hub import InferenceClient

client = InferenceClient(
    "meta-llama/Meta-Llama-3-8B-Instruct",
    token="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",
)

for message in client.chat_completion(
	messages=[{"role": "user", "content": "Correct the spelling mistakes in the following text and send out only the corrected text, without any additional messages, especially not 'Here is the correcte'd text: I Loev yuo"}],
	max_tokens=500,
	stream=True,
):
    print(message.choices[0].delta.content, end="")
