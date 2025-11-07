'use client';

import { SignedOut, SignInButton, SignUpButton, SignedIn, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/providers/i18n-provider';
import { Component, type ReactNode } from 'react';

/**
 * Clerk 인증 버튼 컴포넌트
 * ClerkProvider가 없을 때도 안전하게 처리
 */
function ClerkAuthButtonsContent() {
  const { t } = useI18n();
  
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="ghost" size="sm">
            {t.common.login}
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button size="sm">
            {t.common.signup}
          </Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-8 h-8',
            },
          }}
        />
      </SignedIn>
    </>
  );
}

/**
 * 에러 바운더리로 Clerk 컴포넌트를 감싸서
 * ClerkProvider가 없을 때도 안전하게 처리
 */
class ClerkAuthButtonsErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // ClerkProvider가 없을 때 발생하는 에러는 무시
    if (error.message?.includes('publishableKey') || error.message?.includes('Clerk')) {
      console.warn('[ClerkAuthButtons] Clerk가 초기화되지 않았습니다:', error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      // Clerk가 없을 때는 로그인 버튼만 표시 (실제 기능 없음)
      return (
        <Button variant="ghost" size="sm" disabled>
          로그인
        </Button>
      );
    }

    return this.props.children;
  }
}

export function ClerkAuthButtons() {
  return (
    <ClerkAuthButtonsErrorBoundary>
      <ClerkAuthButtonsContent />
    </ClerkAuthButtonsErrorBoundary>
  );
}

