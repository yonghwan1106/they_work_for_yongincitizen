import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function debugProvincialPage() {
  const browser = await chromium.launch({ headless: false }); // headless: false로 브라우저 표시
  const page = await browser.newPage();

  try {
    console.log('경기도의회 페이지 로딩 중...');
    const url = 'https://www.ggc.go.kr/site/main/memberInfo/actvMmbr/list?menu=city&miDistrictCode=45';

    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000); // 5초 대기

    // 스크린샷 저장
    await page.screenshot({ path: 'provincial-page.png', fullPage: true });
    console.log('스크린샷 저장: provincial-page.png');

    // HTML 저장
    const html = await page.content();
    writeFileSync('provincial-page.html', html);
    console.log('HTML 저장: provincial-page.html');

    // 페이지의 주요 요소 확인
    const bodyText = await page.textContent('body');
    console.log('\n페이지 텍스트 샘플:');
    console.log(bodyText?.substring(0, 500));

    // 특정 선택자 테스트
    const selectors = [
      'ul li',
      '.member',
      '.councillor',
      'table tr',
      '[class*="member"]',
      '[class*="list"]',
      '.list-item',
      '.item',
    ];

    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      console.log(`${selector}: ${count}개`);
    }

    console.log('\n브라우저를 10초 동안 열어둡니다. 페이지를 확인하세요...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugProvincialPage();
