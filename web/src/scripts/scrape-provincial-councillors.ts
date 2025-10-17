import { chromium } from 'playwright';
import { parse } from 'node-html-parser';

export interface ProvincialCouncillor {
  name: string;
  party: string;
  district: string;
  photo_url?: string;
  profile_url: string;
  committees?: string;
}

export async function scrapeProvincialCouncillors(): Promise<ProvincialCouncillor[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('경기도의회 용인시 의원 정보 수집 시작...');
    const url = 'https://www.ggc.go.kr/site/main/memberInfo/actvMmbr/list?menu=city&miDistrictCode=45';

    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const html = await page.content();
    const root = parse(html);

    const councillors: ProvincialCouncillor[] = [];

    // 실제 HTML 구조: <li> 안에 <div class="text"> 안에 정보가 있음
    const memberCards = root.querySelectorAll('ul li');

    console.log(`Found ${memberCards.length} list items`);

    for (const card of memberCards) {
      try {
        // 이름 추출 - p.f22.blue3
        const nameEl = card.querySelector('p.blue3, p.f22');
        const name = nameEl?.textContent.trim() || '';

        if (!name) continue; // 이름이 없으면 스킵

        // 정당과 선거구는 ul.list_style01의 li들에 있음
        const infoItems = card.querySelectorAll('ul.list_style01 li');
        let party = '';
        let district = '';

        if (infoItems.length >= 2) {
          party = infoItems[0]?.textContent.trim() || '';
          district = infoItems[1]?.textContent.trim() || '';
        }

        // 사진 URL 추출
        const photoEl = card.querySelector('img');
        let photo_url = photoEl?.getAttribute('src') || '';
        if (photo_url && !photo_url.startsWith('http')) {
          photo_url = `https://www.ggc.go.kr${photo_url}`;
        }

        // 프로필 링크 추출 - 더보기 버튼의 a 태그
        const linkEl = card.querySelector('a[href*="blog"]');
        let profile_url = linkEl?.getAttribute('href') || '';
        if (profile_url && !profile_url.startsWith('http')) {
          profile_url = `https://www.ggc.go.kr${profile_url}`;
        }

        if (name && party && district) {
          councillors.push({
            name,
            party,
            district,
            photo_url: photo_url || undefined,
            profile_url,
          });

          console.log(`추가됨: ${name} (${party}, ${district})`);
        }
      } catch (error) {
        console.error('의원 정보 파싱 오류:', error);
      }
    }

    console.log(`총 ${councillors.length}명의 경기도의원 정보 수집 완료`);
    return councillors;

  } catch (error) {
    console.error('Scraping error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// 직접 실행시
if (require.main === module) {
  scrapeProvincialCouncillors()
    .then((councillors) => {
      console.log('\n=== 수집된 데이터 ===');
      console.log(JSON.stringify(councillors, null, 2));
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}
