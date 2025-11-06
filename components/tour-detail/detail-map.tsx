/**
 * @file detail-map.tsx
 * @description 상세페이지용 구글 지도 컴포넌트
 *
 * 단일 관광지의 위치를 구글 지도에 표시하는 컴포넌트입니다.
 * PRD.md 2.4.4 지도 섹션 요구사항을 참고하여 작성되었습니다.
 *
 * 주요 기능:
 * - 해당 관광지 위치를 마커로 표시 (마커 1개)
 * - KATEC → WGS84 좌표 변환
 * - 길찾기 버튼 (구글 지도 앱/웹 연동)
 * - 좌표 복사 기능
 */

'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { MapPin, Navigation, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface DetailMapProps {
  /** 관광지명 */
  title: string;
  /** 주소 */
  address?: string;
  /** 경도 (KATEC 좌표계, 정수형) */
  mapx: string;
  /** 위도 (KATEC 좌표계, 정수형) */
  mapy: string;
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
): { lat: number; lng: number } | null {
  const x = typeof mapx === 'string' ? parseFloat(mapx) : mapx;
  const y = typeof mapy === 'string' ? parseFloat(mapy) : mapy;

  // 유효성 검사
  if (isNaN(x) || isNaN(y) || x === 0 || y === 0) {
    return null;
  }

  // KATEC 좌표를 10000000으로 나누어 WGS84로 변환
  return {
    lng: x / 10000000,
    lat: y / 10000000,
  };
}

/**
 * 구글 지도 길찾기 URL 생성 (현재 위치 → 목적지)
 * @param lat 목적지 위도
 * @param lng 목적지 경도
 * @returns 구글 지도 길찾기 URL
 */
