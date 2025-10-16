# -*- coding: utf-8 -*-
"""
Test script to debug scraper and Supabase connection
"""
import sys
import os

# Set UTF-8 encoding for stdout
if sys.platform == "win32":
    import codecs
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())

# Add scraper directory to path
sys.path.insert(0, os.path.dirname(__file__))

from scrapers.councillors import scrape_councillors
from utils.db import get_supabase_client
import json

def test_scraping():
    """Test scraping function"""
    print("=" * 60)
    print("Testing Councillor Scraper")
    print("=" * 60)

    try:
        councillors = scrape_councillors()
        print(f"\n✓ Found {len(councillors)} councillors")

        if councillors:
            print("\nFirst councillor data:")
            print(json.dumps(councillors[0], ensure_ascii=False, indent=2))

        return councillors
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return []

def test_supabase():
    """Test Supabase connection"""
    print("\n" + "=" * 60)
    print("Testing Supabase Connection")
    print("=" * 60)

    try:
        client = get_supabase_client()

        # Try to read from councillors table
        response = client.table('councillors').select('id, name').limit(1).execute()
        print(f"\n✓ Successfully connected to Supabase")
        print(f"  Existing councillors in DB: {len(response.data)}")

        return True
    except Exception as e:
        print(f"\n✗ Error connecting to Supabase: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_insert():
    """Test inserting a councillor"""
    print("\n" + "=" * 60)
    print("Testing Insert Operation")
    print("=" * 60)

    try:
        client = get_supabase_client()

        # Test data
        test_councillor = {
            'name': '테스트의원',
            'party': '무소속',
            'is_active': True,
            'term_number': 8
        }

        print(f"\nTrying to insert: {json.dumps(test_councillor, ensure_ascii=False)}")

        response = client.table('councillors').upsert(test_councillor).execute()
        print(f"\n✓ Successfully inserted test councillor")
        print(f"  Response: {response.data}")

        return True
    except Exception as e:
        print(f"\n✗ Error inserting: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Test 1: Scraping
    councillors = test_scraping()

    # Test 2: Supabase connection
    supabase_ok = test_supabase()

    # Test 3: Insert operation
    if supabase_ok:
        test_insert()

    print("\n" + "=" * 60)
    print("Tests Complete")
    print("=" * 60)
