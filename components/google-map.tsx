/**
 * @file google-map.tsx
 * @description 구글 지도 컴포넌트
 *
 * 관광지 목록을 구글 지도에 마커로 표시하는 컴포넌트입니다.
 * PRD.md 2.2 구글 지도 연동 요구사항을 참고하여 작성되었습니다.
 *
 * 주요 기능:
 * - 관광지 마커 표시
 * - 마커 클릭 시 인포윈도우
 * - 리스트-지도 연동 (특정 마커로 이동)
 * - KATEC → WGS84 좌표 변환
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TourItem } from '@/lib/types/tour';
import { CONTENT_TYPE_LABELS } from '@/lib/types/tour';

interface GoogleMapProps {
  /** 관광지 목록 데이터 */
  tours: TourItem[];
  /** 초기 중심 좌표 (선택 사항) */
  center?: { lat: number; lng: number };
  /** 초기 줌 레벨 (선택 사항, 기본값: 10) */
  zoom?: number;
  /** 선택된 관광지 ID (해당 마커로 이동) */
  selectedTourId?: string;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * KATEC 좌표계를 WGS84 좌표계로 변환
 * @param mapx 경도 (KATEC, 정수형)
 * @param mapy 위도 (KATEC, 정수형)
 * @returns WGS84 좌표 { lat, lng }
 */
function convertKATECToWGS84(
  mapx: string | number,
  mapy: string | number
): { lat: number; lng: number } {
  const x = typeof mapx === 'string' ? parseFloat(mapx) : mapx;
  const y = typeof mapy === 'string' ? parseFloat(mapy) : mapy;

  // KATEC 좌표를 10000000으로 나누어 WGS84로 변환
  return {
    lng: x / 10000000,
    lat: y / 10000000,
  };
}

/**
 * 관광지 목록에서 유효한 좌표를 가진 항목만 필터링
 */
function getValidTours(tours: TourItem[]): Array<TourItem & { position: { lat: number; lng: number } }> {
  return tours
    .filter((tour) => tour.mapx && tour.mapy)
    .map((tour) => ({
      ...tour,
      position: convertKATECToWGS84(tour.mapx!, tour.mapy!),
    }));
}

/**
 * 관광지 목록의 중심 좌표와 줌 레벨 계산
 */
