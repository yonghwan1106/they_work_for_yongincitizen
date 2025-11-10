# PocketBase 사용 예시

마이그레이션 후 Next.js 코드에서 PocketBase를 사용하는 방법입니다.

## 📋 기본 사용법

### 1. 클라이언트 Import

```typescript
import { pocketbase, getCouncillorPhotoUrl } from '@/lib/pocketbase/client';
import type { Councillor, CouncillorExpanded } from '@/types/pocketbase-types';
```

---

## 🔍 데이터 조회 (Read)

### 전체 목록 조회

```typescript
// 모든 의원 조회 (정렬 포함)
const councillors = await pocketbase
  .collection('councillors')
  .getFullList<Councillor>({
    sort: 'name', // 이름순 정렬
  });

console.log(`총 ${councillors.length}명의 의원`);
```

### 필터링 조회

```typescript
// 활동 중인 용인시의원만 조회
const activeCouncillors = await pocketbase
  .collection('councillors')
  .getFullList<Councillor>({
    filter: 'is_active = true && councillor_type = "용인시의원"',
    sort: 'name',
  });
```

### 페이지네이션

```typescript
// 페이지별 조회 (20개씩)
const result = await pocketbase
  .collection('councillors')
  .getList<Councillor>(1, 20, { // page=1, perPage=20
    filter: 'is_active = true',
    sort: '-created', // 최신순 (- = DESC)
  });

console.log(`총 ${result.totalItems}건 중 ${result.items.length}건 표시`);
console.log(`현재 페이지: ${result.page}/${result.totalPages}`);
```

### 단일 레코드 조회

```typescript
// ID로 특정 의원 조회
const councillor = await pocketbase
  .collection('councillors')
  .getOne<Councillor>('abc123def456');

console.log(councillor.name);
```

### Relation Expand (JOIN과 유사)

```typescript
// 의원 + 소속 위원회 함께 조회
const councillor = await pocketbase
  .collection('councillors')
  .getOne<CouncillorExpanded>('abc123def456', {
    expand: 'councillor_committees_via_councillor.committee',
  });

// Expanded 데이터 접근
if (councillor.expand?.councillor_committees_via_councillor) {
  for (const rel of councillor.expand.councillor_committees_via_councillor) {
    const committee = rel.expand?.committee;
    console.log(`${rel.role}: ${committee?.name}`);
  }
}
```

### 다중 Relation Expand

```typescript
// 의안 + 제안자 + 공동발의자 모두 조회
const bill = await pocketbase
  .collection('bills')
  .getOne<BillExpanded>('xyz789', {
    expand: 'proposer,bill_cosponsors_via_bill.councillor',
  });

// 제안자
console.log('제안자:', bill.expand?.proposer?.name);

// 공동발의자
if (bill.expand?.bill_cosponsors_via_bill) {
  for (const cosponsor of bill.expand.bill_cosponsors_via_bill) {
    console.log('공동발의:', cosponsor.expand?.councillor?.name);
  }
}
```

---

## 🔎 검색 (Search)

### LIKE 검색

```typescript
// 이름에 "김"이 포함된 의원 검색
const results = await pocketbase
  .collection('councillors')
  .getFullList<Councillor>({
    filter: 'name ~ "김"', // ~ = LIKE operator
  });
```

### 다중 조건 검색

```typescript
// 이름 또는 선거구에 검색어가 포함된 경우
const searchQuery = '처인';
const results = await pocketbase
  .collection('councillors')
  .getFullList<Councillor>({
    filter: `name ~ "${searchQuery}" || district ~ "${searchQuery}"`,
    sort: 'name',
  });
```

### 날짜 범위 검색

```typescript
// 2024년에 제안된 의안 검색
const bills = await pocketbase
  .collection('bills')
  .getFullList<Bill>({
    filter: 'proposal_date >= "2024-01-01" && proposal_date <= "2024-12-31"',
    sort: '-proposal_date',
  });
```

---

## 🖼️ 파일 URL 처리

### 의원 사진 URL 생성

```typescript
import { getCouncillorPhotoUrl } from '@/lib/pocketbase/client';

// 방법 1: Helper 함수 사용
const photoUrl = councillor.photo
  ? getCouncillorPhotoUrl(councillor.id, councillor.photo)
  : '/default-avatar.png';

// 방법 2: 직접 생성
const photoUrl = councillor.photo
  ? pocketbase.files.getUrl(councillor, councillor.photo, { thumb: '300x300' })
  : '/default-avatar.png';

// 방법 3: 원본 크기
const photoUrl = councillor.photo
  ? `https://theyworkforcitizen-api.duckdns.org/api/files/${councillor.collectionId}/${councillor.id}/${councillor.photo}`
  : '/default-avatar.png';
