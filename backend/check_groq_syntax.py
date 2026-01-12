
try:
    from app.services.groq_client import GroqClient
    print("Import successful")
    client = GroqClient()
    print("Instantiation successful")
except Exception as e:
    print(f"Error: {e}")
