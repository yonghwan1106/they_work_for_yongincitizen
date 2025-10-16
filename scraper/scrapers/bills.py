# -*- coding: utf-8 -*-
"""
Scraper for Yongin Council bill information
"""
import requests
from bs4 import BeautifulSoup
import logging
import time
import re
from datetime import datetime
from config import COUNCIL_BASE_URL, REQUEST_TIMEOUT, REQUEST_DELAY, USER_AGENT
from utils.db import upsert_bills, get_councillor_by_name

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def scrape_bills(max_pages=3):
    """
    Scrape bill information from Yongin Council website

    Args:
        max_pages: Maximum number of pages to scrape (default: 3)

    Returns:
        List of bill dictionaries
    """
    url = f"{COUNCIL_BASE_URL}/kr/bill.do"
    logger.info(f"Scraping bills from {url}")

    headers = {'User-Agent': USER_AGENT}
    bills = []

    try:
        for page in range(1, max_pages + 1):
            page_url = f"{url}?page={page}"
            logger.info(f"Fetching page {page}: {page_url}")

            response = requests.get(page_url, headers=headers, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            response.encoding = 'utf-8'

            soup = BeautifulSoup(response.text, 'html.parser')

            # Find the table with classes "board_list" and "bbs_bill"
            table = soup.find('table', class_='board_list')
            if not table:
                logger.warning(f"No bills table found on page {page}")
                break

            # Find all data rows (skip header)
            rows = table.find_all('tr')[1:]  # Skip header row

            if not rows:
                logger.warning(f"No bill rows found on page {page}")
                break

            page_bills = 0
            for row in rows:
                try:
                    bill = extract_bill_info(row)
                    if bill and bill.get('title'):
                        bills.append(bill)
                        page_bills += 1
                        logger.info(f"Found: {bill['title'][:50]}... ({bill.get('proposal_date', 'N/A')})")
                except Exception as e:
                    logger.warning(f"Error parsing bill row: {e}")
                    continue

            logger.info(f"Page {page}: Found {page_bills} bills")

            if page_bills == 0:
                break

            time.sleep(REQUEST_DELAY)

        logger.info(f"Total bills scraped: {len(bills)}")
        return bills

    except requests.RequestException as e:
        logger.error(f"Error fetching bills page: {e}")
        raise
    except Exception as e:
        logger.error(f"Error parsing bills data: {e}")
        raise

def extract_bill_info(row):
    """
    Extract bill information from table row

    Table structure:
    <tr>
      <td>번호</td>
      <td><a href="/kr/billview.do?uid=XXX">의안명</a></td>
      <td>발의자</td>
      <td>제출일자</td>
    </tr>

    Args:
        row: BeautifulSoup tr element

    Returns:
        Dictionary with bill data
    """
    bill = {}

    cells = row.find_all('td')
    if len(cells) < 4:
        return None

    # Cell 0: 번호 (bill_number) - use this as bill_number
    bill_num_text = cells[0].get_text().strip()
    if bill_num_text.isdigit():
        bill['bill_number'] = f"BILL-{bill_num_text}"

    # Cell 1: 의안명 with link
    title_cell = cells[1]
    title_link = title_cell.find('a')
    if title_link:
        bill['title'] = title_link.get_text().strip()

        # Extract bill detail URL
        href = title_link.get('href')
        if href:
            if href.startswith('http'):
                bill['bill_url'] = href
            else:
                bill['bill_url'] = f"{COUNCIL_BASE_URL}{href}" if href.startswith('/') else f"{COUNCIL_BASE_URL}/{href}"
    else:
        bill['title'] = title_cell.get_text().strip()

    # Determine bill type from title
    title = bill.get('title', '')
    if '조례' in title:
        bill['bill_type'] = '조례안'
    elif '예산' in title:
        bill['bill_type'] = '예산안'
    elif '결산' in title:
        bill['bill_type'] = '결산안'
    else:
        bill['bill_type'] = '기타'

    # Cell 2: 발의자 (proposer)
    proposer_text = cells[2].get_text().strip()

    # Try to find proposer in database
    if proposer_text:
        # Extract just the name (remove titles like "의원 외 10인")
        proposer_match = re.match(r'([가-힣]{2,4})', proposer_text)
        if proposer_match:
            proposer_name = proposer_match.group(1)
            try:
                proposer = get_councillor_by_name(proposer_name)
                if proposer:
                    bill['proposer_id'] = proposer['id']
                    logger.debug(f"Found proposer: {proposer_name}")
            except Exception as e:
                logger.debug(f"Could not find proposer {proposer_name}: {e}")

    # Cell 3: 제출일자 (proposal_date)
    date_text = cells[3].get_text().strip()
    try:
        # Parse date - could be YYYY-MM-DD or YYYY.MM.DD
        date_text = date_text.replace('.', '-')
        date_obj = datetime.strptime(date_text, '%Y-%m-%d')
        bill['proposal_date'] = date_obj.date().isoformat()
    except ValueError:
        logger.warning(f"Could not parse date: {date_text}")

    # Set default status
    bill['status'] = '발의'  # Default to "proposed"

    return bill

def run():
    """Main function to scrape and save bill data"""
    try:
        # Scrape first 3 pages (about 30 recent bills)
        bills = scrape_bills(max_pages=3)

        if bills:
            upsert_bills(bills)
            logger.info(f"Successfully scraped and saved {len(bills)} bills")
        else:
            logger.warning("No bill data scraped")

    except Exception as e:
        logger.error(f"Failed to scrape bills: {e}")
        raise

if __name__ == "__main__":
    run()