```

### 썸네일 크기 지정

```typescript
// 100x100 썸네일
const thumb100 = pocketbase.files.getUrl(councillor, councillor.photo, { thumb: '100x100' });

// 300x300 썸네일
const thumb300 = pocketbase.files.getUrl(councillor, councillor.photo, { thumb: '300x300' });

// 원본 크기 (썸네일 없음)
const original = pocketbase.files.getUrl(councillor, councillor.photo);
```

---

## 📝 데이터 생성/수정/삭제 (Admin Only)

### Admin 인증

```typescript
// Admin으로 로그인 (서버 사이드에서만 사용)
await pocketbase.admins.authWithPassword(
  process.env.POCKETBASE_ADMIN_EMAIL!,
  process.env.POCKETBASE_ADMIN_PASSWORD!
);

console.log('Admin 인증 성공');
```

### 레코드 생성

```typescript
// 새 의원 추가
const newCouncillor = await pocketbase
  .collection('councillors')
  .create<Councillor>({
    name: '홍길동',
    councillor_type: '용인시의원',
    party: '무소속',
    district: '처인구 갑',
    is_active: true,
  });

console.log('생성된 ID:', newCouncillor.id);
```

### 레코드 수정

```typescript
// 의원 정보 업데이트
const updated = await pocketbase
  .collection('councillors')
  .update<Councillor>('abc123def456', {
    phone: '031-1234-5678',
    email: 'hong@example.com',
  });
```

### 파일 업로드

```typescript
import FormData from 'form-data';
import fs from 'fs';

// FormData 생성
const formData = new FormData();
formData.append('photo', fs.createReadStream('/path/to/photo.jpg'));
formData.append('name', '홍길동'); // 다른 필드도 함께 업데이트 가능

// 업로드
const updated = await pocketbase
  .collection('councillors')
  .update('abc123def456', formData);

console.log('업로드된 파일명:', updated.photo);
```

### 레코드 삭제

```typescript
// 의원 삭제
await pocketbase
  .collection('councillors')
  .delete('abc123def456');

console.log('삭제 완료');
```

---

## 🎯 실제 사용 예시 (Next.js Pages)

### 의원 목록 페이지 (SSR)

```typescript
// src/app/councillors/page.tsx
import { pocketbase, getCouncillorPhotoUrl } from '@/lib/pocketbase/client';
import type { Councillor } from '@/types/pocketbase-types';
import Image from 'next/image';

