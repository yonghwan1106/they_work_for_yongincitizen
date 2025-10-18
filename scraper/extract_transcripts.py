# -*- coding: utf-8 -*-
"""
Extract full transcript text from meetings
Phase 2 準備: 회의록 전문 텍스트 추출

Usage:
    python extract_transcripts.py --limit 10
"""
import argparse
import logging
import time
from scrapers.meetings import scrape_transcript_text
from utils.db import get_supabase_client

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def extract_all_transcripts(limit=None, force=False):
    """
    Extract full transcript text for all meetings that don't have it yet

    Args:
        limit: Maximum number of transcripts to extract (None = all)
        force: Re-extract even if transcript_text already exists
    """
    supabase = get_supabase_client()

    # Query meetings without transcript text
    query = supabase.from_('meetings').select('id, title, transcript_url, transcript_text')

    if not force:
        query = query.is_('transcript_text', 'null')

    if limit:
        query = query.limit(limit)

    result = query.execute()
    meetings = result.data

    if not meetings:
        logger.info("No meetings found that need transcript extraction")
        return

    logger.info(f"Found {len(meetings)} meetings to process")

    success_count = 0
    error_count = 0

    for i, meeting in enumerate(meetings, 1):
        meeting_id = meeting['id']
        title = meeting['title']
        transcript_url = meeting['transcript_url']

        logger.info(f"[{i}/{len(meetings)}] Processing: {title}")

        if not transcript_url:
            logger.warning(f"  ⚠️ No transcript URL for: {title}")
            error_count += 1
            continue

        try:
            # Extract transcript text
            logger.info(f"  📄 Fetching from: {transcript_url}")
            transcript_text = scrape_transcript_text(transcript_url)

            if not transcript_text:
                logger.warning(f"  ⚠️ No text extracted from: {transcript_url}")
                error_count += 1
                continue

            # Update database
            supabase.from_('meetings').update({
                'transcript_text': transcript_text
            }).eq('id', meeting_id).execute()

            logger.info(f"  ✅ Extracted {len(transcript_text)} characters")
            success_count += 1

            # Rate limiting
            time.sleep(2)  # 2초 대기 (서버 부하 방지)

        except Exception as e:
            logger.error(f"  ❌ Error processing {title}: {e}")
            error_count += 1
            continue

    logger.info("=" * 60)
    logger.info(f"Extraction complete!")
    logger.info(f"  ✅ Success: {success_count}")
    logger.info(f"  ❌ Errors: {error_count}")
    logger.info(f"  📊 Total: {len(meetings)}")
    logger.info("=" * 60)


def main():
    parser = argparse.ArgumentParser(description='Extract meeting transcript text')
    parser.add_argument(
        '--limit',
        type=int,
        default=None,
        help='Maximum number of transcripts to extract (default: all)'
    )
    parser.add_argument(
        '--force',
        action='store_true',
        help='Re-extract even if transcript already exists'
    )

    args = parser.parse_args()

    logger.info("Starting transcript extraction...")
    logger.info(f"  Limit: {args.limit if args.limit else 'No limit'}")
    logger.info(f"  Force re-extract: {args.force}")

    extract_all_transcripts(limit=args.limit, force=args.force)


if __name__ == "__main__":
    main()
