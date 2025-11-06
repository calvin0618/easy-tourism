/**
 * @file app/places/[contentId]/page.tsx
 * @description 관광지 상세페이지
 *
 * 사용자가 관광지를 클릭하면 상세 정보를 보여주는 페이지입니다.
 * PRD.md 2.4 상세페이지 요구사항을 참고하여 작성되었습니다.
 *
 * Phase 3.1: 페이지 기본 구조
 * Phase 3.2: 기본 정보 섹션
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MapPin, Phone, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getDetailCommon, getDetailIntro, getDetailImage } from '@/lib/api/tour-api';
import { CONTENT_TYPE_LABELS } from '@/lib/types/tour';
import type { Metadata } from 'next';
import { AddressCopyButton } from '@/components/tour-detail/address-copy-button';
import { DetailMapWrapper } from '@/components/tour-detail/detail-map-wrapper';
import { ShareButton } from '@/components/tour-detail/share-button';
import { DetailIntro } from '@/components/tour-detail/detail-intro';
import { DetailGallery } from '@/components/tour-detail/detail-gallery';

interface PageProps {
  params: Promise<{ contentId: string }>;
}

/**
 * 동적 메타데이터 생성
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { contentId } = await params;

  try {
    const detail = await getDetailCommon(contentId);

    return {
      title: `${detail.title} - My Trip`,
      description: detail.overview
        ? detail.overview.substring(0, 100) + '...'
        : `${detail.title} 관광지 정보`,
      openGraph: {
        title: detail.title,
        description: detail.overview
          ? detail.overview.substring(0, 100) + '...'
          : `${detail.title} 관광지 정보`,
        images: detail.firstimage
          ? [{ url: detail.firstimage, width: 1200, height: 630 }]
          : [],
        type: 'website',
      },
    };
  } catch {
    return {
      title: '관광지 상세 - My Trip',
      description: '관광지 상세 정보를 확인하세요',
    };
  }
}


export default async function PlaceDetailPage({ params }: PageProps) {
  const { contentId } = await params;

  let detail;
  let intro;
  let images;
  
  try {
    // 기본 정보, 운영 정보, 이미지 목록을 병렬로 로드
    [detail, intro, images] = await Promise.allSettled([
      getDetailCommon(contentId),
      // 운영 정보는 contentTypeId가 필요하므로 detail 로드 후에 호출
      Promise.resolve(null),
      getDetailImage(contentId),
    ]).then((results) => {
      const detailResult = results[0];
      const imageResult = results[2];
      
      if (detailResult.status === 'rejected') {
        throw detailResult.reason;
      }
      
      const detailData = detailResult.value;
      
      // 운영 정보는 contentTypeId가 필요하므로 detail 로드 후에 호출
      const introPromise = getDetailIntro(contentId, detailData.contenttypeid).catch(() => null);
      
      return Promise.all([
        Promise.resolve(detailData),
        introPromise,
        imageResult.status === 'fulfilled' ? Promise.resolve(imageResult.value) : Promise.resolve([]),
      ]);
    });
  } catch (error) {
    console.error('관광지 정보 로딩 실패:', error);
    notFound();
  }

  const fullAddress = detail.addr2
    ? `${detail.addr1} ${detail.addr2}`
    : detail.addr1;
  const contentTypeLabel =
    CONTENT_TYPE_LABELS[detail.contenttypeid as keyof typeof CONTENT_TYPE_LABELS] ||
    '관광지';
  const imageUrl = detail.firstimage || detail.firstimage2;
  const hasImage =
    imageUrl && imageUrl.trim() !== '' && imageUrl !== 'null';

  // 이미지 갤러리에 대표 이미지도 포함 (images에 없을 경우)
  const allImages = images && images.length > 0 
    ? images 
    : (hasImage && imageUrl
        ? [{ originimgurl: imageUrl, smallimageurl: imageUrl } as import('@/lib/types/tour').TourImage] 
        : []);

  /**
   * 홈페이지 URL에서 HTML 태그 제거하고 실제 URL만 추출
   */
  const extractHomepageUrl = (homepage: string): string => {
    // HTML 태그가 포함된 경우 파싱
    if (homepage.includes('<a') || homepage.includes('href=')) {
      // href 속성에서 URL 추출
      const hrefMatch = homepage.match(/href=["']([^"']+)["']/i);
      if (hrefMatch && hrefMatch[1]) {
        return hrefMatch[1];
      }
      // <a> 태그 내부의 텍스트만 추출
      const textMatch = homepage.match(/<a[^>]*>([^<]+)<\/a>/i);
      if (textMatch && textMatch[1]) {
        return textMatch[1].trim();
      }
    }
    // 일반 URL인 경우 그대로 반환
    return homepage.trim();
  };

  const homepageUrl = detail.homepage ? extractHomepageUrl(detail.homepage) : null;

  return (
    <div className="min-h-screen">
      {/* 헤더 영역 */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              뒤로가기
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <ShareButton />
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 대표 이미지 */}
        {hasImage && (
          <div className="relative w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={detail.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1200px"
              priority={true}
            />
          </div>
        )}

        {/* 제목 및 뱃지 */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {detail.title}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{contentTypeLabel}</Badge>
            {detail.cat1 && (
              <Badge variant="outline" className="text-xs">
                {detail.cat1}
                {detail.cat2 && ` · ${detail.cat2}`}
              </Badge>
            )}
          </div>
        </div>

        {/* 기본 정보 섹션 */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">기본 정보</h2>
          <div className="space-y-4">
            {/* 주소 */}
            {detail.addr1 && (
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">주소</p>
                  <p className="text-base">{fullAddress}</p>
                </div>
                <AddressCopyButton address={fullAddress} />
              </div>
            )}

            {/* 전화번호 */}
            {detail.tel && (
              <div className="flex items-start gap-2">
                <Phone className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">전화번호</p>
                  <a
                    href={`tel:${detail.tel}`}
                    className="text-base hover:text-blue-600 hover:underline"
                  >
                    {detail.tel}
                  </a>
                </div>
              </div>
            )}

            {/* 홈페이지 */}
            {homepageUrl && (
              <div className="flex items-start gap-2">
                <Globe className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">홈페이지</p>
                  <a
                    href={homepageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base hover:text-blue-600 hover:underline break-all"
                  >
                    {homepageUrl}
                  </a>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 개요 섹션 */}
        {detail.overview && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">개요</h2>
            <div
              className="prose prose-sm max-w-none text-foreground"
              dangerouslySetInnerHTML={{
                __html: detail.overview.replace(/\n/g, '<br />'),
              }}
            />
          </Card>
        )}

        {/* 운영 정보 섹션 */}
        {intro && <DetailIntro intro={intro} className="mb-6" />}

        {/* 이미지 갤러리 섹션 */}
        {allImages.length > 0 && (
          <DetailGallery images={allImages} title={detail.title} className="mb-6" />
        )}

        {/* 지도 섹션 */}
        {detail.mapx && detail.mapy && (
          <DetailMapWrapper
            title={detail.title}
            address={fullAddress}
            mapx={detail.mapx}
            mapy={detail.mapy}
            className="mb-6"
          />
        )}
      </div>
    </div>
  );
}

