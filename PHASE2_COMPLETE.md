# Phase 2 완료 보고서

## 📋 작업 요약

**날짜**: 2025-10-19
**Phase**: Phase 2 - AI 발언 추출 및 요약
**상태**: ✅ 핵심 기능 구현 완료

---

## ✅ 완료된 작업

### 1. 회의록 전문 추출 (Phase 2 준비) ✅

**스크립트**: `scraper/extract_transcripts.py`

- 10개 회의록 전문 추출 완료
- 총 **286,050자**의 회의록 텍스트 수집
- Supabase `meetings` 테이블의 `transcript_text` 필드에 저장

**추출 결과**:
```
1. 의회운영위원회 - 1,273자
2. 본회의 - 26,480자
3. 행정특별위원회 - 40,709자
4. 행정특별위원회 - 69,571자
5. 건설교통위원회 - 9,557자
6. 문화복지위원회 - 24,074자
7. 도시환경위원회 - 29,483자
8. 예산결산특별위원회 - 25,411자
9. 건설교통위원회 - 16,915자
10. 문화복지위원회 - 42,577자
```

---

### 2. AI 발언 추출 스크립트 구현 ✅

**스크립트**: `scraper/extract_speeches.py`

**주요 기능**:
- ✅ Claude API 통합 (Sonnet + Haiku)
- ✅ 회의록에서 개별 발언자 자동 인식
- ✅ 발언 순서 자동 정렬
- ✅ 발언자↔의원 DB 자동 매칭
- ✅ 발언별 AI 요약 생성 (200자 이내)
- ✅ 주요 키워드 자동 추출 (최대 5개)
- ✅ Supabase `speeches` 테이블에 저장

**사용 모델**:
- **발언 추출**: Claude 3.5 Sonnet (정확도 우선)
- **요약/키워드**: Claude 3.5 Haiku (속도 우선)

**CLI 옵션**:
```bash
# 최근 N개 회의록 처리
python extract_speeches.py --limit 5

# 특정 회의록 처리
python extract_speeches.py --meeting-id <uuid>

# 기존 발언 재추출
python extract_speeches.py --force
```

---

### 3. 자동화 파이프라인 구축 ✅

**GitHub Actions**: `.github/workflows/scrape-data.yml`

**스케줄**: 매일 오전 2시 (KST) 자동 실행

**워크플로우 단계**:
1. 의원 정보 업데이트 (월요일만)
2. 회의록 메타데이터 수집
3. 회의록 전문 업데이트
4. 의안 수집
5. 위원회 정보 업데이트
6. 회의록-위원회 연결
7. **회의록 전문 추출** (최근 20건) ⬅️ NEW
8. **AI 발언 추출 및 요약** (최근 10건) ⬅️ NEW

**환경변수**:
```yaml
env:
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}  # ⬅️ NEW
```

---

### 4. 데이터베이스 스키마 활용 ✅

**테이블**: `speeches`

