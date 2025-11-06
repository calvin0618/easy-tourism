/**
 * @file detail-gallery.tsx
 * @description 상세페이지 이미지 갤러리 컴포넌트
 *
 * 관광지의 이미지들을 갤러리 형태로 표시합니다.
 * PRD.md 2.4.3 이미지 갤러리 요구사항을 참고하여 작성되었습니다.
 *
 * 주요 기능:
 * - 대표 이미지 + 서브 이미지들
 * - 이미지 클릭 시 전체화면 모달 (향후 구현)
 * - 이미지 슬라이드 기능 (기본 구현)
 * - 이미지 없으면 기본 이미지
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { TourImage } from '@/lib/types/tour';
import { cn } from '@/lib/utils';

interface DetailGalleryProps {
  /** 이미지 목록 */
  images: TourImage[];
  /** 관광지명 (대체 텍스트용) */
  title: string;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 상세페이지 이미지 갤러리 컴포넌트
 */
export function DetailGallery({
  images,
  title,
  className,
}: DetailGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 이미지가 없으면 표시하지 않음
  if (!images || images.length === 0) {
    return null;
  }

  // 유효한 이미지 URL만 필터링
  const validImages = images.filter(
    (img) =>
      img.originimgurl &&
      img.originimgurl.trim() !== '' &&
      img.originimgurl !== 'null'
  );

  if (validImages.length === 0) {
    return null;
  }

  const currentImage = validImages[currentIndex];
  const hasMultipleImages = validImages.length > 1;

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? validImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev === validImages.length - 1 ? 0 : prev + 1
    );
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">이미지 갤러리</h2>
          {hasMultipleImages && (
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {validImages.length}
            </span>
          )}
        </div>

        {/* 메인 이미지 */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4">
          {currentImage.originimgurl && (
            <Image
              src={currentImage.originimgurl}
              alt={`${title} 이미지 ${currentIndex + 1}`}
              fill
              className="object-cover cursor-pointer"
              sizes="(max-width: 768px) 100vw, 800px"
              onClick={openModal}
              priority={false}
              loading={currentIndex === 0 ? 'eager' : 'lazy'}
            />
          )}

          {/* 네비게이션 버튼 */}
          {hasMultipleImages && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                aria-label="이전 이미지"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                aria-label="다음 이미지"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {/* 썸네일 그리드 (이미지가 2개 이상일 때) */}
        {hasMultipleImages && validImages.length > 1 && (
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {validImages.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'relative aspect-square rounded-md overflow-hidden border-2 transition-all',
                  index === currentIndex
                    ? 'border-primary ring-2 ring-primary ring-offset-2'
                    : 'border-transparent hover:border-gray-300'
                )}
                aria-label={`이미지 ${index + 1} 선택`}
              >
                {img.smallimageurl || img.originimgurl ? (
                  <Image
                    src={img.smallimageurl || img.originimgurl || ''}
                    alt={`${title} 썸네일 ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 25vw, 150px"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                )}
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* 전체화면 모달 (향후 개선) */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            aria-label="닫기"
          >
            <X className="w-6 h-6" />
          </button>
          {hasMultipleImages && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                aria-label="이전 이미지"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                aria-label="다음 이미지"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center">
            {currentImage.originimgurl && (
              <Image
                src={currentImage.originimgurl}
                alt={`${title} 이미지 ${currentIndex + 1}`}
                width={1200}
                height={800}
                className="object-contain w-full h-full"
                sizes="100vw"
                priority={false}
                loading="eager"
              />
            )}
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {currentIndex + 1} / {validImages.length}
          </div>
        </div>
      )}
    </>
  );
}

