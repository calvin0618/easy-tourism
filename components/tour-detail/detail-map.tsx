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
 * @returns WGS84 좌표 { lat, lng } 또는 null
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
  // 방법 1: mapx = 경도, mapy = 위도 (표준)
  const converted1 = {
    lng: x / 10000000,
    lat: y / 10000000,
  };

  // 방법 2: mapx = 위도, mapy = 경도 (반대)
  const converted2 = {
    lat: x / 10000000,
    lng: y / 10000000,
  };

  // 한국 영역 범위 (약간 넓게 설정)
  // 위도: 33 ~ 39 (실제로는 33.1 ~ 38.6)
  // 경도: 124 ~ 132 (실제로는 124.6 ~ 131.9)
  const isValid1 = 
    converted1.lat >= 33 && converted1.lat <= 39 &&
    converted1.lng >= 124 && converted1.lng <= 132;

  const isValid2 = 
    converted2.lat >= 33 && converted2.lat <= 39 &&
    converted2.lng >= 124 && converted2.lng <= 132;

  // 두 방법 중 유효한 것을 선택
  if (isValid1) {
    console.log('[DetailMap] 좌표 변환 성공 (표준 방법):', {
      original: { mapx: x, mapy: y },
      converted: converted1,
    });
    return converted1;
  }

  if (isValid2) {
    console.log('[DetailMap] 좌표 변환 성공 (반대 방법):', {
      original: { mapx: x, mapy: y },
      converted: converted2,
      note: 'mapx와 mapy가 반대로 되어 있었습니다',
    });
    return converted2;
  }

  // 둘 다 유효하지 않으면 에러 로그 출력
  // 좌표 값이 이미 변환된 값일 수도 있으므로 확인
  const isAlreadyConverted = (x >= 33 && x <= 39 && y >= 124 && y <= 132) || 
                             (y >= 33 && y <= 39 && x >= 124 && x <= 132);
  
  if (isAlreadyConverted) {
    // 이미 변환된 값인 경우
    const result = x >= 33 && x <= 39 ? { lat: x, lng: y } : { lat: y, lng: x };
    console.log('[DetailMap] 좌표가 이미 변환된 값입니다:', {
      original: { mapx: x, mapy: y },
      converted: result,
      note: '10000000으로 나누지 않고 그대로 사용',
    });
    return result;
  }
  
  console.error('[DetailMap] 변환된 좌표가 한국 영역 밖입니다:', {
    original: { mapx: x, mapy: y },
    converted1: {
      ...converted1,
      isValid: isValid1,
    },
    converted2: {
      ...converted2,
      isValid: isValid2,
    },
    isAlreadyConverted,
    reason: '두 방법 모두 한국 영역 밖의 좌표 (위도: 33-39, 경도: 124-132)',
    suggestion: '좌표 값이 다른 형식이거나 잘못된 값일 수 있습니다',
  });
  
  return null;
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // 서울시청 좌표 (기본값)
  const DEFAULT_LOCATION = useMemo(() => ({ lat: 37.5665, lng: 126.9780 }), []);

  // 관광지 좌표 변환
  const tourLocation = useMemo(() => {
    // mapx, mapy가 유효한지 먼저 확인
    if (!mapx || !mapy || mapx.trim() === '' || mapy.trim() === '' || mapx === '0' || mapy === '0') {
      console.warn('[DetailMap] 관광지 좌표가 없거나 유효하지 않음:', { mapx, mapy, title });
      return null;
    }

    // 좌표 값의 크기를 확인하여 이미 변환된 값인지 확인
    const x = typeof mapx === 'string' ? parseFloat(mapx) : mapx;
    const y = typeof mapy === 'string' ? parseFloat(mapy) : mapy;
    
    console.log('[DetailMap] 원본 좌표 값 확인:', {
      mapx: { raw: mapx, parsed: x, type: typeof mapx },
      mapy: { raw: mapy, parsed: y, type: typeof mapy },
      title,
      note: 'KATEC 좌표는 보통 10000000 이상의 큰 값입니다',
    });

    const converted = convertKATECToWGS84(mapx, mapy);
    if (converted) {
      console.log('[DetailMap] 관광지 좌표 변환 완료:', {
        original: { mapx, mapy },
        converted,
        title,
      });
      return converted;
    }
    
    // 변환 실패 시 더 자세한 정보 출력
    console.error('[DetailMap] 관광지 좌표 변환 실패 - 상세 정보:', {
      mapx: { raw: mapx, parsed: x, type: typeof mapx },
      mapy: { raw: mapy, parsed: y, type: typeof mapy },
      title,
      converted1: {
        lat: y / 10000000,
        lng: x / 10000000,
      },
      converted2: {
        lat: x / 10000000,
        lng: y / 10000000,
      },
      note: '좌표 값이 이미 변환된 값이거나 다른 형식일 수 있습니다',
    });
    
    return null;
  }, [mapx, mapy, title]);

  // 구글 지도 API 로드 확인
  useEffect(() => {
    // 이미 로드되어 있으면 바로 설정
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      console.log('[DetailMap] 구글 지도 API 이미 로드됨');
      setIsLoaded(true);
      setLoadError(null);
      return;
    }

    let retryCount = 0;
    const maxRetries = 100; // 최대 10초 대기 (100 * 100ms)
    let timeoutId: NodeJS.Timeout | null = null;

    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        console.log('[DetailMap] 구글 지도 API 로드 완료');
        setIsLoaded(true);
        setLoadError(null);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      } else if (retryCount < maxRetries) {
        retryCount++;
        timeoutId = setTimeout(checkGoogleMaps, 100);
      } else {
        console.error('[DetailMap] 구글 지도 API 로드 실패 (타임아웃)');
        console.error('[DetailMap] 디버그 정보:', {
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
      console.warn('[DetailMap] 구글 지도 API 스크립트 태그를 찾을 수 없습니다.');
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

  // 현재 위치 가져오기 (선택 사항)
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined' || !navigator.geolocation) {
      // Geolocation을 지원하지 않으면 현재 위치 없음 (관광지 위치만 표시)
      console.log('[DetailMap] Geolocation 미지원, 현재 위치 없음');
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
        console.warn('[DetailMap] 현재 위치 가져오기 실패:', error.message);
        // 위치 권한이 거부되었거나 오류가 발생하면 현재 위치 없음 (관광지 위치만 표시)
        setCurrentLocation(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 60000, // 1분 캐시
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  // 지도 초기화 및 마커 표시
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // 관광지 좌표가 없으면 지도를 표시하지 않음
    if (!tourLocation) {
      console.error('[DetailMap] 관광지 좌표가 없어 지도를 표시할 수 없습니다:', { mapx, mapy, title });
      setLoadError('관광지 위치 정보가 없습니다.');
      return;
    }

    // 지도 초기화 (관광지 위치로)
    if (!mapInstanceRef.current) {
      console.log('[DetailMap] 지도 초기화 (관광지 위치로):', tourLocation);
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: tourLocation,
        zoom: 15, // 상세페이지는 줌 레벨 15 (가까운 뷰)
        mapTypeControl: true,
        zoomControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        disableDefaultUI: false,
      });
    } else {
      // 지도가 이미 있으면 관광지 위치로 이동
      console.log('[DetailMap] 관광지 위치로 지도 중심 이동:', tourLocation);
      mapInstanceRef.current.setCenter(tourLocation);
      mapInstanceRef.current.setZoom(15);
    }

    // 기존 마커 모두 제거
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

    // 관광지 위치 마커 생성 (빨간색)
    if (mapInstanceRef.current && tourLocation) {
      const tourMarker = new google.maps.Marker({
        position: tourLocation,
        map: mapInstanceRef.current,
        title: title,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: { width: 32, height: 32 } as google.maps.Size,
        },
        animation: google.maps.Animation?.DROP,
        zIndex: 1000,
      });
      allMarkersRef.current.push(tourMarker);
      
      console.log('[DetailMap] 관광지 마커 생성 완료:', {
        title,
        position: tourLocation,
      });
    }

    // 현재 위치 마커 생성 (파란색, 선택 사항)
    if (currentLocation && mapInstanceRef.current) {
      currentLocationMarkerRef.current = new google.maps.Marker({
        position: currentLocation,
        map: mapInstanceRef.current,
        title: '내 위치',
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: { width: 32, height: 32 } as google.maps.Size,
        },
        animation: google.maps.Animation?.DROP,
        zIndex: 999,
      });
      allMarkersRef.current.push(currentLocationMarkerRef.current);
      
      console.log('[DetailMap] 현재 위치 마커 생성 완료:', {
        position: currentLocation,
      });
    }

    // cleanup - 모든 마커 제거
    return () => {
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
  }, [isLoaded, tourLocation, currentLocation, title]);

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

  // 좌표 복사 (관광지 좌표 사용)
  const handleCopyCoordinates = async () => {
    if (!tourLocation) {
      toast.error('관광지 위치 정보가 없습니다');
      return;
    }

    try {
      await copyCoordinatesToClipboard(tourLocation.lat, tourLocation.lng);
      setCopied(true);
      toast.success('좌표가 복사되었습니다');
      console.log('[DetailMap] 좌표 복사:', tourLocation);
      
      // 2초 후 복사 상태 초기화
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('[DetailMap] 좌표 복사 실패:', error);
      toast.error('좌표 복사에 실패했습니다');
    }
  };

  // 관광지 좌표가 없으면 표시하지 않음
  if (!tourLocation) {
    return (
      <Card className={className}>
        <div className="p-6">
          <div className="text-center text-muted-foreground">
            <p>관광지 위치 정보가 없습니다.</p>
          </div>
        </div>
      </Card>
    );
  }

  console.log('[DetailMap] 표시 위치:', {
    tourLocation,
    currentLocation,
    title,
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
            {/* 좌표 정보 표시 (관광지 좌표) */}
            {tourLocation && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="hidden sm:inline">
                  {tourLocation.lat.toFixed(6)}, {tourLocation.lng.toFixed(6)}
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
                {loadError ? (
                  <div className="space-y-2 px-4">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">지도 로드 실패</p>
                    <p className="text-xs">{loadError}</p>
                  </div>
                ) : (
                  <p className="text-sm">지도를 불러오는 중...</p>
                )}
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

