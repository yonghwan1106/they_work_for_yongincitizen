# -*- coding: utf-8 -*-
"""
Quick update with latest cafe posts
10월 17일 이후 최신 글 업데이트
"""
import sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

from utils.db import get_supabase_client
from datetime import datetime

# 최신 글 (수동으로 확인하여 입력)
latest_posts = [
    {
        'id': '585',
        'title': '용인시의회 행정사무감사 대비, 용인시 예산 분석 세미나 진행',
        'author': '하이젠버그',
        'post_date': '2025.10.28',
        'views': '5',
        'url': 'https://cafe.naver.com/yonginblue/585',
        'is_notice': False,
    },
    {
        'id': '584',
        'title': '용인블루, 용인시 에너지 주권(主權) 확보할 \'용인에너지공사, YECo\' 설립 공식 제안',
        'author': '하이젠버그',
        'post_date': '2025.10.16',
        'views': '25',
        'url': 'https://cafe.naver.com/yonginblue/584',
        'is_notice': True,
    },
    {
        'id': '583',
        'title': '[용인블루 재반박 성명서] 박은선 위원장의 \'책임 회피성 변명\', 본질을 흐리는 언론 기만 행위',
        'author': '하이젠버그',
        'post_date': '2025.10.16',
        'views': '18',
        'url': 'https://cafe.naver.com/yonginblue/583',
        'is_notice': False,
    },
    {
        'id': '582',
        'title': '[보도자료] 용인시, 5년간 \'쌈짓돈\'처럼 쓴 특별교부세 500억 원… "목적 잃고 선심성 사업에 편중"',
        'author': '하이젠버그',
        'post_date': '2025.10.16',
        'views': '28',
        'url': 'https://cafe.naver.com/yonginblue/582',
        'is_notice': True,
    },
    {
        'id': '580',
        'title': '[보도자료] 박은선 용인시의회 윤리특별위원장 직무유기 혐의로 형사 고발',
        'author': '하이젠버그',
        'post_date': '2025.10.13',
        'views': '95',
        'url': 'https://cafe.naver.com/yonginblue/580',
        'is_notice': True,
    },
]

def update():
    supabase = get_supabase_client()

    print("Updating cafe posts...")

    try:
        for post in latest_posts:
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

            print(f"✓ {post['title'][:50]}...")

        print(f"\n성공: {len(latest_posts)}개 글 업데이트 완료!")

    except Exception as e:
        print(f"오류: {e}")

if __name__ == "__main__":
    update()
