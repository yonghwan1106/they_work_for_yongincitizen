'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CafePost {
  id: string;
  title: string;
  author: string;
  date: string;
  views: string;
  url: string;
  isNotice: boolean;
}

export default function CafePostsList() {
  const [posts, setPosts] = useState<CafePost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cafe-posts')
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch cafe posts:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        로딩 중...
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        카페 글을 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {posts.slice(0, 8).map((post) => (
        <Link
          key={post.id}
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 hover:bg-blue-50 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {post.isNotice && (
                  <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded font-semibold">
                    공지
                  </span>
                )}
                <h3 className="text-base font-semibold text-gray-900">
                  {post.title}
                </h3>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>{post.author}</span>
                <span>•</span>
                <span>{post.date}</span>
                <span>•</span>
                <span>조회 {post.views}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
