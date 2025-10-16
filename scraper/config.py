"""
Configuration module for Yongin Council scraper
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Supabase Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

# Anthropic Configuration
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')

# Yongin Council Website
COUNCIL_BASE_URL = os.getenv('COUNCIL_BASE_URL', 'https://council.yongin.go.kr')

# Scraping Settings
REQUEST_TIMEOUT = 30
REQUEST_DELAY = 1  # Delay between requests in seconds
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

# Paths
COUNCILLORS_URL = f"{COUNCIL_BASE_URL}/kr/member/intro.do"
MEETINGS_URL = f"{COUNCIL_BASE_URL}/kr/minutes.do"
BILLS_URL = f"{COUNCIL_BASE_URL}/kr/bill.do"
