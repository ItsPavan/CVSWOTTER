from supabase import create_client, Client, ClientOptions
from app.config import SUPABASE_URL, SUPABASE_KEY

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials are missing")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_supabase_client(token: str = None) -> Client:
    """
    Returns a Supabase client. 
    If token is provided, returns a client authenticated with that token (for RLS).
    """
    if token:
        return create_client(
            SUPABASE_URL, 
            SUPABASE_KEY, 
            options=ClientOptions(headers={"Authorization": f"Bearer {token}"})
        )
    return supabase
