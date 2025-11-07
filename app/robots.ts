/**
 * @file robots.ts
 * @description robots.txt 생성
 *
 * Next.js App Router의 robots.ts는 robots.txt를 동적으로 생성합니다.
 * 이 파일은 검색 엔진 크롤러에게 어떤 페이지를 크롤링할 수 있는지 알려줍니다.
 *
 * 참고: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://my-trip.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/sign-in',
          '/sign-up',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

