'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddPostPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [articleId, setArticleId] = useState('');
  const [author, setAuthor] = useState('하이젠버그');
  const [isNotice, setIsNotice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/add-cafe-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          title,
          articleId,
          author,
          isNotice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '오류가 발생했습니다.');
      }

      setMessage({ type: 'success', text: data.message });

      // Reset form
      setTitle('');
      setArticleId('');
      setIsNotice(false);

      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '오류가 발생했습니다.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">용인블루 글 추가</h1>
          <p className="mt-2 text-sm text-gray-600">
            새로운 카페 글을 메인페이지에 추가합니다
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                관리자 비밀번호 *
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                글 제목 *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 용인시의회 행정사무감사 세미나"
              />
            </div>

            {/* Article ID */}
            <div>
              <label htmlFor="articleId" className="block text-sm font-medium text-gray-700">
                글 번호 *
              </label>
              <input
                type="text"
                id="articleId"
                value={articleId}
                onChange={(e) => setArticleId(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 585 (URL의 숫자)"
              />
              <p className="mt-1 text-xs text-gray-500">
                https://cafe.naver.com/yonginblue/<strong>585</strong> ← 이 숫자
              </p>
            </div>

            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                작성자
              </label>
              <input
                type="text"
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="하이젠버그"
              />
            </div>

            {/* Is Notice */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isNotice"
                checked={isNotice}
                onChange={(e) => setIsNotice(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isNotice" className="ml-2 block text-sm text-gray-700">
                공지사항으로 표시
              </label>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`p-4 rounded-md ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                <p className="text-sm font-medium">{message.text}</p>
                {message.type === 'success' && (
                  <p className="text-xs mt-1">메인페이지로 이동합니다...</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '추가 중...' : '글 추가하기'}
            </button>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← 메인페이지로 돌아가기
              </button>
            </div>
          </form>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">사용 방법</h3>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>용인블루 카페에 새 글을 작성합니다</li>
            <li>작성한 글의 URL에서 숫자(글 번호)를 확인합니다</li>
            <li>이 페이지에서 제목과 글 번호를 입력합니다</li>
            <li>&ldquo;글 추가하기&rdquo; 버튼을 클릭합니다</li>
            <li>메인페이지에서 즉시 확인할 수 있습니다!</li>
          </ol>
        </div>

        {/* Bookmark Tip */}
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            💡 <strong>팁:</strong> 이 페이지를 북마크해두시면 언제든 빠르게 접근할 수 있습니다!
          </p>
        </div>
      </div>
    </div>
  );
}
