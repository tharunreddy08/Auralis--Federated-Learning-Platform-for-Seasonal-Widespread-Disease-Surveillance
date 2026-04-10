"""
Database configuration - Always using local demo mode
"""

# Always use local demo mode - no external database dependencies
supabase = None

def is_supabase_available() -> bool:
    """Always return False to use local demo mode"""
    return False
