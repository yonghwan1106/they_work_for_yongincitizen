# 그들은 용인시민을 위해 일합니다

> **데이터 저널리즘 기반 용인시의회 감시 플랫폼**

단순한 의정 정보 제공을 넘어, **데이터로 증명하는 시민 감시 인프라**입니다.

영국 TheyWorkForYou의 의정 투명성 모델과 뉴스타파의 탐사보도 DNA를 결합하여, 용인시의회 데이터를 시민이 이해하고 행동할 수 있는 형태로 재구성합니다.

## 🎯 Core Vision

1. **Radical Accessibility**: 복잡한 의정 데이터를 모든 시민이 이해할 수 있게
2. **Data-Driven Accountability**: 데이터로 증명하는 의정 감시
3. **Investigative Infrastructure**: 탐사보도를 위한 시민 인프라 구축
4. **Strict Non-partisanship**: 정치적 중립성 유지

## 💡 Inspiration: 3가지 DNA의 융합

| Platform | Core Strength | What We Adopt |
|----------|---------------|---------------|
| **TheyWorkForYou (UK)** | 의정 데이터 아카이빙 & 검색 | 의원별 프로필, 발언 아카이브, 법안 추적 시스템 |
| **뉴스타파 (KR)** | 데이터 저널리즘 & 탐사보도 | "세금도둑 추적" 프로젝트 방식, 시각화, 시민 펀딩 모델 |
| **ProPublica (US)** | 오픈소스 데이터 인프라 | 재사용 가능한 데이터셋, API 제공, 공공 기여 유도 |

## 🏗️ 프로젝트 구조

```
they_work_for_yongincitizen/
├── docs/                     # 프로젝트 문서
│   ├── prd v2.0.md          # ⭐ Product Requirements Document (데이터 저널리즘 통합)
│   ├── prd v1.0.md          # 초기 PRD
│   ├── proposal.md          # 전략적 청사진
│   └── userjourney.md       # 사용자 여정 맵
├── web/                      # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/             # App Router 페이지
│   │   ├── components/      # 재사용 가능한 컴포넌트
│   │   └── lib/             # 유틸리티 (Supabase 클라이언트 등)
│   └── package.json
├── scraper/                  # Python 데이터 수집 스크립트
│   ├── scrapers/
│   │   ├── councillors.py   # ✅ DONE (31명 수집 완료)
│   │   ├── meetings.py      # 🔄 TODO
│   │   └── bills.py         # 🔄 TODO
│   ├── utils/               # 데이터베이스 유틸리티
│   └── requirements.txt
├── supabase/                 # 데이터베이스 스키마
│   ├── schema.sql
│   └── migrations/
│       └── 20251018_add_investigations.sql  # 탐사 프로젝트 테이블
└── CLAUDE.md                 # Claude Code용 개발 가이드 (PRD v2.0 반영)
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
   ```sql
   -- 1. 기본 스키마 생성
   \i supabase/schema.sql

   -- 2. 탐사 프로젝트 테이블 추가 (PRD v2.0)
   \i supabase/migrations/20251018_add_investigations.sql

   -- 3. 샘플 데이터 삽입 (선택사항)
   \i supabase/sample_data.sql
   ```
3. Project Settings에서 API keys 확인하여 환경 변수에 설정

**현재 데이터:**
- ✅ 31명의 용인시의원 (실제 스크래핑 데이터)
- 📋 샘플 회의록, 의안, 표결 기록 (테스트용)

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
# .env 파일에서 Supabase Service Role Key 설정

# 의원 정보 스크레이퍼 실행 (이미 완료됨)
python -m scrapers.councillors  # ✅ 31명 수집 완료

# 회의록/의안 스크레이퍼 (구현 예정)
# python -m scrapers.meetings
# python -m scrapers.bills
```

자세한 내용은 [`scraper/SCRAPER_SUCCESS.md`](./scraper/SCRAPER_SUCCESS.md) 참조

## 📅 개발 로드맵 (3 Phases)

### Phase 1: MVP - Foundation ✅ 80% 완료

**Goal:** 기본적인 의정 데이터 아카이빙 시스템 구축

- [x] Next.js 프로젝트 초기화
- [x] 데이터베이스 스키마 설계 (PRD v2.0 반영)
- [x] Python 스크레이퍼 기본 구조
- [x] 의원 정보 스크래퍼 (31명 수집 완료)
- [x] 기본 레이아웃 및 홈페이지
- [x] 의원별 디지털 프로필 페이지
- [x] 의원 상세 페이지 구조
- [x] TypeScript 타입 정의
- [x] Supabase 연동 완료
- [ ] 회의록 스크레이퍼 구현 🔄
- [ ] 의안 스크레이퍼 구현 🔄
- [ ] 회의록/의안 페이지 구현 🔄
- [ ] 전문 검색 기능 🔄

