import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Meeting } from '@/types'

export const dynamic = 'force-dynamic'

export default async function MeetingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('meetings')
    .select('*, committee:committees(name)')
    .order('meeting_date', { ascending: false })
    .limit(50)

  if (params.type) {
    query = query.eq('meeting_type', params.type)
  }

  if (params.q) {
    query = query.ilike('title', `%${params.q}%`)
  }

  const { data: meetings, error } = await query

  // Get unique meeting types
  const { data: allMeetings } = await supabase
    .from('meetings')
    .select('meeting_type')

  const meetingTypes = Array.from(
    new Set(allMeetings?.map(m => m.meeting_type).filter(Boolean))
  ) as string[]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">회의록 검색</h1>
        <p className="text-gray-600">용인특례시의회 회의록을 검색하고 열람하세요</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form className="space-y-4">
          <div>
            <input
              type="text"
              name="q"
              placeholder="회의명 검색..."
              defaultValue={params.q}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {meetingTypes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <a
                href="/meetings"
                className={`px-3 py-1 rounded-full text-sm ${
                  !params.type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체
              </a>
              {meetingTypes.map((type) => (
                <a
                  key={type}
                  href={`/meetings?type=${encodeURIComponent(type)}`}
                  className={`px-3 py-1 rounded-full text-sm ${
                    params.type === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </a>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* Meetings List */}
      {!meetings || meetings.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <p className="text-yellow-800 mb-2">
            {error ? '⚠️ 데이터를 불러오는 중 오류가 발생했습니다.' : '📭 회의록이 없습니다.'}
          </p>
          <p className="text-sm text-yellow-700">
            {error
              ? 'Supabase 연결을 확인해주세요.'
              : params.q
              ? '다른 검색어로 시도해보세요.'
              : '데이터 수집 스크립트를 실행하여 회의록을 추가해주세요.'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-gray-600">
            총 <strong>{meetings.length}건</strong>의 회의록
          </div>
          <div className="bg-white rounded-lg shadow divide-y">
            {meetings.map((meeting: any) => (
              <Link
                key={meeting.id}
                href={`/meetings/${meeting.id}`}
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {meeting.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      {meeting.meeting_type && (
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {meeting.meeting_type}
                        </span>
                      )}
                      {meeting.committee?.name && (
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {meeting.committee.name}
                        </span>
                      )}
                      {meeting.session_number && (
                        <span>제{meeting.session_number}회</span>
                      )}
                      {meeting.meeting_number && (
                        <span>제{meeting.meeting_number}차</span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 flex-shrink-0">
                    {new Date(meeting.meeting_date).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
