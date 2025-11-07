/**
 * @file app/about/page.tsx
 * @description About 페이지
 *
 * 서비스 소개 페이지입니다.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - My Trip',
  description: 'My Trip 서비스 소개',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">About My Trip</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">서비스 소개</h2>
          <p className="text-muted-foreground mb-4">
            My Trip은 한국관광공사 공공 API를 활용하여 전국의 관광지 정보를 제공하는 서비스입니다.
          </p>
          <p className="text-muted-foreground">
            사용자는 지역, 관광지 유형, 키워드로 관광지를 검색하고, 상세 정보를 확인할 수 있습니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">주요 기능</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>전국 관광지 검색 및 조회</li>
            <li>지역별, 유형별 필터링</li>
            <li>구글 지도 연동</li>
            <li>관광지 상세 정보 제공</li>
            <li>북마크 기능 (로그인 시)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">데이터 제공</h2>
          <p className="text-muted-foreground mb-4">
            본 서비스는 한국관광공사에서 제공하는 공공 API를 사용합니다.
          </p>
          <p className="text-muted-foreground">
            <a
              href="https://www.data.go.kr/data/15101578/openapi.do"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              한국관광공사 공공 API 바로가기
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

