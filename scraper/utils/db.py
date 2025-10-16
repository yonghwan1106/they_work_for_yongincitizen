"""
Database utility functions for Supabase operations
"""
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_KEY
import logging

logger = logging.getLogger(__name__)

def get_supabase_client() -> Client:
    """Create and return Supabase client"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Supabase credentials not found in environment variables")

    return create_client(SUPABASE_URL, SUPABASE_KEY)

def upsert_councillors(councillors_data: list) -> dict:
    """
    Insert or update councillor data in database

    Args:
        councillors_data: List of councillor dictionaries

    Returns:
        Supabase response
    """
    try:
        client = get_supabase_client()

        # Filter out fields that don't exist in the database schema
        allowed_fields = {'name', 'name_en', 'party', 'district', 'photo_url',
                         'term_number', 'is_active', 'email', 'phone',
                         'office_location', 'profile_url'}

        cleaned_data = []
        for councillor in councillors_data:
            # Keep only allowed fields
            cleaned = {k: v for k, v in councillor.items() if k in allowed_fields}
            cleaned_data.append(cleaned)

            # Log position for future use (could be stored in councillor_committees table)
            if 'position' in councillor:
                logger.debug(f"{councillor.get('name')}: position={councillor['position']}")

        response = client.table('councillors').upsert(cleaned_data).execute()
        logger.info(f"Upserted {len(cleaned_data)} councillors")
        return response
    except Exception as e:
        logger.error(f"Error upserting councillors: {e}")
        raise

def upsert_meetings(meetings_data: list) -> dict:
    """
    Insert or update meeting data in database

    Args:
        meetings_data: List of meeting dictionaries

    Returns:
        Supabase response
    """
    try:
        client = get_supabase_client()
        response = client.table('meetings').upsert(meetings_data).execute()
        logger.info(f"Upserted {len(meetings_data)} meetings")
        return response
    except Exception as e:
        logger.error(f"Error upserting meetings: {e}")
        raise

def upsert_bills(bills_data: list) -> dict:
    """
    Insert or update bill data in database

    Args:
        bills_data: List of bill dictionaries

    Returns:
        Supabase response
    """
    try:
        client = get_supabase_client()
        response = client.table('bills').upsert(bills_data).execute()
        logger.info(f"Upserted {len(bills_data)} bills")
        return response
    except Exception as e:
        logger.error(f"Error upserting bills: {e}")
        raise

def get_councillor_by_name(name: str) -> dict:
    """
    Get councillor by name

    Args:
        name: Councillor name

    Returns:
        Councillor data or None
    """
    try:
        client = get_supabase_client()
        response = client.table('councillors').select('*').eq('name', name).execute()

        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        logger.error(f"Error getting councillor: {e}")
        raise
