/**
 * @file share-button.tsx
 * @description 상세페이지 공유 버튼 컴포넌트
 *
 * URL 복사 기능을 제공하는 공유 버튼입니다.
 * PRD.md 2.4.5 공유 기능 요구사항을 참고하여 작성되었습니다.
 *
 * 주요 기능:
 * - 현재 페이지 URL을 클립보드에 복사
 * - 복사 완료 토스트 메시지
 * - HTTPS 환경 확인
 */

'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ShareButtonProps {
  /** 공유할 URL (기본값: 현재 페이지 URL) */
  url?: string;
  /** 버튼 크기 */
  size?: 'sm' | 'default' | 'lg' | 'icon';
  /** 버튼 variant */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 상세페이지 공유 버튼 컴포넌트
 */
export function ShareButton({
  url,
  size = 'default',
  variant = 'outline',
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  /**
   * URL을 클립보드에 복사
   */
  const handleShare = async () => {
    try {
      // URL이 제공되지 않으면 현재 페이지 URL 사용
      const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

      if (!shareUrl) {
        toast.error('공유할 URL을 찾을 수 없습니다.');
        return;
      }

      // HTTPS 환경 확인 (클립보드 API는 HTTPS 또는 localhost에서만 작동)
      if (typeof window !== 'undefined' && !window.isSecureContext && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        // 대체 방법: prompt로 URL 표시
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          toast.success('URL이 복사되었습니다.');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          toast.error('URL 복사에 실패했습니다.');
          console.error('[ShareButton] URL 복사 실패:', err);
        } finally {
          document.body.removeChild(textArea);
        }
        return;
      }

      // 클립보드 API 사용
      await navigator.clipboard.writeText(shareUrl);
      toast.success('URL이 복사되었습니다.');
      console.log('[ShareButton] URL 복사 완료:', shareUrl);
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('[ShareButton] URL 복사 실패:', error);
      toast.error('URL 복사에 실패했습니다.');
    }
  };

  return (
    <Button
      onClick={handleShare}
      size={size}
      variant={variant}
      className={className}
      aria-label="공유하기"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          복사됨
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 mr-2" />
          공유하기
        </>
      )}
    </Button>
  );
}

