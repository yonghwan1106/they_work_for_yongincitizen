import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MeetingDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch meeting details
  const { data: meeting, error } = await supabase
    .from('meetings')
    .select(`
      *,
      committee:committees(name, type)
    `)
    .eq('id', id)
    .single()

  if (error || !meeting) {
    notFound()
  }

  // Fetch speeches from this meeting
  const { data: speeches } = await supabase
    .from('speeches')
    .select(`
      *,
      councillor:councillors(id, name, party, district)
    `)
    .eq('meeting_id', id)
    .order('speech_order', { ascending: true })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link href="/meetings" className="text-blue-600 hover:underline">
          회의록
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600">{meeting.title}</span>
      </nav>

      {/* Meeting Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4">{meeting.title}</h1>

        <div className="grid md:grid-cols-2 gap-4 text-gray-600">
          <div>
            <span className="font-semibold">회의 유형:</span>{' '}
            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {meeting.meeting_type}
            </span>
          </div>

          <div>
            <span className="font-semibold">회의 일자:</span>{' '}
            {new Date(meeting.meeting_date).toLocaleDateString('ko-KR')}
          </div>

          {meeting.committee && (
            <div>
              <span className="font-semibold">위원회:</span> {meeting.committee.name}
            </div>
          )}

          {meeting.session_number && (
            <div>
              <span className="font-semibold">회기:</span> 제{meeting.session_number}대
            </div>
          )}

          {meeting.meeting_number && (
            <div>
              <span className="font-semibold">회차:</span> 제{meeting.meeting_number}회
            </div>
          )}
        </div>

        {/* Original URL */}
        {meeting.transcript_url && (
          <div className="mt-4 pt-4 border-t">
            <a
              href={meeting.transcript_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              원문 보기 (용인시의회 웹사이트)
            </a>
          </div>
        )}
      </div>

      {/* Speeches Section */}
      {speeches && speeches.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">발언 목록</h2>
            <div className="text-sm text-gray-600">
              총 {speeches.length}건의 발언
            </div>
          </div>
          <div className="space-y-6">
            {speeches.map((speech) => (
              <div key={speech.id} className="border-b last:border-b-0 pb-6 last:pb-0">
                {/* Councillor Info */}
                {speech.councillor && (
                  <div className="mb-3">
                    <Link
                      href={`/councillors/${speech.councillor.id}`}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <span>{speech.councillor.name}</span>
                      {speech.councillor.party && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          {speech.councillor.party}
                        </span>
                      )}
                      {speech.councillor.district && (
                        <span className="text-xs text-gray-500">
                          {speech.councillor.district}
                        </span>
                      )}
                    </Link>
                  </div>
                )}

                {/* Speech Content */}
                <div>
                  {speech.summary ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          🤖 AI 요약
                        </span>
                      </div>
                      <p className="text-gray-900 leading-relaxed mb-3">
                        {speech.summary}
                      </p>
                      <details>
                        <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700">
                          원문 보기
                        </summary>
                        <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed whitespace-pre-wrap">
                          {speech.speech_text}
                        </p>
                      </details>
                    </div>
                  ) : (
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {speech.speech_text}
                    </p>
                  )}
                </div>

                {/* Keywords */}
                {speech.keywords && speech.keywords.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {speech.keywords.map((keyword: string, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transcript Content */}
      {meeting.transcript_text ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">회의록 전문</h2>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
              {meeting.transcript_text}
            </pre>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            📝 회의록 전문이 아직 수집되지 않았습니다.
          </p>
          <p className="text-sm text-yellow-700 mt-2">
            원문은 위의 &quot;원문 보기&quot; 링크에서 확인하실 수 있습니다.
          </p>
        </div>
      )}
    </div>
  )
}
