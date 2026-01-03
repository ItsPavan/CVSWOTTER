import sys
import os

# Add current directory to path so we can import 'app'
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

print("Attempting to import app.main...")
try:
    from app import main
    print("SUCCESS: app.main imported successfully.")
except Exception as e:
    print(f"FAILURE: {e}")
    import traceback
    traceback.print_exc()
