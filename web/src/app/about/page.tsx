export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">프로젝트 소개</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">왜 만들었나요?</h2>
        <div className="bg-white rounded-lg shadow p-6 space-y-4 text-gray-700">
          <p>
            용인특례시의회는 공식 웹사이트를 통해 의정 활동 정보를 공개하고 있습니다.
            하지만 정보가 분산되어 있고, 검색이 어려워 시민들이 자신의 대표자가 어떤 활동을
            하는지 파악하기 어려운 실정입니다.
          </p>
          <p>
            <strong>&quot;그들은 용인시민을 위해 일합니까?&quot;</strong>는 영국의 성공적인 의회 모니터링
            플랫폼인 TheyWorkForYou를 벤치마킹하여, 용인시의회의 공개 데이터를 시민들이
            쉽게 이해하고 활용할 수 있도록 재구성한 비영리 시민 프로젝트입니다.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">주요 기능</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">Phase 1: MVP (현재)</h3>
            <ul className="space-y-2 text-gray-700">
              <li>✅ 의원별 디지털 서류철</li>
              <li>✅ 통합 회의록 검색</li>
              <li>✅ 의안 추적기</li>
            </ul>
          </div>
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">Phase 2: 책임 추궁</h3>
            <ul className="space-y-2 text-gray-700">
              <li>🔄 AI 기반 발언 분석</li>
              <li>🔄 개별 의원 표결 기록</li>
              <li>🔄 정책별 투표 성향 분석</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">기술 스택</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid md:grid-cols-2 gap-4 text-gray-700">
            <div>
              <h3 className="font-semibold mb-2">프론트엔드</h3>
              <ul className="space-y-1">
                <li>• Next.js (App Router)</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">백엔드 & 데이터</h3>
              <ul className="space-y-1">
                <li>• Supabase (PostgreSQL)</li>
                <li>• Python (데이터 수집)</li>
                <li>• Anthropic Claude API</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">데이터 출처</h2>
        <div className="bg-white rounded-lg shadow p-6 space-y-4 text-gray-700">
          <p>
            모든 데이터는 <a href="https://council.yongin.go.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            용인특례시의회 공식 웹사이트</a>에서 공개된 정보를 수집하여 재구성한 것입니다.
          </p>
          <p className="text-sm text-gray-600">
            본 플랫폼은 비영리 공익 목적으로 운영되며, 모든 정보의 출처를 명확히 표시하고
            공식 웹사이트 원문으로 연결합니다. 데이터의 정확성을 위해 지속적으로 노력하고 있으나,
            공식적인 정보는 반드시 용인시의회 공식 웹사이트에서 확인하시기 바랍니다.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">오픈소스</h2>
        <div className="bg-white rounded-lg shadow p-6 space-y-4 text-gray-700">
          <p>
            이 프로젝트는 오픈소스로 공개될 예정입니다. 다른 지방자치단체에서도
            유사한 플랫폼을 만들 수 있도록 코드와 방법론을 공유할 계획입니다.
          </p>
          <p>
            시민 참여와 개발 협력을 환영합니다.
          </p>
        </div>
      </section>
    </div>
  );
}
