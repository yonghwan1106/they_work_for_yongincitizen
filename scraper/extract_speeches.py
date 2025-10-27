"""
회의록에서 AI를 활용하여 개별 의원 발언을 추출하고 요약하는 스크립트

Usage:
    python extract_speeches.py --limit 5
    python extract_speeches.py --meeting-id <uuid>
    python extract_speeches.py --force  # 기존 발언 재추출
"""

import os
import sys
import logging
import argparse
from typing import List, Dict, Optional
from datetime import datetime
import anthropic
from supabase import create_client, Client
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Supabase 클라이언트 초기화
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY, ANTHROPIC_API_KEY]):
    logger.error("Missing required environment variables!")
    logger.error(f"SUPABASE_URL: {'✓' if SUPABASE_URL else '✗'}")
    logger.error(f"SUPABASE_KEY: {'✓' if SUPABASE_KEY else '✗'}")
    logger.error(f"ANTHROPIC_API_KEY: {'✓' if ANTHROPIC_API_KEY else '✗'}")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
claude_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)


def extract_speeches_from_transcript(
    transcript: str,
    meeting_id: str,
    meeting_title: str
) -> List[Dict]:
    """
    Claude API를 사용하여 회의록에서 개별 발언 추출

    Args:
        transcript: 회의록 전문
        meeting_id: 회의 ID
        meeting_title: 회의 제목

    Returns:
        추출된 발언 리스트 [{"speaker": "name", "text": "...", "order": 1}, ...]
    """

    prompt = f"""다음은 용인시의회 "{meeting_title}" 회의록 전문입니다.

이 회의록에서 각 의원의 발언을 추출하여 JSON 형식으로 정리해주세요.

요구사항:
1. 각 발언자의 이름과 발언 내용을 추출
2. 발언 순서대로 정렬
3. 의장, 부의장, 각 의원의 발언을 모두 포함
4. 발언자 이름은 "○○○ 의원", "○○○ 의장" 형식으로 표기
5. 발언 내용은 원문 그대로 유지

출력 형식:
{{
  "speeches": [
    {{
      "order": 1,
      "speaker": "홍길동 의장",
      "text": "개회를 선포합니다..."
    }},
    {{
      "order": 2,
      "speaker": "김철수 의원",
      "text": "질의하겠습니다..."
    }}
  ]
}}

회의록:
{transcript[:50000]}

위 형식에 맞춰 JSON만 출력해주세요. 다른 설명은 필요 없습니다."""

    try:
        logger.info(f"  🤖 Calling Claude API for speech extraction...")

        message = claude_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=8000,
            temperature=0,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        response_text = message.content[0].text
        logger.debug(f"Claude response: {response_text[:500]}...")

        # JSON 파싱
        import json

        # JSON 블록 추출 (```json ... ``` 형식 처리)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        data = json.loads(response_text)
        speeches = data.get("speeches", [])

        logger.info(f"  ✅ Extracted {len(speeches)} speeches")
        return speeches

    except Exception as e:
        logger.error(f"  ❌ Error extracting speeches: {e}")
        return []


