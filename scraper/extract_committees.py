# -*- coding: utf-8 -*-
"""
Extract committee information from existing meeting data
"""
from utils.db import get_supabase_client
import logging
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_committees_from_meetings():
    """
    Extract unique committees from meeting titles and save to database
    """
    client = get_supabase_client()

    # Get all meetings
    response = client.table('meetings').select('id, title, meeting_type').execute()
    meetings = response.data

    logger.info(f"Found {len(meetings)} meetings")

    # Extract committee names
    committee_names = set()

    for meeting in meetings:
        title = meeting.get('title', '')

        # Extract committee name from title
        # Examples: "의회운영위원회", "예산결산특별위원회", "자치행정위원회"
        # Pattern: ends with "위원회"
        if '위원회' in title:
            # Extract the committee name
            # Try to match patterns like "○○위원회", "○○특별위원회"
            match = re.search(r'([가-힣]+위원회)', title)
            if match:
                committee_name = match.group(1)
                committee_names.add(committee_name)

    logger.info(f"\nFound {len(committee_names)} unique committees:")
    for name in sorted(committee_names):
        logger.info(f"  - {name}")

    # Save committees to database
    committees_data = []
    for name in committee_names:
        # Determine committee type
        if '특별위원회' in name:
            committee_type = '특별위원회'
        else:
            committee_type = '상임위원회'

        committees_data.append({
            'name': name,
            'type': committee_type  # Fixed: use 'type' not 'committee_type'
        })

    if committees_data:
        # Insert committees (upsert to avoid duplicates)
        for committee in committees_data:
            try:
                # Check if committee already exists
                existing = client.table('committees').select('id').eq('name', committee['name']).execute()

                if not existing.data:
                    # Insert new committee
                    result = client.table('committees').insert(committee).execute()
                    logger.info(f"✓ Created committee: {committee['name']}")
                else:
                    logger.info(f"  Committee already exists: {committee['name']}")
            except Exception as e:
                logger.error(f"Error inserting committee {committee['name']}: {e}")

        logger.info(f"\n=== Committee extraction complete ===")
        logger.info(f"Total unique committees: {len(committees_data)}")
    else:
        logger.warning("No committees found")

if __name__ == "__main__":
    extract_committees_from_meetings()
