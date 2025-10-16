# -*- coding: utf-8 -*-
"""
Update existing meetings with full transcript text
"""
from utils.db import get_supabase_client
from scrapers.meetings import scrape_transcript_text
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def update_meeting_transcripts(limit=5):
    """
    Update meetings that don't have transcript text yet

    Args:
        limit: Maximum number of meetings to update (default: 5)
    """
    client = get_supabase_client()

    # Get meetings without transcript_text
    response = client.table('meetings').select('id, title, transcript_url').is_('transcript_text', 'null').limit(limit).execute()

    meetings = response.data
    logger.info(f"Found {len(meetings)} meetings without transcript text")

    updated_count = 0
    for meeting in meetings:
        try:
            logger.info(f"\nProcessing: {meeting['title']}")

            if not meeting.get('transcript_url'):
                logger.warning(f"No transcript URL for meeting: {meeting['title']}")
                continue

            # Fetch transcript text
            transcript_text = scrape_transcript_text(meeting['transcript_url'])

            if transcript_text:
                # Update in database
                client.table('meetings').update({
                    'transcript_text': transcript_text
                }).eq('id', meeting['id']).execute()

                logger.info(f"✓ Updated: {meeting['title']} ({len(transcript_text)} chars)")
                updated_count += 1
            else:
                logger.warning(f"No transcript text extracted for: {meeting['title']}")

            # Delay between requests
            time.sleep(2)

        except Exception as e:
            logger.error(f"Error updating meeting {meeting['title']}: {e}")
            continue

    logger.info(f"\n=== Update complete ===")
    logger.info(f"Updated {updated_count}/{len(meetings)} meetings")

if __name__ == "__main__":
    # Update all meetings without transcript text
    update_meeting_transcripts(limit=30)
