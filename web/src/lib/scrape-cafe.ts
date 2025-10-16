import { chromium } from 'playwright';
import { parse } from 'node-html-parser';

export interface CafePost {
  id: string;
  title: string;
  author: string;
  date: string;
  views: string;
  url: string;
  isNotice: boolean;
}

export async function scrapeCafePosts(): Promise<CafePost[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('Going to cafe page...');
    await page.goto('https://cafe.naver.com/yonginblue', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(3000);
    
    const frameElement = await page.waitForSelector('iframe#cafe_main');
    const frame = await frameElement.contentFrame();
    
    if (!frame) {
      throw new Error('Cannot access iframe');
    }
    
    const html = await frame.content();
    const root = parse(html);
    
    const posts: CafePost[] = [];
    const rows = root.querySelectorAll('table tbody tr');
    console.log(`Found ${rows.length} rows`);
    
    for (let i = 0; i < Math.min(rows.length, 10); i++) {
      const row = rows[i];
      const link = row.querySelector('a[href*="articleid"]');
      if (!link) continue;
      
      const href = link.getAttribute('href') || '';
      const titleText = link.textContent.trim();
      
      const match = href.match(/articleid=(\d+)/);
      if (!match) continue;
      
      const articleId = match[1];
      const cells = row.querySelectorAll('td');

      // 실제 순서: 제목(0), 작성자(1), 날짜(2), 조회수(3)
      const author = cells[1] ? cells[1].textContent.trim() : '알 수 없음';
      const date = cells[2] ? cells[2].textContent.trim() : '';
      const views = cells[3] ? cells[3].textContent.trim() : '0';
      
      const isNotice = row.querySelector('strong') !== null;
      
      posts.push({
        id: articleId,
        title: titleText,
        author,
        date,
        views,
        url: `https://cafe.naver.com/yonginblue/${articleId}`,
        isNotice,
      });
      
      console.log(`Added: ${titleText.substring(0, 40)}...`);
    }
    
    console.log(`Total posts: ${posts.length}`);
    return posts;
    
  } catch (error) {
    console.error('Scraping error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}
