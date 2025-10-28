# -*- coding: utf-8 -*-
"""
Fix foreign key references and remove remaining duplicates
"""
import logging
import sys
from config import SUPABASE_URL, SUPABASE_KEY
from supabase import create_client

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

def fix_and_clean():
    """Update foreign keys and remove duplicates"""
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Get all councillors
    response = supabase.table('councillors').select('*').execute()
    councillors = response.data

    # Find duplicates
    name_groups = {}
    for c in councillors:
        name = c['name']
        if name not in name_groups:
            name_groups[name] = []
        name_groups[name].append(c)

    duplicates = {name: group for name, group in name_groups.items() if len(group) > 1}

    if not duplicates:
        logger.info("No duplicates remaining!")
        return

    logger.info(f"Found {len(duplicates)} councillors with remaining duplicates")

    for name, group in duplicates.items():
        sorted_group = sorted(group, key=lambda x: x.get('created_at', ''), reverse=True)
        keep_id = sorted_group[0]['id']
        old_ids = [c['id'] for c in sorted_group[1:]]

        logger.info(f"\n{name}: Updating references to keep {keep_id}")

        # Update bills
        for old_id in old_ids:
            try:
                supabase.table('bills').update({'proposer_id': keep_id}).eq('proposer_id', old_id).execute()
                logger.info(f"  Updated bills from {old_id}")
            except Exception as e:
                logger.error(f"  Error updating bills: {e}")

        # Update speeches
        for old_id in old_ids:
            try:
                supabase.table('speeches').update({'councillor_id': keep_id}).eq('councillor_id', old_id).execute()
                logger.info(f"  Updated speeches from {old_id}")
            except Exception as e:
                logger.error(f"  Error updating speeches: {e}")

        # Update votes
        for old_id in old_ids:
            try:
                supabase.table('votes').update({'councillor_id': keep_id}).eq('councillor_id', old_id).execute()
                logger.info(f"  Updated votes from {old_id}")
            except Exception as e:
                logger.error(f"  Error updating votes: {e}")

        # Now delete old records
        for old_id in old_ids:
            try:
                supabase.table('councillors').delete().eq('id', old_id).execute()
                logger.info(f"  Deleted {old_id}")
            except Exception as e:
                logger.error(f"  Error deleting: {e}")

    # Final count
    response = supabase.table('councillors').select('id', count='exact').execute()
    logger.info(f"\n=== COMPLETE ===")
    logger.info(f"Final count: {response.count} councillors")

if __name__ == "__main__":
    fix_and_clean()
