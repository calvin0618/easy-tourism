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
    console.warn('[DetailMap] 유효하지 않은 좌표:', { mapx, mapy, x, y });
    return null;
  }

  // KATEC 좌표를 10000000으로 나누어 WGS84로 변환
  const converted = {
    lng: x / 10000000,
    lat: y / 10000000,
  };

  console.log('[DetailMap] 좌표 변환:', {
    original: { mapx: x, mapy: y },
    converted,
  });

  return converted;
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
  const currentLocationMarkerRef = useRef<google.maps.Marker | null>(null);
  const allMarkersRef = useRef<google.maps.Marker[]>([]); // 모든 마커 추적
  const [isLoaded, setIsLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // 서울시청 좌표 (기본값)
  const DEFAULT_LOCATION = useMemo(() => ({ lat: 37.5665, lng: 126.9780 }), []);
  
  // 최종 표시할 위치: 현재 위치 또는 서울시청
  const displayLocation = currentLocation || DEFAULT_LOCATION;

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

  // 현재 위치 가져오기
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined' || !navigator.geolocation) {
      // Geolocation을 지원하지 않으면 서울시청 좌표 사용
      console.log('[DetailMap] Geolocation 미지원, 서울시청 좌표 사용');
      setCurrentLocation(DEFAULT_LOCATION);
      return;
    }

    console.log('[DetailMap] 현재 위치 요청 시작');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log('[DetailMap] 현재 위치 가져오기 성공:', location);
        setCurrentLocation(location);
      },
      (error) => {
        console.warn('[DetailMap] 현재 위치 가져오기 실패, 서울시청 좌표 사용:', error.message);
        // 위치 권한이 거부되었거나 오류가 발생하면 서울시청 좌표 사용
        setCurrentLocation(DEFAULT_LOCATION);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 60000, // 1분 캐시
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  // 지도 초기화 및 마커 표시 (현재 위치만 표시)
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // 지도 초기화 (한 번만)
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: displayLocation,
        zoom: 15, // 상세페이지는 줌 레벨 15 (가까운 뷰)
        mapTypeControl: true,
        zoomControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        // Places API가 자동으로 마커를 추가하지 않도록 설정
        disableDefaultUI: false,
      });
      
      console.log('[DetailMap] 지도 초기화 완료:', {
        center: displayLocation,
        isCurrentLocation: !!currentLocation,
        note: '목적지 마커는 생성하지 않음',
      });
    } else {
      // 지도가 이미 있으면 중심 좌표만 업데이트
      mapInstanceRef.current.setCenter(displayLocation);
    }
    
    // 지도에 이미 추가된 모든 마커 제거 (안전장치)
    // Google Maps가 자동으로 추가한 마커가 있을 수 있으므로
    // 지도 초기화 직후에 명시적으로 제거
    if (mapInstanceRef.current) {
      // 지도의 모든 오버레이를 제거하는 것은 직접적으로 불가능하지만,
      // 우리가 생성한 마커만 추적하고 관리
      console.log('[DetailMap] 지도 초기화 후 마커 상태 확인');
    }

    // 기존 마커 모두 제거 (명시적으로 모든 마커 제거)
    allMarkersRef.current.forEach((marker) => {
      if (marker) {
        marker.setMap(null);
      }
    });
    allMarkersRef.current = [];
    
    if (currentLocationMarkerRef.current) {
      currentLocationMarkerRef.current.setMap(null);
      currentLocationMarkerRef.current = null;
    }

    // 현재 위치 마커만 생성 (목적지 마커는 절대 생성하지 않음)
    if (mapInstanceRef.current) {
      const markerTitle = currentLocation ? '내 위치' : '서울시청';
      const marker = new google.maps.Marker({
        position: displayLocation,
        map: mapInstanceRef.current,
        title: markerTitle,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: { width: 32, height: 32 } as google.maps.Size,
        },
        animation: google.maps.Animation?.DROP,
        zIndex: 1000, // 다른 마커보다 위에 표시
      });
      
      currentLocationMarkerRef.current = marker;
      allMarkersRef.current.push(marker); // 마커 추적 목록에 추가
      
      console.log('[DetailMap] 현재 위치 마커만 표시 (목적지 마커 없음):', {
        location: displayLocation,
        title: markerTitle,
        isCurrentLocation: !!currentLocation,
        totalMarkers: allMarkersRef.current.length,
        note: '목적지 마커는 생성하지 않음',
      });
    }

    // 지도 초기화 후 일정 시간 후 모든 마커 재확인 및 제거 (안전장치)
    // Google Maps API가 자동으로 추가한 마커가 있을 수 있으므로
    const checkInterval = setTimeout(() => {
      if (mapInstanceRef.current) {
        // 지도 DOM에서 마커 이미지 요소 찾기 및 제거 시도
        const mapContainer = mapRef.current;
        if (mapContainer) {
          // Google Maps 마커는 일반적으로 img 태그로 표시됨
          // 하지만 직접 DOM 조작은 권장되지 않음
          // 대신 우리가 생성한 마커만 추적하고 관리
          console.log('[DetailMap] 마커 재확인:', {
            trackedMarkers: allMarkersRef.current.length,
            currentLocationMarker: !!currentLocationMarkerRef.current,
            note: '목적지 마커는 생성하지 않았으므로 표시되면 안 됨',
          });
        }
      }
    }, 1000); // 1초 후 확인

    // cleanup - 모든 마커 제거
    return () => {
      clearTimeout(checkInterval);
      
      allMarkersRef.current.forEach((marker) => {
        if (marker) {
          marker.setMap(null);
        }
      });
      allMarkersRef.current = [];
      
      if (currentLocationMarkerRef.current) {
        currentLocationMarkerRef.current.setMap(null);
        currentLocationMarkerRef.current = null;
      }
    };
  }, [isLoaded, displayLocation, currentLocation]);

  // 길찾기 버튼 클릭 (현재 위치 → 목적지)
  const handleDirections = async () => {
    // 목적지 좌표는 관광지 정보에서 가져오기
    const katacPosition = convertKATECToWGS84(mapx, mapy);
    if (!katacPosition) {
      console.warn('[DetailMap] 좌표가 없어 길찾기를 열 수 없습니다.');
      toast.error('목적지 위치 정보가 없습니다.');
      return;
    }

    try {
      // 목적지 좌표 확인
      const destinationLat = katacPosition.lat;
      const destinationLng = katacPosition.lng;

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
      // 목적지 설정: 주소가 있으면 주소 사용, 없으면 장소명 사용, 둘 다 없으면 좌표 사용
      let destination: string;
      if (address && address.trim()) {
        // 주소가 있으면 주소와 장소명을 함께 사용 (더 정확한 위치 지정)
        destination = `${title}, ${address}`;
      } else if (title && title.trim()) {
        // 주소가 없으면 장소명만 사용
        destination = title;
      } else {
        // 둘 다 없으면 좌표 사용
        destination = `${destinationLat},${destinationLng}`;
      }

      try {
        const currentLocation = await getCurrentLocation();
        // 현재 위치를 출발지로 명시적으로 설정
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
    if (!displayLocation) return;

    try {
      await copyCoordinatesToClipboard(displayLocation.lat, displayLocation.lng);
      setCopied(true);
      toast.success('좌표가 복사되었습니다');
      console.log('[DetailMap] 좌표 복사:', displayLocation);
      
      // 2초 후 복사 상태 초기화
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('[DetailMap] 좌표 복사 실패:', error);
      toast.error('좌표 복사에 실패했습니다');
    }
  };

  // 좌표가 없으면 표시하지 않음
  if (!displayLocation) {
    return null;
  }

  console.log('[DetailMap] 표시 위치:', {
    location: displayLocation,
    isCurrentLocation: !!currentLocation,
    title: currentLocation ? '내 위치' : '서울시청',
  });

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
            {displayLocation && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="hidden sm:inline">
                  {displayLocation.lat.toFixed(6)}, {displayLocation.lng.toFixed(6)}
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

