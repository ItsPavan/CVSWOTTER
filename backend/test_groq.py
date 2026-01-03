import os
from dotenv import load_dotenv
from groq import Groq
import json

# Force load .env from current directory
load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
print(f"DEBUG: Loaded API Key: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

if not api_key:
    print("ERROR: GROQ_API_KEY is missing!")
    exit(1)

try:
    client = Groq(api_key=api_key)
    print("DEBUG: Client initialized. Sending test request...")
    
    completion = client.chat.completions.create(
        messages=[{"role": "user", "content": "Return simple JSON: {\"status\": \"ok\"}"}],
        model="llama-3.3-70b-versatile",
        response_format={"type": "json_object"}
    )
    
    content = completion.choices[0].message.content
    print(f"SUCCESS: Raw Response: {content}")
    parsed = json.loads(content)
    print("SUCCESS: JSON Parsed correctly.")

except Exception as e:
    print(f"FAIL: Groq Error: {e}")
