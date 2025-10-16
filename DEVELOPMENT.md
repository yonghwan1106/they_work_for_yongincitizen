# 개발 가이드

## 프로젝트 현황

### ✅ 완료된 작업

#### 인프라 및 설정
- [x] Next.js 15 프로젝트 초기화 (TypeScript, Tailwind CSS)
- [x] Supabase 연동 설정 (클라이언트/서버)
- [x] 환경 변수 구성
- [x] Git 설정 (.gitignore)

#### 데이터베이스
- [x] 완전한 데이터베이스 스키마 설계 (Phase 1-3)
- [x] RLS (Row Level Security) 정책
- [x] 한국어 텍스트 검색 (pg_trgm)
- [x] 검색 함수 (search_speeches)
- [x] 샘플 데이터 SQL 스크립트

#### 타입 시스템
- [x] Database 타입 정의
- [x] 편의 타입 (Councillor, Bill, Meeting 등)
- [x] 관계형 타입 (WithDetails, WithStats)

#### UI 컴포넌트
- [x] Header (네비게이션)
- [x] Footer
- [x] CouncillorCard (의원 카드)

#### 페이지 구현
- [x] 홈페이지 (히어로, 기능 소개, 통계)
- [x] 의원 목록 페이지 (필터링)
- [x] 의원 상세 페이지 (프로필, 의안, 발언, 표결)
- [x] 회의록 목록/검색 페이지
- [x] 의안 목록 페이지
- [x] 소개 페이지

#### Python 스크레이퍼
- [x] 기본 구조 및 설정
- [x] Supabase 연동 유틸리티
- [x] 스크레이퍼 템플릿 (의원, 회의록, 의안)

#### 문서화
- [x] 프로젝트 README
- [x] CLAUDE.md (AI 개발 가이드)
- [x] Supabase 가이드
- [x] Scraper 가이드
- [x] QUICKSTART.md

### 🔄 진행 중인 작업

없음 - Phase 1 MVP의 80% 완료

### 📋 다음 작업

#### 즉시 가능
1. **샘플 데이터 테스트**
   - Supabase에 schema.sql 실행
   - sample_data.sql 실행
   - 웹사이트에서 데이터 표시 확인

2. **스타일 개선**
   - 반응형 디자인 최적화
   - 다크모드 지원 (선택사항)
   - 로딩 상태 추가

#### 중기 목표 (1-2주)
3. **실제 데이터 수집**
   - council.yongin.go.kr 웹사이트 HTML 구조 분석
   - 스크레이퍼 로직 구현
   - 데이터 수집 자동화 (GitHub Actions)

4. **검색 기능 강화**
   - 전체 텍스트 검색 UI
   - 고급 필터링
   - 검색 결과 하이라이팅

#### 장기 목표 (Phase 2)
5. **AI 분석 기능**
   - Claude API 연동
   - 회의록 발언 자동 추출
   - 발언 요약 생성
   - 키워드 추출

6. **표결 기록 시스템**
   - 표결 기록 추출 (AI + Human-in-the-loop)
   - 검증 시스템
   - 정책별 투표 성향 분석

## 개발 워크플로우

### 1. 새로운 페이지 추가

```bash
# 1. 페이지 파일 생성
web/src/app/새페이지/page.tsx

# 2. 타입 정의 (필요시)
web/src/types/index.ts

# 3. 컴포넌트 생성 (재사용 가능한 경우)
web/src/components/새컴포넌트.tsx

# 4. 헤더에 링크 추가
web/src/components/Header.tsx
```

### 2. 새로운 데이터 테이블 추가

```sql
-- 1. Supabase에서 테이블 생성
CREATE TABLE new_table (...);

-- 2. 타입 정의 업데이트
web/src/types/database.types.ts

-- 3. RLS 정책 설정
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY ...
```

### 3. 스크레이퍼 추가

```python
# 1. 새 스크레이퍼 파일 생성
scraper/scrapers/new_scraper.py

# 2. DB 유틸리티 함수 추가 (필요시)
scraper/utils/db.py

# 3. main.py에 통합
scraper/main.py
```

## 코딩 컨벤션

### TypeScript/React
- Server Components 우선 사용
- Client Components는 'use client' 명시
- async/await 사용
- 에러 처리 필수

### 네이밍
- 파일: PascalCase.tsx (컴포넌트), camelCase.ts (유틸)
- 컴포넌트: PascalCase
- 함수/변수: camelCase
- 상수: UPPER_SNAKE_CASE
- 타입: PascalCase

### Supabase 쿼리
- 에러 처리 필수
- 타입 안전성 유지
- RLS 정책 고려

## 성능 최적화

### 프론트엔드
- [ ] Image 최적화 (next/image)
- [ ] 코드 스플리팅 (dynamic imports)
- [x] Font 최적화 (Noto Sans KR)
- [ ] 캐싱 전략 (ISR, SWR)

### 데이터베이스
- [x] 인덱스 설정
- [x] RLS 정책
- [ ] 쿼리 최적화
- [ ] 연결 풀링

### 스크레이퍼
- [ ] Rate limiting
- [ ] 에러 복구
- [ ] 중복 방지
- [ ] 로깅

## 배포 체크리스트

### Vercel 배포
- [ ] 환경 변수 설정
- [ ] Build 성공 확인
- [ ] 도메인 연결
- [ ] Analytics 설정

### Supabase
- [x] RLS 활성화
- [ ] Backup 설정
- [ ] 모니터링
- [ ] 사용량 확인

### GitHub Actions
- [ ] 스크레이퍼 자동화
- [ ] 테스트 자동화
- [ ] 배포 자동화

## 문제 해결

### 자주 발생하는 문제

#### 1. Supabase 연결 오류
```
Error: Failed to fetch
```
**해결책:**
- `.env.local` 파일 확인
- Supabase 프로젝트 상태 확인
- CORS 설정 확인

#### 2. 타입 에러
```
Property 'xxx' does not exist on type 'yyy'
```
**해결책:**
- `database.types.ts` 업데이트
- `npm run build`로 전체 타입 검사

#### 3. 데이터가 표시되지 않음
**확인 사항:**
- Supabase에 데이터 존재 확인
- RLS 정책 확인
- 네트워크 탭에서 API 응답 확인

## 유용한 명령어

```bash
# 개발 서버
cd web && npm run dev

# 프로덕션 빌드
cd web && npm run build

# 타입 체크
cd web && npx tsc --noEmit

# 스크레이퍼 실행
cd scraper && python main.py --target all

# Git
git add .
git commit -m "feat: 새 기능"
git push
```

## 참고 자료

- [Next.js 문서](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)
