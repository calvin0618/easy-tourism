/**
 * @file sitemap.ts
 * @description 동적 사이트맵 생성
 *
 * Next.js App Router의 sitemap.ts는 동적 사이트맵을 생성합니다.
 * 이 파일은 SEO를 위해 검색 엔진에 사이트 구조를 알려줍니다.
 *
 * 참고: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://my-trip.vercel.app';

  // 정적 페이지들
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/bookmarks`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/stats`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // 동적 페이지는 실제로는 API를 통해 생성할 수 있지만,
  // 여기서는 기본 구조만 제공합니다.
  // 실제 구현 시에는 관광지 목록을 가져와서 각 관광지 상세 페이지를 추가할 수 있습니다.

  return staticPages;
}

