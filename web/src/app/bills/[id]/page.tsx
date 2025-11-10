import { pocketbase } from '@/lib/pocketbase/client'
import { BillExpanded } from '@/types/pocketbase-types'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BillDetailPage({ params }: PageProps) {
  const { id } = await params

  let bill: BillExpanded | null = null

  try {
    // Fetch bill details with proposer expansion
    bill = await pocketbase.collection('bills').getOne<BillExpanded>(id, {
      expand: 'proposer'
    })
  } catch (error) {
    console.error('Error fetching bill:', error)
    notFound()
  }

  if (!bill) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link href="/bills" className="text-blue-600 hover:underline">
          의안 추적
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600">{bill.title}</span>
      </nav>

      {/* Bill Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold flex-1">{bill.title}</h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              bill.status === '가결'
                ? 'bg-green-100 text-green-800'
                : bill.status === '부결'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {bill.status}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-gray-600">
          {bill.bill_number && (
            <div>
              <span className="font-semibold">의안번호:</span> {bill.bill_number}
            </div>
          )}

          <div>
            <span className="font-semibold">의안 유형:</span>{' '}
            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {bill.bill_type}
            </span>
          </div>

          {bill.proposal_date && (
            <div>
              <span className="font-semibold">제출일:</span>{' '}
              {new Date(bill.proposal_date).toLocaleDateString('ko-KR')}
            </div>
          )}

          {bill.expand?.proposer && (
            <div>
              <span className="font-semibold">발의자:</span>{' '}
              <Link
                href={`/councillors/${bill.expand.proposer.id}`}
                className="text-blue-600 hover:underline"
              >
                {bill.expand.proposer.name}
              </Link>
              {bill.expand.proposer.party && (
                <span className="text-sm text-gray-500 ml-2">({bill.expand.proposer.party})</span>
              )}
            </div>
          )}
        </div>

        {/* Original URL */}
        {bill.bill_url && (
          <div className="mt-4 pt-4 border-t">
            <a
              href={bill.bill_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              원문 보기 (용인시의회 웹사이트)
            </a>
          </div>
        )}
      </div>

      {/* Bill Summary */}
      {bill.summary && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">의안 요약</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{bill.summary}</p>
          </div>
        </div>
      )}

      {/* Full Text */}
      {bill.full_text ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">의안 전문</h2>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
              {bill.full_text}
            </pre>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">📝 의안 전문이 아직 수집되지 않았습니다.</p>
          <p className="text-sm text-yellow-700 mt-2">
            원문은 위의 &quot;원문 보기&quot; 링크에서 확인하실 수 있습니다.
          </p>
        </div>
      )}
    </div>
  )
}
