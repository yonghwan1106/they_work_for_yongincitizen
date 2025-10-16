# -*- coding: utf-8 -*-
"""
Test direct Supabase REST API connection
"""
import requests
import json
from config import SUPABASE_URL, SUPABASE_KEY

def test_direct_api():
    """Test direct REST API call to Supabase"""
    print("Testing direct REST API call...")

    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }

    # Try to select from councillors
    url = f"{SUPABASE_URL}/rest/v1/councillors"
    params = {'select': 'id,name', 'limit': 1}

    print(f"\nURL: {url}")
    print(f"Headers: apikey={SUPABASE_KEY[:20]}...")

    try:
        response = requests.get(url, headers=headers, params=params)
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response: {response.text}")

        if response.status_code == 200:
            print("\n✓ Direct API call successful!")
            return True
        else:
            print(f"\n✗ API call failed: {response.text}")
            return False

    except Exception as e:
        print(f"\n✗ Error: {e}")
        return False

def test_insert():
    """Test inserting via direct API"""
    print("\n" + "=" * 60)
    print("Testing insert via direct API...")

    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }

    url = f"{SUPABASE_URL}/rest/v1/councillors"

    test_data = {
        'name': '홍길동',
        'party': '무소속',
        'is_active': True,
        'term_number': 8
    }

    print(f"Data: {json.dumps(test_data, ensure_ascii=False)}")

    try:
        response = requests.post(url, headers=headers, json=test_data)
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response: {response.text}")

        if response.status_code in [200, 201]:
            print("\n✓ Insert successful!")
            return True
        else:
            print(f"\n✗ Insert failed")
            return False

    except Exception as e:
        print(f"\n✗ Error: {e}")
        return False

if __name__ == "__main__":
    test_direct_api()
    test_insert()
