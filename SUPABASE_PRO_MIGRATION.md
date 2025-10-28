# Supabase 프리 → 프로 마이그레이션 가이드

**목표**: 현재 프리 플랜 Supabase 프로젝트를 프로 플랜으로 마이그레이션

---

## 📋 마이그레이션 옵션

### 옵션 1: 기존 프로젝트 업그레이드 (가장 간단) ⭐ 추천

Supabase는 프로젝트를 직접 업그레이드할 수 있습니다. 데이터 이동 없이 플랜만 변경됩니다.

**장점**:
- ✅ 데이터 이동 불필요
- ✅ URL 변경 없음
- ✅ 환경 변수 변경 없음
- ✅ 5분 안에 완료

**단점**:
- 프리 플랜 프로젝트가 사라짐 (업그레이드되므로)

#### 단계별 가이드

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard 접속
   - 현재 프로젝트 선택

2. **Settings → Billing 이동**
   - 왼쪽 사이드바에서 `Settings` 클릭
   - `Billing` 탭 선택

3. **Upgrade to Pro 클릭**
   - "Upgrade to Pro" 버튼 클릭
   - $25/month 플랜 확인

4. **결제 정보 입력**
   - 신용카드 정보 입력
   - 확인 후 업그레이드

5. **완료!**
   - 즉시 프로 플랜 기능 사용 가능
   - 환경 변수 변경 없음

---

### 옵션 2: 새 프로 프로젝트로 마이그레이션 (클린 시작)

기존 프리 플랜 유지하면서 새로운 프로 프로젝트를 생성하고 데이터를 이동합니다.

**장점**:
- ✅ 프리 플랜 프로젝트 유지 (백업 용도)
- ✅ 클린 시작

**단점**:
- ❌ 데이터 마이그레이션 필요
- ❌ URL 변경 필요
- ❌ 환경 변수 업데이트 필요
- ❌ 30분~1시간 소요

#### 단계별 가이드

**1단계: 현재 데이터 백업**

```bash
cd /c/Users/user/they_work_for_yongincitizen

# 1. 스키마 백업
# Supabase Dashboard → Database → Schema → Export SQL
# 또는 수동으로 schema.sql 사용

# 2. 데이터 백업 (pg_dump 사용)
# Supabase Dashboard → Settings → Database → Connection string 복사
pg_dump -h [YOUR_PROJECT_REF].supabase.co \
  -U postgres \
  -d postgres \
  --no-owner \
  --no-privileges \
  -f backup_$(date +%Y%m%d).sql
```

**2단계: 새 프로 프로젝트 생성**

1. Supabase Dashboard → New Project
2. 프로젝트 이름: `they_work_for_yongincitizen_pro`
3. 데이터베이스 비밀번호 설정 (안전하게 보관!)
4. 리전: `ap-northeast-1` (도쿄) 또는 `ap-southeast-1` (싱가포르)
5. **Plan 선택: Pro ($25/month)**
6. Create New Project 클릭

**3단계: 스키마 복원**

```sql
-- Supabase Dashboard → SQL Editor에서 실행

-- 1. Extensions 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. 스키마 생성 (schema.sql 실행)
-- supabase/schema.sql 내용 복사 & 붙여넣기
```

**4단계: 데이터 마이그레이션**

옵션 A: **Supabase CLI 사용** (추천)

```bash
# Supabase CLI 설치 (없는 경우)
npm install -g supabase

# 프리 프로젝트에서 데이터 다운로드
supabase db dump --db-url "postgresql://postgres:[OLD_PASSWORD]@[OLD_PROJECT_REF].supabase.co:5432/postgres" > data_dump.sql

# 프로 프로젝트에 데이터 업로드
supabase db push --db-url "postgresql://postgres:[NEW_PASSWORD]@[NEW_PROJECT_REF].supabase.co:5432/postgres" data_dump.sql
```

옵션 B: **수동 CSV 내보내기/가져오기**

```bash
# 1. 프리 프로젝트에서 CSV 내보내기
# Supabase Dashboard → Table Editor → 각 테이블 → Export to CSV

# 2. 프로 프로젝트에 CSV 가져오기
# Supabase Dashboard → Table Editor → 각 테이블 → Import CSV
```

**5단계: 환경 변수 업데이트**

```bash
cd /c/Users/user/they_work_for_yongincitizen/web

# .env.local 파일 편집
```

```env
# 이전 (프리)
NEXT_PUBLIC_SUPABASE_URL=https://[OLD_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[OLD_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[OLD_SERVICE_KEY]

# 새로운 (프로)
NEXT_PUBLIC_SUPABASE_URL=https://[NEW_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[NEW_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[NEW_SERVICE_KEY]
```

**6단계: Vercel 환경 변수 업데이트**

```bash
# Vercel Dashboard → 프로젝트 → Settings → Environment Variables

# 다음 변수 업데이트:
1. NEXT_PUBLIC_SUPABASE_URL
2. NEXT_PUBLIC_SUPABASE_ANON_KEY
3. SUPABASE_SERVICE_ROLE_KEY
```

**7단계: 재배포**

```bash
cd /c/Users/user/they_work_for_yongincitizen/web

# 로컬 테스트
npm run dev
# localhost:3000 접속하여 데이터 로드 확인

# Vercel 재배포
vercel --prod --yes
```

**8단계: GitHub Actions Secrets 업데이트**

```bash
# GitHub → 저장소 → Settings → Secrets and variables → Actions

# 다음 Secrets 업데이트:
1. SUPABASE_URL
2. SUPABASE_SERVICE_ROLE_KEY
3. ANTHROPIC_API_KEY (변경 없음)
```

