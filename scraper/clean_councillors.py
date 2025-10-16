# -*- coding: utf-8 -*-
"""
Clean councillors - keep only real 31 from website
"""
from utils.db import get_supabase_client
from scrapers.councillors import scrape_councillors
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def clean_councillors():
    """
    1. Scrape fresh data from website (31 councillors)
    2. Delete ALL existing councillors
    3. Insert only the 31 real ones
    """
    client = get_supabase_client()

    # Step 1: Scrape fresh data
    logger.info("1단계: 웹사이트에서 최신 의원 정보 스크래핑...")
    fresh_councillors = scrape_councillors()
    logger.info(f"   웹사이트에서 {len(fresh_councillors)}명 수집")

    if len(fresh_councillors) != 31:
        logger.warning(f"   경고: 31명이 아닌 {len(fresh_councillors)}명이 수집되었습니다!")
        response = input("   계속 진행하시겠습니까? (y/n): ")
        if response.lower() != 'y':
            logger.info("   취소됨")
            return

    # Step 2: Delete ALL councillors
    logger.info("\n2단계: 기존 의원 데이터 전체 삭제...")

    # First delete all related data to avoid foreign key constraints
    logger.info("   - 표결 기록 삭제...")
    client.table('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()

    logger.info("   - 발언 기록 삭제...")
    client.table('speeches').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()

    logger.info("   - 의안 공동발의자 삭제...")
    client.table('bill_cosponsors').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()

    logger.info("   - 의안 삭제...")
    client.table('bills').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()

    logger.info("   - 의원-위원회 관계 삭제...")
    client.table('councillor_committees').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()

    logger.info("   - 의원 데이터 삭제...")
    result = client.table('councillors').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
    logger.info(f"   ✓ 모든 의원 데이터 삭제 완료")

    # Step 3: Insert fresh councillors
    logger.info("\n3단계: 최신 의원 정보 저장...")

    # Filter allowed fields
    allowed_fields = {'name', 'name_en', 'party', 'district', 'photo_url',
                     'term_number', 'is_active', 'email', 'phone',
                     'office_location', 'profile_url'}

    clean_councillors_data = []
    for councillor in fresh_councillors:
        clean_data = {k: v for k, v in councillor.items() if k in allowed_fields}
        clean_councillors_data.append(clean_data)

    # Insert in database
    if clean_councillors_data:
        result = client.table('councillors').insert(clean_councillors_data).execute()
        logger.info(f"   ✓ {len(clean_councillors_data)}명 저장 완료")

    # Verify
    verify = client.table('councillors').select('id, name, district').execute()
    logger.info(f"\n최종 확인: 데이터베이스에 {len(verify.data)}명의 의원")

    logger.info("\n=== 정리 완료 ===")

if __name__ == "__main__":
    clean_councillors()
