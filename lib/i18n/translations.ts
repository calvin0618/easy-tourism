/**
 * @file translations.ts
 * @description 다국어 번역 데이터
 */

export type Language = 'ko' | 'en' | 'ja' | 'zh' | 'es';

export interface Translations {
  // 공통
  common: {
    search: string;
    login: string;
    signup: string;
    myLocation: string;
    directions: string;
    share: string;
    back: string;
    close: string;
    loading: string;
    error: string;
    noResults: string;
  };
  // 헤더
  header: {
    searchPlaceholder: string;
    search: string;
  };
  // 필터
  filter: {
    area: string;
    type: string;
    sort: string;
    all: string;
    reset: string;
  };
  // 관광지 타입
  contentType: {
    '12': string;
    '14': string;
    '15': string;
    '25': string;
    '28': string;
    '32': string;
    '38': string;
    '39': string;
  };
  // 상세페이지
  detail: {
    title: string;
    address: string;
    phone: string;
    homepage: string;
    overview: string;
    operatingInfo: string;
    gallery: string;
    location: string;
    copyAddress: string;
    copyCoordinates: string;
    addressCopied: string;
    coordinatesCopied: string;
  };
}

export const translations: Record<Language, Translations> = {
  ko: {
    common: {
      search: '검색',
      login: '로그인',
      signup: '가입하기',
      myLocation: '내 위치',
      directions: '길찾기',
      share: '공유',
      back: '뒤로가기',
      close: '닫기',
      loading: '로딩 중...',
      error: '오류가 발생했습니다',
      noResults: '결과가 없습니다',
    },
    header: {
      searchPlaceholder: '관광지 검색...',
      search: '검색',
    },
    filter: {
      area: '지역',
      type: '타입',
      sort: '정렬',
      all: '전체',
      reset: '초기화',
    },
    contentType: {
      '12': '관광지',
      '14': '문화시설',
      '15': '축제/행사',
      '25': '여행코스',
      '28': '레포츠',
      '32': '숙박',
      '38': '쇼핑',
      '39': '음식점',
    },
    detail: {
      title: '기본 정보',
      address: '주소',
      phone: '전화번호',
      homepage: '홈페이지',
      overview: '개요',
      operatingInfo: '운영 정보',
      gallery: '이미지 갤러리',
      location: '위치',
      copyAddress: '주소 복사',
      copyCoordinates: '좌표 복사',
      addressCopied: '주소가 복사되었습니다',
      coordinatesCopied: '좌표가 복사되었습니다',
    },
  },
  en: {
    common: {
      search: 'Search',
      login: 'Login',
      signup: 'Sign Up',
      myLocation: 'My Location',
      directions: 'Directions',
      share: 'Share',
      back: 'Back',
      close: 'Close',
      loading: 'Loading...',
      error: 'An error occurred',
      noResults: 'No results found',
    },
    header: {
      searchPlaceholder: 'Search tourist spots...',
      search: 'Search',
    },
    filter: {
      area: 'Area',
      type: 'Type',
      sort: 'Sort',
      all: 'All',
      reset: 'Reset',
    },
    contentType: {
      '12': 'Tourist Spot',
      '14': 'Cultural Facility',
      '15': 'Festival/Event',
      '25': 'Travel Course',
      '28': 'Leisure Sports',
      '32': 'Accommodation',
      '38': 'Shopping',
      '39': 'Restaurant',
    },
    detail: {
      title: 'Basic Information',
      address: 'Address',
      phone: 'Phone',
      homepage: 'Homepage',
      overview: 'Overview',
      operatingInfo: 'Operating Information',
      gallery: 'Image Gallery',
      location: 'Location',
      copyAddress: 'Copy Address',
      copyCoordinates: 'Copy Coordinates',
      addressCopied: 'Address copied',
      coordinatesCopied: 'Coordinates copied',
    },
  },
  ja: {
    common: {
      search: '検索',
      login: 'ログイン',
      signup: '登録',
      myLocation: '現在地',
      directions: 'ルート案内',
      share: '共有',
      back: '戻る',
      close: '閉じる',
      loading: '読み込み中...',
      error: 'エラーが発生しました',
      noResults: '結果が見つかりません',
    },
    header: {
      searchPlaceholder: '観光地を検索...',
      search: '検索',
    },
    filter: {
      area: '地域',
      type: 'タイプ',
      sort: '並び替え',
      all: 'すべて',
      reset: 'リセット',
    },
    contentType: {
      '12': '観光地',
      '14': '文化施設',
      '15': '祭り/イベント',
      '25': '旅行コース',
      '28': 'レジャースポーツ',
      '32': '宿泊',
      '38': 'ショッピング',
      '39': 'レストラン',
    },
    detail: {
      title: '基本情報',
      address: '住所',
      phone: '電話番号',
      homepage: 'ホームページ',
      overview: '概要',
      operatingInfo: '営業情報',
      gallery: '画像ギャラリー',
      location: '位置',
      copyAddress: '住所をコピー',
      copyCoordinates: '座標をコピー',
      addressCopied: '住所がコピーされました',
      coordinatesCopied: '座標がコピーされました',
    },
  },
  zh: {
    common: {
      search: '搜索',
      login: '登录',
      signup: '注册',
      myLocation: '我的位置',
      directions: '路线',
      share: '分享',
      back: '返回',
      close: '关闭',
      loading: '加载中...',
      error: '发生错误',
      noResults: '未找到结果',
    },
    header: {
      searchPlaceholder: '搜索旅游景点...',
      search: '搜索',
    },
    filter: {
      area: '地区',
      type: '类型',
      sort: '排序',
      all: '全部',
      reset: '重置',
    },
    contentType: {
      '12': '旅游景点',
      '14': '文化设施',
      '15': '节庆/活动',
      '25': '旅游路线',
      '28': '休闲运动',
      '32': '住宿',
      '38': '购物',
      '39': '餐厅',
    },
    detail: {
      title: '基本信息',
      address: '地址',
      phone: '电话',
      homepage: '网站',
      overview: '概述',
      operatingInfo: '营业信息',
      gallery: '图片库',
      location: '位置',
      copyAddress: '复制地址',
      copyCoordinates: '复制坐标',
      addressCopied: '地址已复制',
      coordinatesCopied: '坐标已复制',
    },
  },
  es: {
    common: {
      search: 'Buscar',
      login: 'Iniciar sesión',
      signup: 'Registrarse',
      myLocation: 'Mi ubicación',
      directions: 'Direcciones',
      share: 'Compartir',
      back: 'Volver',
      close: 'Cerrar',
      loading: 'Cargando...',
      error: 'Ocurrió un error',
      noResults: 'No se encontraron resultados',
    },
    header: {
      searchPlaceholder: 'Buscar lugares turísticos...',
      search: 'Buscar',
    },
    filter: {
      area: 'Área',
      type: 'Tipo',
      sort: 'Ordenar',
      all: 'Todos',
      reset: 'Restablecer',
    },
    contentType: {
      '12': 'Lugar turístico',
      '14': 'Instalación cultural',
      '15': 'Festival/Evento',
      '25': 'Ruta de viaje',
      '28': 'Deportes recreativos',
      '32': 'Alojamiento',
      '38': 'Compras',
      '39': 'Restaurante',
    },
    detail: {
      title: 'Información básica',
      address: 'Dirección',
      phone: 'Teléfono',
      homepage: 'Sitio web',
      overview: 'Resumen',
      operatingInfo: 'Información de operación',
      gallery: 'Galería de imágenes',
      location: 'Ubicación',
      copyAddress: 'Copiar dirección',
      copyCoordinates: 'Copiar coordenadas',
      addressCopied: 'Dirección copiada',
      coordinatesCopied: 'Coordenadas copiadas',
    },
  },
};

