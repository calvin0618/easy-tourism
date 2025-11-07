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

import { useEffect, useRef, useState, useMemo } from 'react';
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
    .filter((tour) => {
      // mapx, mapy가 존재하고 빈 문자열이 아니며 "0"이 아닌지 확인
      const hasMapx = tour.mapx && tour.mapx.trim() !== '' && tour.mapx !== '0';
      const hasMapy = tour.mapy && tour.mapy.trim() !== '' && tour.mapy !== '0';
      return hasMapx && hasMapy;
    })
    .map((tour) => {
      const position = convertKATECToWGS84(tour.mapx!, tour.mapy!);
      // 변환된 좌표가 유효한 범위 내에 있는지 확인 (한국 영역)
      const isValidPosition = 
        position.lat >= 33 && position.lat <= 43 && // 한국 위도 범위
        position.lng >= 124 && position.lng <= 132; // 한국 경도 범위
      
      if (!isValidPosition) {
        console.warn(`[GoogleMap] 유효하지 않은 좌표: ${tour.title}`, {
          mapx: tour.mapx,
          mapy: tour.mapy,
          converted: position,
        });
      }
      
      return {
        ...tour,
        position,
      };
    })
    .filter((tour) => {
      // 최종적으로 유효한 좌표를 가진 항목만 반환
      const isValid = 
        tour.position.lat >= 33 && tour.position.lat <= 43 &&
        tour.position.lng >= 124 && tour.position.lng <= 132;
      return isValid;
    });
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
  const currentLocationMarkerRef = useRef<google.maps.Marker | null>(null);
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // 서울시청 좌표 (기본값)
  const DEFAULT_LOCATION = useMemo(() => ({ lat: 37.5665, lng: 126.9780 }), []);

  // 구글 지도 API 로드 확인
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 100; // 최대 10초 대기 (100 * 100ms)
    let timeoutId: NodeJS.Timeout | null = null;

    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        console.log('[GoogleMap] 구글 지도 API 로드 완료');
        setIsLoaded(true);
        setLoadError(null);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      } else if (retryCount < maxRetries) {
        retryCount++;
        // 구글 지도가 아직 로드되지 않았으면 재시도
        timeoutId = setTimeout(checkGoogleMaps, 100);
      } else {
        // 타임아웃 후에도 로드되지 않으면 에러 상태 표시
        console.error('[GoogleMap] 구글 지도 API 로드 실패 (타임아웃)');
        console.error('[GoogleMap] 디버그 정보:', {
          hasWindow: typeof window !== 'undefined',
          hasGoogle: typeof window !== 'undefined' && !!window.google,
          hasGoogleMaps: typeof window !== 'undefined' && window.google && !!window.google.maps,
          scriptExists: typeof document !== 'undefined' && !!document.querySelector('script[src*="maps.googleapis.com"]'),
        });
        setLoadError('구글 지도 API를 로드할 수 없습니다. 환경 변수 NEXT_PUBLIC_GOOGLE_MAP_API_KEY를 확인하세요.');
        setIsLoaded(false);
      }
    };

    // 스크립트 태그가 있는지 먼저 확인
    const scriptTag = typeof document !== 'undefined' 
      ? document.querySelector('script[src*="maps.googleapis.com"]') 
      : null;
    
    if (!scriptTag) {
      console.warn('[GoogleMap] 구글 지도 API 스크립트 태그를 찾을 수 없습니다.');
      setLoadError('구글 지도 API 스크립트가 로드되지 않았습니다. 환경 변수 NEXT_PUBLIC_GOOGLE_MAP_API_KEY를 확인하세요.');
      return;
    }

    checkGoogleMaps();

    // cleanup
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // 현재 위치 가져오기 - 메인 페이지에서는 관광지만 표시하므로 비활성화
  useEffect(() => {
    // 메인 페이지에서는 현재 위치를 사용하지 않고 null로 유지
    setCurrentLocation(null);
    console.log('[GoogleMap] 메인 페이지: 현재 위치 사용 안 함, 관광지만 표시');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 지도 초기화 및 마커 표시
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // 지도 인스턴스가 없으면 먼저 초기화 (기본 위치로)
    if (!mapInstanceRef.current) {
      console.log('[GoogleMap] 지도 초기화 시작');
      const initialCenter = currentLocation || DEFAULT_LOCATION;
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: initialCenter,
        zoom: 13,
        mapTypeControl: true,
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });
      console.log('[GoogleMap] 지도 초기화 완료 (임시 위치):', initialCenter);
    }

    // 지도가 로드되었지만 데이터가 없으면 기본 지도만 표시
    if (tours.length === 0) {
      console.log('[GoogleMap] 관광지 데이터 없음, 현재 위치만 표시');
      if (currentLocation && mapInstanceRef.current) {
        // 현재 위치가 설정되면 지도 중심 업데이트
        mapInstanceRef.current.setCenter(currentLocation);
      }
      
      // 현재 위치 마커 추가
      if (currentLocation && !currentLocationMarkerRef.current && mapInstanceRef.current) {
        currentLocationMarkerRef.current = new google.maps.Marker({
          position: currentLocation,
          map: mapInstanceRef.current,
          title: '내 위치',
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: { width: 32, height: 32 } as google.maps.Size,
          },
          animation: google.maps.Animation?.DROP,
        });
      }
      return;
    }

    const validTours = getValidTours(tours);
    console.log('[GoogleMap] 관광지 데이터 확인:', {
      totalTours: tours.length,
      validTours: validTours.length,
      sampleTour: tours[0] ? {
        title: tours[0].title,
        mapx: tours[0].mapx,
        mapy: tours[0].mapy,
        hasCoordinates: !!(tours[0].mapx && tours[0].mapy),
      } : null,
    });
    
    if (validTours.length === 0) {
      console.warn('[GoogleMap] 유효한 좌표를 가진 관광지가 없습니다. 전체 관광지:', tours.length);
      // 유효한 좌표가 없어도 기본 지도는 표시
      if (!mapInstanceRef.current) {
        const centerLocation = currentLocation || DEFAULT_LOCATION;
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: centerLocation,
          zoom: 13,
          mapTypeControl: true,
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        });
      } else if (currentLocation) {
        mapInstanceRef.current.setCenter(currentLocation);
      }
      
      // 현재 위치 마커 추가
      if (currentLocation && !currentLocationMarkerRef.current) {
        currentLocationMarkerRef.current = new google.maps.Marker({
          position: currentLocation,
          map: mapInstanceRef.current,
          title: '내 위치',
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: { width: 32, height: 32 } as google.maps.Size,
          },
          animation: google.maps.Animation?.DROP,
        });
      }
      return;
    }

    // 지도 초기화 또는 업데이트
    // 메인 페이지: 관광지 중심으로만 표시
    const bounds = calculateBounds(validTours);
    const mapCenter = center || (validTours.length > 0 ? bounds.center : DEFAULT_LOCATION);
    const mapZoom = zoom || (validTours.length > 0 ? bounds.zoom : 10);

    console.log('[GoogleMap] 지도 중심 설정:', {
      center: mapCenter,
      zoom: mapZoom,
      validToursCount: validTours.length,
      note: validTours.length > 0 ? '관광지 중심으로 지도 표시' : '관광지 없음, 기본 위치 사용',
    });

    if (!mapInstanceRef.current) {
      // 지도가 아직 초기화되지 않았으면 관광지 중심으로 초기화
      console.log('[GoogleMap] 지도 초기화:', {
        center: mapCenter,
        zoom: mapZoom,
        hasTours: validTours.length > 0,
      });
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: mapZoom,
        mapTypeControl: true,
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });
    } else {
      // 지도가 이미 초기화되어 있으면 관광지 중심으로만 이동
      if (validTours.length > 0) {
        // 관광지가 있으면 관광지 중심으로 이동
        console.log('[GoogleMap] 관광지 중심으로 지도 이동:', bounds.center);
        mapInstanceRef.current.setCenter(bounds.center);
        mapInstanceRef.current.setZoom(bounds.zoom);
      } else {
        // 관광지가 없으면 기본 위치로 이동
        console.log('[GoogleMap] 관광지 없음, 기본 위치로 이동:', DEFAULT_LOCATION);
        mapInstanceRef.current.setCenter(DEFAULT_LOCATION);
        mapInstanceRef.current.setZoom(10);
      }
    }

    // 기존 마커 및 인포윈도우 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    infoWindowsRef.current.forEach((infoWindow) => infoWindow.close());
    if (currentLocationMarkerRef.current) {
      currentLocationMarkerRef.current.setMap(null);
      currentLocationMarkerRef.current = null;
    }
    markersRef.current = [];
    infoWindowsRef.current = [];

    // 관광지 마커 생성
    const bounds_instance = new google.maps.LatLngBounds();
    
    console.log('[GoogleMap] 관광지 마커 생성 시작:', {
      validToursCount: validTours.length,
      mapInstanceExists: !!mapInstanceRef.current,
    });

    validTours.forEach((tour, index) => {
      console.log(`[GoogleMap] 마커 생성 ${index + 1}/${validTours.length}:`, {
        title: tour.title,
        position: tour.position,
        contentId: tour.contentid,
      });
      // 선택된 관광지인 경우 애니메이션 추가
      const isSelected = tour.contentid === selectedTourId;
      const marker = new google.maps.Marker({
        position: tour.position,
        map: mapInstanceRef.current,
        title: tour.title,
        animation: isSelected ? (google.maps.Animation?.BOUNCE ?? 1) : undefined,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: { width: 32, height: 32 } as google.maps.Size,
        },
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
        if (mapInstanceRef.current) {
          // InfoWindow.open()은 옵션 객체를 받으며, anchor는 MVCObject 타입이 필요
          infoWindow.open({
            map: mapInstanceRef.current,
            anchor: marker as unknown as google.maps.MVCObject,
          });
        }
      });

      markersRef.current.push(marker);
      infoWindowsRef.current.push(infoWindow);
      
      console.log(`[GoogleMap] 마커 생성 완료: ${tour.title}`, {
        markerPosition: marker.getPosition()?.toJSON(),
        map: marker.getMap() ? '지도에 표시됨' : '지도에 표시 안됨',
      });
    });
    
    console.log('[GoogleMap] 모든 마커 생성 완료:', {
      totalMarkers: markersRef.current.length,
      bounds: {
        north: bounds_instance.getNorthEast().lat(),
        south: bounds_instance.getSouthWest().lat(),
        east: bounds_instance.getNorthEast().lng(),
        west: bounds_instance.getSouthWest().lng(),
      },
    });

    // 현재 위치 마커 생성 - 메인 페이지에서는 사용하지 않음
    // 메인 페이지는 한국관광공사 관광지만 표시

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
        if (markerIndex !== -1 && infoWindowsRef.current[markerIndex] && mapInstanceRef.current) {
          // InfoWindow.open()은 옵션 객체를 받으며, anchor는 MVCObject 타입이 필요
          infoWindowsRef.current[markerIndex].open({
            map: mapInstanceRef.current,
            anchor: markersRef.current[markerIndex] as unknown as google.maps.MVCObject,
          });
        }
      }
    } else {
      // 선택된 관광지가 없으면 모든 관광지가 보이도록 지도 범위 조정
      if (mapInstanceRef.current && validTours.length > 0) {
        // bounds_instance가 비어있지 않은지 확인
        const hasBounds = bounds_instance.getNorthEast() && bounds_instance.getSouthWest();
        
        if (hasBounds) {
          // 모든 관광지가 보이도록 fitBounds 사용
          try {
            mapInstanceRef.current.fitBounds(bounds_instance, {
              top: 50,
              right: 50,
              bottom: 50,
              left: 50,
            });
            console.log('[GoogleMap] 모든 관광지가 보이도록 지도 범위 조정 완료', {
              bounds: {
                north: bounds_instance.getNorthEast().lat(),
                south: bounds_instance.getSouthWest().lat(),
                east: bounds_instance.getNorthEast().lng(),
                west: bounds_instance.getSouthWest().lng(),
              },
              validToursCount: validTours.length,
              hasCurrentLocation: !!currentLocation,
            });
          } catch (error) {
            console.error('[GoogleMap] fitBounds 실패:', error);
            // fitBounds 실패 시 관광지 중심으로 이동
            if (validTours.length > 0) {
              const firstTour = validTours[0];
              mapInstanceRef.current.setCenter(firstTour.position);
              mapInstanceRef.current.setZoom(10);
              console.log('[GoogleMap] fitBounds 실패로 첫 번째 관광지 중심으로 이동:', firstTour.position);
            }
          }
        } else {
          // bounds가 없으면 첫 번째 관광지 중심으로 이동
          if (validTours.length > 0) {
            const firstTour = validTours[0];
            mapInstanceRef.current.setCenter(firstTour.position);
            mapInstanceRef.current.setZoom(10);
            console.log('[GoogleMap] bounds 없음, 첫 번째 관광지 중심으로 이동:', firstTour.position);
          } else {
            // 관광지가 없으면 기본 위치로 이동
            mapInstanceRef.current.setCenter(DEFAULT_LOCATION);
            mapInstanceRef.current.setZoom(10);
            console.log('[GoogleMap] 관광지 없음, 기본 위치로 이동:', DEFAULT_LOCATION);
          }
        }
      } else if (mapInstanceRef.current) {
        // 관광지가 없으면 기본 위치로 이동
        mapInstanceRef.current.setCenter(DEFAULT_LOCATION);
        mapInstanceRef.current.setZoom(10);
        console.log('[GoogleMap] 관광지 없음, 기본 위치로 이동:', DEFAULT_LOCATION);
      }
    }

    // 전역 함수로 상세보기 페이지 이동 (인포윈도우에서 사용)
    (window as any).openTourDetail = (contentId: string) => {
      router.push(`/places/${contentId}`);
    };

    // cleanup
    return () => {
      (window as any).openTourDetail = undefined;
      if (currentLocationMarkerRef.current) {
        currentLocationMarkerRef.current.setMap(null);
        currentLocationMarkerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          {loadError ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">지도 로드 실패</p>
              <p className="text-xs">{loadError}</p>
            </div>
          ) : (
            <p className="text-sm">지도를 불러오는 중...</p>
          )}
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

