
import requests
import json

# Correct payload structure based on assumption
payload = {
    "analysis_id": "test_id",
    "accepted_suggestions": [
        {
            "original": "test orig",
            "suggested": "test new",
            "reason": "because",
            "status": "accepted"
        }
    ]
}

# Payload that MIGHT be failing (e.g. from frontend)
# Frontend sends: analysis_id, accepted_suggestions (array of objects)
# Object has: original, suggested, reason, status.
# Let's try to hit it without auth first to see if it's auth related, 
# then with a dummy token to see validation error.

print("Sending Request...")
try:
    r = requests.post("http://localhost:8000/api/generate-pdf", json=payload, headers={"Authorization": "Bearer test"})
    print(f"Status: {r.status_code}")
    try:
        print(json.dumps(r.json(), indent=2))
    except:
        print(r.text)
except Exception as e:
    print(e)
