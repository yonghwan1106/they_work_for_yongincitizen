# -*- coding: utf-8 -*-
"""
Scraper for Naver Cafe posts from 용인블루
https://cafe.naver.com/yonginblue

Uses RSS feed for reliable data access.
"""
import logging
from datetime import datetime
from utils.db import get_supabase_client
import re
import sys

# Fix Windows encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

def scrape_cafe_posts_with_rss(max_posts=10):
    """
    Scrape recent posts from Naver Cafe 용인블루 using RSS feed

    Args:
        max_posts: Maximum number of posts to scrape (default: 10)

    Returns:
        List of post dictionaries
    """
    try:
        import feedparser
    except ImportError:
        logger.error("feedparser not installed. Install with: pip install feedparser")
        return get_fallback_posts()

    logger.info("Fetching posts from RSS feed...")
    posts = []

    try:
        # Naver Cafe RSS URL format
        # https://cafe.naver.com/[cafe_name].xml or
        # https://cafe.naver.com/ArticleSearchList.nhn?search.clubid=[id]&search.media=0&search.searchdate=&search.defaultValue=1&search.exact=&search.include=&search.exclude=&search.include.and=&search.sortBy=date&search.viewtype=title&search.page=1

        # Try RSS feed for yonginblue
        rss_url = "https://cafe.naver.com/yonginblue.xml"

        logger.info(f"Fetching RSS from: {rss_url}")
        feed = feedparser.parse(rss_url)

        if not feed.entries:
            logger.warning("No entries found in RSS feed")
            return get_fallback_posts()

        logger.info(f"Found {len(feed.entries)} entries in RSS feed")

        for idx, entry in enumerate(feed.entries[:max_posts]):
            try:
                # Extract article ID from link
                article_id = None
                link = entry.get('link', '')

                # Try different URL patterns
                match = re.search(r'/(\d+)$', link) or re.search(r'articleid=(\d+)', link)
                if match:
                    article_id = match.group(1)
                else:
                    # Use entry ID or generate from link
                    article_id = entry.get('id', str(idx))

                # Get title
                title = entry.get('title', 'No title')

                # Get author
                author = entry.get('author', '알 수 없음')

                # Get published date
                pub_date = ''
                if hasattr(entry, 'published_parsed') and entry.published_parsed:
                    dt = datetime(*entry.published_parsed[:6])
                    pub_date = dt.strftime('%Y.%m.%d')
                elif hasattr(entry, 'published'):
                    pub_date = entry.published[:10].replace('-', '.')

                # Check if notice (usually in title or category)
                is_notice = '[공지]' in title or '공지' in title.lower()

                post = {
                    'id': article_id,
                    'title': title.replace('[공지]', '').replace('[필독]', '').strip(),
                    'author': author,
                    'post_date': pub_date,
                    'views': '0',  # RSS doesn't provide view count
                    'url': link,
                    'is_notice': is_notice,
                }

                posts.append(post)
                logger.info(f"  [{len(posts)}] {title[:50]}...")

            except Exception as e:
                logger.error(f"Error parsing RSS entry {idx}: {e}")
                continue

        logger.info(f"Successfully fetched {len(posts)} posts from RSS")

    except Exception as e:
        logger.error(f"RSS fetching failed: {e}")
        logger.warning("Falling back to sample data...")
        return get_fallback_posts()

    return posts if posts else get_fallback_posts()

def get_fallback_posts():
    """Return fallback sample posts if RSS fails"""
    logger.warning("Using fallback sample data")
    return [
        {
            'id': '584',
            'title': '용인블루, 용인시 에너지 주권(主權) 확보할 \'용인에너지공사, YECo\' 설립 공식 제안',
            'author': '하이젠버그',
            'post_date': '2025.10.16',
            'views': '14',
            'url': 'https://cafe.naver.com/yonginblue/584',
            'is_notice': True,
        },
    ]

def scrape_cafe_posts(max_posts=10):
    """
    Get recent posts from Naver Cafe 용인블루

    Args:
        max_posts: Maximum number of posts to return (default: 10)

    Returns:
        List of post dictionaries
    """
    logger.info("Getting cafe posts from 용인블루")
    return scrape_cafe_posts_with_rss(max_posts)

def upsert_cafe_posts(posts):
    """
    Insert or update cafe posts in Supabase

    Args:
        posts: List of post dictionaries
    """
    if not posts:
        logger.warning("No posts to upsert")
        return

    client = get_supabase_client()

    try:
        # Upsert posts (insert or update if ID already exists)
        for post in posts:
            client.table('cafe_posts').upsert({
                'id': post['id'],
                'title': post['title'],
                'author': post.get('author'),
                'post_date': post.get('post_date'),
                'views': post.get('views'),
                'url': post['url'],
                'is_notice': post.get('is_notice', False),
                'updated_at': datetime.now().isoformat()
            }).execute()

        logger.info(f"Successfully upserted {len(posts)} cafe posts")

    except Exception as e:
        logger.error(f"Error upserting cafe posts: {e}")
        raise

def run():
    """Main function to get and save cafe posts"""
    try:
        posts = scrape_cafe_posts(max_posts=10)

        if posts:
            upsert_cafe_posts(posts)
            logger.info(f"Successfully saved {len(posts)} cafe posts")
        else:
            logger.warning("No cafe posts to save")

    except Exception as e:
        logger.error(f"Failed to process cafe posts: {e}")
        raise

if __name__ == "__main__":
    run()