**Deliverables:**
- 의원 30명 프로필 수집 ✅
- 최근 1년 회의록 100건 이상 아카이빙 🔄
- 법안 50건 이상 추적 🔄
- 검색 가능한 웹사이트 🔄

### Phase 2: Accountability Engine 📋 계획 중

**Goal:** AI 기반 의정 활동 분석 시스템 구축

- [ ] AI 발언 추출 & 요약 (Claude API)
- [ ] 투표 기록 추출 (NLP + 수작업 검증)
- [ ] 의원별 통합 프로필 2.0 (발언 이력, 투표 성향)
- [ ] 관리자 검증 대시보드

**Critical Challenge:**
용인시의회는 개별 투표 기록을 공개하지 않음 → 회의록 NLP 분석 + 수작업 검증 필요

**Deliverables:**
- 1,000개 이상 발언 AI 요약
- 100개 법안 투표 기록 (검증 완료)
- 의원별 분석 페이지 30개

### Phase 3: Engagement & Investigation 📋 계획 중

**Goal:** 시민 참여 기능 + 데이터 저널리즘 프로젝트 런칭

**시민 참여 기능:**
- [ ] "내 지역구 의원 찾기" (주소 → Naver Maps)
- [ ] 이메일 알림 시스템 (키워드/의원/법안)
- [ ] AI 챗봇 (RAG: pgvector + Claude API)

**⭐ 탐사 프로젝트 (NEW in PRD v2.0):**

뉴스타파의 "세금도둑 추적" 방식을 벤치마킹한 데이터 저널리즘 프로젝트:

1. **해외출장 사용 내역 추적**
   - 의원별 해외출장 횟수, 목적지, 비용 시각화
   - 출장 목적과 결과 보고서 연결
   - 인터랙티브 지도 (D3.js)

2. **의정비 투명성 리포트**
   - 의정비 사용 내역 연간 리포트
   - 타 지자체 의회와 비교 분석

3. **개발 사업 추적**
   - 대규모 개발 사업 관련 의원 발언/투표 패턴 분석
   - 찬성/반대 의원 네트워크 그래프

**Deliverables:**
- 지역구 찾기 기능
- 알림 시스템 (100명 구독자)
- AI 챗봇 베타
- 탐사 프로젝트 1개 완성

## 🛠️ 기술 스택

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS | SSR for SEO, Vercel 배포 |
| **Backend/DB** | Supabase (PostgreSQL) | Auth, Storage, Realtime, pgvector for RAG |
| **Data Collection** | Python, BeautifulSoup, Playwright | council.yongin.go.kr 스크래핑 |
| **AI** | Anthropic Claude 3.5 Sonnet | 한국어 발언 요약, 투표 추출, RAG 챗봇 |
| **Maps** | Naver Maps API | 지역구 찾기 (Geocoding) |
| **Email** | Resend API | 알림 시스템, 뉴스레터 |
| **Visualization** | D3.js, Recharts | 네트워크 그래프, 투표 차트, 인터랙티브 맵 |
| **Public Data** | data.go.kr API | 선거구 경계 데이터 |

## 📚 주요 문서

- [**prd v2.0.md**](./docs/prd%20v2.0.md): ⭐ **PRIMARY REFERENCE** - 데이터 저널리즘 접근 방식, 탐사 프로젝트 상세
- [prd v1.0.md](./docs/prd%20v1.0.md): 초기 PRD (3-phase 기술 로드맵)
- [proposal.md](./docs/proposal.md): TheyWorkForYou 벤치마킹 및 전략적 청사진
- [userjourney.md](./docs/userjourney.md): 3가지 페르소나의 사용자 여정
- [CLAUDE.md](./CLAUDE.md): Claude Code AI 개발 가이드 (PRD v2.0 반영)

## 📊 Database Schema

### Core Tables (Phase 1)
```sql
councillors             -- 의원 프로필 (이름, 정당, 선거구, 연락처)
committees              -- 위원회 정보
councillor_committees   -- 의원-위원회 관계
meetings                -- 회의 메타데이터 (날짜, 회의록, 영상)
bills                   -- 의안 정보 (의안번호, 제목, 상태)
bill_cosponsors         -- 공동발의자
```