function getDirectionsUrl(lat: number, lng: number): string {
  // origin을 생략하면 자동으로 "내 위치"로 인식
  // 또는 명시적으로 "현재 위치"를 설정할 수도 있음
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/**
 * 좌표를 클립보드에 복사
 */
function copyCoordinatesToClipboard(lat: number, lng: number): Promise<void> {
  const coordText = `${lat}, ${lng}`;
  return navigator.clipboard.writeText(coordText);
}

export function DetailMap({
  title,
  address,
  mapx,
  mapy,
  className,
}: DetailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const markerClickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  // 좌표 변환 (메모이제이션하여 무한 루프 방지)
  const position = useMemo(() => convertKATECToWGS84(mapx, mapy), [mapx, mapy]);
  
  // coordinates는 position과 동일하므로 별도 state 제거
  const coordinates = position;

  // 구글 지도 API 로드 확인
  useEffect(() => {
    // 이미 로드되어 있으면 바로 설정
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      console.log('[DetailMap] 구글 지도 API 이미 로드됨');
      setIsLoaded(true);
      return;
    }

    let retryCount = 0;
    const maxRetries = 100; // 최대 10초 대기 (100 * 100ms)
    let timeoutId: NodeJS.Timeout | null = null;

    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        console.log('[DetailMap] 구글 지도 API 로드 완료');
        setIsLoaded(true);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      } else if (retryCount < maxRetries) {
        retryCount++;
        timeoutId = setTimeout(checkGoogleMaps, 100);
      } else {
        console.warn('[DetailMap] 구글 지도 API 로드 실패 (타임아웃)');
        console.warn('[DetailMap] Google Maps API 키 확인 필요:', {
          hasApiKey: !!process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY,
          googleExists: typeof window !== 'undefined' && !!window.google,
        });
      }
    };

    checkGoogleMaps();

    // cleanup
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // 지도 초기화 및 마커 표시
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !position) return;

    // 지도 초기화 (한 번만)
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: position,
        zoom: 15, // 상세페이지는 줌 레벨 15 (가까운 뷰)
        mapTypeControl: true,
        zoomControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });
    } else {
      // 지도가 이미 있으면 중심 좌표만 업데이트
      mapInstanceRef.current.setCenter(position);
    }

    // 기존 마커 및 인포윈도우 제거
    if (markerClickListenerRef.current) {
      google.maps.event.removeListener(markerClickListenerRef.current);
      markerClickListenerRef.current = null;
    }
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null;
    }

    // 마커 생성
    markerRef.current = new google.maps.Marker({
      position: position,
      map: mapInstanceRef.current,
      title: title,
      animation: google.maps.Animation?.DROP,
    });

    // 인포윈도우 생성 (한 번만)
    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow();
    }

    // 인포윈도우 내용 업데이트
    const content = `
      <div style="padding: 12px; min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">${title}</h3>
        ${address ? `<p style="margin: 0; font-size: 12px; color: #666;">${address}</p>` : ''}
      </div>
    `;
    infoWindowRef.current.setContent(content);

    // 마커 클릭 시 인포윈도우 열기
    if (markerRef.current) {
      markerClickListenerRef.current = markerRef.current.addListener('click', () => {
        if (infoWindowRef.current && markerRef.current && mapInstanceRef.current) {
          infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
        }
      });
    }

    // 마커 생성 후 인포윈도우 자동 열기
    if (infoWindowRef.current && markerRef.current && mapInstanceRef.current) {
      infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
    }

    // cleanup
    return () => {
      if (markerClickListenerRef.current) {
        google.maps.event.removeListener(markerClickListenerRef.current);
        markerClickListenerRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }
    };
  }, [isLoaded, mapx, mapy, title, address]);

  // 길찾기 버튼 클릭 (현재 위치 → 목적지)
  const handleDirections = async () => {
    if (!coordinates) {
      console.warn('[DetailMap] 좌표가 없어 길찾기를 열 수 없습니다.');
      toast.error('목적지 위치 정보가 없습니다.');
      return;
    }

    try {
      // 목적지 좌표 확인
      const destinationLat = coordinates.lat;
      const destinationLng = coordinates.lng;

      console.log('[DetailMap] 목적지 좌표:', {
        lat: destinationLat,
        lng: destinationLng,
        title,
        address,
      });

      // 좌표 유효성 검사
      if (isNaN(destinationLat) || isNaN(destinationLng)) {
        console.error('[DetailMap] 유효하지 않은 목적지 좌표:', { destinationLat, destinationLng });
        toast.error('목적지 위치 정보가 올바르지 않습니다.');
        return;
      }

      // 현재 위치를 가져와서 명시적으로 출발지로 설정
      const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            // Geolocation API를 지원하지 않으면 origin을 생략하여 자동으로 "내 위치" 사용
            reject(new Error('Geolocation not supported'));
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (error) => {
              // 위치 권한이 거부되었거나 오류가 발생하면 origin을 생략하여 자동으로 "내 위치" 사용
              reject(error);
            },
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            }
          );
        });
      };

      let url: string;
      try {
        const currentLocation = await getCurrentLocation();
        // 현재 위치를 출발지로 명시적으로 설정
        // destination은 좌표만 사용 (위도,경도 형식)
        const destination = `${destinationLat},${destinationLng}`;
        
        // 주소가 있으면 query 파라미터로 추가 (선택 사항)
        const queryParams = new URLSearchParams({
          api: '1',
          origin: `${currentLocation.lat},${currentLocation.lng}`,
          destination: destination,
        });
        
        url = `https://www.google.com/maps/dir/?${queryParams.toString()}`;
        console.log('[DetailMap] 길찾기 열기 (현재 위치 사용):', {
          origin: `${currentLocation.lat},${currentLocation.lng}`,
          destination: destination,
          title,
          address,
          url,
        });
      } catch (error) {
        // Geolocation 실패 시 origin을 생략하여 자동으로 "내 위치" 사용
        // destination은 좌표만 사용
        const destination = `${destinationLat},${destinationLng}`;
        
        const queryParams = new URLSearchParams({
          api: '1',
          destination: destination,
        });
        
        url = `https://www.google.com/maps/dir/?${queryParams.toString()}`;
        console.log('[DetailMap] 길찾기 열기 (자동 위치 감지):', {
          destination: destination,
          title,
          address,
          url,
        });
        console.warn('[DetailMap] 현재 위치 가져오기 실패, 자동 위치 감지 사용:', error);
      }

      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('[DetailMap] 길찾기 열기 실패:', error);
      toast.error('길찾기를 열 수 없습니다');
    }
  };

  // 좌표 복사
  const handleCopyCoordinates = async () => {
    if (!coordinates) return;

    try {
      await copyCoordinatesToClipboard(coordinates.lat, coordinates.lng);
      setCopied(true);
      toast.success('좌표가 복사되었습니다');
      console.log('[DetailMap] 좌표 복사:', coordinates);
      
      // 2초 후 복사 상태 초기화
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('[DetailMap] 좌표 복사 실패:', error);
      toast.error('좌표 복사에 실패했습니다');
    }
  };

  // 좌표가 없으면 표시하지 않음
  if (!position) {
    return null;
  }

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            위치
          </h2>
          <div className="flex items-center gap-2">
            {/* 좌표 정보 표시 */}
            {coordinates && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="hidden sm:inline">
                  {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCoordinates}
                  className="h-8 px-2"
                  title="좌표 복사"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 지도 컨테이너 */}
        <div className="relative w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div
            ref={mapRef}
            className="w-full"
            style={{ height: '400px', minHeight: '400px' }}
            aria-label={`${title} 위치 지도`}
          />
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center text-muted-foreground">
                <p className="text-sm">지도를 불러오는 중...</p>
              </div>
            </div>
          )}
        </div>

        {/* 길찾기 버튼 */}
        <div className="mt-4 flex justify-center">
          <Button
            onClick={handleDirections}
            className="gap-2"
            variant="default"
          >
            <Navigation className="w-4 h-4" />
            길찾기
          </Button>
        </div>
      </div>
    </Card>
  );
}

