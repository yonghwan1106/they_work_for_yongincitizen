import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            그들은 용인시민을 위해 일합니까?
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link href="/councillors" className="text-gray-700 hover:text-gray-900 transition-colors">
              의원 소개
            </Link>
            <Link href="/meetings" className="text-gray-700 hover:text-gray-900 transition-colors">
              회의록
            </Link>
            <Link href="/bills" className="text-gray-700 hover:text-gray-900 transition-colors">
              의안 추적
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-gray-900 transition-colors">
              소개
            </Link>
          </nav>
          <button className="md:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
