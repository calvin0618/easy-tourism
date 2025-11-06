'use client';

import { useEffect } from 'react';
import { useI18n } from '@/components/providers/i18n-provider';

const languageMap: Record<string, string> = {
  ko: 'ko',
  en: 'en',
  ja: 'ja',
  zh: 'zh-CN',
  es: 'es',
};

export function LanguageSync() {
  const { language } = useI18n();

  useEffect(() => {
    // HTML lang 속성 동적 변경
    const htmlLang = languageMap[language] || 'ko';
    document.documentElement.lang = htmlLang;
    console.log('[LanguageSync] 언어 변경:', htmlLang);
  }, [language]);

  return null;
}