function calculateBounds(
  tours: Array<TourItem & { position: { lat: number; lng: number } }>
): { center: { lat: number; lng: number }; zoom: number } {
  if (tours.length === 0) {
    // 기본값: 서울시청
    return {
      center: { lat: 37.5665, lng: 126.9780 },
      zoom: 10,
    };
  }

  if (tours.length === 1) {
    return {
      center: tours[0].position,
      zoom: 15,
    };
  }

  // 여러 관광지의 중심 좌표 계산
  const lats = tours.map((tour) => tour.position.lat);
  const lngs = tours.map((tour) => tour.position.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const center = {
    lat: (minLat + maxLat) / 2,
    lng: (minLng + maxLng) / 2,
  };

  // 경도와 위도의 차이를 기반으로 줌 레벨 계산 (간단한 추정)
  const latDiff = maxLat - minLat;
  const lngDiff = maxLng - minLng;
  const maxDiff = Math.max(latDiff, lngDiff);

  let zoom = 10;
  if (maxDiff > 2) zoom = 7;
  else if (maxDiff > 1) zoom = 8;
  else if (maxDiff > 0.5) zoom = 9;
  else if (maxDiff > 0.2) zoom = 10;
  else if (maxDiff > 0.1) zoom = 11;
  else if (maxDiff > 0.05) zoom = 12;
  else zoom = 13;

  return { center, zoom };
}

export function GoogleMap({
  tours,
  center,
  zoom,
  selectedTourId,
  className,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowsRef = useRef<google.maps.InfoWindow[]>([]);
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  // 구글 지도 API 로드 확인
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 50; // 최대 5초 대기 (50 * 100ms)

    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        console.log('[GoogleMap] 구글 지도 API 로드 완료');
        setIsLoaded(true);
      } else if (retryCount < maxRetries) {
        retryCount++;
        // 구글 지도가 아직 로드되지 않았으면 재시도
        setTimeout(checkGoogleMaps, 100);
      } else {
        console.warn('[GoogleMap] 구글 지도 API 로드 실패 (타임아웃)');
        // 타임아웃 후에도 로드되지 않으면 에러 상태 표시
      }
    };

    checkGoogleMaps();
  }, []);

  // 지도 초기화 및 마커 표시
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // 지도가 로드되었지만 데이터가 없으면 기본 지도만 표시
    if (tours.length === 0) {
      if (!mapInstanceRef.current) {
        console.log('[GoogleMap] 기본 지도 초기화 (데이터 없음)');
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: { lat: 37.5665, lng: 126.9780 }, // 서울시청
          zoom: 10,
          mapTypeControl: true,
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        });
      }
      return;
    }

    const validTours = getValidTours(tours);
    if (validTours.length === 0) {
      console.warn('[GoogleMap] 유효한 좌표를 가진 관광지가 없습니다');
      // 유효한 좌표가 없어도 기본 지도는 표시
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: { lat: 37.5665, lng: 126.9780 },
          zoom: 10,
          mapTypeControl: true,
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        });
      }
      return;
    }

    // 지도 초기화
    const bounds = calculateBounds(validTours);
    const mapCenter = center || bounds.center;
    const mapZoom = zoom || bounds.zoom;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: mapZoom,
        mapTypeControl: true,
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });
    }

    // 기존 마커 및 인포윈도우 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    infoWindowsRef.current.forEach((infoWindow) => infoWindow.close());
    markersRef.current = [];
    infoWindowsRef.current = [];

    // 관광지 마커 생성
    const bounds_instance = new google.maps.LatLngBounds();

    validTours.forEach((tour) => {
      // 선택된 관광지인 경우 애니메이션 추가
      const isSelected = tour.contentid === selectedTourId;
      const marker = new google.maps.Marker({
        position: tour.position,
        map: mapInstanceRef.current,
        title: tour.title,
        animation: isSelected ? (google.maps.Animation?.BOUNCE ?? 1) : undefined,
      });

      bounds_instance.extend(tour.position);

      // 인포윈도우 생성
      const contentTypeLabel =
        CONTENT_TYPE_LABELS[tour.contenttypeid as keyof typeof CONTENT_TYPE_LABELS] || '관광지';

      const infoWindowContent = `
        <div style="padding: 8px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${tour.title}</h3>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">
            <span style="background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${contentTypeLabel}</span>
          </p>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${tour.addr1 || ''}</p>
          <button
            onclick="window.openTourDetail('${tour.contentid}')"
            style="
              background: #2563eb;
              color: white;
              border: none;
              padding: 6px 12px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 12px;
              width: 100%;
            "
            onmouseover="this.style.background='#1d4ed8'"
            onmouseout="this.style.background='#2563eb'"
          >
            상세보기
          </button>
        </div>
      `;

      const infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent,
      });

      // 마커 클릭 시 인포윈도우 열기
      marker.addListener('click', () => {
        // 다른 인포윈도우 닫기
        infoWindowsRef.current.forEach((iw) => iw.close());
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
      infoWindowsRef.current.push(infoWindow);
    });

    // 선택된 관광지가 있으면 해당 마커로 이동
    if (selectedTourId) {
      const selectedTour = validTours.find((tour) => tour.contentid === selectedTourId);
      if (selectedTour && mapInstanceRef.current) {
        mapInstanceRef.current.panTo(selectedTour.position);
        mapInstanceRef.current.setZoom(15);

        // 해당 마커의 인포윈도우 열기
        const markerIndex = markersRef.current.findIndex(
          (marker) => marker.getTitle() === selectedTour.title
        );
        if (markerIndex !== -1 && infoWindowsRef.current[markerIndex]) {
          infoWindowsRef.current[markerIndex].open(
            mapInstanceRef.current,
            markersRef.current[markerIndex]
          );
        }
      }
    } else {
      // 모든 마커를 포함하도록 지도 범위 조정
      if (validTours.length > 1 && mapInstanceRef.current) {
        mapInstanceRef.current.fitBounds(bounds_instance);
      }
    }

    // 전역 함수로 상세보기 페이지 이동 (인포윈도우에서 사용)
    (window as any).openTourDetail = (contentId: string) => {
      router.push(`/places/${contentId}`);
    };

    // cleanup
    return () => {
      (window as any).openTourDetail = undefined;
    };
  }, [isLoaded, tours, selectedTourId, center, zoom, router]);

  // 지도가 로드되지 않았을 때 표시할 내용
  if (!isLoaded) {
    return (
      <div
        ref={mapRef}
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className || ''}`}
        style={{ minHeight: '400px' }}
      >
        <div className="text-center text-muted-foreground">
          <p className="text-sm">지도를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={`w-full h-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 ${className || ''}`}
      style={{ minHeight: '400px' }}
    />
  );
}

