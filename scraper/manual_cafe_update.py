# -*- coding: utf-8 -*-
"""
Manual cafe post updater
용인블루 카페의 최신 글을 수동으로 입력하여 업데이트하는 스크립트
"""
import sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

from utils.db import get_supabase_client
from datetime import datetime

def add_cafe_posts_manually():
    """
    수동으로 카페 글을 추가/업데이트
    """
    print("=" * 60)
    print("용인블루 카페 글 수동 업데이트")
    print("=" * 60)
    print()
    print("최신 글 정보를 입력하세요 (입력 완료 시 제목에 'q' 입력)")
    print()

    posts = []

    while True:
        print(f"\n[글 {len(posts) + 1}]")

        title = input("제목: ").strip()
        if title.lower() == 'q':
            break

        article_id = input("글 번호 (URL에서 숫자): ").strip()
        author = input("작성자 (Enter=하이젠버그): ").strip() or "하이젠버그"
        post_date = input("날짜 (YYYY.MM.DD, Enter=오늘): ").strip()

        if not post_date:
            post_date = datetime.now().strftime('%Y.%m.%d')

        views = input("조회수 (Enter=0): ").strip() or "0"
        is_notice_input = input("공지사항? (y/n, Enter=n): ").strip().lower()
        is_notice = is_notice_input == 'y'

        url = f"https://cafe.naver.com/yonginblue/{article_id}"

        post = {
            'id': article_id,
            'title': title,
            'author': author,
            'post_date': post_date,
            'views': views,
            'url': url,
            'is_notice': is_notice,
        }

        posts.append(post)
        print(f"✓ 추가됨: {title}")

    if not posts:
        print("\n입력된 글이 없습니다.")
        return

    print(f"\n총 {len(posts)}개의 글을 업데이트하시겠습니까? (y/n): ", end='')
    confirm = input().strip().lower()

    if confirm != 'y':
        print("취소됨")
        return

    # Upload to Supabase
    supabase = get_supabase_client()

    try:
        for post in posts:
            supabase.table('cafe_posts').upsert({
                'id': post['id'],
                'title': post['title'],
                'author': post['author'],
                'post_date': post['post_date'],
                'views': post['views'],
                'url': post['url'],
                'is_notice': post['is_notice'],
                'updated_at': datetime.now().isoformat()
            }).execute()

        print(f"\n✓ {len(posts)}개의 글이 성공적으로 업데이트되었습니다!")

    except Exception as e:
        print(f"\n✗ 오류 발생: {e}")

if __name__ == "__main__":
    add_cafe_posts_manually()
