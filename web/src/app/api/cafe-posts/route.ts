import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

export async function GET() {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch cafe posts from Supabase, ordered by post_date DESC
    const { data: posts, error } = await supabase
      .from('cafe_posts')
      .select('*')
      .order('scraped_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!posts || posts.length === 0) {
      console.log('No posts found in database');
      // Return empty array if no posts (scraper hasn't run yet)
      return NextResponse.json([]);
    }

    // Transform data to match frontend expectations
    const transformedPosts = posts.map(post => ({
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

    // 에러 발생시 빈 배열 반환
    return NextResponse.json([]);
  }
}
