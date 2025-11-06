/**
 * @file address-copy-button.tsx
 * @description 주소 복사 버튼 컴포넌트
 *
 * 클립보드에 주소를 복사하는 기능을 제공합니다.
 */

'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AddressCopyButtonProps {
  address: string;
}

export function AddressCopyButton({ address }: AddressCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('주소가 복사되었습니다.');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('주소 복사에 실패했습니다.');
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="h-8 gap-2"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          복사됨
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          복사
        </>
      )}
    </Button>
  );
}

