# CLAUDE_KR.md

이 파일은 이 프로젝트에서 코드 작업 시 Claude Code (claude.ai/code) AI에게 제공하는 한국어 가이드입니다.

## 프로젝트 개요

**"그들은 용인시민을 위해 일합니다"**는 용인시의회를 감시하는 **데이터 저널리즘 기반 시민 감시 플랫폼**입니다.

이 프로젝트는 3가지 DNA를 결합합니다:
- **TheyWorkForYou (영국)**: 의회 데이터 아카이빙 및 검색
- **뉴스타파 (한국)**: 데이터 저널리즘 및 탐사보도 ("세금도둑 추적")
- **ProPublica (미국)**: 오픈소스 데이터 인프라

**현재 상태:** Phase 1 MVP 완료 (100%). Phase 2 AI 발언 추출 핵심 기능 구현 완료.

## 핵심 비전

1. **Radical Accessibility (근본적 접근성)**: 복잡한 의정 데이터를 모든 시민이 이해할 수 있게 만들기
2. **Data-Driven Accountability (데이터 기반 책임성)**: 의견이 아닌 데이터로 책임성 증명
3. **Investigative Infrastructure (탐사 인프라)**: 시민을 위한 탐사보도 인프라 구축
4. **Strict Non-partisanship (엄격한 비당파성)**: 정치적 중립성 유지

## 핵심 아키텍처

### 기술 스택 (PRD v2.0 기준)

| 레이어 | 기술 | 목적 |
|-------|------|------|
| **프론트엔드** | Next.js 15 (App Router) | SEO를 위한 SSR, Vercel 배포 |
| **백엔드/DB** | Supabase (PostgreSQL) | Auth, Storage, Realtime, RAG를 위한 pgvector |
| **데이터 수집** | Python (BeautifulSoup, Playwright) | council.yongin.go.kr 스크래핑 |
| **AI** | Anthropic Claude 3.5 Sonnet | 한국어 발언 요약, 투표 추출, RAG 챗봇 |
| **지도** | Naver Maps API | "내 의원 찾기" 기능의 지오코딩 |
| **이메일** | Resend API | 알림 시스템, 뉴스레터 |
| **공공 데이터** | data.go.kr API | 선거구 경계 데이터 |
| **시각화** | D3.js, Recharts | 네트워크 그래프, 투표 차트, 인터랙티브 맵 |

### 개발 단계

프로젝트는 3단계 로드맵을 따릅니다 (전체 내용은 `/docs/prd v2.0.md` 참조):

#### Phase 1 - MVP (기초) - **완료 ✅**

**목표:** 핵심 데이터 집계 시스템

완료된 기능:
- ✅ 의원 디지털 프로필 (31명 스크래핑 완료)
- ✅ 검색 가능한 회의록 아카이브 (30건)
- ✅ 법안 추적기 (30건)
- ✅ 데이터 스크래핑 파이프라인 프레임워크
- ✅ Supabase 통합된 Next.js 웹 애플리케이션
- ✅ Vercel 프로덕션 배포

#### Phase 2 - 책임성 엔진 - **핵심 기능 구현 완료 ✅**

**목표:** AI 기반 분석 시스템

구현된 기능:
- ✅ 회의록에서 AI 기반 발언 추출 (Claude API)
- ✅ 발언별 AI 요약 및 키워드 추출
- ✅ GitHub Actions 자동화 파이프라인
- 🔄 개별 투표 기록 추출 (NLP + 수동 검증) - 진행 중
- 🔄 발언 이력 및 투표 기록이 포함된 향상된 의원 프로필 - 진행 중
- 📋 투표 검증용 관리자 대시보드 - 예정

**핵심 과제:** 투표 기록이 공식 웹사이트에 구조화되어 있지 않음. 회의록 텍스트에 포함되어 있어 NLP + 수동 검증이 필요함 (`is_verified` 플래그 사용).

#### Phase 3 - 참여 및 탐사보도 - **계획 중**

**목표:** 시민 참여 + 탐사 프로젝트

예정된 기능:
- 주소로 "내 의원 찾기" (Naver Maps + PostGIS)
- 키워드/의원/법안 이메일 알림 시스템
- RAG 아키텍처를 사용한 AI 기반 Q&A 챗봇
- **탐사 프로젝트** (v2.0의 새로운 기능):
  - "해외출장 사용 내역 추적"
  - "의정비 투명성 리포트"
  - "개발 사업 추적"

