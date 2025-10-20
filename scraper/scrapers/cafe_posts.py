# -*- coding: utf-8 -*-
"""
Scraper for Naver Cafe posts from 용인블루
https://cafe.naver.com/yonginblue

Note: Naver Cafe scraping requires browser automation (Selenium/Playwright).
For now, using sample data that can be manually updated.
"""
import logging
from datetime import datetime
from utils.db import get_supabase_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def scrape_cafe_posts(max_posts=10):
    """
    Get recent posts from Naver Cafe 용인블루

    Note: Naver Cafe scraping is complex due to dynamic content and authentication.
    For now, returning sample data. Manual updates recommended through Supabase dashboard.

    Args:
        max_posts: Maximum number of posts to return (default: 10)

    Returns:
        List of post dictionaries
    """
    logger.info("Getting cafe posts from 용인블루")

    # Sample posts (these should be manually updated in Supabase or via better scraper)
    logger.warning("Using sample cafe data - implement Playwright/Selenium for auto-scraping")

    sample_posts = [
        {
            'id': '584',
            'title': '용인블루, 용인시 에너지 주권(主權) 확보할 \'용인에너지공사, YECo\' 설립 공식 제안',
            'author': '하이젠버그',
            'post_date': '2025.10.16',
            'views': '14',
            'url': 'https://cafe.naver.com/yonginblue/584',
            'is_notice': True,
        },
        {
            'id': '583',
            'title': '[용인블루 재반박 성명서] 박은선 위원장의 \'책임 회피성 변명\', 본질을 흐리는 언론 기만 행위',
            'author': '하이젠버그',
            'post_date': '2025.10.16',
            'views': '12',
            'url': 'https://cafe.naver.com/yonginblue/583',
            'is_notice': False,
        },
        {
            'id': '582',
            'title': '[보도자료] 용인시, 5년간 \'쌈짓돈\'처럼 쓴 특별교부세 500억 원… "목적 잃고 선심성 사업에 편중"',
            'author': '하이젠버그',
            'post_date': '2025.10.16',
            'views': '19',
            'url': 'https://cafe.naver.com/yonginblue/582',
            'is_notice': True,
        },
        {
            'id': '580',
            'title': '[보도자료] 박은선 용인시의회 윤리특별위원장 직무유기 혐의로 형사 고발',
            'author': '하이젠버그',
            'post_date': '2025.10.13',
            'views': '79',
            'url': 'https://cafe.naver.com/yonginblue/580',
            'is_notice': True,
        },
        {
            'id': '579',
            'title': '용인시의회 홈페이지 게시물 등록일자 소급 조작 의혹 관련, 긴급 정보공개 청구',
            'author': '하이젠버그',
            'post_date': '2025.10.11',
            'views': '48',
            'url': 'https://cafe.naver.com/yonginblue/579',
            'is_notice': True,
        },
    ]

    logger.info(f"Returning {len(sample_posts)} sample posts")
    return sample_posts[:max_posts]

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
