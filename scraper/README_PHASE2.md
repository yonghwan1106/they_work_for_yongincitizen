# Phase 2: AI 발언 추출 및 요약

## 개요

Claude API를 활용하여 용인시의회 회의록에서 개별 의원의 발언을 자동으로 추출하고 요약하는 시스템입니다.

## 주요 기능

### 1. 발언 추출 (`extract_speeches.py`)

회의록 전문에서 각 의원의 발언을 AI로 추출합니다.

**기능:**
- 발언자 자동 인식 (의원명, 의장, 부의장 등)
- 발언 순서 자동 정렬
- 발언자와 의원 DB 자동 매칭
- 발언별 AI 요약 생성
- 주요 키워드 자동 추출

**사용법:**

```bash
# 최근 5개 회의록 처리
python extract_speeches.py --limit 5

# 특정 회의록 처리
python extract_speeches.py --meeting-id <uuid>

# 기존 발언 재추출
python extract_speeches.py --force --limit 5
```

### 2. AI 모델 사용

- **발언 추출**: Claude 3.5 Sonnet
  - 긴 회의록 전문을 정확하게 분석
  - JSON 형식으로 구조화된 데이터 추출

- **요약 및 키워드**: Claude 3.5 Haiku
  - 빠르고 효율적인 요약 생성
  - 최대 5개 키워드 추출

## 데이터 구조

### speeches 테이블

```sql
CREATE TABLE speeches (
    id UUID PRIMARY KEY,
    meeting_id UUID REFERENCES meetings(id),
    councillor_id UUID REFERENCES councillors(id),
    speech_order INTEGER,           -- 발언 순서
    speech_text TEXT NOT NULL,      -- 발언 전문
    summary TEXT,                   -- AI 생성 요약
    keywords TEXT[],                -- AI 추출 키워드
    timestamp_start INTEGER,        -- 영상 시작 시간
    timestamp_end INTEGER,          -- 영상 종료 시간
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

## 자동화

### GitHub Actions 워크플로우

매일 오전 2시(KST)에 자동 실행됩니다.

**실행 순서:**
1. 의원 정보 업데이트 (월요일만)
2. 회의록 메타데이터 수집
3. 회의록 전문 추출
4. 의안 수집
5. 위원회 정보 업데이트
6. 회의록-위원회 연결
7. **회의록 전문 추출** (최근 20건)
8. **AI 발언 추출 및 요약** (최근 10건)

### 환경변수 설정

GitHub Secrets에 다음 변수를 설정해야 합니다:

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
```

## 성능

### 처리 시간
- 회의록 1개당 약 30-60초
- 발언 1개당 약 3-5초

### 비용 추정 (Claude API)
- 회의록 1개 (평균 30,000자): 약 $0.15
- 발언 요약 1개 (평균 500자): 약 $0.001
- **일 10개 회의록 처리**: 약 $2-3

## 예제 출력

### 추출된 발언 예시

```json
{
  "meeting_id": "uuid",
  "councillor_id": "uuid",
  "speech_order": 1,
  "speech_text": "의장님, 질의하겠습니다. 이번 안건에 대해...",
  "summary": "환경 예산 증액의 필요성을 강조하며 구체적인 집행 계획을 질의함",
  "keywords": ["환경예산", "집행계획", "투명성", "시민참여", "재정"]
}
```

## 문제 해결

### API Rate Limit

Claude API가 과부하 상태일 경우 자동으로 재시도합니다.

```python
# 재시도 로직 포함
anthropic.Anthropic(
    api_key=ANTHROPIC_API_KEY,
    max_retries=3
)
```

### 발언자 매칭 실패

의원 DB에 없는 발언자는 `councillor_id=NULL`로 저장됩니다.

```python
# 수동으로 매칭 수정 가능
UPDATE speeches
SET councillor_id = '<uuid>'
WHERE speech_text LIKE '%홍길동%';
```

## 향후 계획

- [ ] 발언 감정 분석 (긍정/부정/중립)
- [ ] 발언 유형 분류 (질의/답변/토론/의견)
- [ ] 의원간 발언 네트워크 분석
- [ ] 실시간 회의록 스트리밍 처리
- [ ] 음성 인식 통합 (영상→텍스트)

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
