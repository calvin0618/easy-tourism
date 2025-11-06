/**
 * @file tour-api.ts
 * @description 한국관광공사 공공 API 클라이언트
 *
 * 한국관광공사 공공 API (KorService2)를 호출하는 함수들을 제공합니다.
 * PRD.md의 4. API 명세 섹션을 참고하여 작성되었습니다.
 *
 * Base URL: https://apis.data.go.kr/B551011/KorService2
 * 공통 파라미터: serviceKey, MobileOS="ETC", MobileApp="MyTrip", _type="json"
 */

import type {
  ApiResponse,
  TourItem,
  TourDetail,
  TourIntro,
  TourImage,
  AreaCodeInfo,
  TourListParams,
  SearchParams,
  ContentType,
} from '@/lib/types/tour';

/**
 * API Base URL
 */
const BASE_URL = 'https://apis.data.go.kr/B551011/KorService2';

/**
 * 공통 파라미터
 */
const COMMON_PARAMS = {
  MobileOS: 'ETC',
  MobileApp: 'MyTrip',
  _type: 'json',
} as const;

/**
 * API 키 가져오기
 * NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY 사용
 */
function getApiKey(): string {
  // 클라이언트 사이드에서는 NEXT_PUBLIC_ 접두사가 필수
  const publicKey = process.env.NEXT_PUBLIC_TOUR_API_KEY;
  const serverKey = process.env.TOUR_API_KEY;
  
  const apiKey = publicKey || serverKey;

  // 디버깅: 환경변수 로딩 확인 (개발 환경에서만)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('[Tour API] 환경변수 확인:', {
      hasPublicKey: !!publicKey,
      hasServerKey: !!serverKey,
      hasApiKey: !!apiKey,
    });
  }

  if (!apiKey) {
    throw new Error(
      '한국관광공사 API 키가 설정되지 않았습니다. NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY 환경변수를 설정하세요.'
    );
  }

  return apiKey;
}

/**
 * 클라이언트 사이드에서 API Route를 통해 호출하는지 확인
 */
function isClientSide(): boolean {
  return typeof window !== 'undefined';
}

/**
 * API 요청 헬퍼 함수
 * 클라이언트 사이드에서는 API Route를 통해, 서버 사이드에서는 직접 호출
 */
async function fetchApi<T>(
  endpoint: string,
  params: Record<string, string | number | undefined>
): Promise<ApiResponse<T>> {
  // 클라이언트 사이드에서는 API Route를 통해 호출
  if (isClientSide()) {
    return fetchApiViaRoute(endpoint, params);
  }

  // 서버 사이드에서는 직접 호출
  return fetchApiDirect(endpoint, params);
}

/**
 * 클라이언트 사이드: API Route를 통해 호출
 */
