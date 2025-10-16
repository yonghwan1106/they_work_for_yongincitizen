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
