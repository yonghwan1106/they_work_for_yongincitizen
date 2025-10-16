# -*- coding: utf-8 -*-
"""
Find duplicate councillors
"""
from utils.db import get_supabase_client
import logging
from collections import Counter

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def find_duplicates():
    """
    Find duplicate councillors by name
    """
    client = get_supabase_client()

    # Get all councillors
    response = client.table('councillors').select('*').execute()
    councillors = response.data

    logger.info(f"총 {len(councillors)}명의 의원")

    # Count by name
    name_counts = Counter([c['name'] for c in councillors])

    # Find duplicates
    duplicates = {name: count for name, count in name_counts.items() if count > 1}

    if duplicates:
        logger.info(f"\n중복된 의원 ({len(duplicates)}명):")
        for name, count in duplicates.items():
            logger.info(f"  {name}: {count}번 등장")

            # Show all instances
            instances = [c for c in councillors if c['name'] == name]
            for i, instance in enumerate(instances, 1):
                logger.info(f"    [{i}] ID: {instance['id']}")
                logger.info(f"        지역구: {instance.get('district', 'N/A')}")
                logger.info(f"        정당: {instance.get('party', 'N/A')}")
                logger.info(f"        전화: {instance.get('phone', 'N/A')}")
                logger.info(f"        생성일: {instance.get('created_at', 'N/A')}")

        # Recommend which to keep (newer one with more data)
        logger.info("\n삭제 권장 (오래되었거나 데이터가 적은 항목):")
        for name in duplicates.keys():
            instances = [c for c in councillors if c['name'] == name]
            # Sort by created_at (older first)
            instances.sort(key=lambda x: x.get('created_at', ''))

            # Keep the latest one, delete others
            for instance in instances[:-1]:
                logger.info(f"  DELETE: {instance['id']} - {name} (생성일: {instance.get('created_at', 'N/A')})")

    else:
        logger.info("\n중복된 의원 없음")

    return duplicates

if __name__ == "__main__":
    find_duplicates()