---

## 🔍 데이터 검증

마이그레이션 후 다음 항목을 확인하세요:

```sql
-- 1. 테이블 개수 확인
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'public';

-- 2. 데이터 개수 확인
SELECT 'councillors' as table_name, COUNT(*) FROM councillors
UNION ALL
SELECT 'meetings', COUNT(*) FROM meetings
UNION ALL
SELECT 'bills', COUNT(*) FROM bills
UNION ALL
SELECT 'speeches', COUNT(*) FROM speeches
UNION ALL
SELECT 'votes', COUNT(*) FROM votes;

-- 3. Extensions 확인
SELECT * FROM pg_extension;
```

**예상 결과**:
- councillors: 31건
- meetings: 30건
- bills: 30건
- speeches: 14건 (AI 처리된 발언)
- votes: 검증된 투표 기록

---

## 💰 비용 비교

### 프리 플랜
- ✅ 무료
- ❌ 500MB 데이터베이스
- ❌ 1GB 파일 스토리지
- ❌ 50,000 MAU (월간 활성 사용자)
- ❌ 2개 프로젝트만

### 프로 플랜 ($25/month)
- ✅ 8GB 데이터베이스 (16배 증가)
- ✅ 100GB 파일 스토리지 (100배 증가)
- ✅ 100,000 MAU (2배 증가)
- ✅ 무제한 프로젝트
- ✅ 일일 백업
- ✅ 우선 지원
- ✅ 사용자 정의 도메인

**현재 프로젝트 요구사항**:
- 데이터베이스: ~10MB (프리 충분하지만 성장 가능성)
- 파일: 의원 사진 등 (~5MB)
- MAU: 초기 단계 (~100명 이하)

**프로 플랜 권장 이유**:
1. 🚀 **성장 대비**: 회의록, 발언 데이터 증가 시 프리 플랜 한계 도달
2. 💾 **백업**: 일일 자동 백업으로 데이터 안전성 확보
3. ⚡ **성능**: 더 빠른 응답 속도
4. 🔧 **우선 지원**: 문제 발생 시 빠른 대응

---

## 🚀 추천 방식

### 상황별 추천

**케이스 1: 프리 프로젝트 하나만 사용 중**
→ **옵션 1 (업그레이드)** 추천
- 5분 안에 완료
- 데이터 이동 불필요
- 환경 변수 변경 없음

**케이스 2: 여러 프리 프로젝트 사용 중 + 프리 유지 필요**
→ **옵션 2 (새 프로젝트)** 추천
- 프리 프로젝트 유지
- 클린 시작
- 백업 용도로 프리 유지

**이 프로젝트의 경우**:
→ **옵션 1 (업그레이드)** 강력 추천!
- 단일 프로젝트
- 데이터 이동 리스크 없음
- 즉시 프로 기능 사용 가능

---

## 📝 체크리스트

### 옵션 1 (업그레이드) 체크리스트

- [ ] Supabase Dashboard 로그인
- [ ] Settings → Billing 이동
- [ ] Upgrade to Pro 클릭
- [ ] 결제 정보 입력
- [ ] 업그레이드 확인
- [ ] 웹사이트 테스트 (localhost:3000)
- [ ] 프로덕션 테스트 (Vercel URL)
- [ ] ✅ 완료!

### 옵션 2 (마이그레이션) 체크리스트

**백업**
- [ ] 스키마 백업 (schema.sql)
- [ ] 데이터 백업 (pg_dump 또는 CSV)
- [ ] 환경 변수 기록

**새 프로젝트**
- [ ] 프로 프로젝트 생성
- [ ] 데이터베이스 비밀번호 기록
- [ ] Extensions 활성화
- [ ] 스키마 복원
- [ ] 데이터 마이그레이션

**환경 설정**
- [ ] .env.local 업데이트
- [ ] Vercel 환경 변수 업데이트
- [ ] GitHub Actions Secrets 업데이트

**테스트**
- [ ] 로컬 테스트 (npm run dev)
- [ ] 데이터 검증 (SQL 쿼리)
- [ ] Vercel 재배포
- [ ] 프로덕션 테스트

**정리**
- [ ] 프리 프로젝트 삭제 (선택)
- [ ] 문서 업데이트

---

## 🆘 문제 해결

### 문제: 마이그레이션 중 데이터 손실

**해결**:
```bash
# 백업에서 복원
psql -h [NEW_PROJECT_REF].supabase.co \
  -U postgres \
  -d postgres \
  -f backup_YYYYMMDD.sql
```

### 문제: RLS 정책 오류

**해결**:
```sql
-- RLS 정책 재생성
-- supabase/schema.sql의 RLS 정책 부분 재실행
```

### 문제: Extension 오류

**해결**:
```sql
-- Extensions 다시 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";
```

---

## 📞 지원

- **Supabase 지원**: https://supabase.com/support
- **Supabase Discord**: https://discord.supabase.com
- **문서**: https://supabase.com/docs/guides/platform/migrating-and-upgrading-projects

---

## 다음 단계

마이그레이션 완료 후:

1. ✅ 프로 플랜 기능 활용
   - 일일 백업 설정
   - 커스텀 도메인 연결 (선택)
   - 성능 모니터링

2. 📊 데이터 증가 계획
   - 더 많은 회의록 수집
   - AI 발언 처리 확대
   - 투표 기록 검증

3. 🚀 Phase 3 진행
   - "내 의원 찾기" 기능
   - 이메일 알림 시스템
   - RAG 챗봇

---

**작성일**: 2025-10-28
**버전**: v1.0
