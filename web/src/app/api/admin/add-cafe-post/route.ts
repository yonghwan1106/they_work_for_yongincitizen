import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, title, articleId, author, isNotice } = body;

    // Validate password
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || password !== adminPassword) {
      return NextResponse.json(
        { error: '비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!title || !articleId) {
      return NextResponse.json(
        { error: '제목과 글 번호는 필수입니다.' },
        { status: 400 }
      );
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Prepare post data
    const now = new Date();
    const postDate = now.toISOString().split('T')[0].replace(/-/g, '.');

    const postData = {
      id: articleId.toString(),
      title: title.trim(),
      author: author?.trim() || '하이젠버그',
      post_date: postDate,
      views: '0',
      url: `https://cafe.naver.com/yonginblue/${articleId}`,
      is_notice: isNotice || false,
      updated_at: now.toISOString(),
    };

    // Upsert to database
    const { data, error } = await supabase
      .from('cafe_posts')
      .upsert(postData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '카페 글이 성공적으로 추가되었습니다!',
      data: data,
    });

  } catch (error) {
    console.error('Error adding cafe post:', error);
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
