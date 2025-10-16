# -*- coding: utf-8 -*-
"""
Scraper for Yongin Council councillor information
"""
import requests
from bs4 import BeautifulSoup
import logging
import time
import re
from config import COUNCIL_BASE_URL, REQUEST_TIMEOUT, REQUEST_DELAY, USER_AGENT
from utils.db import upsert_councillors

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def scrape_councillors():
    """
    Scrape councillor information from Yongin Council website

    Returns:
        List of councillor dictionaries
    """
    url = f"{COUNCIL_BASE_URL}/kr/member/name.do"
    logger.info(f"Scraping councillors from {url}")

    headers = {'User-Agent': USER_AGENT}
    councillors = []

    try:
        # Scrape all pages (assuming pagination exists)
        page = 1
        while True:
            page_url = f"{url}?page={page}"
            logger.info(f"Fetching page {page}: {page_url}")

            response = requests.get(page_url, headers=headers, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            response.encoding = 'utf-8'

            soup = BeautifulSoup(response.text, 'html.parser')

            # Find all councillor profile blocks
            # Each councillor is in a <div class="profile"> element
            # Include both visible (class="profile") and hidden (class="profile none")
            councillor_blocks = soup.find_all('div', class_='profile')

            if not councillor_blocks:
                logger.warning(f"No councillor blocks found on page {page}")
                break

            logger.info(f"Found {len(councillor_blocks)} profile blocks on page {page}")

            page_councillors = 0
            for block in councillor_blocks:
                try:
                    councillor = extract_councillor_info(block)
                    if councillor and councillor.get('name'):
                        councillors.append(councillor)
                        page_councillors += 1
                        logger.info(f"Found: {councillor['name']} ({councillor.get('party', 'N/A')})")
                except Exception as e:
                    logger.warning(f"Error parsing councillor block: {e}")
                    continue

            logger.info(f"Page {page}: Found {page_councillors} councillors")

            # Check if there's a next page
            next_page = soup.find('a', string=lambda text: text and ('다음' in text or 'next' in text.lower()))
            if not next_page or page_councillors == 0:
                break

            page += 1
            time.sleep(REQUEST_DELAY)

        logger.info(f"Total councillors scraped: {len(councillors)}")
        return councillors

    except requests.RequestException as e:
        logger.error(f"Error fetching councillors page: {e}")
        raise
    except Exception as e:
        logger.error(f"Error parsing councillors data: {e}")
        raise

def extract_councillor_info(block):
    """
    Extract councillor information from HTML block

    HTML structure:
    <div class="profile">
      <dl>
        <dt><img alt="name" src="photo_url"></dt>
        <dd>
          <em class="name">Name</em>
          <ul class="dot">
            <li><em>직위</em>...<span>position</span></li>
            <li><em>선거구</em>...<span>district</span></li>
            <li><em>소속정당</em>...<span>party</span></li>
            <li><em>연락처</em>...<span><a>phone</a></span></li>
          </ul>
        </dd>
      </dl>
    </div>

    Args:
        block: BeautifulSoup element containing councillor info

    Returns:
        Dictionary with councillor data
    """
    councillor = {
        'is_active': True,
        'term_number': 8  # Current term
    }

    # Extract name from <em class="name">
    name_elem = block.find('em', class_='name')
    if name_elem:
        councillor['name'] = name_elem.get_text().strip()

    # Extract photo URL from <dt><img>
    img = block.find('dt')
    if img:
        img_tag = img.find('img')
        if img_tag and img_tag.get('src'):
            photo_url = img_tag['src']
            if not photo_url.startswith('http'):
                photo_url = f"{COUNCIL_BASE_URL}{photo_url}" if photo_url.startswith('/') else f"{COUNCIL_BASE_URL}/{photo_url}"
            councillor['photo_url'] = photo_url

    # Extract info from <ul class="dot"> items
    info_list = block.find('ul', class_='dot')
    if info_list:
        items = info_list.find_all('li')
        for item in items:
            label_elem = item.find('em')
            if not label_elem:
                continue

            # Normalize label by removing all whitespace
            label = ''.join(label_elem.get_text().split())

            # Get the value span (skip the colon span)
            value_spans = item.find_all('span')
            if not value_spans:
                continue

            # Find non-colon spans
            value_spans = [s for s in value_spans if 'colon' not in s.get('class', [])]
            if not value_spans:
                continue

            # Usually the first non-colon span contains the actual value
            value_text = value_spans[0].get_text().strip()

            # Map labels to fields (normalized labels without spaces)
            if '직위' in label or label == '직':
                councillor['position'] = value_text
            elif '선거구' in label:
                # Extract just the electoral district name (e.g., "라선거구")
                # Remove the detailed area in parentheses if present
                district = value_text.split('(')[0].strip()
                councillor['district'] = district
            elif '소속정당' in label or '정당' in label:
                councillor['party'] = value_text
            elif '연락처' in label or '전화' in label:
                # Phone might be in an <a> tag
                phone_link = value_spans[0].find('a')
                if phone_link:
                    phone = phone_link.get_text().strip()
                else:
                    phone = value_text
                councillor['phone'] = phone

    # Extract email (if present in the block)
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', block.get_text())
    if email_match:
        councillor['email'] = email_match.group(0)

    return councillor

def run():
    """Main function to scrape and save councillor data"""
    try:
        councillors = scrape_councillors()

        if councillors:
            upsert_councillors(councillors)
            logger.info(f"Successfully scraped and saved {len(councillors)} councillors")
        else:
            logger.warning("No councillor data scraped")

    except Exception as e:
        logger.error(f"Failed to scrape councillors: {e}")
        raise

if __name__ == "__main__":
    run()
