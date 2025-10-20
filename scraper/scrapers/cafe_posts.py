# -*- coding: utf-8 -*-
"""
Scraper for Naver Cafe posts from 용인블루
https://cafe.naver.com/yonginblue
"""
import requests
from bs4 import BeautifulSoup
import logging
import time
import re
from datetime import datetime
from config import REQUEST_TIMEOUT, REQUEST_DELAY, USER_AGENT
from utils.db import get_supabase_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CAFE_URL = "https://cafe.naver.com/ArticleList.nhn?search.clubid=30322346&search.menuid=14&search.boardtype=L"

def scrape_cafe_posts(max_posts=10):
    """
    Scrape recent posts from Naver Cafe 용인블루

    Args:
        max_posts: Maximum number of posts to scrape (default: 10)

    Returns:
        List of post dictionaries
    """
    logger.info(f"Scraping cafe posts from 용인블루")

    headers = {
        'User-Agent': USER_AGENT,
        'Referer': 'https://cafe.naver.com/yonginblue'
    }
    posts = []

    try:
        logger.info(f"Fetching: {CAFE_URL}")
        response = requests.get(CAFE_URL, headers=headers, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        response.encoding = 'utf-8'

        soup = BeautifulSoup(response.text, 'html.parser')

        # 네이버 카페는 iframe을 사용하므로 iframe 내부의 content를 찾아야 함
        # iframe의 src URL을 찾아서 다시 요청
        iframe = soup.find('iframe', {'id': 'cafe_main'})
        if iframe and iframe.get('src'):
            iframe_url = iframe['src']
            if not iframe_url.startswith('http'):
                iframe_url = f"https://cafe.naver.com{iframe_url}"

            logger.info(f"Found iframe URL: {iframe_url}")
            response = requests.get(iframe_url, headers=headers, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            response.encoding = 'utf-8'
            soup = BeautifulSoup(response.text, 'html.parser')

        # 게시글 목록 테이블 찾기
        article_list = soup.find('table', class_='board-list') or soup.find('table', {'class': re.compile('article-board')})

        if not article_list:
            logger.warning("Could not find article list table")
            logger.debug(f"Page content preview: {soup.prettify()[:500]}")
            return []

        rows = article_list.find_all('tr')
        logger.info(f"Found {len(rows)} rows in cafe posts table")

        for row in rows[:max_posts]:
            try:
                post = extract_post_info(row)
                if post and post.get('id'):
                    posts.append(post)
                    logger.info(f"Found: {post['title'][:50]}... (ID: {post['id']})")
            except Exception as e:
                logger.warning(f"Error parsing post row: {e}")
                continue

        logger.info(f"Total cafe posts scraped: {len(posts)}")
        return posts

    except requests.RequestException as e:
        logger.error(f"Error fetching cafe posts: {e}")
        return []
    except Exception as e:
        logger.error(f"Error parsing cafe posts: {e}")
        return []

def extract_post_info(row):
    """
    Extract post information from table row

    Args:
        row: BeautifulSoup tr element

    Returns:
        Dictionary with post data
    """
    post = {}

    # 제목 링크 찾기
    title_link = row.find('a', {'class': re.compile('article')}) or row.find('a', href=re.compile('articleid'))
    if not title_link:
        return None

    # 게시글 ID 추출
    href = title_link.get('href', '')
    article_match = re.search(r'articleid=(\d+)', href)
    if not article_match:
        return None

    article_id = article_match.group(1)
    post['id'] = article_id
    post['url'] = f"https://cafe.naver.com/yonginblue/{article_id}"

    # 제목
    title_text = title_link.get_text(strip=True)
    post['title'] = title_text

    # 공지 여부 (강조 표시나 특정 클래스가 있는지 확인)
    is_notice = bool(row.find('td', class_=re.compile('notice|top'))) or bool(row.find('strong'))
    post['is_notice'] = is_notice

    # 테이블 셀 정보 추출
    cells = row.find_all('td')

    # 일반적인 네이버 카페 게시판 구조:
    # 셀 순서는 카페마다 다를 수 있으므로 패턴으로 찾기
    for cell in cells:
        cell_text = cell.get_text(strip=True)

        # 날짜 패턴 (YYYY.MM.DD)
        date_match = re.search(r'(\d{4}\.\d{1,2}\.\d{1,2})', cell_text)
        if date_match:
            post['post_date'] = date_match.group(1)

        # 조회수 패턴
        views_match = re.search(r'(\d+)', cell_text)
        if views_match and 'views' not in post:
            # 날짜가 아니고 숫자만 있으면 조회수로 간주
            if not date_match:
                post['views'] = views_match.group(1)

    # 작성자 (닉네임)
    author_elem = row.find('td', class_=re.compile('author|writer|name')) or row.find('a', class_=re.compile('m-tcol-c'))
    if author_elem:
        post['author'] = author_elem.get_text(strip=True)

    # 기본값 설정
    if 'post_date' not in post:
        post['post_date'] = datetime.now().strftime('%Y.%m.%d')
    if 'views' not in post:
        post['views'] = '0'
    if 'author' not in post:
        post['author'] = '알 수 없음'

    return post

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
    """Main function to scrape and save cafe posts"""
    try:
        posts = scrape_cafe_posts(max_posts=15)

        if posts:
            upsert_cafe_posts(posts)
            logger.info(f"Successfully scraped and saved {len(posts)} cafe posts")
        else:
            logger.warning("No cafe posts scraped")

    except Exception as e:
        logger.error(f"Failed to scrape cafe posts: {e}")
        raise

if __name__ == "__main__":
    run()
