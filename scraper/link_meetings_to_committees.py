# -*- coding: utf-8 -*-
"""
Link existing meetings to their committees
"""
from utils.db import get_supabase_client
import logging
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def link_meetings_to_committees():
    """
    Update meetings with their committee_id based on title matching
    """
    client = get_supabase_client()

    # Get all committees
    committees_response = client.table('committees').select('id, name').execute()
    committees = {c['name']: c['id'] for c in committees_response.data}

    logger.info(f"Found {len(committees)} committees")

    # Get all meetings
    meetings_response = client.table('meetings').select('id, title, meeting_type').execute()
    meetings = meetings_response.data

    logger.info(f"Found {len(meetings)} meetings")

    updated_count = 0
    for meeting in meetings:
        title = meeting.get('title', '')

        # Find which committee this meeting belongs to
        committee_id = None
        for committee_name, c_id in committees.items():
            if committee_name in title:
                committee_id = c_id
                break

        if committee_id:
            try:
                # Update meeting with committee_id
                client.table('meetings').update({
                    'committee_id': committee_id
                }).eq('id', meeting['id']).execute()

                logger.info(f"✓ Linked: {title[:50]}... → {committee_name}")
                updated_count += 1
            except Exception as e:
                logger.error(f"Error linking meeting {title}: {e}")
        else:
            logger.debug(f"  No committee found for: {title}")

    logger.info(f"\n=== Linking complete ===")
    logger.info(f"Linked {updated_count}/{len(meetings)} meetings to committees")

if __name__ == "__main__":
    link_meetings_to_committees()