export default async function CouncillorsPage() {
  // Server Component에서 데이터 Fetch
  const councillors = await pocketbase
    .collection('councillors')
    .getFullList<Councillor>({
      filter: 'is_active = true && councillor_type = "용인시의원"',
      sort: 'name',
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">용인시의회 의원</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {councillors.map((councillor) => {
          const photoUrl = councillor.photo
            ? getCouncillorPhotoUrl(councillor.id, councillor.photo)
            : '/default-avatar.png';

          return (
            <div key={councillor.id} className="border rounded-lg p-4 shadow-sm">
              <Image
                src={photoUrl}
                alt={councillor.name}
                width={300}
                height={300}
                className="rounded-full mx-auto"
              />
              <h2 className="text-xl font-semibold text-center mt-4">
                {councillor.name}
              </h2>
              <p className="text-gray-600 text-center">{councillor.party}</p>
              <p className="text-gray-500 text-center text-sm">{councillor.district}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### 의원 상세 페이지 (Dynamic Route)

```typescript
// src/app/councillors/[id]/page.tsx
import { pocketbase } from '@/lib/pocketbase/client';
import type { CouncillorExpanded, BillExpanded } from '@/types/pocketbase-types';
import { notFound } from 'next/navigation';

interface Props {
  params: { id: string };
}

export default async function CouncillorDetailPage({ params }: Props) {
  try {
    // 의원 정보 + 위원회 정보 조회
    const councillor = await pocketbase
      .collection('councillors')
      .getOne<CouncillorExpanded>(params.id, {
        expand: 'councillor_committees_via_councillor.committee',
      });

    // 제안한 의안 조회
    const bills = await pocketbase
      .collection('bills')
      .getList<BillExpanded>(1, 20, {
        filter: `proposer = "${params.id}"`,
        sort: '-proposal_date',
        expand: 'bill_cosponsors_via_bill.councillor',
      });

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">{councillor.name}</h1>
        <p className="text-xl text-gray-600">{councillor.party} | {councillor.district}</p>

        {/* 소속 위원회 */}
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">소속 위원회</h2>
          {councillor.expand?.councillor_committees_via_councillor?.map((rel) => {
            const committee = rel.expand?.committee;
            return (
              <div key={rel.id} className="mb-2">
                <span className="font-medium">{rel.role}</span>: {committee?.name}
              </div>
            );
          })}
        </section>

        {/* 제안 의안 */}
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">
            제안 의안 ({bills.totalItems}건)
          </h2>
          {bills.items.map((bill) => (
            <div key={bill.id} className="border-b py-4">
              <h3 className="font-semibold">{bill.title}</h3>
              <p className="text-sm text-gray-500">
                {bill.bill_number} | {bill.status} | {bill.proposal_date}
              </p>
              {/* 공동발의자 */}
              {bill.expand?.bill_cosponsors_via_bill && (
                <p className="text-sm text-gray-600 mt-1">
                  공동발의:{' '}
                  {bill.expand.bill_cosponsors_via_bill
                    .map((c) => c.expand?.councillor?.name)
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
            </div>
          ))}
        </section>
      </div>
    );
  } catch (error) {
    // 레코드가 없으면 404
    notFound();
  }
}
```

### 검색 페이지 (Client Component)

```typescript
// src/app/search/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { pocketbase } from '@/lib/pocketbase/client';
import type { Councillor } from '@/types/pocketbase-types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Councillor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);

      try {
        const data = await pocketbase
          .collection('councillors')
          .getFullList<Councillor>({
            filter: `name ~ "${query}" || district ~ "${query}" || party ~ "${query}"`,
            sort: 'name',
          });

        setResults(data);
      } catch (error) {
        console.error('검색 실패:', error);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">의원 검색</h1>

      <input
        type="text"
        placeholder="의원 이름, 선거구, 정당 검색..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg mb-6"
      />

      {loading && <p>검색 중...</p>}

      {!loading && results.length > 0 && (
        <div>
          <p className="mb-4">검색 결과: {results.length}건</p>
          {results.map((councillor) => (
            <div key={councillor.id} className="border-b py-4">
              <h2 className="font-semibold">{councillor.name}</h2>
              <p className="text-sm text-gray-600">
                {councillor.party} | {councillor.district}
              </p>
            </div>
          ))}
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <p className="text-gray-500">검색 결과가 없습니다.</p>
      )}
    </div>
  );
}
```

---

## 📚 고급 패턴

### Realtime Subscription (실시간 업데이트)

```typescript
// 의원 목록 실시간 구독
pocketbase.collection('councillors').subscribe('*', (e) => {
  console.log('변경 감지:', e.action); // create, update, delete
  console.log('레코드:', e.record);

  // UI 업데이트 로직
  if (e.action === 'create') {
    // 새 의원 추가
  } else if (e.action === 'update') {
    // 의원 정보 업데이트
  } else if (e.action === 'delete') {
    // 의원 삭제
  }
});

// 구독 해제
pocketbase.collection('councillors').unsubscribe('*');
```

### Error Handling

```typescript
try {
  const councillor = await pocketbase
    .collection('councillors')
    .getOne('invalid-id');
} catch (error: any) {
  if (error.status === 404) {
    console.error('의원을 찾을 수 없습니다');
  } else if (error.status === 403) {
    console.error('접근 권한이 없습니다');
  } else {
    console.error('알 수 없는 오류:', error);
  }
}
```

### Caching (Next.js)

```typescript
// 캐시 설정 (Next.js 14+)
export const revalidate = 3600; // 1시간마다 재검증

export default async function CouncillorsPage() {
  const councillors = await pocketbase
    .collection('councillors')
    .getFullList<Councillor>({
      sort: 'name',
      cache: 'force-cache', // Next.js 캐시 사용
    });

  return <div>...</div>;
}
```

---

## 🔗 참고 자료

- **PocketBase JS SDK:** https://github.com/pocketbase/js-sdk
- **PocketBase API Docs:** https://pocketbase.io/docs/api-records/
- **Filter Syntax:** https://pocketbase.io/docs/api-rules-and-filters/

---

**작성일:** 2025년 11월 10일
**버전:** 1.0
