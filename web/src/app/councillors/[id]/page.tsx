import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

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
      meeting:meetings(title, meeting_date, meeting_type)
    `)
    .eq('councillor_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch votes by this councillor
  const { data: votes } = await supabase
    .from('votes')
    .select(`
      *,
      bill:bills(title, bill_type)
    `)
    .eq('councillor_id', id)
    .eq('is_verified', true)
    .order('created_at', { ascending: false })
    .limit(10)

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
          <h2 className="text-2xl font-bold mb-4">최근 발언</h2>
          {!speeches || speeches.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">
              발언 기록이 없거나 데이터가 수집되지 않았습니다.
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow divide-y">
              {speeches.map((speech: any) => (
                <div key={speech.id} className="p-4">
                  <div className="mb-2">
                    {speech.meeting && (
                      <div className="text-sm text-gray-600">
                        {speech.meeting.meeting_type} - {speech.meeting.title}
                        {speech.meeting.meeting_date && (
                          <span className="ml-2">
                            ({new Date(speech.meeting.meeting_date).toLocaleDateString('ko-KR')})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-800 line-clamp-3">
                    {speech.summary || speech.speech_text.substring(0, 200) + '...'}
                  </p>
                  {speech.keywords && speech.keywords.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {speech.keywords.map((keyword: string, idx: number) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                          #{keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Votes Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">표결 기록</h2>
          {!votes || votes.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">
              표결 기록이 없거나 데이터가 수집되지 않았습니다.
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow divide-y">
              {votes.map((vote: any) => (
                <div key={vote.id} className="p-4 flex items-start justify-between">
                  <div className="flex-1">
                    {vote.bill && (
                      <>
                        <h3 className="font-semibold text-gray-900">{vote.bill.title}</h3>
                        {vote.bill.bill_type && (
                          <p className="text-sm text-gray-600 mt-1">{vote.bill.bill_type}</p>
                        )}
                      </>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ml-4 ${
                    vote.vote_cast === '찬성' ? 'bg-green-100 text-green-800' :
                    vote.vote_cast === '반대' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {vote.vote_cast}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
