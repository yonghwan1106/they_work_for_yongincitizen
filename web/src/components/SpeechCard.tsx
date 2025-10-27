import Link from 'next/link'

interface Speech {
  id: string
  speech_text: string
  summary: string | null
  keywords: string[] | null
  speech_order: number | null
  created_at: string
  meeting?: {
    id: string
    title: string
    meeting_date: string
    meeting_type: string | null
  } | null
}

interface SpeechCardProps {
  speech: Speech
  showMeetingInfo?: boolean
  expandable?: boolean
}

export default function SpeechCard({
  speech,
  showMeetingInfo = true,
  expandable = false
}: SpeechCardProps) {
  const hasSummary = speech.summary && speech.summary.trim().length > 0

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors border-b last:border-b-0">
      {/* Meeting Info */}
      {showMeetingInfo && speech.meeting && (
        <div className="mb-3">
          <Link
            href={`/meetings/${speech.meeting.id}`}
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <span className="font-medium">
              {speech.meeting.meeting_type || '회의'}
            </span>
            {' - '}
            {speech.meeting.title}
            {speech.meeting.meeting_date && (
              <span className="ml-2 text-gray-500">
                ({new Date(speech.meeting.meeting_date).toLocaleDateString('ko-KR')})
              </span>
            )}
          </Link>
        </div>
      )}

      {/* Summary or Speech Text */}
      <div className="mb-3">
        {hasSummary ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                🤖 AI 요약
              </span>
            </div>
            <p className="text-gray-900 leading-relaxed">
              {speech.summary}
            </p>
            {expandable && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700">
                  원문 보기
                </summary>
                <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed whitespace-pre-wrap">
                  {speech.speech_text}
                </p>
              </details>
            )}
          </div>
        ) : (
          <p className="text-gray-800 leading-relaxed line-clamp-4">
            {speech.speech_text.length > 300
              ? speech.speech_text.substring(0, 300) + '...'
              : speech.speech_text}
          </p>
        )}
      </div>

      {/* Keywords */}
      {speech.keywords && speech.keywords.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {speech.keywords.map((keyword, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              #{keyword}
            </span>
          ))}
        </div>
      )}

      {/* Metadata */}
      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
        {speech.speech_order && (
          <span>발언 순서: {speech.speech_order}</span>
        )}
        <span>
          {new Date(speech.created_at).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </span>
      </div>
    </div>
  )
}