## 주요 데이터 소스

- **용인특례시의회 웹사이트:** council.yongin.go.kr
  - 의원 프로필: `/kr/member/list.do`
  - 회의록: `/kr/minutes/late.do`
  - 법안 정보: `/kr/bill.do`
  - 위원회 활동

**데이터 수집 전략:**
- 공개된 데이터 스크래핑 (공정 사용 원칙, TheyWorkForYou 선례 준수)
- 항상 출처 명시 및 공식 기록 링크 제공
- 공식 API를 기다리지 않고 더 나은 UX로 가치 구축
- 플랫폼 성공 → 공식 오픈 데이터 정책 옹호

## 데이터베이스 스키마

### 핵심 테이블 (Phase 1)
```sql
councillors         -- 의원 프로필 (이름, 정당, 선거구, 사진, 연락처)
committees          -- 위원회 정보
councillor_committees -- 의원-위원회 관계
meetings            -- 회의 메타데이터 (날짜, 유형, transcript_url, transcript_text)
bills               -- 법안 정보 (의안번호, 제목, 상태, 제안자)
bill_cosponsors     -- 법안 공동 발의자
```

### Phase 2 테이블 (책임성)
```sql
speeches            -- 추출된 발언 (councillor_id, meeting_id, speech_text, ai_summary, keywords)
votes               -- 투표 기록 (bill_id, councillor_id, vote_cast, is_verified)
                    -- is_verified: 사람이 검증한 데이터 (수동 확인 필요)
```

### Phase 3 테이블 (참여 및 탐사보도)
```sql
district_mapping    -- 선거구 매핑 (선거구 → 행정동)
user_profiles       -- 확장 사용자 프로필 (auth.users에 연결)
subscriptions       -- 알림 구독 (유형: 의원/키워드/법안)
notification_logs   -- 이메일 알림 이력
chat_history        -- AI 챗봇 대화 이력
speech_embeddings   -- RAG용 벡터 임베딩 (pgvector)

-- PRD v2.0의 새로운 기능: 탐사 프로젝트
investigations      -- 탐사 프로젝트 메타데이터 (제목, 카테고리, 결과, 시각화)
investigation_councillors -- 의원을 탐사에 연결
```

### 주요 인덱스
- 한국어 텍스트를 위한 `pg_trgm` (trigram) 전문 검색
- `pgvector`를 사용한 벡터 유사도 검색 (Phase 3)
- 회의 및 법안을 위한 날짜 기반 인덱스

## AI 통합 포인트

### Phase 2: AI 처리 (구현 완료)

1. **발언 요약:**
   - 입력: 회의록 원문 텍스트
   - 처리: Claude API → 발언자별 파싱 → 발언당 3-5줄 요약 생성
   - 출력: `speeches.summary`, `speeches.keywords`
   - 저장: `speeches` 테이블의 요약, `speech_embeddings`의 임베딩

2. **투표 기록 추출:**
   - 입력: 회의록 텍스트
   - 처리: Claude API (구조화된 출력) + regex → 투표 결과 추출
   - 과제: 개별 투표가 종종 기록되지 않음 (거수표결)
   - 해결책: NLP 추출 + **수동 검증** (`is_verified` 플래그)
   - 출력: `is_verified=false`인 `votes` 테이블 → 관리자 대시보드 검토 → `is_verified=true`

### Phase 3: RAG 챗봇

3. **Q&A 챗봇:**
   - 아키텍처: 벡터 검색 (pgvector) + Claude API
   - 흐름:
     1. 사용자 질문 → 임베딩 생성
     2. `speech_embeddings`에서 벡터 유사도 검색
     3. 상위 k개 관련 발언 가져오기
     4. 프롬프트와 함께 Claude API: "이 회의록만을 기반으로 답변하세요. 추측하지 마세요."
     5. 답변 + 출처 링크 반환 (meeting_id, speech_id)

## 설계 원칙

