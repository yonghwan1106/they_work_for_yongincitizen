import { NextResponse } from 'next/server';
import { pocketbase } from '@/lib/pocketbase/client';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

export async function GET() {
  try {
    // Fetch cafe posts from PocketBase, ordered by scraped_at DESC
    const posts = await pocketbase.collection('cafe_posts').getList(1, 10, {
      sort: '-scraped_at'
    }).then(result => result.items).catch((err) => {
      // Collection doesn't exist or is empty
      console.log('cafe_posts collection not found or empty:', err.message);
      return [];
    });

    if (!posts || posts.length === 0) {
      console.log('No posts found in database');
      // Return empty array if no posts (scraper hasn't run yet)
      return NextResponse.json([]);
    }

    // Transform data to match frontend expectations
    const transformedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      author: post.author || '알 수 없음',
      date: post.post_date || '',
      views: post.views || '0',
      url: post.url,
      isNotice: post.is_notice || false,
    }));

    console.log(`Successfully fetched ${transformedPosts.length} posts from database`);
    return NextResponse.json(transformedPosts);

  } catch (error) {
    console.error('Error fetching cafe posts:', error);

    // 에러 발생시 빈 배열 반환 (컬렉션이 없거나 데이터가 없을 때)
    return NextResponse.json([]);
  }
}
