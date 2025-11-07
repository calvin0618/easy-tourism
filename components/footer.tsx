/**
 * @file footer.tsx
 * @description 푸터 컴포넌트
 *
 * 사이트 하단 푸터로, 저작권 정보와 한국관광공사 API 제공 표기를 포함합니다.
 * Design.md의 푸터 디자인을 참고하여 작성되었습니다.
 */

'use client';

import Link from 'next/link';
import { useI18n } from '@/components/providers/i18n-provider';

export function Footer() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* 저작권 정보 */}
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              My Trip © {currentYear}
            </p>
          </div>

          {/* 링크 (선택 사항) */}
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link
              href="/about"
              className="hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* API 제공 표기 */}
          <div className="text-center md:text-right">
            <p className="text-xs text-muted-foreground">
              {t.footer.apiProvider}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              <a
                href="https://www.data.go.kr/data/15101578/openapi.do"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors underline"
              >
                {t.footer.dataProvider}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

