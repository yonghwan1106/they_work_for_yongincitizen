import { pocketbase } from '@/lib/pocketbase/client'
import { SpeechExpanded } from '@/types/pocketbase-types'
import Link from 'next/link'
import SpeechCard from '@/components/SpeechCard'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    q?: string
    keyword?: string
    sort?: string
  }>
}

export default async function SpeechesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = params.q || ''
  const keyword = params.keyword || ''
  const sort = params.sort || 'latest'

  let speeches: SpeechExpanded[] = []
  let topKeywords: string[] = []
  let error = null

  try {
    // Build filter string
    let filters: string[] = []

    // Search filter - search in speech_text or summary
    if (query) {
      filters.push(`(speech_text ~ "${query}" || summary ~ "${query}")`)
    }

    // Keyword filter
    if (keyword) {
      filters.push(`keywords ~ "${keyword}"`)
    }

    const filter = filters.length > 0 ? filters.join(' && ') : undefined

    // Determine sort order
    const sortOrder = sort === 'oldest' ? 'created' : '-created'

    // Fetch speeches with meeting and councillor expansion
    speeches = await pocketbase.collection('speeches').getList<SpeechExpanded>(1, 50, {
      filter,
      sort: sortOrder,
      expand: 'meeting,councillor'
    }).then(result => result.items)

    // Get top keywords for filter
    const allSpeeches = await pocketbase.collection('speeches').getList(1, 100, {
      filter: 'keywords != ""',
      fields: 'keywords'
    }).then(result => result.items)

    const keywordCounts = new Map<string, number>()
    allSpeeches.forEach((speech: any) => {
      if (speech.keywords && Array.isArray(speech.keywords)) {
        speech.keywords.forEach((kw: string) => {
          keywordCounts.set(kw, (keywordCounts.get(kw) || 0) + 1)
        })
      }
    })

    topKeywords = Array.from(keywordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([kw]) => kw)
  } catch (err) {
    console.error('Error fetching speeches:', err)
    error = err
    // If speeches collection doesn't exist yet, just show empty state
    speeches = []
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">발언 검색</h1>
        <p className="text-gray-600">
          용인시의회 의원들의 발언을 검색하고 분석할 수 있습니다
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form method="GET" action="/speeches" className="space-y-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              발언 내용 검색
            </label>
            <input
              type="text"
              id="search"
              name="q"
              defaultValue={query}
              placeholder="검색어를 입력하세요 (예: 예산, 복지, 개발)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <label className="text-sm font-medium text-gray-700">정렬:</label>
            <select
              name="sort"
              defaultValue={sort}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="latest">최신순</option>
              <option value="oldest">오래된순</option>
            </select>

            <button
              type="submit"
              className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              검색
            </button>
          </div>
        </form>

        {/* Top Keywords */}
        {topKeywords.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">인기 키워드:</p>
            <div className="flex flex-wrap gap-2">
              {topKeywords.map((kw) => (
                <Link
                  key={kw}
                  href={`/speeches?keyword=${encodeURIComponent(kw)}`}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    keyword === kw
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  #{kw}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Filters */}
      {(query || keyword) && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">필터:</span>
          {query && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
              검색: {query}
              <Link href="/speeches" className="text-gray-500 hover:text-gray-700">
                ✕
              </Link>
            </span>
          )}
          {keyword && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 rounded-full text-sm">
              키워드: #{keyword}
              <Link
                href={query ? `/speeches?q=${query}` : '/speeches'}
                className="text-blue-700 hover:text-blue-900"
              >
                ✕
              </Link>
            </span>
          )}
        </div>
      )}

      {/* Results */}
      <div className="mb-4 text-sm text-gray-600">
        {error ? (
          <p className="text-red-600">검색 중 오류가 발생했습니다.</p>
        ) : speeches && speeches.length > 0 ? (
          <p>총 {speeches.length}건의 발언을 찾았습니다</p>
        ) : (
          <p>검색 결과가 없습니다</p>
        )}
      </div>

      {/* Speech List */}
      {speeches && speeches.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {speeches.map((speech) => (
            <div key={speech.id} className="border-b last:border-b-0">
              {/* Councillor Info */}
              {speech.expand?.councillor && (
                <div className="px-6 pt-4">
                  <Link
                    href={`/councillors/${speech.expand.councillor.id}`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <span>{speech.expand.councillor.name}</span>
                    {speech.expand.councillor.party && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        {speech.expand.councillor.party}
                      </span>
                    )}
                    {speech.expand.councillor.district && (
                      <span className="text-xs text-gray-500">
                        {speech.expand.councillor.district}
                      </span>
                    )}
                  </Link>
                </div>
              )}

              <SpeechCard
                speech={speech}
                showMeetingInfo={true}
                expandable={true}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600 text-lg mb-2">
            {query || keyword ? '검색 결과가 없습니다' : '발언 데이터를 검색해보세요'}
          </p>
          <p className="text-sm text-gray-500">
            {query || keyword
              ? '다른 키워드로 검색해보세요'
              : '위의 검색창에 키워드를 입력하거나 인기 키워드를 클릭하세요'}
          </p>
        </div>
      )}
    </div>
  )
}