1. **Radical Accessibility (근본적 접근성)**: 복잡한 의정 데이터를 모든 시민이 이해할 수 있게 만들기
2. **Strict Non-partisanship (엄격한 비당파성)**: 정치적 편향 없이 데이터를 객관적으로 제시
3. **Mobile-first (모바일 우선)**: 모바일 기기에 최적화된 반응형 디자인
4. **Transparency (투명성)**: 항상 출처를 인용하고 공식 기록에 링크
5. **Data Quality (데이터 품질)**: `is_verified` 플래그 사용 및 신뢰도 수준 표시

## 문서 구조

- `/docs/prd v2.0.md`: **주요 참조 문서** - 제품 요구사항 문서 (데이터 저널리즘 접근법)
- `/docs/prd v1.0.md`: 원본 PRD (기술 로드맵)
- `/docs/proposal.md`: TheyWorkForYou 모델 및 용인 데이터 환경 분석 전략 청사진
- `/docs/userjourney.md`: 3가지 페르소나의 사용자 여정 맵
- `/docs/용인 워치독.pdf`: 탐사보도 프레임워크 (뉴스타파 벤치마킹)

## 현재 구현 상태

### ✅ 완료됨 (Phase 1)
- App Router를 사용한 Next.js 15 프로젝트 설정
- Supabase 통합 (PostgreSQL + Auth + Storage)
- RLS 정책을 포함한 데이터베이스 스키마 설계
- 의원 스크래퍼 (Python + BeautifulSoup)
  - council.yongin.go.kr에서 31명의 의원 수집
  - Supabase `councillors` 테이블에 저장
- 회의록 스크래퍼 (30건 메타데이터 + URL)
- 법안 스크래퍼 (30건)
- 웹 페이지:
  - `/` - 홈페이지
  - `/about` - 소개 페이지
  - `/councillors` - 의원 목록
  - `/councillors/[id]` - 의원 상세 (프로필, 발언, 투표)
  - `/meetings` - 회의록 아카이브 (검색 기능)
  - `/meetings/[id]` - 회의 상세 (회의록)
  - `/bills` - 법안 추적기
  - `/bills/[id]` - 법안 상세
- TypeScript 타입 (`/web/src/types/`)
- Vercel 프로덕션 배포

### ✅ 완료됨 (Phase 2 핵심 기능)
- Claude API 통합 (Sonnet + Haiku)
- 회의록 전문 추출 (10건, 286,050자)
- AI 발언 추출 스크립트 (`extract_speeches.py`)
  - 자동 발언자 인식 및 의원 매칭
  - 발언별 AI 요약 생성
  - 키워드 자동 추출
- GitHub Actions 자동화 파이프라인
  - 매일 오전 2시 자동 실행
  - 회의록 수집 → 전문 추출 → AI 발언 추출

### 🔄 진행 중 (Phase 2)
- 투표 기록 추출 (NLP)
- 관리자 검증 대시보드
- 발언/투표가 포함된 향상된 의원 프로필

### 📋 예정 (Phase 2)
- 웹 UI에 발언 검색 기능
- 발언 감정 분석
- 발언 유형 분류

### 📋 예정 (Phase 3)
- "내 의원 찾기" 기능 (Naver Maps + PostGIS)
- 이메일 알림 시스템 (Resend API)
- RAG 챗봇 (pgvector + Claude API)
- 탐사 프로젝트 페이지
- 데이터 시각화 (D3.js)

## 데이터 수집 전략

### 스크래핑 워크플로우
1. **Python 스크래퍼** (BeautifulSoup/Playwright) → HTML 파싱
2. **데이터 정제** (Pandas) → 구조화된 JSON
3. **Supabase 업로드** (Service role key) → PostgreSQL
4. **Next.js 프론트엔드** → Supabase에서 가져오기 (Anon key)

### 스크래퍼 아키텍처
```
scraper/
├── scrapers/
│   ├── councillors.py  ✅ 완료 (31명)
│   ├── meetings.py     ✅ 완료 (30건)
│   └── bills.py        ✅ 완료 (30건)
├── extract_transcripts.py  ✅ 완료 (10건 전문 추출)
├── extract_speeches.py     ✅ 완료 (AI 발언 추출)
├── utils/
│   └── db.py           -- Supabase 헬퍼 함수
├── config.py           -- 환경 설정
└── requirements.txt
```

