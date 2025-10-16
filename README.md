# 그들은 용인시민을 위해 일합니다

> 용인특례시의회 의정활동 모니터링 플랫폼

영국의 성공적인 의회 모니터링 플랫폼 [TheyWorkForYou](https://www.theyworkforyou.com/)를 벤치마킹하여, 용인시의회의 공개 데이터를 시민들이 쉽게 이해하고 활용할 수 있도록 재구성한 비영리 시민 프로젝트입니다.

## 📋 프로젝트 목표

1. **투명성 증대**: 복잡하고 분산된 의정 정보를 통합적이고 검색 가능한 형태로 제공
2. **책임성 강화**: 시의원의 발언, 활동, 표결 기록을 체계적으로 추적하고 공개
3. **시민 참여 활성화**: 시민들이 자신의 지역구 의원을 쉽게 찾고 의정활동을 모니터링

## 🏗️ 프로젝트 구조

```
they_work_for_yongincitizen/
├── docs/                  # 프로젝트 문서
│   ├── proposal.md       # 전략적 청사진 (TheyWorkForYou 벤치마킹)
│   ├── prd.md           # 제품 요구사항 정의서
│   └── userjourney.md   # 사용자 여정 맵
├── web/                  # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/         # App Router 페이지
│   │   ├── components/  # 재사용 가능한 컴포넌트
│   │   └── lib/         # 유틸리티 (Supabase 클라이언트 등)
│   └── package.json
├── scraper/             # Python 데이터 수집 스크립트
│   ├── scrapers/        # 의원, 회의록, 의안 스크레이퍼
│   ├── utils/           # 데이터베이스 유틸리티
│   └── requirements.txt
├── supabase/            # 데이터베이스 스키마
│   └── schema.sql
└── CLAUDE.md            # Claude Code용 개발 가이드
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+
- Python 3.9+
- Supabase 계정 (무료)

### 1. 프론트엔드 설정 (Next.js)

```bash
cd web
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에서 Supabase URL과 API 키 설정

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 2. 데이터베이스 설정 (Supabase)

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 다음 순서로 실행:
   - `supabase/schema.sql` - 데이터베이스 스키마 생성
   - `supabase/sample_data.sql` - 샘플 데이터 삽입 (선택사항)
3. Project Settings에서 API keys 확인하여 환경 변수에 설정

**샘플 데이터 포함 내용:**
- 6명의 의원
- 5개의 위원회
- 5건의 회의록
- 5건의 의안
- 발언 및 표결 기록

자세한 내용은 [`supabase/README.md`](./supabase/README.md) 참조

### 3. 데이터 수집 설정 (Python)

```bash
cd scraper
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt

# 환경 변수 설정
cp .env.example .env
# .env 파일에서 Supabase 및 API 키 설정

# 스크레이퍼 실행 (TODO: 웹사이트 구조 분석 후 구현 필요)
python main.py --target all
```

자세한 내용은 [`scraper/README.md`](./scraper/README.md) 참조

## 📅 개발 로드맵

### Phase 1: MVP - 정보 기반 구축 ✅ (80% 완료)

- [x] Next.js 프로젝트 초기화
- [x] 데이터베이스 스키마 설계
- [x] Python 스크레이퍼 기본 구조
- [x] 기본 레이아웃 및 홈페이지
- [x] TypeScript 타입 정의
- [x] 의원별 디지털 서류철 페이지
- [x] 의원 상세 페이지 (발언, 의안, 표결)
- [x] 통합 회의록 검색 페이지
- [x] 의안 추적 페이지
- [x] Supabase 연동 완료
- [ ] 웹사이트 구조 분석 및 스크레이퍼 구현
- [ ] 실제 데이터 수집

### Phase 2: 책임 추궁 엔진 🔄 (예정)

- [ ] AI 기반 회의록 발언 추출
- [ ] 개별 의원 표결 기록 구축
- [ ] 표결 기록 검증 시스템 (Human-in-the-loop)
- [ ] 의원 프로필에 발언 & 표결 기록 통합

### Phase 3: 시민 참여 및 고급 기능 📋 (계획)

- [ ] '내 지역구 의원 찾기' 기능
- [ ] 이메일 알림 시스템
- [ ] AI 기반 Q&A 챗봇 (RAG)

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL)
- **Data Collection**: Python, BeautifulSoup, Requests
- **AI**: Anthropic Claude 3 Sonnet
- **Deployment**: Vercel (web), GitHub Actions (scraper)
- **Maps**: Naver Maps API
- **Email**: Resend API

## 📚 주요 문서

- [proposal.md](./docs/proposal.md): TheyWorkForYou 벤치마킹 및 전략적 청사진
- [prd.md](./docs/prd.md): 제품 요구사항 정의서 (기능 상세 명세)
- [userjourney.md](./docs/userjourney.md): 3가지 페르소나의 사용자 여정
- [CLAUDE.md](./CLAUDE.md): Claude Code AI 개발 가이드

## 📄 데이터 출처 및 법적 고려사항

모든 데이터는 [용인특례시의회 공식 웹사이트](https://council.yongin.go.kr)의 공개 정보를 수집하여 재구성한 것입니다.

본 프로젝트는 영국 TheyWorkForYou의 선례를 따라, 공공 데이터의 "공정한 이용(fair use)" 원칙에 기반하여 비영리 공익 목적으로 운영됩니다. 모든 정보의 출처를 명확히 표시하며, 공식 웹사이트 원문으로 연결합니다.

## 🤝 기여하기

이 프로젝트는 오픈소스로 공개될 예정입니다.
시민 참여와 개발 협력을 환영합니다.

## 📝 개발 현황

**현재 상태**: MVP Phase 1 진행 중

다음 단계:
1. 용인시의회 웹사이트 HTML 구조 분석
2. 스크레이퍼 로직 구현 (의원, 회의록, 의안)
3. Supabase 데이터베이스 설정 및 데이터 수집
4. 프론트엔드 동적 데이터 연동

## 💡 영감

이 프로젝트는 다음에서 영감을 받았습니다:
- [TheyWorkForYou](https://www.theyworkforyou.com/) - 영국 의회 모니터링 플랫폼
- [mySociety](https://www.mysociety.org/) - 시민 기술(Civic Tech) 비영리 단체

## 📧 문의

프로젝트에 대한 문의나 제안이 있으시면 Issue를 남겨주세요.

---

**"민주주의는 선거일에만 작동하지 않습니다. 우리 대표자들이 우리를 위해 일하는지 지켜보는 것, 그것이 진정한 시민의 역할입니다."**
