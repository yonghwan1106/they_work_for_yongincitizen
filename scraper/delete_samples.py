# -*- coding: utf-8 -*-
"""
Delete sample data from database
"""
from utils.db import get_supabase_client

client = get_supabase_client()

print('Deleting sample data...')

# 1. Delete votes
client.table('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
print('Votes deleted')

# 2. Delete speeches
client.table('speeches').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
print('Speeches deleted')

# 3. Delete bill_cosponsors
client.table('bill_cosponsors').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
print('Bill cosponsors deleted')

# 4. Delete bills
client.table('bills').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
print('Bills deleted')

# 5. Delete meetings
client.table('meetings').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
print('Meetings deleted')

# 6. Delete councillor_committees
client.table('councillor_committees').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
print('Councillor committees deleted')

# 7. Delete committees
client.table('committees').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
print('Committees deleted')

# 8. Delete sample councillors
sample_names = ['김민수', '강동현', '이현주', '박지영', '최수진', '정민호']
for name in sample_names:
    client.table('councillors').delete().eq('name', name).execute()
print('Sample councillors deleted')

# Verify
response = client.table('councillors').select('name').order('name').execute()
print(f'\nRemaining councillors: {len(response.data)}')
for c in response.data[:5]:
    print(f'  - {c["name"]}')
if len(response.data) > 5:
    print(f'  ... and {len(response.data) - 5} more')
