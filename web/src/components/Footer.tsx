export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">그들은 용인시민을 위해 일합니다</h3>
            <p className="text-gray-400 text-sm">
              용인특례시의회 의정활동을 투명하게 공개하고 시민의 알 권리를 실현합니다.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">주요 기능</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>의원별 활동 기록</li>
              <li>회의록 통합 검색</li>
              <li>의안 추적</li>
              <li>표결 기록 (곧 제공)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">정보</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="https://council.yongin.go.kr" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  용인시의회 공식 사이트
                </a>
              </li>
              <li>데이터 출처: 용인특례시의회</li>
              <li>비영리 시민 프로젝트</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-gray-400 text-center">
          <p>
            본 사이트는 TheyWorkForYou를 벤치마킹한 비영리 시민 프로젝트입니다.
            모든 데이터는 용인특례시의회 공식 웹사이트에서 제공하는 공개 정보를 기반으로 합니다.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} 그들은 용인시민을 위해 일합니다. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
