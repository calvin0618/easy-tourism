/**
 * @file tour.ts
 * @description 한국관광공사 API 관광지 데이터 타입 정의
 *
 * 한국관광공사 공공 API (KorService2)의 응답 데이터를 위한 TypeScript 타입 정의입니다.
 * PRD.md의 5. 데이터 구조 섹션을 참고하여 작성되었습니다.
 */

/**
 * 관광 타입 ID
 * Content Type ID (관광 타입)
 */
export type ContentType =
  | '12' // 관광지
  | '14' // 문화시설
  | '15' // 축제/행사
  | '25' // 여행코스
  | '28' // 레포츠
  | '32' // 숙박
  | '38' // 쇼핑
  | '39'; // 음식점

/**
 * 관광 타입 ID에 대한 라벨 맵핑
 */
export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  '12': '관광지',
  '14': '문화시설',
  '15': '축제/행사',
  '25': '여행코스',
  '28': '레포츠',
  '32': '숙박',
  '38': '쇼핑',
  '39': '음식점',
};

/**
 * 지역코드 (시/도 단위)
 */
export type AreaCode = string;

/**
 * 관광지 목록 아이템 (areaBasedList2 응답)
 * PRD.md 5.1 참고
 */
export interface TourItem {
  /** 주소 */
  addr1: string;
  /** 상세주소 */
  addr2?: string;
  /** 지역코드 */
  areacode: string;
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: ContentType;
  /** 제목 (관광지명) */
  title: string;
  /** 경도 (KATEC 좌표계, 정수형) */
  mapx: string;
  /** 위도 (KATEC 좌표계, 정수형) */
  mapy: string;
  /** 대표이미지1 */
  firstimage?: string;
  /** 대표이미지2 */
  firstimage2?: string;
  /** 전화번호 */
  tel?: string;
  /** 대분류 */
  cat1?: string;
  /** 중분류 */
  cat2?: string;
  /** 소분류 */
  cat3?: string;
  /** 수정일 */
  modifiedtime: string;
}

/**
 * 관광지 상세 기본정보 (detailCommon2 응답)
 * PRD.md 5.2 참고
 */
export interface TourDetail {
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: ContentType;
  /** 제목 (관광지명) */
  title: string;
  /** 주소 */
  addr1: string;
  /** 상세주소 */
  addr2?: string;
  /** 우편번호 */
  zipcode?: string;
  /** 전화번호 */
  tel?: string;
  /** 홈페이지 */
  homepage?: string;
  /** 개요 (긴 설명) */
  overview?: string;
  /** 대표이미지1 */
  firstimage?: string;
  /** 대표이미지2 */
  firstimage2?: string;
  /** 경도 (KATEC 좌표계) */
  mapx: string;
  /** 위도 (KATEC 좌표계) */
  mapy: string;
}

/**
 * 관광지 운영정보 (detailIntro2 응답)
 * PRD.md 5.3 참고
 * 타입별로 필드가 다르므로 선택적 필드로 정의
 */
export interface TourIntro {
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: ContentType;
  /** 이용시간 */
  usetime?: string;
  /** 휴무일 */
  restdate?: string;
  /** 문의처 */
  infocenter?: string;
  /** 주차 가능 여부 */
  parking?: string;
  /** 반려동물 동반 가능 여부 */
  chkpet?: string;
  /** 수용인원 */
  accomcount?: string;
  /** 체험 프로그램 */
  expguide?: string;
  /** 유모차 대여 가능 여부 */
  chkbabycarriage?: string;
  /** 이용요금 */
  usefee?: string;
  /** 이용요금 안내 */
  usetimeculture?: string;
  // 기타 타입별 필드는 필요시 추가
}

/**
 * 관광지 이미지 정보 (detailImage2 응답)
 */
export interface TourImage {
  /** 이미지 순번 */
  serialnum?: string;
  /** 이미지 URL */
  originimgurl?: string;
  /** 썸네일 이미지 URL */
  smallimageurl?: string;
}

/**
 * 지역코드 정보 (areaCode2 응답)
 */
export interface AreaCodeInfo {
  /** 지역코드 */
  code: string;
  /** 지역명 */
  name: string;
}

/**
 * API 응답 공통 구조
 */
export interface ApiResponse<T> {
  /** 응답 코드 */
  response: {
    /** 헤더 */
    header: {
      resultCode: string;
      resultMsg: string;
    };
    /** 바디 */
    body: {
      items?: {
        item: T | T[];
      };
      numOfRows?: number;
      pageNo?: number;
      totalCount?: number;
    };
  };
}

/**
 * 페이지네이션 파라미터
 */
export interface PaginationParams {
  /** 페이지 번호 */
  pageNo?: number;
  /** 페이지당 항목 수 */
  numOfRows?: number;
}

/**
 * 지역 필터 파라미터
 */
export interface AreaFilterParams extends PaginationParams {
  /** 지역코드 */
  areaCode?: string;
  /** 시/군/구 코드 (선택 사항) */
  sigunguCode?: string;
}

/**
 * 관광 타입 필터 파라미터
 */
export interface ContentTypeFilterParams extends PaginationParams {
  /** 관광 타입 ID */
  contentTypeId?: ContentType;
}

/**
 * 지역 + 관광 타입 필터 파라미터
 */
export interface TourListParams
  extends AreaFilterParams,
    ContentTypeFilterParams {
  /** 정렬 옵션 */
  arrange?: 'O' | 'P' | 'Q' | 'R' | 'S'; // O:제목순, P:조회순, Q:수정일, R:생성일, S:거리순
}

/**
 * 키워드 검색 파라미터
 */
export interface SearchParams extends PaginationParams {
  /** 검색 키워드 */
  keyword: string;
  /** 지역코드 (선택 사항) */
  areaCode?: string;
  /** 관광 타입 ID (선택 사항) */
  contentTypeId?: ContentType;
  /** 정렬 옵션 (선택 사항, searchKeyword2는 지원하지 않을 수 있음) */
  arrange?: 'O' | 'P' | 'Q' | 'R' | 'S';
}

