/**
 * @file app/contact/page.tsx
 * @description Contact 페이지
 *
 * 문의 페이지입니다.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact - My Trip',
  description: 'My Trip 문의',
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Contact</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">문의하기</h2>
          <p className="text-muted-foreground mb-4">
            My Trip 서비스에 대한 문의사항이 있으시면 아래를 통해 연락해주세요.
          </p>
          <p className="text-muted-foreground">
            서비스 개선을 위한 피드백도 환영합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">데이터 출처</h2>
          <p className="text-muted-foreground mb-4">
            본 서비스는 한국관광공사에서 제공하는 공공 데이터를 사용합니다.
          </p>
          <p className="text-muted-foreground">
            데이터 관련 문의는{' '}
            <a
              href="https://www.data.go.kr/data/15101578/openapi.do"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              한국관광공사 공공 API
            </a>
            를 참고해주세요.
          </p>
        </section>
      </div>
    </div>
  );
}

