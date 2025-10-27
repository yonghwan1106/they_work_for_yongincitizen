import Link from 'next/link'

interface Vote {
  id: string
  vote_cast: string
  is_verified: boolean
  verified_by: string | null
  verified_at: string | null
  created_at: string
  bill?: {
    id: string
    title: string
    bill_type: string | null
    bill_number: string | null
    proposal_date: string | null
  } | null
}

interface VoteCardProps {
  vote: Vote
  showBillInfo?: boolean
}

export default function VoteCard({ vote, showBillInfo = true }: VoteCardProps) {
  const getVoteColor = (voteCast: string) => {
    const vote = voteCast.toLowerCase()
    if (vote.includes('찬성')) return 'bg-green-100 text-green-800 border-green-200'
    if (vote.includes('반대')) return 'bg-red-100 text-red-800 border-red-200'
    if (vote.includes('기권')) return 'bg-gray-100 text-gray-800 border-gray-200'
    return 'bg-blue-100 text-blue-800 border-blue-200'
  }

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors border-b last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        {/* Bill Info */}
        {showBillInfo && vote.bill && (
          <div className="flex-1">
            <Link
              href={`/bills/${vote.bill.id}`}
              className="text-gray-900 font-semibold hover:text-blue-600 transition-colors"
            >
              {vote.bill.title}
            </Link>

            <div className="flex gap-2 mt-2 text-sm text-gray-600 flex-wrap">
              {vote.bill.bill_number && (
                <span className="bg-gray-100 px-2 py-0.5 rounded">
                  {vote.bill.bill_number}
                </span>
              )}
              {vote.bill.bill_type && (
                <span className="bg-gray-100 px-2 py-0.5 rounded">
                  {vote.bill.bill_type}
                </span>
              )}
              {vote.bill.proposal_date && (
                <span className="text-gray-500">
                  {new Date(vote.bill.proposal_date).toLocaleDateString('ko-KR')}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Vote Badge */}
        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-4 py-2 rounded-lg font-medium border-2 ${getVoteColor(vote.vote_cast)}`}
          >
            {vote.vote_cast}
          </span>

          {/* Verification Status */}
          {!vote.is_verified && (
            <div className="flex items-center gap-1 text-xs">
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200">
                ⚠️ 미검증
              </span>
            </div>
          )}

          {vote.is_verified && vote.verified_at && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 border border-green-200">
                ✓ 검증완료
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Verification Info */}
      {vote.is_verified && (vote.verified_by || vote.verified_at) && (
        <div className="mt-3 pt-3 border-t text-xs text-gray-500">
          {vote.verified_by && <span>검증자: {vote.verified_by}</span>}
          {vote.verified_at && (
            <span className="ml-3">
              검증일: {new Date(vote.verified_at).toLocaleDateString('ko-KR')}
            </span>
          )}
        </div>
      )}

      {/* Unverified Warning */}
      {!vote.is_verified && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
            💡 이 투표 기록은 회의록에서 AI가 추출한 데이터로, 아직 사람이 검증하지 않았습니다.
            정확성을 보장할 수 없으며 참고용으로만 사용하세요.
          </p>
        </div>
      )}
    </div>
  )
}
