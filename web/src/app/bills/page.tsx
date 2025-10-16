import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Bill } from '@/types'

export const dynamic = 'force-dynamic'

export default async function BillsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; q?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('bills')
    .select('*, proposer:councillors(name, party)')
    .order('proposal_date', { ascending: false })
    .limit(50)

  if (params.status) {
    query = query.eq('status', params.status)
  }

  if (params.type) {
    query = query.eq('bill_type', params.type)
  }

  if (params.q) {
    query = query.ilike('title', `%${params.q}%`)
  }

  const { data: bills, error } = await query

  // Get unique statuses and types
  const { data: allBills } = await supabase
    .from('bills')
    .select('status, bill_type')

  const statuses = Array.from(new Set(allBills?.map(b => b.status).filter(Boolean))) as string[]
  const billTypes = Array.from(new Set(allBills?.map(b => b.bill_type).filter(Boolean))) as string[]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">의안 추적</h1>
        <p className="text-gray-600">용인특례시의회 의안 정보를 확인하세요</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form className="space-y-4">
          <input
            type="text"
            name="q"
            placeholder="의안명 검색..."
            defaultValue={params.q}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <div className="grid md:grid-cols-2 gap-4">
            {statuses.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  처리 상태
                </label>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="/bills"
                    className={`px-3 py-1 rounded-full text-sm ${
                      !params.status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    전체
                  </a>
                  {statuses.map((status) => (
                    <a
                      key={status}
                      href={`/bills?status=${encodeURIComponent(status)}`}
                      className={`px-3 py-1 rounded-full text-sm ${
                        params.status === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {billTypes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  의안 유형
                </label>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="/bills"
                    className={`px-3 py-1 rounded-full text-sm ${
                      !params.type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    전체
                  </a>
                  {billTypes.map((type) => (
                    <a
                      key={type}
                      href={`/bills?type=${encodeURIComponent(type)}`}
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
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Bills List */}
      {!bills || bills.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <p className="text-yellow-800 mb-2">
            {error ? '⚠️ 데이터를 불러오는 중 오류가 발생했습니다.' : '📭 의안이 없습니다.'}
          </p>
          <p className="text-sm text-yellow-700">
            {error
              ? 'Supabase 연결을 확인해주세요.'
              : params.q
              ? '다른 검색어로 시도해보세요.'
              : '데이터 수집 스크립트를 실행하여 의안 정보를 추가해주세요.'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-gray-600">
            총 <strong>{bills.length}건</strong>의 의안
          </div>
          <div className="bg-white rounded-lg shadow divide-y">
            {bills.map((bill: any) => (
              <Link
                key={bill.id}
                href={`/bills/${bill.id}`}
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1">
                        {bill.title}
                      </h3>
                      {bill.status && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 ${
                          bill.status === '가결' ? 'bg-green-100 text-green-800' :
                          bill.status === '부결' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {bill.status}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      {bill.bill_type && (
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {bill.bill_type}
                        </span>
                      )}
                      {bill.proposer && (
                        <span>
                          발의: {bill.proposer.name}
                          {bill.proposer.party && ` (${bill.proposer.party})`}
                        </span>
                      )}
                      {bill.proposal_date && (
                        <span>
                          {new Date(bill.proposal_date).toLocaleDateString('ko-KR')}
                        </span>
                      )}
                    </div>
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
