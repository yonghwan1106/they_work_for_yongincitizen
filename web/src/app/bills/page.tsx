import { pocketbase } from '@/lib/pocketbase/client'
import { BillExpanded } from '@/types/pocketbase-types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function BillsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; q?: string }>
}) {
  const params = await searchParams

  let bills: BillExpanded[] = []
  let statuses: string[] = []
  let billTypes: string[] = []
  let error = null

  try {
    // Build filter string
    let filters: string[] = []

    if (params.status) {
      filters.push(`status = "${params.status}"`)
    }

    if (params.type) {
      filters.push(`bill_type = "${params.type}"`)
    }

    if (params.q) {
      filters.push(`title ~ "${params.q}"`)
    }

    const filter = filters.length > 0 ? filters.join(' && ') : undefined

    // Fetch bills with proposer expansion
    bills = await pocketbase.collection('bills').getList<BillExpanded>(1, 50, {
      filter,
      sort: '-proposal_date',
      expand: 'proposer'
    }).then(result => result.items)

    // Get unique statuses and types
    const allBills = await pocketbase.collection('bills').getFullList({
      fields: 'status,bill_type'
    })

    statuses = Array.from(new Set(allBills.map((b: any) => b.status).filter(Boolean))) as string[]
    billTypes = Array.from(new Set(allBills.map((b: any) => b.bill_type).filter(Boolean))) as string[]
  } catch (err) {
    console.error('Error fetching bills:', err)
    error = err
  }

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
                  <Link
                    href="/bills"
                    className={`px-3 py-1 rounded-full text-sm ${
                      !params.status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    전체
                  </Link>
                  {statuses.map((status) => (
                    <Link
                      key={status}
                      href={`/bills?status=${encodeURIComponent(status)}`}
                      className={`px-3 py-1 rounded-full text-sm ${
                        params.status === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status}
                    </Link>
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
                  <Link
                    href="/bills"
                    className={`px-3 py-1 rounded-full text-sm ${
                      !params.type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    전체
                  </Link>
                  {billTypes.map((type) => (
                    <Link
                      key={type}
                      href={`/bills?type=${encodeURIComponent(type)}`}
                      className={`px-3 py-1 rounded-full text-sm ${
                        params.type === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </Link>
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
              ? 'PocketBase 연결을 확인해주세요.'
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
            {bills.map((bill) => (
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
                      {bill.expand?.proposer && (
                        <span>
                          발의: {bill.expand.proposer.name}
                          {bill.expand.proposer.party && ` (${bill.expand.proposer.party})`}
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