### Phase 2 Tables
```sql
speeches                -- AI 추출 발언 (요약, 키워드, 임베딩)
votes                   -- 투표 기록 (is_verified 플래그)
```

### Phase 3 Tables
```sql
district_mapping        -- 선거구 매핑 (주소 → 의원)
subscriptions           -- 알림 구독
chat_history            -- AI 챗봇 대화 이력
speech_embeddings       -- RAG용 벡터 임베딩 (pgvector)

-- NEW in PRD v2.0: 탐사 프로젝트
investigations          -- 탐사 프로젝트 메타데이터
investigation_councillors -- 프로젝트-의원 연결
```

자세한 스키마: [`supabase/schema.sql`](./supabase/schema.sql)

## 📄 데이터 출처 및 법적 고려사항

모든 데이터는 [용인특례시의회 공식 웹사이트](https://council.yongin.go.kr)의 공개 정보를 수집하여 재구성한 것입니다.

**Fair Use 원칙:**
- 비영리 공익 목적 (시민의 알 권리)
- 원본 데이터 변형 (요약, 분석, 시각화)
- 항상 출처 명시 및 원본 링크 제공

**선례:**
영국 TheyWorkForYou는 공식 API 없이 시작 → 플랫폼 성공 후 공공기관과 협력 체계 구축

## 🤝 윤리 원칙 (PRD v2.0)

### Non-partisanship (비당파성)
- 어떤 정당/의원도 우대하거나 폄하하지 않음
- 데이터는 있는 그대로 제시
- 편집자 코멘트 최소화 (팩트만 제공)

### Transparency (투명성)
- 모든 데이터 출처 명시
- AI 생성 콘텐츠 명확히 라벨링
- 오류 발견 시 즉시 수정 및 공지
- 재정 내역 공개 (수입/지출)

### Privacy (개인정보보호)
- 의원은 공인이므로 공개된 정보 사용 가능
- 일반 시민 개인정보는 절대 수집하지 않음 (이메일 외)
- 댓글 기능 없음 (악플 방지)

### Accountability (책임성)
- 사용자 신고 기능 (데이터 오류, 윤리 위반)
- 독립 자문위원회 구성 계획 (언론인, 법률가, 시민단체)
- 연간 투명성 리포트 발행

## 💰 지속가능성 모델 (Phase 3 이후)

**뉴스타파 벤치마킹:**
- 시민 후원 모델 (월 정기 후원)
- 투명한 재정 공개
- 비영리 독립성 유지 (광고 없음, 정치 후원 거부)

**예상 월 운영비:** 15-20만원
- Vercel Pro: $20/월
- Supabase Pro: $25/월
- Claude API: $50-100/월
- 도메인/이메일: $10/월

→ 시민 후원 200명 × 5,000원 = 100만원/월로 충분히 충당 가능

## 📝 개발 현황

**현재 상태**: Phase 1 MVP 진행 중 (~80% 완료)

**다음 단계:**
1. 회의록 스크레이퍼 구현 (`scrapers/meetings.py`)
2. 의안 스크레이퍼 구현 (`scrapers/bills.py`)
3. 회의록/의안 웹 페이지 구현
4. Vercel 배포 및 자동 스크래핑 설정

## 🔧 기여하기

이 프로젝트는 오픈소스로 공개될 예정입니다.
시민 참여와 개발 협력을 환영합니다.

**개발 가이드:**
- 기능 구현 전 [`docs/prd v2.0.md`](./docs/prd%20v2.0.md) 확인
- TypeScript strict mode, ESLint 준수
- 코드 커밋 전 `npm run build` 성공 확인
- AI 개발 시 [`CLAUDE.md`](./CLAUDE.md) 참조

## 📧 문의

프로젝트에 대한 문의나 제안이 있으시면 Issue를 남겨주세요.

---

## 🌟 영감을 준 프로젝트

- [TheyWorkForYou](https://www.theyworkforyou.com/) - 영국 의회 모니터링 플랫폼
- [mySociety](https://www.mysociety.org/) - 시민 기술(Civic Tech) 비영리 단체
- [뉴스타파](https://newstapa.org) - 한국 탐사보도 전문 매체 ("세금도둑 추적" 프로젝트)
- [ProPublica](https://www.propublica.org/) - 미국 비영리 탐사보도 매체

---

**"민주주의는 선거일에만 작동하지 않습니다.**
**우리 대표자들이 우리를 위해 일하는지 지켜보는 것, 그것이 진정한 시민의 역할입니다."**

**"데이터로 증명하고, 시민이 감시하고, 함께 만드는 투명한 지방의회."**
