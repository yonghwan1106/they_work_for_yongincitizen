import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import SpeechCard from '@/components/SpeechCard'
import VoteCard from '@/components/VoteCard'

export const dynamic = 'force-dynamic'

export default async function CouncillorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch councillor data
  const { data: councillor, error } = await supabase
    .from('councillors')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !councillor) {
    notFound()
  }

  // Fetch bills proposed by this councillor
  const { data: bills } = await supabase
    .from('bills')
    .select('*')
    .eq('proposer_id', id)
    .order('proposal_date', { ascending: false })
    .limit(10)

  // Fetch speeches by this councillor
  const { data: speeches } = await supabase
    .from('speeches')
    .select(`
      *,
      meeting:meetings(id, title, meeting_date, meeting_type)
    `)
    .eq('councillor_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch votes by this councillor (both verified and unverified)
  const { data: votes } = await supabase
    .from('votes')
    .select(`
      *,
      bill:bills(id, title, bill_type, bill_number, proposal_date)
    `)
    .eq('councillor_id', id)
    .order('is_verified', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(20)

  const getPartyColor = (party: string | null) => {
    if (!party) return 'bg-gray-100 text-gray-800'

    const partyLower = party.toLowerCase()
    if (partyLower.includes('민주')) return 'bg-blue-100 text-blue-800'
    if (partyLower.includes('국민의힘') || partyLower.includes('국민의')) return 'bg-red-100 text-red-800'
    if (partyLower.includes('정의')) return 'bg-yellow-100 text-yellow-800'
    return 'bg-purple-100 text-purple-800'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-600">
        <Link href="/councillors" className="hover:text-blue-600">
          의원 소개
        </Link>
        <span className="mx-2">/</span>
        <span>{councillor.name}</span>
      </nav>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-32 h-32 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
            {councillor.photo_url ? (
              <img
                src={councillor.photo_url}
                alt={councillor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
                👤
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-4">{councillor.name}</h1>

            <div className="grid md:grid-cols-2 gap-4">
              {councillor.party && (
                <div>
                  <span className="text-sm text-gray-600">정당</span>
                  <div className="mt-1">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPartyColor(councillor.party)}`}>
                      {councillor.party}
                    </span>
                  </div>
                </div>
              )}

              {councillor.district && (
                <div>
                  <span className="text-sm text-gray-600">선거구</span>
                  <p className="mt-1 font-medium">📍 {councillor.district}</p>
                </div>
              )}

              {councillor.term_number && (
                <div>
                  <span className="text-sm text-gray-600">대수</span>
                  <p className="mt-1 font-medium">제{councillor.term_number}대</p>
                </div>
              )}

              {councillor.email && (
                <div>
                  <span className="text-sm text-gray-600">이메일</span>
                  <p className="mt-1">
                    <a href={`mailto:${councillor.email}`} className="text-blue-600 hover:underline">
                      {councillor.email}
                    </a>
                  </p>
                </div>
              )}

              {councillor.phone && (
                <div>
                  <span className="text-sm text-gray-600">전화</span>
                  <p className="mt-1">{councillor.phone}</p>
                </div>
              )}

              {councillor.office_location && (
                <div>
                  <span className="text-sm text-gray-600">사무실</span>
                  <p className="mt-1">{councillor.office_location}</p>
                </div>
              )}
            </div>

            {councillor.profile_url && (
              <div className="mt-4">
                <a
                  href={councillor.profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  공식 프로필 보기 →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{bills?.length || 0}</div>
          <div className="text-gray-600 mt-1">대표 발의 의안</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{speeches?.length || 0}</div>
          <div className="text-gray-600 mt-1">발언 기록</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{votes?.length || 0}</div>
          <div className="text-gray-600 mt-1">표결 기록</div>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="space-y-8">
        {/* Bills Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">대표 발의 의안</h2>
          {!bills || bills.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">
              발의한 의안이 없거나 데이터가 수집되지 않았습니다.
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow divide-y">
              {bills.map((bill) => (
                <Link
                  key={bill.id}
                  href={`/bills/${bill.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{bill.title}</h3>
                      <div className="flex gap-2 text-sm text-gray-600">
                        {bill.bill_type && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded">{bill.bill_type}</span>
                        )}
                        {bill.proposal_date && (
                          <span>{new Date(bill.proposal_date).toLocaleDateString('ko-KR')}</span>
                        )}
                      </div>
                    </div>
                    {bill.status && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        bill.status === '가결' ? 'bg-green-100 text-green-800' :
                        bill.status === '부결' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {bill.status}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Speeches Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">최근 발언</h2>
            {speeches && speeches.length > 0 && (
              <div className="text-sm text-gray-600">
                총 {speeches.length}건
              </div>
            )}
          </div>
          {!speeches || speeches.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">
              <p className="text-lg font-medium mb-2">발언 기록이 없습니다</p>
              <p className="text-sm">
                이 의원의 발언 기록이 아직 수집되지 않았거나, AI 분석이 진행 중입니다.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {speeches.map((speech) => (
                <SpeechCard
                  key={speech.id}
                  speech={speech}
                  showMeetingInfo={true}
                  expandable={true}
                />
              ))}
            </div>
          )}
        </section>

        {/* Votes Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">표결 기록</h2>
            {votes && votes.length > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-600">
                  총 {votes.length}건
                </span>
                {votes.some(v => v.is_verified) && (
                  <span className="text-green-600">
                    검증: {votes.filter(v => v.is_verified).length}건
                  </span>
                )}
                {votes.some(v => !v.is_verified) && (
                  <span className="text-yellow-600">
                    미검증: {votes.filter(v => !v.is_verified).length}건
                  </span>
                )}
              </div>
            )}
          </div>
          {!votes || votes.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">
              <p className="text-lg font-medium mb-2">표결 기록이 없습니다</p>
              <p className="text-sm">
                이 의원의 표결 기록이 아직 수집되지 않았거나, AI 분석이 진행 중입니다.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {votes.map((vote) => (
                <VoteCard key={vote.id} vote={vote} showBillInfo={true} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
