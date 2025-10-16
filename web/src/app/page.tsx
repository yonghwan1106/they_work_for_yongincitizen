import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              그들은 용인시민을 위해 일합니다
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              용인특례시의회 의원들의 활동을 투명하게 공개합니다
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/councillors"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                의원 찾아보기
              </Link>
              <Link
                href="/meetings"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                회의록 검색
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">주요 기능</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="의원별 디지털 서류철"
              description="각 의원의 프로필, 발언 기록, 발의 의안을 한눈에 확인하세요"
              icon="👤"
              link="/councillors"
            />
            <FeatureCard
              title="통합 회의록 검색"
              description="모든 회의록을 통합 검색하여 원하는 발언을 쉽게 찾으세요"
              icon="🔍"
              link="/meetings"
            />
            <FeatureCard
              title="의안 추적기"
              description="조례안의 발의부터 처리까지 전 과정을 추적하세요"
              icon="📋"
              link="/bills"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <StatCard number="30+" label="현역 의원" />
            <StatCard number="수백건" label="회의록" />
            <StatCard number="수천건" label="발언 기록" />
            <StatCard number="곧 제공" label="표결 기록" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">왜 이 플랫폼이 필요한가요?</h2>
            <p className="text-lg text-gray-700 mb-4">
              용인시의회 공식 웹사이트에도 의정 활동 정보가 공개되어 있지만,
              시민들이 쉽게 이해하고 활용하기에는 어려움이 있습니다.
            </p>
            <p className="text-lg text-gray-700 mb-8">
              우리는 영국의 TheyWorkForYou를 벤치마킹하여, 복잡한 의정 정보를
              시민 누구나 쉽게 검색하고 이해할 수 있는 형태로 재구성했습니다.
            </p>
            <Link
              href="/about"
              className="text-blue-600 font-semibold hover:underline"
            >
              프로젝트에 대해 더 알아보기 →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, description, icon, link }: { title: string; description: string; icon: string; link: string }) {
  return (
    <Link href={link} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold text-blue-600 mb-2">{number}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}