async function fetchApiViaRoute<T>(
  endpoint: string,
  params: Record<string, string | number | undefined>
): Promise<ApiResponse<T>> {
  // endpoint를 action으로 변환
  const actionMap: Record<string, string> = {
    '/areaCode2': 'areaCodes',
    '/areaBasedList2': 'areaBasedList',
    '/searchKeyword2': 'searchKeyword',
    '/detailCommon2': 'detailCommon',
    '/detailIntro2': 'detailIntro',
    '/detailImage2': 'detailImage',
  };

  const action = actionMap[endpoint];
  if (!action) {
    throw new Error(`알 수 없는 endpoint: ${endpoint}`);
  }

  // API Route URL 생성
  // undefined 값은 제외하고, 문자열/숫자만 포함
  const cleanParams = Object.fromEntries(
    Object.entries(params)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => [key, String(value)])
  );

  const queryParams = new URLSearchParams({
    action,
    ...cleanParams,
  });

  const url = `/api/tour?${queryParams.toString()}`;

  console.log(`[Tour API] 클라이언트 요청: ${action}`, { params });

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `API 요청 실패: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'API 요청 실패');
    }

    // API Route 응답 구조에 맞게 변환
    // API Route는 { success: true, data: {...} } 형태로 반환
    const data = result.data;

    // searchKeyword와 getAreaBasedList는 { items, totalCount } 형태로 반환
    // 하지만 기존 함수들은 ApiResponse<T> 형태를 기대하므로 변환 필요
    if (action === 'searchKeyword' || action === 'areaBasedList') {
      // { items, totalCount } 형태를 ApiResponse 형태로 변환
      // data.items가 undefined이거나 null인 경우 빈 배열로 처리
      const items = data.items || [];
      const itemsArray = Array.isArray(items) ? items : items ? [items] : [];
      
      console.log(`[Tour API] 클라이언트 응답 변환: ${action}`, {
        itemsCount: itemsArray.length,
        totalCount: data.totalCount || 0,
        hasItems: itemsArray.length > 0,
      });

      const mockApiResponse = {
        response: {
          header: {
            resultCode: '0000',
            resultMsg: 'OK',
          },
          body: {
            items: {
              item: itemsArray,
            },
            totalCount: data.totalCount || 0,
          },
        },
      } as ApiResponse<T>;

      return mockApiResponse;
    }

    // getDetailCommon은 TourDetail 객체를 직접 반환
    // 하지만 fetchApi는 ApiResponse<T> 형태를 기대하므로 변환 필요
    if (action === 'detailCommon') {
      const mockApiResponse = {
        response: {
          header: {
            resultCode: '0000',
            resultMsg: 'OK',
          },
          body: {
            items: {
              item: data,
            },
          },
        },
      } as ApiResponse<T>;

      return mockApiResponse;
    }

    // getAreaCodes는 AreaCodeInfo[] 배열을 반환
    // 하지만 fetchApi는 ApiResponse<T> 형태를 기대하므로 변환 필요
    // getAreaCodes 함수 내부에서 변환하므로 여기서는 원시 응답 형태로 반환
    const mockApiResponse = {
      response: {
        header: {
          resultCode: '0000',
          resultMsg: 'OK',
        },
        body: {
          items: {
            item: Array.isArray(data) ? data : [data],
          },
          totalCount: Array.isArray(data) ? data.length : 1,
        },
      },
    } as ApiResponse<T>;

    return mockApiResponse;
  } catch (error) {
    console.error(`[Tour API] 클라이언트 에러: ${action}`, error);
    throw error;
  }
}

/**
 * 서버 사이드: 직접 API 호출
 */
async function fetchApiDirect<T>(
  endpoint: string,
  params: Record<string, string | number | undefined>
): Promise<ApiResponse<T>> {
  const apiKey = getApiKey();

  // 파라미터 정리 (undefined 제거)
  const queryParams = new URLSearchParams({
    serviceKey: apiKey,
    ...COMMON_PARAMS,
    ...Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(params).filter(([_, value]) => value !== undefined)
    ),
  });

  const url = `${BASE_URL}${endpoint}?${queryParams.toString()}`;

  console.log(`[Tour API] 서버 요청: ${endpoint}`, { params });

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Next.js 캐싱 설정 (선택 사항)
      next: {
        revalidate: 3600, // 1시간 캐시
      },
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
    }

    const data: any = await response.json();

    // 응답 구조 확인
    if (!data) {
      console.error(`[Tour API] 응답이 없습니다: ${endpoint}`);
      throw new Error('API 응답이 없습니다.');
    }

    // 에러 응답 처리 (resultCode가 최상위에 있는 경우)
    if (data.resultCode && data.resultCode !== '0000') {
      const errorMsg = data.resultMsg || '알 수 없는 오류';
      console.warn(`[Tour API] API 에러: ${endpoint}`, { resultCode: data.resultCode, resultMsg: errorMsg });
      throw new Error(`API 에러: ${data.resultCode} - ${errorMsg}`);
    }

    // 정상 응답 구조 확인
    if (!data.response) {
      console.error(`[Tour API] 잘못된 응답 구조: ${endpoint}`, data);
      throw new Error('API 응답 구조가 올바르지 않습니다.');
    }

    // 응답 코드 확인
    if (data.response.header && data.response.header.resultCode !== '0000') {
      throw new Error(
        `API 에러: ${data.response.header.resultCode} - ${data.response.header.resultMsg || '알 수 없는 오류'}`
      );
    }

    console.log(`[Tour API] 성공: ${endpoint}`);

    return data as ApiResponse<T>;
  } catch (error) {
    console.error(`[Tour API] 에러: ${endpoint}`, error);
    throw error;
  }
}

/**
 * 지역코드 조회 (areaCode2)
 * 지역 필터 생성에 사용
 *
 * @param params - 페이지네이션 파라미터 (선택 사항)
 * @returns 지역코드 정보 배열
 */
export async function getAreaCodes(
  params?: { numOfRows?: number; pageNo?: number }
): Promise<AreaCodeInfo[]> {
  const data = await fetchApi<AreaCodeInfo>('/areaCode2', {
    numOfRows: params?.numOfRows || 25,
    pageNo: params?.pageNo || 1,
  });

  const items = data.response.body.items?.item;
  if (!items) {
    return [];
  }

  // 배열이 아닌 경우 배열로 변환
  return Array.isArray(items) ? items : [items];
}

/**
 * 지역 기반 관광지 목록 조회 (areaBasedList2)
 *
 * @param params - 필터 및 페이지네이션 파라미터
 * @returns 관광지 목록
 */
export async function getAreaBasedList(
  params: TourListParams
): Promise<{ items: TourItem[]; totalCount: number }> {
  const data = await fetchApi<TourItem>('/areaBasedList2', {
    areaCode: params.areaCode,
    sigunguCode: params.sigunguCode,
    contentTypeId: params.contentTypeId,
    arrange: params.arrange || 'O', // 기본값: 제목순
    numOfRows: params.numOfRows || 20,
    pageNo: params.pageNo || 1,
  });

  const items = data.response.body.items?.item;
  const totalCount = data.response.body.totalCount || 0;

  const tourItems: TourItem[] = items
    ? Array.isArray(items)
      ? items
      : [items]
    : [];

  return {
    items: tourItems,
    totalCount,
  };
}

/**
 * 키워드 검색 (searchKeyword2)
 *
 * @param params - 검색 파라미터
 * @returns 검색 결과 관광지 목록
 */
export async function searchKeyword(
  params: SearchParams
): Promise<{ items: TourItem[]; totalCount: number }> {
  if (!params.keyword || params.keyword.trim() === '') {
    throw new Error('검색 키워드가 필요합니다.');
  }

  console.log('[Tour API] searchKeyword 호출:', {
    keyword: params.keyword.trim(),
    areaCode: params.areaCode,
    contentTypeId: params.contentTypeId,
    numOfRows: params.numOfRows || 20,
    pageNo: params.pageNo || 1,
  });

  const data = await fetchApi<TourItem>('/searchKeyword2', {
    keyword: params.keyword.trim(),
    areaCode: params.areaCode,
    contentTypeId: params.contentTypeId,
    arrange: params.arrange || 'O', // 기본값: 제목순 (searchKeyword2는 arrange 파라미터를 지원하지 않을 수 있음)
    numOfRows: params.numOfRows || 20,
    pageNo: params.pageNo || 1,
  });

  console.log('[Tour API] searchKeyword 응답:', {
    resultCode: data.response.header.resultCode,
    resultMsg: data.response.header.resultMsg,
    hasItems: !!data.response.body.items,
    itemsType: Array.isArray(data.response.body.items?.item) ? 'array' : typeof data.response.body.items?.item,
    totalCount: data.response.body.totalCount || 0,
  });

  const items = data.response.body.items?.item;
  const totalCount = data.response.body.totalCount || 0;

  const tourItems: TourItem[] = items
    ? Array.isArray(items)
      ? items
      : [items]
    : [];

  console.log('[Tour API] searchKeyword 파싱 결과:', {
    itemCount: tourItems.length,
    totalCount,
    firstItemTitle: tourItems[0]?.title || null,
  });

  return {
    items: tourItems,
    totalCount,
  };
}

/**
 * 상세 기본정보 조회 (detailCommon2)
 *
 * @param contentId - 콘텐츠ID
 * @returns 관광지 상세 기본정보
 */
export async function getDetailCommon(
  contentId: string
): Promise<TourDetail> {
  if (!contentId) {
    throw new Error('contentId가 필요합니다.');
  }

  const data = await fetchApi<TourDetail>('/detailCommon2', {
    contentId,
  });

  const items = data.response.body.items?.item;
  if (!items) {
    throw new Error('관광지 정보를 찾을 수 없습니다.');
  }

  // 배열이 아닌 경우 객체로 반환
  return Array.isArray(items) ? items[0] : items;
}

/**
 * 상세 운영정보 조회 (detailIntro2)
 *
 * @param contentId - 콘텐츠ID
 * @param contentTypeId - 콘텐츠타입ID (필수)
 * @returns 관광지 운영정보
 */
export async function getDetailIntro(
  contentId: string,
  contentTypeId: ContentType
): Promise<TourIntro> {
  if (!contentId) {
    throw new Error('contentId가 필요합니다.');
  }
  if (!contentTypeId) {
    throw new Error('contentTypeId가 필요합니다.');
  }

  const data = await fetchApi<TourIntro>('/detailIntro2', {
    contentId,
    contentTypeId,
  });

  const items = data.response.body.items?.item;
  if (!items) {
    throw new Error('운영정보를 찾을 수 없습니다.');
  }

  // 배열이 아닌 경우 객체로 반환
  return Array.isArray(items) ? items[0] : items;
}

/**
 * 상세 이미지 목록 조회 (detailImage2)
 *
 * @param contentId - 콘텐츠ID
 * @returns 관광지 이미지 목록
 */
export async function getDetailImage(
  contentId: string
): Promise<TourImage[]> {
  if (!contentId) {
    throw new Error('contentId가 필요합니다.');
  }

  try {
    const data = await fetchApi<TourImage>('/detailImage2', {
      contentId,
      imageYN: 'Y', // 이미지 있는 것만 조회
      // subImageYN 파라미터는 일부 API 버전에서 지원하지 않을 수 있으므로 제거
    });

    // 응답 구조 확인
    if (!data || !data.response || !data.response.body) {
      console.warn('[Tour API] getDetailImage: 응답 데이터가 없습니다.', contentId);
      return [];
    }

    const items = data.response.body.items?.item;
    if (!items) {
      console.log('[Tour API] getDetailImage: 이미지가 없습니다.', contentId);
      return [];
    }

    // 배열이 아닌 경우 배열로 변환
    const imageList = Array.isArray(items) ? items : [items];
    console.log('[Tour API] getDetailImage: 이미지 개수:', imageList.length);
    return imageList;
  } catch (error) {
    console.error('[Tour API] getDetailImage 에러:', error);
    // 이미지가 없어도 에러로 처리하지 않고 빈 배열 반환
    return [];
  }
}

