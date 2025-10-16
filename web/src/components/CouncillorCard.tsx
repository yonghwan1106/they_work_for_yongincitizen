import Link from 'next/link'
import { Councillor } from '@/types'

interface CouncillorCardProps {
  councillor: Councillor
}

export default function CouncillorCard({ councillor }: CouncillorCardProps) {
  const getPartyColor = (party: string | null) => {
    if (!party) return 'bg-gray-100 text-gray-800'

    const partyLower = party.toLowerCase()
    if (partyLower.includes('민주')) return 'bg-blue-100 text-blue-800'
    if (partyLower.includes('국민의힘') || partyLower.includes('국민의')) return 'bg-red-100 text-red-800'
    if (partyLower.includes('정의')) return 'bg-yellow-100 text-yellow-800'
    return 'bg-purple-100 text-purple-800'
  }

  return (
    <Link href={`/councillors/${councillor.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
            {councillor.photo_url ? (
              <img
                src={councillor.photo_url}
                alt={councillor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                👤
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {councillor.name}
            </h3>

            <div className="space-y-1">
              {councillor.party && (
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPartyColor(councillor.party)}`}>
                  {councillor.party}
                </span>
              )}

              {councillor.district && (
                <p className="text-gray-600 text-sm mt-2">
                  📍 {councillor.district}
                </p>
              )}

              {councillor.term_number && (
                <p className="text-gray-500 text-sm">
                  제{councillor.term_number}대
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
