import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

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

    // Initialize PocketBase client with admin auth
    const pocketbaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL!;
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL!;
    const adminPwd = process.env.POCKETBASE_ADMIN_PASSWORD!;

    if (!pocketbaseUrl || !adminEmail || !adminPwd) {
      throw new Error('Missing PocketBase environment variables');
    }

    const pb = new PocketBase(pocketbaseUrl);
    await pb.admins.authWithPassword(adminEmail, adminPwd);

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
      scraped_at: now.toISOString(),
    };

    // Create or update in database
    let data;
    try {
      // Try to update existing record
      data = await pb.collection('cafe_posts').update(articleId.toString(), postData);
    } catch {
      // If record doesn't exist, create it
      data = await pb.collection('cafe_posts').create(postData);
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
