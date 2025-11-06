/**
 * @file error-boundary.tsx
 * @description 에러 바운더리 컴포넌트
 *
 * React 에러 바운더리를 사용하여 컴포넌트 트리에서 발생하는 에러를 처리합니다.
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent =
        this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * 기본 에러 폴백 컴포넌트
 */
function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <AlertCircle className="w-16 h-16 text-destructive mb-4" />
      <h2 className="text-2xl font-bold mb-2">문제가 발생했습니다</h2>
      <p className="text-muted-foreground mb-4 text-center max-w-md">
        예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 다시 시도해주세요.
      </p>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 p-4 bg-destructive/10 rounded-md max-w-md">
          <summary className="cursor-pointer font-medium mb-2">
            에러 상세 정보 (개발 모드)
          </summary>
          <pre className="text-xs overflow-auto text-left">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}
      <Button onClick={resetError} className="mt-4">
        다시 시도
      </Button>
    </div>
  );
}

export default ErrorBoundary;