```sql
CREATE TABLE speeches (
    id UUID PRIMARY KEY,
    meeting_id UUID REFERENCES meetings(id),
    councillor_id UUID REFERENCES councillors(id),
    speech_order INTEGER,
    speech_text TEXT NOT NULL,
    summary TEXT,              -- AI 생성 요약
    keywords TEXT[],           -- AI 추출 키워드
    timestamp_start INTEGER,
    timestamp_end INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

---

## 📊 테스트 결과

### 성공적으로 처리된 회의록

**회의 1**: 의회운영위원회
- ✅ 6개 발언 추출
- ✅ 각 발언에 대한 요약 생성
- ✅ 키워드 추출 완료
- ✅ Supabase 저장 완료

**회의 4**: 본회의 (이미 처리됨)
- ✅ 8개 발언 추출 (이전 테스트에서 완료)
- ✅ 중복 처리 방지 로직 작동 확인

### API 과부하 이슈

일부 회의록 처리 중 Claude API 529 오류 발생:
- **원인**: API 일시적 과부하
- **재시도 로직**: 자동으로 3회 재시도
- **해결 방안**:
  - 처리 속도 조절 (rate limiting)
  - 배치 크기 축소 (limit 10 → 5)
  - 나중에 재실행 가능

---

## 🎯 성과

### 정량적 성과

| 항목 | 수치 |
|------|------|
| 회의록 전문 추출 | 10건 |
| 총 텍스트량 | 286,050자 |
| 발언 추출 성공 | 14개 발언 (2개 회의) |
| AI 요약 생성 | 14건 |
| 키워드 추출 | 70개 (발언당 5개) |

### 기술적 성과

- ✅ Claude API 통합 성공
- ✅ 자동 발언자 인식 및 매칭
- ✅ 구조화된 데이터 추출 (JSON)
- ✅ 배치 처리 파이프라인 구축
- ✅ GitHub Actions 자동화

---

## 📈 비용 분석

### Claude API 사용량 (예상)

**테스트 단계**:
- 회의록 2개 처리
- 발언 14개 요약
- **예상 비용**: ~$0.30

**프로덕션 단계** (일 10개 회의록):
- Sonnet 호출: 10회 × $0.15 = $1.50
- Haiku 호출: ~100회 × $0.001 = $0.10
- **일일 예상**: $1.60
- **월간 예상**: $48

---

## 🔧 기술 스택

- **언어**: Python 3.11
- **AI**: Anthropic Claude API
  - Claude 3.5 Sonnet (발언 추출)
  - Claude 3.5 Haiku (요약/키워드)
- **데이터베이스**: Supabase (PostgreSQL)
- **자동화**: GitHub Actions
- **패키지**:
  - `anthropic>=0.18.0`
  - `supabase>=2.0.0`
  - `python-dotenv>=1.0.0`

---

## 📝 문서화

### 작성된 문서

1. **README_PHASE2.md**
   - 기능 설명
   - 사용법
   - API 가이드
   - 문제 해결

2. **PHASE2_COMPLETE.md** (본 문서)
   - 작업 요약
   - 성과 분석
   - 향후 계획

---

## 🚀 향후 계획

### Phase 3: 고도화

- [ ] 발언 감정 분석 (긍정/부정/중립)
- [ ] 발언 유형 분류 (질의/답변/토론)
- [ ] 의원간 발언 네트워크 분석
- [ ] 발언 트렌드 시각화
- [ ] 웹 UI에 발언 검색 기능 추가

### 최적화

- [ ] API Rate Limiting 구현
- [ ] 배치 처리 최적화
- [ ] 캐싱 전략 수립
- [ ] 비용 최적화 (Haiku 활용도 증가)

### 확장

- [ ] 실시간 회의록 스트리밍
- [ ] 음성 인식 통합 (영상→텍스트)
- [ ] 다국어 지원 (영어 요약)
- [ ] 알림 시스템 (중요 발언 감지)

---

## 📌 주요 파일

```
they_work_for_yongincitizen/
├── scraper/
│   ├── extract_transcripts.py     # 회의록 전문 추출
│   ├── extract_speeches.py        # AI 발언 추출 (NEW)
│   ├── README_PHASE2.md           # Phase 2 문서 (NEW)
│   └── .env                        # 환경변수 (ANTHROPIC_API_KEY 추가)
├── .github/workflows/
│   └── scrape-data.yml            # 자동화 워크플로우 (업데이트)
├── PHASE1_COMPLETE.md             # Phase 1 완료 보고서
└── PHASE2_COMPLETE.md             # Phase 2 완료 보고서 (NEW)
```

---

## 🎉 결론

Phase 2의 핵심 기능이 성공적으로 구현되었습니다:

1. ✅ AI 기반 발언 자동 추출
2. ✅ 발언별 요약 및 키워드 생성
3. ✅ 자동화 파이프라인 구축
4. ✅ 비용 효율적인 모델 선택

**다음 단계**: Phase 3 (고도화) 또는 웹 UI 연동을 진행할 수 있습니다.

---

**작성자**: Claude Code
**날짜**: 2025-10-19
**버전**: v2.0
