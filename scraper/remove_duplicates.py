# -*- coding: utf-8 -*-
"""
Remove duplicate councillors from database
"""
import logging
from config import SUPABASE_URL, SUPABASE_KEY
from supabase import create_client, Client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_supabase_client() -> Client:
    """Create Supabase client"""
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def find_duplicates():
    """Find duplicate councillors by name"""
    supabase = get_supabase_client()

    # Get all councillors
    response = supabase.table('councillors').select('*').execute()
    councillors = response.data

    logger.info(f"Total councillors in database: {len(councillors)}")

    # Group by name
    name_groups = {}
    for c in councillors:
        name = c['name']
        if name not in name_groups:
            name_groups[name] = []
        name_groups[name].append(c)

    # Find duplicates
    duplicates = {name: group for name, group in name_groups.items() if len(group) > 1}

    if duplicates:
        logger.warning(f"Found {len(duplicates)} councillors with duplicates:")
        for name, group in duplicates.items():
            logger.warning(f"  {name}: {len(group)} entries")
            for c in group:
                logger.warning(f"    - ID: {c['id']}, District: {c.get('district', 'N/A')}, Party: {c.get('party', 'N/A')}, Created: {c.get('created_at', 'N/A')}")
    else:
        logger.info("No duplicates found")

    return duplicates

def remove_duplicates():
    """Remove duplicate councillors, keeping the most recent one"""
    supabase = get_supabase_client()
    duplicates = find_duplicates()

    if not duplicates:
        logger.info("No duplicates to remove")
        return

    removed_count = 0

    for name, group in duplicates.items():
        # Sort by created_at (most recent first)
        sorted_group = sorted(group, key=lambda x: x.get('created_at', ''), reverse=True)

        # Keep the first one (most recent), delete the rest
        keep = sorted_group[0]
        to_delete = sorted_group[1:]

        logger.info(f"Processing {name}:")
        logger.info(f"  Keeping: ID {keep['id']} (Created: {keep.get('created_at', 'N/A')})")

        for c in to_delete:
            try:
                # Delete the duplicate
                supabase.table('councillors').delete().eq('id', c['id']).execute()
                logger.info(f"  Deleted: ID {c['id']} (Created: {c.get('created_at', 'N/A')})")
                removed_count += 1
            except Exception as e:
                logger.error(f"  Error deleting ID {c['id']}: {e}")

    logger.info(f"Successfully removed {removed_count} duplicate entries")

    # Verify
    logger.info("\nVerifying after cleanup:")
    find_duplicates()

def check_database_stats():
    """Show database statistics"""
    supabase = get_supabase_client()

    # Count total
    response = supabase.table('councillors').select('id', count='exact').execute()
    total = response.count

    # Count active
    response = supabase.table('councillors').select('id', count='exact').eq('is_active', True).execute()
    active = response.count

    # Count by party
    response = supabase.table('councillors').select('party').eq('is_active', True).execute()
    parties = {}
    for c in response.data:
        party = c['party'] or '무소속'
        parties[party] = parties.get(party, 0) + 1

    logger.info("\n=== Database Statistics ===")
    logger.info(f"Total councillors: {total}")
    logger.info(f"Active councillors: {active}")
    logger.info(f"Inactive councillors: {total - active}")
    logger.info(f"\nBy party:")
    for party, count in sorted(parties.items(), key=lambda x: -x[1]):
        logger.info(f"  {party}: {count}")

if __name__ == "__main__":
    logger.info("=== Checking for duplicate councillors ===\n")

    # Show current stats
    check_database_stats()

    # Find and show duplicates
    logger.info("\n=== Finding duplicates ===")
    duplicates = find_duplicates()

    if duplicates:
        # Ask for confirmation
        print("\n⚠️  WARNING: This will delete duplicate entries!")
        print("The most recent entry for each councillor will be kept.")
        confirm = input("\nDo you want to proceed? (yes/no): ")

        if confirm.lower() == 'yes':
            logger.info("\n=== Removing duplicates ===")
            remove_duplicates()

            # Show updated stats
            logger.info("\n=== Updated Statistics ===")
            check_database_stats()
        else:
            logger.info("Operation cancelled")
    else:
        logger.info("\n✅ No duplicates found. Database is clean!")
