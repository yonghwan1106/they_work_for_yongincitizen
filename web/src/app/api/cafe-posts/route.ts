import { NextResponse } from 'next/server';
import { scrapeCafePosts } from '@/lib/scrape-cafe';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Vercel 함수 최대 실행 시간 (초)

export async function GET() {
  try {
    console.log('Starting cafe posts scraping...');
    const posts = await scrapeCafePosts();
    console.log(`Successfully scraped ${posts.length} posts`);
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching cafe posts:', error);
    
    // 에러 발생시 샘플 데이터 반환
    const fallbackPosts = [
      {
        id: '584',
        title: '용인블루, 용인시 에너지 주권(主權) 확보할 \'용인에너지공사, YECo\' 설립 공식 제안',
        author: '하이젠버그',
        date: '2025.10.16',
        views: '14',
        url: 'https://cafe.naver.com/yonginblue/584',
        isNotice: true,
      },
      {
        id: '583',
        title: '[용인블루 재반박 성명서] 박은선 위원장의 \'책임 회피성 변명\', 본질을 흐리는 언론 기만 행위',
        author: '하이젠버그',
        date: '2025.10.16',
        views: '12',
        url: 'https://cafe.naver.com/yonginblue/583',
        isNotice: false,
      },
      {
        id: '582',
        title: '[보도자료] 용인시, 5년간 \'쌈짓돈\'처럼 쓴 특별교부세 500억 원… "목적 잃고 선심성 사업에 편중"',
        author: '하이젠버그',
        date: '2025.10.16',
        views: '19',
        url: 'https://cafe.naver.com/yonginblue/582',
        isNotice: true,
      },
      {
        id: '580',
        title: '[보도자료] 박은선 용인시의회 윤리특별위원장 직무유기 혐의로 형사 고발',
        author: '하이젠버그',
        date: '2025.10.13',
        views: '79',
        url: 'https://cafe.naver.com/yonginblue/580',
        isNotice: true,
      },
      {
        id: '579',
        title: '용인시의회 홈페이지 게시물 등록일자 소급 조작 의혹 관련, 긴급 정보공개 청구',
        author: '하이젠버그',
        date: '2025.10.11',
        views: '48',
        url: 'https://cafe.naver.com/yonginblue/579',
        isNotice: true,
      },
    ];
    
    console.log('Returning fallback data due to scraping error');
    return NextResponse.json(fallbackPosts);
  }
}
