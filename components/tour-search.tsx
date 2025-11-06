/**
 * @file tour-search.tsx
 * @description 관광지 검색 컴포넌트
 *
 * 키워드 검색을 위한 검색창 컴포넌트입니다.
 * PRD.md 2.3 키워드 검색 요구사항을 참고하여 작성되었습니다.
 * Design.md의 검색창 레이아웃을 반영했습니다.
 *
 * 주요 기능:
 * 1. 검색어 입력 및 검색 실행
 * 2. Enter 키 이벤트 처리
 * 3. 검색 버튼 클릭
 * 4. 모바일 반응형 디자인
 *
 * @dependencies
 * - lucide-react: Search 아이콘
 * - @/components/ui/input: Input 컴포넌트
 * - @/components/ui/button: Button 컴포넌트
 */

'use client';

import { useState, KeyboardEvent } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TourSearchProps {
  /** 검색어 초기값 */
  value?: string;
  /** 검색 실행 핸들러 */
  onSearch: (keyword: string) => void;
  /** 검색어 초기화 핸들러 */
  onClear?: () => void;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 추가 클래스명 */
  className?: string;
  /** 검색창 크기 */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 관광지 검색 컴포넌트
 */
export function TourSearch({
  value = '',
  onSearch,
  onClear,
  placeholder = '관광지 검색...',
  className,
  size = 'md',
}: TourSearchProps) {
  const [searchKeyword, setSearchKeyword] = useState(value);

  // 검색 실행
  const handleSearch = () => {
    const trimmedKeyword = searchKeyword.trim();
    if (trimmedKeyword) {
      console.log('[TourSearch] 검색 실행:', trimmedKeyword);
      onSearch(trimmedKeyword);
    }
  };

  // Enter 키 이벤트 처리
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // 검색어 초기화
  const handleClear = () => {
    setSearchKeyword('');
    if (onClear) {
      onClear();
    }
  };

  // 크기별 스타일
  const sizeStyles = {
    sm: 'h-8 text-sm px-3',
    md: 'h-10 text-base px-4',
    lg: 'h-12 text-lg px-6',
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative flex items-center">
        {/* 검색 아이콘 */}
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />

        {/* 검색 입력창 */}
        <Input
          type="search"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'pl-10 pr-20',
            sizeStyles[size],
            'focus-visible:ring-2 focus-visible:ring-ring'
          )}
          aria-label="관광지 검색"
        />

        {/* 검색어가 있을 때 초기화 버튼 */}
        {searchKeyword && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-12 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="검색어 초기화"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}

        {/* 검색 버튼 */}
        <Button
          type="button"
          onClick={handleSearch}
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
          className={cn(
            'absolute right-1',
            size === 'sm' ? 'h-6 px-2' : size === 'lg' ? 'h-10 px-4' : 'h-8 px-3'
          )}
          disabled={!searchKeyword.trim()}
        >
          <Search className="h-4 w-4 mr-1 md:mr-2" />
          <span className="hidden md:inline">검색</span>
        </Button>
      </div>
    </div>
  );
}

