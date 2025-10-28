# -*- coding: utf-8 -*-
"""
Test script to analyze new Naver Cafe structure
"""
import sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()

    # Try the new cafe URL structure
    url = "https://cafe.naver.com/ca-fe/cafes/31159952/menus/1"
    print(f"Navigating to: {url}")

    try:
        page.goto(url, wait_until='domcontentloaded', timeout=30000)
        page.wait_for_timeout(5000)

        # Take screenshot
        page.screenshot(path="cafe_page2.png", full_page=True)
        print("Screenshot saved to cafe_page2.png")

        # Try different selectors
        print("\nTrying to find article list...")

        # Check page content
        content = page.content()
        with open('cafe_full_page.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Full page HTML saved to cafe_full_page.html")

        # Try to find article elements
        selectors_to_try = [
            'article',
            '.article',
            '[class*="article"]',
            '[class*="Article"]',
            '[data-article-id]',
            'a[href*="articles"]',
        ]

        for selector in selectors_to_try:
            try:
                elements = page.locator(selector).all()
                if elements:
                    print(f"Found {len(elements)} elements with selector: {selector}")
            except:
                pass

        page.wait_for_timeout(3000)

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="cafe_error.png")

    browser.close()
