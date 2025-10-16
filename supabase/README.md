# Supabase Database Setup

이 디렉토리에는 용인시의회 모니터링 플랫폼의 데이터베이스 스키마가 포함되어 있습니다.

## 스키마 적용 방법

### 1. Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에 접속하여 새 프로젝트를 생성합니다
2. Database 비밀번호를 설정합니다 (잘 기억해두세요!)
3. 프로젝트가 생성될 때까지 대기 (~2분)

### 2. 환경 변수 설정
1. Project Settings > API로 이동
2. 다음 값들을 복사:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key (보안 주의!) → `SUPABASE_KEY` (Python 스크레이퍼용)
3. `web/.env.local` 파일에 설정
4. `scraper/.env` 파일에 설정

### 3. SQL 스키마 실행
Supabase Dashboard에서:
1. SQL Editor로 이동
2. `schema.sql` 파일의 내용을 복사하여 붙여넣기
3. Run 버튼을 클릭하여 실행
4. 성공 메시지 확인

### 4. 샘플 데이터 삽입 (선택사항)
개발 및 테스트를 위해 샘플 데이터를 삽입할 수 있습니다:
1. SQL Editor에서 `sample_data.sql` 파일 내용 복사
2. Run 버튼 클릭
3. 삽입된 데이터 개수 확인

**샘플 데이터:**
- 6명의 의원 (더불어민주당 3명, 국민의힘 2명, 정의당 1명)
- 5개의 위원회
- 5건의 회의록
- 5건의 의안 (조례안 4건, 예산안 1건)
- 발언 기록 3건
- 검증된 표결 기록

또는 Supabase CLI 사용:
```bash
supabase db push
```

## 데이터베이스 구조

### Phase 1 (MVP) 테이블
- `councillors`: 의원 정보
- `committees`: 위원회 정보
- `councillor_committees`: 의원-위원회 관계
- `meetings`: 회의 정보
- `bills`: 의안 정보
- `bill_cosponsors`: 의안 공동발의자

### Phase 2 (책임 추궁) 테이블
- `speeches`: 발언 기록 (AI 요약 포함)
- `votes`: 표결 기록 (검증 시스템 포함)

### Phase 3 (시민 참여) 테이블
- `district_mapping`: 선거구 매핑
- `user_profiles`: 사용자 프로필
- `subscriptions`: 알림 구독
- `notification_logs`: 알림 발송 기록
- `chat_history`: AI 채팅 기록
- `speech_embeddings`: 발언 벡터 임베딩 (RAG용)

## 주요 기능

- **Full-text Search**: `pg_trgm` 확장을 사용한 한국어 텍스트 검색
  - Trigram 기반 유사도 검색으로 오타에 강함
  - `search_speeches(검색어)` 함수로 발언 검색 가능
- **Vector Search**: Phase 3에서 RAG 구현을 위한 벡터 유사도 검색
- **Row Level Security**: 공개 데이터는 누구나 읽기 가능, 개인 데이터는 소유자만 접근
- **자동 타임스탬프**: `updated_at` 자동 업데이트 트리거

## 텍스트 검색 사용법

### 방법 1: 검색 함수 사용 (추천)
```sql
-- 발언 검색 예시
SELECT * FROM search_speeches('환경 보호') LIMIT 10;
```

### 방법 2: 직접 쿼리
```sql
-- 발언 텍스트에서 '환경'이 포함된 내용 검색
SELECT *
FROM speeches
WHERE speech_text ILIKE '%환경%'
ORDER BY created_at DESC;

-- Trigram 유사도 검색 (더 정교한 검색)
SELECT *,
  similarity(speech_text, '환경 보호') as sim
FROM speeches
WHERE speech_text % '환경 보호'
ORDER BY sim DESC
LIMIT 10;
```