### 스크래퍼 실행
```bash
cd scraper
python -m scrapers.councillors  # ✅ 작동 (31명 수집 완료)
python -m scrapers.meetings     # ✅ 작동 (30건 수집 완료)
python -m scrapers.bills        # ✅ 작동 (30건 수집 완료)
python extract_transcripts.py --limit 10  # ✅ 작동 (10건 전문 추출)
python extract_speeches.py --limit 5      # ✅ 작동 (AI 발언 추출)
```

## 법적 고려사항

- 공식 웹사이트에 저작권 고지 (COPYRIGHT © 2021 YONGIN COUNCIL)
- **전략:** 비영리 공익을 위한 "공정 사용" 원칙 적용
  - 항상 데이터 출처를 밝히고 공식 기록에 링크 제공
  - 그대로 재게시하기보다는 데이터 변환 (요약, 분석, 시각화)
  - 플랫폼 성공은 공식 데이터 공유 협정으로 이어질 수 있음 (TheyWorkForYou 선례)
- **투명성:** 소개 페이지에 데이터 출처 및 방법론 문서화

## 윤리 지침 (PRD v2.0)

### 비당파성
- 어떤 정당/의원도 편애하거나 비판하지 않음
- 데이터를 있는 그대로 제시
- 편집 논평 최소화 (사실만)

### 투명성
- 모든 데이터 출처 인용
- AI 생성 콘텐츠에 명확한 라벨 ("AI 요약")
- 즉시 오류 수정 및 공개 공지
- 재정 기록 공개 (수입/지출)

### 개인정보 보호
- 의원은 공인 → 공개 정보는 사용 가능
- 시민 개인 데이터는 수집하지 않음 (알림용 이메일 제외)
- 댓글 섹션 없음 (괴롭힘 방지)

### 책임성
- 사용자 신고 기능 (데이터 오류, 윤리 위반)
- 독립 자문위원회 (언론인, 변호사, 시민 단체)
- 연간 투명성 보고서

## 개발 가이드라인

### 기능 구현 시

1. **항상 PRD v2.0 먼저 확인** (`/docs/prd v2.0.md`)
2. **데이터베이스 변경:**
   - `/supabase/schema.sql` 업데이트
   - `/supabase/migrations/`에 마이그레이션 생성
   - Supabase 프로젝트에 적용
3. **스크래퍼 개발:**
   - 분석을 위해 `/scraper/*.html`에 샘플 HTML 저장
   - 정적 페이지는 BeautifulSoup, 동적 콘텐츠는 Playwright 사용
   - Service role key로 데이터 저장 (`.env`에, 절대 커밋하지 말 것)
   - 대량 업로드 전 데이터 품질 확인
4. **프론트엔드 개발:**
   - Next.js App Router 사용 (Pages Router 아님)
   - 가능하면 서버 사이드에서 데이터 가져오기 (SEO용 SSR)
   - 공개 데이터에 Supabase Anon key 사용
   - 모바일 우선 반응형 디자인 (Tailwind CSS)
5. **AI 통합:**
   - Claude 3.5 Sonnet API 사용 (한국어 성능 우수)
   - AI 응답에 항상 출처 인용 포함
   - AI가 "환각"하지 않도록 - 제공된 데이터로 제한
   - UI에서 AI 생성 콘텐츠에 명확한 라벨

### 코드 스타일
- TypeScript strict mode
- ESLint 설정 (`/web/eslint.config.mjs` 참조)
- Prettier 포맷팅
- 도메인 특정 로직에 한국어 주석 허용

### Git 워크플로우
- 브랜치 명명: `feature/meetings-scraper`, `fix/vote-extraction`
- 커밋 메시지: 영어 선호, 한국어 허용
- PR 설명: 관련 PRD 섹션에 링크

## 주요 과제 및 해결책

### 과제 1: 투표 기록 미제공
**문제:** council.yongin.go.kr은 개별 투표 기록을 구조화된 형식으로 게시하지 않음

**해결책 (Phase 2):**
1. Claude API를 사용한 회의록 NLP 추출
2. 수동 검증 (관리자 대시보드)
3. 데이터베이스의 `is_verified` 플래그
4. 미검증 투표에 UI에서 "미검증" 라벨 표시
5. 장기: 플랫폼 성공 후 공식 데이터 공개 옹호