def summarize_speech(speech_text: str, speaker: str) -> Dict:
    """
    Claude API를 사용하여 발언 요약 및 키워드 추출

    Args:
        speech_text: 발언 내용
        speaker: 발언자 이름

    Returns:
        {"summary": "...", "keywords": ["...", "..."]}
    """

    prompt = f"""다음은 "{speaker}"의 의회 발언입니다.

발언 내용:
{speech_text[:5000]}

이 발언을 분석하여 다음을 제공해주세요:
1. 핵심 요약 (2-3문장, 200자 이내)
2. 주요 키워드 (최대 5개)

출력 형식:
{{
  "summary": "발언 요약...",
  "keywords": ["키워드1", "키워드2", "키워드3"]
}}

JSON만 출력해주세요."""

    try:
        message = claude_client.messages.create(
            model="claude-3-5-haiku-20241022",  # 요약은 Haiku로
            max_tokens=1000,
            temperature=0,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        response_text = message.content[0].text

        # JSON 블록 추출
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        import json
        data = json.loads(response_text)

        return {
            "summary": data.get("summary", ""),
            "keywords": data.get("keywords", [])
        }

    except Exception as e:
        logger.error(f"  ⚠️ Error summarizing speech: {e}")
        return {"summary": "", "keywords": []}


def match_councillor(speaker_name: str) -> Optional[str]:
    """
    발언자 이름으로 의원 ID 찾기

    Args:
        speaker_name: "홍길동 의원" 또는 "홍길동 의장" 형식

    Returns:
        의원 UUID 또는 None
    """

    # 이름에서 직책 제거
    name = speaker_name.replace("의원", "").replace("의장", "").replace("부의장", "").strip()

    try:
        response = supabase.table("councillors")\
            .select("id")\
            .ilike("name", f"%{name}%")\
            .limit(1)\
            .execute()

        if response.data and len(response.data) > 0:
            return response.data[0]["id"]

    except Exception as e:
        logger.debug(f"  Could not match councillor '{name}': {e}")

    return None


def save_speeches_to_db(speeches: List[Dict], meeting_id: str) -> int:
    """
    추출된 발언을 Supabase에 저장

    Args:
        speeches: 발언 리스트
        meeting_id: 회의 ID

    Returns:
        저장된 발언 수
    """

    saved_count = 0

    for speech in speeches:
        try:
            speaker = speech.get("speaker", "")
            speech_text = speech.get("text", "")
            order = speech.get("order", 0)

            if not speech_text or len(speech_text) < 10:
                continue

            # 의원 매칭
            councillor_id = match_councillor(speaker)

            # 요약 및 키워드 추출
            logger.info(f"    📝 Summarizing speech #{order} by {speaker}...")
            summary_data = summarize_speech(speech_text, speaker)

            # DB 저장
            data = {
                "meeting_id": meeting_id,
                "councillor_id": councillor_id,
                "speech_order": order,
                "speech_text": speech_text,
                "summary": summary_data["summary"],
                "keywords": summary_data["keywords"],
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }

            supabase.table("speeches").insert(data).execute()
            saved_count += 1
            logger.info(f"    ✅ Saved speech #{order}")

        except Exception as e:
            logger.error(f"    ❌ Error saving speech #{order}: {e}")
            continue

    return saved_count


def process_meeting(meeting: Dict, force: bool = False) -> bool:
    """
    회의록 처리: 발언 추출 및 저장

    Args:
        meeting: 회의 정보 dict
        force: 기존 발언 재추출 여부

    Returns:
        성공 여부
    """

    meeting_id = meeting["id"]
    title = meeting["title"]
    transcript = meeting.get("transcript_text", "")

    logger.info(f"Processing: {title}")

    # 이미 처리된 회의인지 확인
    if not force:
        existing = supabase.table("speeches")\
            .select("id")\
            .eq("meeting_id", meeting_id)\
            .limit(1)\
            .execute()

        if existing.data and len(existing.data) > 0:
            logger.info(f"  ⏭️  Already processed (use --force to re-extract)")
            return True

    # 회의록 전문이 없으면 스킵
    if not transcript or len(transcript) < 100:
        logger.warning(f"  ⚠️  No transcript available")
        return False

    # 발언 추출
    speeches = extract_speeches_from_transcript(transcript, meeting_id, title)

    if not speeches:
        logger.error(f"  ❌ Failed to extract speeches")
        return False

    # 기존 발언 삭제 (force 모드)
    if force:
        supabase.table("speeches")\
            .delete()\
            .eq("meeting_id", meeting_id)\
            .execute()
        logger.info(f"  🗑️  Deleted existing speeches")

    # 발언 저장
    saved = save_speeches_to_db(speeches, meeting_id)

    logger.info(f"  ✅ Saved {saved}/{len(speeches)} speeches")

    return saved > 0


def main():
    parser = argparse.ArgumentParser(description="Extract speeches from meeting transcripts using AI")
    parser.add_argument("--limit", type=int, help="Number of meetings to process")
    parser.add_argument("--meeting-id", help="Specific meeting ID to process")
    parser.add_argument("--force", action="store_true", help="Re-extract even if already processed")

    args = parser.parse_args()

    logger.info("Starting speech extraction...")
    logger.info(f"  Limit: {args.limit if args.limit else 'All'}")
    logger.info(f"  Force re-extract: {args.force}")

    try:
        # 처리할 회의 가져오기
        if args.meeting_id:
            # 특정 회의만 처리
            response = supabase.table("meetings")\
                .select("id, title, transcript_text")\
                .eq("id", args.meeting_id)\
                .execute()
        else:
            # transcript_text가 있는 회의들 가져오기
            query = supabase.table("meetings")\
                .select("id, title, transcript_text")\
                .not_.is_("transcript_text", "null")\
                .order("created_at", desc=True)

            if args.limit:
                query = query.limit(args.limit)

            response = query.execute()

        meetings = response.data

        if not meetings:
            logger.warning("No meetings found to process")
            return

        logger.info(f"Found {len(meetings)} meetings to process\n")

        # 통계
        success_count = 0
        error_count = 0

        # 각 회의 처리
        for i, meeting in enumerate(meetings, 1):
            logger.info(f"[{i}/{len(meetings)}] {meeting['title']}")

            try:
                if process_meeting(meeting, args.force):
                    success_count += 1
                else:
                    error_count += 1
            except Exception as e:
                logger.error(f"  ❌ Error: {e}")
                error_count += 1

            logger.info("")

        # 최종 결과
        logger.info("=" * 60)
        logger.info("Extraction complete!")
        logger.info(f"  ✅ Success: {success_count}")
        logger.info(f"  ❌ Errors: {error_count}")
        logger.info(f"  📊 Total: {len(meetings)}")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
