import { createClient } from '@/lib/supabase/server'
import CouncillorCard from '@/components/CouncillorCard'
import Link from 'next/link'
import { Councillor } from '@/types'

export const dynamic = 'force-dynamic'

export default async function CouncillorsPage({
  searchParams,
}: {
  searchParams: Promise<{ party?: string; district?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from('councillors')
    .select('*')
    .eq('is_active', true)
    .order('name')

  // Apply filters
  if (params.party) {
    query = query.eq('party', params.party)
  }
  if (params.district) {
    query = query.eq('district', params.district)
  }

  const { data: councillors, error } = await query

  if (error) {
    console.error('Error fetching councillors:', error)
  }

  // Get unique parties and districts for filters
  const { data: allCouncillors } = await supabase
    .from('councillors')
    .select('party, district')
    .eq('is_active', true)

  const parties = Array.from(new Set(allCouncillors?.map(c => c.party).filter(Boolean))) as string[]
  const districts = Array.from(new Set(allCouncillors?.map(c => c.district).filter(Boolean))) as string[]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">의원 소개</h1>
        <p className="text-gray-600">용인특례시의회 현역 의원 정보</p>
      </div>

      {/* Filters */}
      {(parties.length > 0 || districts.length > 0) && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            {parties.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  정당별
                </label>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/councillors"
                    className={`px-3 py-1 rounded-full text-sm ${
                      !params.party
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    전체
                  </Link>
                  {parties.map((party) => (
                    <Link
                      key={party}
                      href={`/councillors?party=${encodeURIComponent(party)}`}
                      className={`px-3 py-1 rounded-full text-sm ${
                        params.party === party
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {party}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {districts.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  지역구별
                </label>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/councillors"
                    className={`px-3 py-1 rounded-full text-sm ${
                      !params.district
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    전체
                  </Link>
                  {districts.map((district) => (
                    <Link
                      key={district}
                      href={`/councillors?district=${encodeURIComponent(district)}`}
                      className={`px-3 py-1 rounded-full text-sm ${
                        params.district === district
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {district}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Councillors Grid */}
      {!councillors || councillors.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <p className="text-yellow-800 mb-2">
            {error ? '⚠️ 데이터를 불러오는 중 오류가 발생했습니다.' : '📭 등록된 의원 정보가 없습니다.'}
          </p>
          <p className="text-sm text-yellow-700">
            {error
              ? 'Supabase 연결을 확인하고 .env.local 파일의 설정을 확인해주세요.'
              : '데이터 수집 스크립트를 실행하여 의원 정보를 추가해주세요.'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-gray-600">
            총 <strong>{councillors.length}명</strong>의 의원
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {councillors.map((councillor: Councillor) => (
              <CouncillorCard key={councillor.id} councillor={councillor} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
