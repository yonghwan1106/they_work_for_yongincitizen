# Supabase RLS 문제 해결 가이드

## 현재 상황

의원 정보 스크레이퍼가 성공적으로 데이터를 수집하고 있으나, Supabase에 데이터를 삽입할 수 없는 상황입니다.

### 스크레이퍼 상태
✅ **작동 중** - 16명의 의원 정보를 성공적으로 추출
- 이름, 정당, 선거구, 직위, 전화번호, 사진 URL 모두 추출 가능

### 데이터베이스 연결 문제
❌ **Row Level Security (RLS) 정책 위반**

```
Error: new row violates row-level security policy for table "councillors"
Code: 42501
```

## 문제 원인

1. **API 키 문제**: 현재 `.env` 파일의 `SUPABASE_KEY`가 `anon` 키입니다.
   - `anon` 키는 읽기(SELECT)만 가능
   - 쓰기(INSERT/UPDATE)는 RLS 정책에 의해 차단됨

2. **Service Role 키 필요**:
   - 원래 `.env`에 있던 `service_role` 키가 유효하지 않음 (401 Unauthorized)
   - `service_role` 키는 RLS를 우회하여 모든 작업 가능

## 해결 방법

### 옵션 1: Service Role API 키 갱신 (권장)

1. Supabase 대시보드 접속: https://supabase.com/dashboard
2. 프로젝트 선택: `mopwsgknvcejfcmgeviv`
3. Settings → API → Project API keys 이동
4. `service_role` 키 복사 (⚠️ 비공개, 서버 전용)
5. `scraper/.env` 파일 업데이트:

```bash
SUPABASE_KEY=<새로운_service_role_키>
```

### 옵션 2: RLS 정책 수정

Supabase SQL Editor에서 실행:

```sql
-- 스크레이퍼를 위한 INSERT 정책 추가
CREATE POLICY "Allow scraper inserts"
ON councillors
FOR INSERT
TO anon
WITH CHECK (true);

-- 스크레이퍼를 위한 UPDATE 정책 추가
CREATE POLICY "Allow scraper updates"
ON councillors
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);
```

⚠️ **주의**: 이 방법은 보안상 권장되지 않습니다. 누구나 anon 키로 데이터를 수정할 수 있게 됩니다.

### 옵션 3: 임시 해결 (개발 전용)

RLS를 일시적으로 비활성화:

```sql
ALTER TABLE councillors DISABLE ROW LEVEL SECURITY;
```

⚠️ **경고**: 프로덕션 환경에서는 절대 사용하지 마세요!

## 테스트 방법

키를 업데이트한 후 테스트:

```bash
cd scraper
python test_scraper.py
```

성공 시 출력:
```
✓ Successfully inserted test councillor
```

## 다음 단계

1. Supabase에서 service_role 키 확보
2. `.env` 파일 업데이트
3. 스크레이퍼 재실행: `python -m scrapers.councillors`
4. 웹사이트에서 데이터 확인: http://localhost:3000/councillors

## 참고

현재 `.env` 파일 상태:
- SUPABASE_URL: https://mopwsgknvcejfcmgeviv.supabase.co ✅
- SUPABASE_KEY: anon 키 사용 중 ⚠️ (읽기 전용)
- ANTHROPIC_API_KEY: 설정됨 ✅