### 과제 2: 회의록 형식 불일치
**문제:** 회의마다 HTML/PDF 구조가 다름

**해결책:**
- 다양한 패턴 학습 (regex + AI)
- 폴백 로직: 파싱 실패 시 원문 텍스트 저장
- 지속적인 모니터링 및 패턴 업데이트

### 과제 3: AI 비용 관리
**문제:** Claude API는 토큰당 과금

**해결책:**
- 토큰 제한 (발언당 입력 2000, 출력 200)
- API 호출 최소화를 위한 배치 처리
- 캐싱 (같은 회의록 재요약하지 않음)
- **비용 추정:** Phase 2용 약 $50-100 (1000개 발언)

### 과제 4: 데이터 스크래핑 법적 위험
**문제:** 공식 웹사이트의 저작권 고지

**해결책:**
- 공정 사용 원칙 (비영리 공익)
- 데이터 변환 (요약, 분석, 시각화)
- 항상 출처 인용
- TheyWorkForYou 선례: 허가 없이 시작 → 가치 입증 후 협상

## 다음 즉시 단계

### Phase 2 완성 (우선순위 순서)
1. **웹 UI에 발언 표시**
   - `/councillors/[id]`에 발언 이력 탭 추가
   - 발언 검색 및 필터 기능
   - AI 요약 명확하게 라벨링

2. **투표 기록 추출 개선**
   - 회의록에서 투표 패턴 추출을 위한 NLP 개선
   - 검증을 위한 관리자 대시보드 구축
   - `is_verified` 플래그 구현

3. **자동화 모니터링**
   - GitHub Actions 로그 검토
   - API 사용량 및 비용 추적
   - 오류 알림 설정

4. **데이터 품질 개선**
   - 더 많은 회의록 처리 (목표: 100건)
   - 발언 추출 정확도 검증
   - 의원 매칭 검토

## 참고 링크

- **공식 데이터 소스:** https://council.yongin.go.kr
- **Supabase 프로젝트:** (`.env.local`에서 URL 확인)
- **Vercel 배포:** https://web-j30km2fem-yongparks-projects.vercel.app
- **PRD v2.0:** `/docs/prd v2.0.md` (주요 참조 문서)
- **Claude API 문서:** https://docs.anthropic.com
- **Naver Maps API:** https://navermaps.github.io/maps.js.ncp

## 현재 프로젝트 상황 요약

### 완료된 작업 (2025-10-19 기준)

**Phase 1 (100% 완료)**
- ✅ 31명 의원 프로필 수집
- ✅ 30건 회의록 메타데이터 수집
- ✅ 30건 법안 수집
- ✅ Next.js 웹 애플리케이션 완성
- ✅ Vercel 프로덕션 배포
- ✅ 검색 및 필터 기능

**Phase 2 (핵심 기능 완료)**
- ✅ 10건 회의록 전문 추출 (286,050자)
- ✅ Claude API 통합 (Sonnet + Haiku)
- ✅ AI 발언 추출 스크립트 (`extract_speeches.py`)
  - 14개 발언 성공적으로 추출 및 요약
  - 70개 키워드 생성
- ✅ GitHub Actions 자동화 파이프라인
  - 매일 오전 2시 자동 실행
  - 데이터 수집 → 전문 추출 → AI 발언 추출

### 진행 중인 작업
- 🔄 웹 UI에 발언 표시 기능
- 🔄 투표 기록 추출 개선
- 🔄 더 많은 회의록 처리

### 다음 우선순위
1. 웹 UI에 발언 섹션 추가
2. 투표 기록 NLP 추출
3. 관리자 검증 대시보드
4. Phase 3 기능 (지도, 알림, 챗봇)

## 질문 또는 명확화

기능 구현 시 요구사항이 불확실한 경우:
1. 먼저 `/docs/prd v2.0.md` 확인
2. TheyWorkForYou 또는 뉴스타파에서 유사한 사례 찾기
3. 사용자에게 명확화 요청
4. 코드 주석에 결정 사항 문서화

---

**기억하세요:** 이것은 단순한 기술 플랫폼이 아닙니다 - **민주적 책임성을 위한 시민 인프라**입니다. 모든 기능은 정부를 더 투명하고 시민이 접근하기 쉽게 만드는 목표를 지향해야 합니다.
