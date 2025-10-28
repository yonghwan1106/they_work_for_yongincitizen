# -*- coding: utf-8 -*-
"""
Test script to analyze Naver Cafe structure
"""
import sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)  # Show browser
    context = browser.new_context()
    page = context.new_page()

    # Navigate to cafe
    url = "https://cafe.naver.com/ArticleList.nhn?search.clubid=31159952&search.menuid=1&search.boardtype=L"
    print(f"Navigating to: {url}")
    page.goto(url, wait_until='networkidle', timeout=60000)

    # Wait for user to see the page
    page.wait_for_timeout(5000)

    # Take screenshot
    page.screenshot(path="cafe_page.png", full_page=True)
    print("Screenshot saved to cafe_page.png")

    # Check for iframe
    frames = page.frames
    print(f"\nFound {len(frames)} frames")
    for i, frame in enumerate(frames):
        print(f"  Frame {i}: {frame.url}")

    # Try to access iframe
    try:
        iframe = page.frame_locator('iframe#cafe_main')

        # Get HTML content
        html = iframe.locator('body').inner_html()
        with open('cafe_iframe_content.html', 'w', encoding='utf-8') as f:
            f.write(html)
        print("\nIframe content saved to cafe_iframe_content.html")

    except Exception as e:
        print(f"Error accessing iframe: {e}")

    page.wait_for_timeout(3000)
    browser.close()
