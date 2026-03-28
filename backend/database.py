import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from supabase import Client, create_client

# load .env from project root (this script may run with cwd=backend)
base_dir = Path(__file__).resolve().parent
project_root = base_dir.parent
dotenv_path = project_root / ".env"

load_dotenv(dotenv_path=dotenv_path)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

supabase: Optional[Client] = None

if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as exc:
        print(
            f"WARNING: Could not create Supabase client ({exc}). "
            "Running in local demo mode without a database."
        )
        supabase = None
else:
    print(
        "INFO: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set. "
        "API runs in local demo mode (in-memory sample data)."
    )


def is_supabase_available() -> bool:
    """Return True when Supabase client exists and a trivial query succeeds."""
    global supabase
    if supabase is None:
        return False
    try:
        supabase.table("hospitals").select("id").limit(1).execute()
        return True
    except Exception as exc:
        print(f"WARNING: Supabase check failed: {exc}. Falling back to local demo mode.")
        supabase = None
        return False
