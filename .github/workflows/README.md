# GitHub Actions 자동화 설정 가이드

## 개요

이 프로젝트는 GitHub Actions를 사용하여 매일 자동으로 용인시의회 데이터를 수집합니다.

## 워크플로우

### `scrape-data.yml` - 일일 데이터 수집

**실행 시간**: 매일 한국시간 오전 6시 (UTC 21:00)

**수집 데이터**:
1. 의원 정보 (월요일만)
2. 회의록 목록 (매일)
3. 회의록 전문 텍스트 (매일)
4. 의안 정보 (매일)
5. 위원회 정보 (매일)

## 초기 설정

### 1. GitHub Secrets 설정

Repository Settings > Secrets and variables > Actions에서 다음 secret을 추가하세요:

- `SUPABASE_URL`: Supabase 프로젝트 URL
  ```
  예: https://mopwsgknvcejfcmgeviv.supabase.co
  ```

- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service_role 키 (읽기/쓰기 권한)
  ```
  예: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

### 2. 워크플로우 활성화

1. GitHub 저장소로 이동
2. Actions 탭 클릭
3. "I understand my workflows, go ahead and enable them" 클릭

### 3. 수동 실행 테스트

1. Actions 탭 > "Daily Data Scraping" 워크플로우 선택
2. "Run workflow" 버튼 클릭
3. 결과 확인

## 스케줄

| 작업 | 실행 빈도 | 실행 시간 (KST) |
|------|----------|----------------|
| 회의록 수집 | 매일 | 오전 6시 |
| 의안 수집 | 매일 | 오전 6시 |
| 의원 정보 | 주 1회 | 월요일 오전 6시 |
| 위원회 정보 | 매일 | 오전 6시 |

## 알림 설정 (선택사항)

워크플로우 실패 시 알림을 받으려면:

1. Slack/Discord Webhook URL 생성
2. GitHub Secrets에 `SLACK_WEBHOOK_URL` 추가
3. `scrape-data.yml`의 "Notify on failure" 섹션 수정:

```yaml
- name: Notify on failure
  if: failure()
  run: |
    curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
      -H 'Content-Type: application/json' \
      -d '{"text":"❌ Daily scraping failed! Check GitHub Actions logs."}'
```

## 로그 확인

1. GitHub > Actions 탭
2. 해당 워크플로우 실행 클릭
3. 각 step의 로그 확인

## 문제 해결

### 워크플로우가 실행되지 않음
- Repository가 public인지 확인 (또는 GitHub Pro 계정)
- Secrets이 올바르게 설정되었는지 확인

### Supabase 연결 오류
- `SUPABASE_SERVICE_ROLE_KEY`가 맞는지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인

### 스크래핑 실패
- 용인시의회 웹사이트 구조가 변경되었는지 확인
- 로그에서 상세 오류 메시지 확인

## 수동 실행

언제든지 Actions 탭에서 "Run workflow" 버튼으로 수동 실행 가능합니다.
