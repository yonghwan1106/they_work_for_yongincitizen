import { chromium } from 'playwright';
import { parse } from 'node-html-parser';

export interface NationalCouncillor {
  name: string;
  name_en: string;
  party: string;
  district: string;
  photo_url?: string;
  profile_url: string;
  committees?: string;
  email?: string;
  phone?: string;
  office_location?: string;
}

const NATIONAL_COUNCILLORS = [
  {
    name: '이상식',
    name_en: 'LEESANGSIK',
    district: '용인시 갑',
    url: 'https://www.assembly.go.kr/members/22nd/LEESANGSIK',
  },
  {
    name: '손명수',
    name_en: 'SONMYOUNGSOO',
    district: '용인시 을',
    url: 'https://www.assembly.go.kr/members/22nd/SONMYOUNGSOO',
  },
  {
    name: '부승찬',
    name_en: 'BOOSEUNGCHAN',
    district: '용인시 병',
    url: 'https://www.assembly.go.kr/members/22nd/BOOSEUNGCHAN',
  },
  {
    name: '이언주',
    name_en: 'LEEUNJU',
    district: '용인시 정',
    url: 'https://www.assembly.go.kr/members/22nd/LEEUNJU',
  },
];

export async function scrapeNationalCouncillor(
  name: string,
  name_en: string,
  district: string,
  url: string
): Promise<NationalCouncillor> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log(`국회의원 정보 수집 중: ${name} (${district})`);

    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const html = await page.content();
    const root = parse(html);

    // 정당 추출
    const partyEl = root.querySelector('.party, .political-party, .member-party, .info-party');
    const party = partyEl?.textContent.trim() || '더불어민주당'; // 기본값

    // 사진 URL 추출 - background-image로 되어 있음
    const photoSpan = root.querySelector('span.img[style*="background-image"]');
    let photo_url = '';
    if (photoSpan) {
      const style = photoSpan.getAttribute('style') || '';
      const match = style.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/);
      if (match && match[1]) {
        photo_url = match[1];
        if (!photo_url.startsWith('http')) {
          photo_url = `https://www.assembly.go.kr${photo_url}`;
        }
      }
    }

    // 위원회 정보 추출
    const committeeEl = root.querySelector('.committee, .member-committee, .committee-info');
    const committees = committeeEl?.textContent.trim() || '';

    // 연락처 정보 추출
    const emailEl = root.querySelector('.email, .member-email, [class*="email"]');
    const email = emailEl?.textContent.trim() || '';

    const phoneEl = root.querySelector('.phone, .tel, .member-phone, [class*="phone"]');
    const phone = phoneEl?.textContent.trim() || '';

    const officeEl = root.querySelector('.office, .room, .member-office, [class*="office"]');
    const office_location = officeEl?.textContent.trim() || '';

    const councillor: NationalCouncillor = {
      name,
      name_en,
      party,
      district,
      photo_url: photo_url || undefined,
      profile_url: url,
      committees: committees || undefined,
      email: email || undefined,
      phone: phone || undefined,
      office_location: office_location || undefined,
    };

    console.log(`수집 완료: ${name}`);
    return councillor;

  } catch (error) {
    console.error(`Error scraping ${name}:`, error);
    // 에러가 발생해도 기본 정보는 반환
    return {
      name,
      name_en,
      party: '더불어민주당',
      district,
      profile_url: url,
    };
  } finally {
    await browser.close();
  }
}

export async function scrapeAllNationalCouncillors(): Promise<NationalCouncillor[]> {
  console.log('국회의원 4명 정보 수집 시작...');

  const councillors: NationalCouncillor[] = [];

  for (const member of NATIONAL_COUNCILLORS) {
    const councillor = await scrapeNationalCouncillor(
      member.name,
      member.name_en,
      member.district,
      member.url
    );
    councillors.push(councillor);

    // 요청 간 지연 (서버 부하 방지)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`총 ${councillors.length}명의 국회의원 정보 수집 완료`);
  return councillors;
}

// 직접 실행시
if (require.main === module) {
  scrapeAllNationalCouncillors()
    .then((councillors) => {
      console.log('\n=== 수집된 데이터 ===');
      console.log(JSON.stringify(councillors, null, 2));
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}
