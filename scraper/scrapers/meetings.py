# -*- coding: utf-8 -*-
"""
Scraper for Yongin Council meeting transcripts
"""
import requests
from bs4 import BeautifulSoup
import logging
import time
import re
from datetime import datetime
from config import COUNCIL_BASE_URL, REQUEST_TIMEOUT, REQUEST_DELAY, USER_AGENT
from utils.db import upsert_meetings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def scrape_meetings(max_pages=5):
    """
    Scrape meeting information from Yongin Council website

    Args:
        max_pages: Maximum number of pages to scrape (default: 5)

    Returns:
        List of meeting dictionaries
    """
    url = f"{COUNCIL_BASE_URL}/kr/minutes/late.do"
    logger.info(f"Scraping meetings from {url}")

    headers = {'User-Agent': USER_AGENT}
    meetings = []

    try:
        for page in range(1, max_pages + 1):
            page_url = f"{url}?page={page}"
            logger.info(f"Fetching page {page}: {page_url}")

            response = requests.get(page_url, headers=headers, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            response.encoding = 'utf-8'

            soup = BeautifulSoup(response.text, 'html.parser')

            # Find the table with class "normal_list"
            table = soup.find('table', class_='normal_list')
            if not table:
                logger.warning(f"No meeting table found on page {page}")
                break

            # Find all data rows (skip header)
            rows = table.find_all('tr')[1:]  # Skip header row

            if not rows:
                logger.warning(f"No meeting rows found on page {page}")
                break

            page_meetings = 0
            for row in rows:
                try:
                    meeting = extract_meeting_info(row)
                    if meeting and meeting.get('title'):
                        meetings.append(meeting)
                        page_meetings += 1
                        logger.info(f"Found: {meeting['title']} ({meeting.get('meeting_date', 'N/A')})")
                except Exception as e:
                    logger.warning(f"Error parsing meeting row: {e}")
                    continue

            logger.info(f"Page {page}: Found {page_meetings} meetings")

            # Check if there's a next page
            if page_meetings == 0:
                break

            time.sleep(REQUEST_DELAY)

        logger.info(f"Total meetings scraped: {len(meetings)}")
        return meetings

    except requests.RequestException as e:
        logger.error(f"Error fetching meetings page: {e}")
        raise
    except Exception as e:
        logger.error(f"Error parsing meetings data: {e}")
        raise

def extract_meeting_info(row):
    """
    Extract meeting information from table row

    Table structure:
    <tr>
      <td>번호</td>
      <td>대수 (session_number)</td>
      <td>회수 (meeting_number)</td>
      <td>차수</td>
      <td><a href="/viewer/minutes.do?uid=XXXX">회의명</a></td>
      <td>일자 (date)</td>
    </tr>

    Args:
        row: BeautifulSoup tr element

    Returns:
        Dictionary with meeting data
    """
    meeting = {}

    cells = row.find_all('td')
    if len(cells) < 6:
        return None

    # Cell 0: 번호 (ID) - skip

    # Cell 1: 대수 (session number) - e.g., "제9대"
    session_text = cells[1].get_text().strip()
    session_match = re.search(r'(\d+)', session_text)
    if session_match:
        meeting['session_number'] = int(session_match.group(1))

    # Cell 2: 회수 (meeting number) - e.g., "제295회"
    meeting_num_text = cells[2].get_text().strip()
    meeting_num_match = re.search(r'(\d+)', meeting_num_text)
    if meeting_num_match:
        meeting['meeting_number'] = int(meeting_num_match.group(1))

    # Cell 3: 차수 - skip for now

    # Cell 4: 회의명 with link to transcript
    title_cell = cells[4]
    title_link = title_cell.find('a')
    if title_link:
        meeting['title'] = title_link.get_text().strip()

        # Extract transcript URL
        href = title_link.get('href')
        if href:
            if href.startswith('http'):
                meeting['transcript_url'] = href
            else:
                meeting['transcript_url'] = f"{COUNCIL_BASE_URL}{href}" if href.startswith('/') else f"{COUNCIL_BASE_URL}/{href}"
    else:
        meeting['title'] = title_cell.get_text().strip()

    # Cell 5: 일자 (date) - e.g., "2025.10.13"
    date_text = cells[5].get_text().strip()
    try:
        # Parse date in format YYYY.MM.DD
        date_obj = datetime.strptime(date_text, '%Y.%m.%d')
        meeting['meeting_date'] = date_obj.date().isoformat()
    except ValueError:
        # Try other formats
        try:
            date_obj = datetime.strptime(date_text, '%Y-%m-%d')
            meeting['meeting_date'] = date_obj.date().isoformat()
        except ValueError:
            logger.warning(f"Could not parse date: {date_text}")

    # Determine meeting type from title
    title_lower = meeting.get('title', '').lower()
    if '본회의' in meeting.get('title', ''):
        meeting['meeting_type'] = '본회의'
    elif '위원회' in meeting.get('title', ''):
        meeting['meeting_type'] = '위원회'
    elif '특별위' in meeting.get('title', ''):
        meeting['meeting_type'] = '특별위원회'
    else:
        meeting['meeting_type'] = '기타'

    # Mark as not processed (will be processed by AI later)
    meeting['is_processed'] = False

    return meeting

def scrape_transcript_text(transcript_url):
    """
    Scrape full text from a meeting transcript page

    Structure:
    <div id="minutes-body">
      <div class="contents-block speaker-block member-speech">
        <strong>○위원장 이윤미</strong>
        발언 내용...
      </div>
    </div>

    Args:
        transcript_url: URL of the transcript

    Returns:
        Full transcript text
    """
    headers = {'User-Agent': USER_AGENT}

    try:
        logger.info(f"Fetching transcript from: {transcript_url}")
        response = requests.get(transcript_url, headers=headers, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        response.encoding = 'utf-8'

        soup = BeautifulSoup(response.text, 'html.parser')

        # Find the main minutes body
        minutes_body = soup.find('div', id='minutes-body')
        if not minutes_body:
            logger.warning("No minutes-body found in transcript")
            return ""

        # Extract all content blocks
        content_blocks = minutes_body.find_all('div', class_='contents-block')

        transcript_parts = []
        for block in content_blocks:
            # Get the text content, preserving line breaks
            text = block.get_text(separator='\n', strip=True)
            if text:
                transcript_parts.append(text)

        transcript_text = '\n\n'.join(transcript_parts)

        logger.info(f"Extracted transcript: {len(transcript_text)} characters")
        return transcript_text

    except Exception as e:
        logger.error(f"Error fetching transcript from {transcript_url}: {e}")
        return ""

def run():
    """Main function to scrape and save meeting data"""
    try:
        # Scrape first 3 pages (about 30 recent meetings)
        meetings = scrape_meetings(max_pages=3)

        if meetings:
            upsert_meetings(meetings)
            logger.info(f"Successfully scraped and saved {len(meetings)} meetings")
        else:
            logger.warning("No meeting data scraped")

    except Exception as e:
        logger.error(f"Failed to scrape meetings: {e}")
        raise

if __name__ == "__main__":
    run()
