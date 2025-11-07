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
  // 홈페이지
  home: {
    heroTitle: string;
    heroDescription: string;
    loadingMap: string;
  };
  // 헤더
  header: {
    searchPlaceholder: string;
    search: string;
    stats: string;
    bookmarks: string;
  };
  // 필터
  filter: {
    area: string;
    type: string;
    sort: string;
    all: string;
    reset: string;
    areaSelect: string;
    areaSelectMobile: string;
    sortPlaceholder: string;
    sortByName: string;
    sortByNewest: string;
    petFriendly: string;
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
  // 관광지 목록
  tourList: {
    searchResults: string;
    searchResultsCount: string;
    loadingMore: string;
    allToursLoaded: string;
    petPriorityNotice: string;
  };
  // 뷰 전환
  viewToggle: {
    list: string;
    map: string;
  };
  // 빈 상태
  emptyState: {
    noData: string;
    noSearchResults: string;
    noSearchResultsDesc: string;
    noSearchResultsDescWithKeyword: string;
    noSearchResultsTryOther: string;
    noTours: string;
    noToursDesc: string;
    noToursPetFilter: string;
    resetSearch: string;
    resetFilters: string;
  };
  // 북마크
  bookmarks: {
    title: string;
    subtitle: string;
    subtitleEmpty: string;
    error: string;
    errorLoading: string;
    errorUserInfo: string;
  };
  // 통계
  stats: {
    title: string;
    description: string;
    error: string;
    errorLoading: string;
    errorDescription: string;
    errorRetry: string;
    backToHome: string;
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
  // 푸터
  footer: {
    apiProvider: string;
    dataProvider: string;
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
    home: {
      heroTitle: '한국의 아름다운 관광지를 탐험하세요',
      heroDescription: '전국의 관광지 정보를 한 곳에서 검색하고 확인하세요',
      loadingMap: '지도를 불러오는 중...',
    },
    header: {
      searchPlaceholder: '관광지 검색...',
      search: '검색',
      stats: '통계',
      bookmarks: '내 북마크',
    },
    filter: {
      area: '지역',
      type: '타입',
      sort: '정렬',
      all: '전체',
      reset: '초기화',
      areaSelect: '지역 선택',
      areaSelectMobile: '지역',
      sortPlaceholder: '정렬',
      sortByName: '이름순',
      sortByNewest: '최신순',
      petFriendly: '반려동물 동반 가능',
    },
    tourList: {
      searchResults: '검색 결과',
      searchResultsCount: '개',
      loadingMore: '더 많은 관광지를 불러오는 중...',
      allToursLoaded: '모든 관광지를 불러왔습니다.',
      petPriorityNotice: '(반려동물 동반 가능한 관광지 우선 표시)',
    },
    viewToggle: {
      list: '목록',
      map: '지도',
    },
    emptyState: {
      noData: '데이터가 없습니다',
      noSearchResults: '검색 결과가 없습니다',
      noSearchResultsDesc: '"{keyword}"에 대한 검색 결과를 찾을 수 없습니다.',
      noSearchResultsDescWithKeyword: '"{keyword}"에 대한 검색 결과를 찾을 수 없습니다.',
      noSearchResultsTryOther: '다른 검색어로 시도해보세요.',
      noTours: '관광지가 없습니다',
      noToursDesc: '선택한 조건에 맞는 관광지가 없습니다. 다른 필터를 선택해보세요.',
      noToursPetFilter: '반려동물 동반 가능한 관광지가 아직 등록되지 않았습니다. 다른 필터를 선택하거나 반려동물 정보를 제출해주세요.',
      resetSearch: '검색 초기화',
      resetFilters: '필터 초기화',
    },
    bookmarks: {
      title: '북마크',
      subtitle: '총 {count}개의 북마크가 있습니다.',
      subtitleEmpty: '아직 북마크한 관광지가 없습니다.',
      error: '북마크 목록을 불러올 수 없습니다.',
      errorLoading: '북마크 목록을 불러올 수 없습니다.',
      errorUserInfo: '사용자 정보를 불러올 수 없습니다.',
    },
    stats: {
      title: '통계 대시보드',
      description: '전국 관광지 현황을 한눈에 파악할 수 있는 통계 정보를 제공합니다.',
      error: '데이터 수집 실패',
      errorLoading: '통계 데이터를 불러오는 중 오류가 발생했습니다.',
      errorDescription: '잠시 후 다시 시도해주세요. 문제가 지속되면 관리자에게 문의해주세요.',
      errorRetry: '다시 시도',
      backToHome: '홈으로 돌아가기',
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
    footer: {
      apiProvider: '한국관광공사 공공 API 제공',
      dataProvider: '데이터 제공',
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
    home: {
      heroTitle: 'Explore Beautiful Tourist Spots in Korea',
      heroDescription: 'Search and discover tourist information from all over Korea in one place',
      loadingMap: 'Loading map...',
    },
    header: {
      searchPlaceholder: 'Search tourist spots...',
      search: 'Search',
      stats: 'Statistics',
      bookmarks: 'My Bookmarks',
    },
    filter: {
      area: 'Area',
      type: 'Type',
      sort: 'Sort',
      all: 'All',
      reset: 'Reset',
      areaSelect: 'Select Area',
      areaSelectMobile: 'Area',
      sortPlaceholder: 'Sort',
      sortByName: 'By Name',
      sortByNewest: 'By Newest',
      petFriendly: 'Pet Friendly',
    },
    tourList: {
      searchResults: 'Search Results',
      searchResultsCount: 'results',
      loadingMore: 'Loading more tourist spots...',
      allToursLoaded: 'All tourist spots have been loaded.',
      petPriorityNotice: '(Pet-friendly spots prioritized)',
    },
    viewToggle: {
      list: 'List',
      map: 'Map',
    },
    emptyState: {
      noData: 'No data available',
      noSearchResults: 'No search results',
      noSearchResultsDesc: 'No search results found for "{keyword}".',
      noSearchResultsDescWithKeyword: 'No search results found for "{keyword}".',
      noSearchResultsTryOther: 'Please try a different search term.',
      noTours: 'No tourist spots',
      noToursDesc: 'No tourist spots match your selected criteria. Please try different filters.',
      noToursPetFilter: 'No pet-friendly tourist spots have been registered yet. Please select different filters or submit pet information.',
      resetSearch: 'Reset Search',
      resetFilters: 'Reset Filters',
    },
    bookmarks: {
      title: 'Bookmarks',
      subtitle: 'You have {count} bookmarks.',
      subtitleEmpty: 'You haven\'t bookmarked any tourist spots yet.',
      error: 'Unable to load bookmarks.',
      errorLoading: 'Unable to load bookmarks.',
      errorUserInfo: 'Unable to load user information.',
    },
    stats: {
      title: 'Statistics Dashboard',
      description: 'View comprehensive statistics about tourist spots across Korea at a glance.',
      error: 'Data Collection Failed',
      errorLoading: 'An error occurred while loading statistics data.',
      errorDescription: 'Please try again later. If the problem persists, please contact the administrator.',
      errorRetry: 'Retry',
      backToHome: 'Back to Home',
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
    footer: {
      apiProvider: 'Data provided by Korea Tourism Organization Public API',
      dataProvider: 'Data Source',
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
    home: {
      heroTitle: '韓国の美しい観光地を探索しましょう',
      heroDescription: '全国の観光地情報を一箇所で検索・確認できます',
      loadingMap: '地図を読み込み中...',
    },
    header: {
      searchPlaceholder: '観光地を検索...',
      search: '検索',
      stats: '統計',
      bookmarks: 'マイブックマーク',
    },
    filter: {
      area: '地域',
      type: 'タイプ',
      sort: '並び替え',
      all: 'すべて',
      reset: 'リセット',
      areaSelect: '地域を選択',
      areaSelectMobile: '地域',
      sortPlaceholder: '並び替え',
      sortByName: '名前順',
      sortByNewest: '新着順',
      petFriendly: 'ペット同伴可能',
    },
    tourList: {
      searchResults: '検索結果',
      searchResultsCount: '件',
      loadingMore: 'さらに観光地を読み込み中...',
      allToursLoaded: 'すべての観光地を読み込みました。',
      petPriorityNotice: '(ペット同伴可能な観光地を優先表示)',
    },
    viewToggle: {
      list: 'リスト',
      map: '地図',
    },
    emptyState: {
      noData: 'データがありません',
      noSearchResults: '検索結果がありません',
      noSearchResultsDesc: '"{keyword}"の検索結果が見つかりませんでした。',
      noSearchResultsDescWithKeyword: '"{keyword}"の検索結果が見つかりませんでした。',
      noSearchResultsTryOther: '別の検索語でお試しください。',
      noTours: '観光地がありません',
      noToursDesc: '選択した条件に一致する観光地がありません。別のフィルターを選択してください。',
      noToursPetFilter: 'ペット同伴可能な観光地がまだ登録されていません。別のフィルターを選択するか、ペット情報を提出してください。',
      resetSearch: '検索をリセット',
      resetFilters: 'フィルターをリセット',
    },
    bookmarks: {
      title: 'ブックマーク',
      subtitle: '合計{count}件のブックマークがあります。',
      subtitleEmpty: 'まだブックマークした観光地がありません。',
      error: 'ブックマークリストを読み込めません。',
      errorLoading: 'ブックマークリストを読み込めません。',
      errorUserInfo: 'ユーザー情報を読み込めません。',
    },
    stats: {
      title: '統計ダッシュボード',
      description: '全国の観光地の現状を一目で把握できる統計情報を提供します。',
      error: 'データ収集失敗',
      errorLoading: '統計データの読み込み中にエラーが発生しました。',
      errorDescription: 'しばらくしてから再試行してください。問題が続く場合は、管理者にお問い合わせください。',
      errorRetry: '再試行',
      backToHome: 'ホームに戻る',
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
    footer: {
      apiProvider: '韓国観光公社公共API提供',
      dataProvider: 'データ提供',
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
    home: {
      heroTitle: '探索韩国美丽的旅游景点',
      heroDescription: '在一个地方搜索和查看全国各地的旅游景点信息',
      loadingMap: '正在加载地图...',
    },
    header: {
      searchPlaceholder: '搜索旅游景点...',
      search: '搜索',
      stats: '统计',
      bookmarks: '我的书签',
    },
    filter: {
      area: '地区',
      type: '类型',
      sort: '排序',
      all: '全部',
      reset: '重置',
      areaSelect: '选择地区',
      areaSelectMobile: '地区',
      sortPlaceholder: '排序',
      sortByName: '按名称',
      sortByNewest: '按最新',
      petFriendly: '允许携带宠物',
    },
    tourList: {
      searchResults: '搜索结果',
      searchResultsCount: '个结果',
      loadingMore: '正在加载更多旅游景点...',
      allToursLoaded: '已加载所有旅游景点。',
      petPriorityNotice: '(优先显示允许携带宠物的景点)',
    },
    viewToggle: {
      list: '列表',
      map: '地图',
    },
    emptyState: {
      noData: '没有数据',
      noSearchResults: '没有搜索结果',
      noSearchResultsDesc: '未找到"{keyword}"的搜索结果。',
      noSearchResultsDescWithKeyword: '未找到"{keyword}"的搜索结果。',
      noSearchResultsTryOther: '请尝试其他搜索词。',
      noTours: '没有旅游景点',
      noToursDesc: '没有符合您选择条件的旅游景点。请尝试其他筛选条件。',
      noToursPetFilter: '尚未注册允许携带宠物的旅游景点。请选择其他筛选条件或提交宠物信息。',
      resetSearch: '重置搜索',
      resetFilters: '重置筛选',
    },
    bookmarks: {
      title: '书签',
      subtitle: '您共有{count}个书签。',
      subtitleEmpty: '您还没有收藏任何旅游景点。',
      error: '无法加载书签。',
      errorLoading: '无法加载书签。',
      errorUserInfo: '无法加载用户信息。',
    },
    stats: {
      title: '统计仪表板',
      description: '一目了然地查看韩国各地旅游景点的综合统计数据。',
      error: '数据收集失败',
      errorLoading: '加载统计数据时发生错误。',
      errorDescription: '请稍后重试。如果问题持续存在，请联系管理员。',
      errorRetry: '重试',
      backToHome: '返回首页',
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
    footer: {
      apiProvider: '数据由韩国观光公社公共API提供',
      dataProvider: '数据来源',
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
    home: {
      heroTitle: 'Explora Hermosos Lugares Turísticos en Corea',
      heroDescription: 'Busca y descubre información turística de toda Corea en un solo lugar',
      loadingMap: 'Cargando mapa...',
    },
    header: {
      searchPlaceholder: 'Buscar lugares turísticos...',
      search: 'Buscar',
      stats: 'Estadísticas',
      bookmarks: 'Mis Marcadores',
    },
    filter: {
      area: 'Área',
      type: 'Tipo',
      sort: 'Ordenar',
      all: 'Todos',
      reset: 'Restablecer',
      areaSelect: 'Seleccionar Área',
      areaSelectMobile: 'Área',
      sortPlaceholder: 'Ordenar',
      sortByName: 'Por Nombre',
      sortByNewest: 'Por Más Reciente',
      petFriendly: 'Apto para Mascotas',
    },
    tourList: {
      searchResults: 'Resultados de Búsqueda',
      searchResultsCount: 'resultados',
      loadingMore: 'Cargando más lugares turísticos...',
      allToursLoaded: 'Se han cargado todos los lugares turísticos.',
      petPriorityNotice: '(Lugares aptos para mascotas priorizados)',
    },
    viewToggle: {
      list: 'Lista',
      map: 'Mapa',
    },
    emptyState: {
      noData: 'No hay datos disponibles',
      noSearchResults: 'No hay resultados de búsqueda',
      noSearchResultsDesc: 'No se encontraron resultados de búsqueda para "{keyword}".',
      noSearchResultsDescWithKeyword: 'No se encontraron resultados de búsqueda para "{keyword}".',
      noSearchResultsTryOther: 'Por favor, intenta con otro término de búsqueda.',
      noTours: 'No hay lugares turísticos',
      noToursDesc: 'No hay lugares turísticos que coincidan con tus criterios seleccionados. Por favor, intenta con diferentes filtros.',
      noToursPetFilter: 'Aún no se han registrado lugares turísticos aptos para mascotas. Por favor, selecciona diferentes filtros o envía información sobre mascotas.',
      resetSearch: 'Restablecer Búsqueda',
      resetFilters: 'Restablecer Filtros',
    },
    bookmarks: {
      title: 'Marcadores',
      subtitle: 'Tienes {count} marcadores.',
      subtitleEmpty: 'Aún no has marcado ningún lugar turístico.',
      error: 'No se pueden cargar los marcadores.',
      errorLoading: 'No se pueden cargar los marcadores.',
      errorUserInfo: 'No se puede cargar la información del usuario.',
    },
    stats: {
      title: 'Panel de Estadísticas',
      description: 'Visualiza estadísticas completas sobre lugares turísticos en Corea de un vistazo.',
      error: 'Error al Recopilar Datos',
      errorLoading: 'Ocurrió un error al cargar los datos estadísticos.',
      errorDescription: 'Por favor, intenta de nuevo más tarde. Si el problema persiste, contacta al administrador.',
      errorRetry: 'Reintentar',
      backToHome: 'Volver al Inicio',
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
    footer: {
      apiProvider: 'Datos proporcionados por la API Pública de la Organización de Turismo de Corea',
      dataProvider: 'Fuente de Datos',
    },
  },
};

