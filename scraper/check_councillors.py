# -*- coding: utf-8 -*-
"""
Check current councillors in database
"""
from utils.db import get_supabase_client
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_councillors():
    """
    Check all councillors in database
    """
    client = get_supabase_client()

    # Get all councillors
    response = client.table('councillors').select('id, name, district, party, phone').execute()
    councillors = response.data

    logger.info(f"\n총 {len(councillors)}명의 의원이 데이터베이스에 있습니다:\n")

    # Group by source (real vs sample)
    real_councillors = []
    sample_councillors = []

    for c in councillors:
        name = c.get('name', '')
        district = c.get('district', '')
        party = c.get('party', '')
        phone = c.get('phone', '')

        # Sample data usually has phone numbers or specific districts
        if not phone or '샘플' in district or name in ['김민수', '강동현', '이현주', '박지영', '최수진', '정민호']:
            sample_councillors.append(c)
            logger.info(f"[샘플] {name} - {district} ({party})")
        else:
            real_councillors.append(c)
            logger.info(f"[실제] {name} - {district} ({party})")

    logger.info(f"\n실제 의원: {len(real_councillors)}명")
    logger.info(f"샘플 의원: {len(sample_councillors)}명")

    if len(sample_councillors) > 0:
        logger.info("\n삭제할 샘플 의원 ID:")
        for c in sample_councillors:
            logger.info(f"  - {c['id']} ({c['name']})")

    return real_councillors, sample_councillors

if __name__ == "__main__":
    check_councillors()
