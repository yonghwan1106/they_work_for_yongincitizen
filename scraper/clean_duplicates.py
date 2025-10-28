# -*- coding: utf-8 -*-
"""
Automatically remove duplicate councillors - keep most recent
"""
import logging
import sys
from config import SUPABASE_URL, SUPABASE_KEY
from supabase import create_client

# Fix Windows encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

logging.basicConfig(
    level=logging.INFO,
    format='%(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

def clean_duplicates():
    """Remove duplicates automatically"""
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Get all councillors
    response = supabase.table('councillors').select('*').execute()
    councillors = response.data

    logger.info(f"Total councillors: {len(councillors)}")

    # Group by name
    name_groups = {}
    for c in councillors:
        name = c['name']
        if name not in name_groups:
            name_groups[name] = []
        name_groups[name].append(c)

    # Find and remove duplicates
    duplicates = {name: group for name, group in name_groups.items() if len(group) > 1}

    if not duplicates:
        logger.info("No duplicates found!")
        return

    logger.info(f"\nFound {len(duplicates)} councillors with duplicates")
    logger.info(f"Total duplicate entries to remove: {sum(len(group) - 1 for group in duplicates.values())}")

    removed_count = 0

    for name, group in duplicates.items():
        # Sort by created_at (most recent first)
        sorted_group = sorted(group, key=lambda x: x.get('created_at', ''), reverse=True)

        # Keep first (most recent), delete rest
        keep = sorted_group[0]
        to_delete = sorted_group[1:]

        logger.info(f"\n{name}: Keeping 1, removing {len(to_delete)}")

        for c in to_delete:
            try:
                supabase.table('councillors').delete().eq('id', c['id']).execute()
                removed_count += 1
            except Exception as e:
                logger.error(f"  Error: {e}")

    logger.info(f"\n=== COMPLETE ===")
    logger.info(f"Removed {removed_count} duplicates")

    # Final count
    response = supabase.table('councillors').select('id', count='exact').execute()
    logger.info(f"Final count: {response.count} councillors")

if __name__ == "__main__":
    clean_duplicates()
