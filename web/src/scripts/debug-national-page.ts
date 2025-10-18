import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function debugNationalPage() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('국회의원 페이지 로딩 중...');
    const url = 'https://www.assembly.go.kr/members/22nd/LEESANGSIK';

    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    // 스크린샷 저장
    await page.screenshot({ path: 'national-page.png', fullPage: true });
    console.log('스크린샷 저장: national-page.png');

    // HTML 저장
    const html = await page.content();
    writeFileSync('national-page.html', html);
    console.log('HTML 저장: national-page.html');

    // 페이지의 주요 요소 확인
    console.log('\n주요 선택자 확인:');
    const selectors = [
      'img',
      '.profile-photo img',
      '.member-photo img',
      '.photo img',
      '[alt*="사진"]',
      '[alt*="프로필"]',
      '.info',
      '.member-info',
      '.profile',
      'table',
    ];

    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`${selector}: ${count}개`);

        // 이미지의 경우 src 확인
        if (selector.includes('img')) {
          const srcs = await page.locator(selector).evaluateAll((elements) =>
            elements.map((el) => ({
              src: (el as HTMLImageElement).src,
              alt: (el as HTMLImageElement).alt
            }))
          );
          console.log('  이미지 정보:', srcs.slice(0, 3));
        }
      }
    }

    console.log('\n브라우저를 10초 동안 열어둡니다...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugNationalPage();
