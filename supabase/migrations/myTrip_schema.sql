flowchart TD
    Start([사용자 접속]) --> Home[홈페이지 /]
    
    Home --> Filter{필터 선택}
    Home --> Search{키워드 검색}
    Home --> ViewList[관광지 목록 조회]
    
    Filter --> |지역 선택| AreaFilter[지역 필터<br/>시/도, 시/군/구]
    Filter --> |타입 선택| TypeFilter[관광 타입 필터<br/>관광지/문화시설/축제 등]
    
    AreaFilter --> APICall1[areaBasedList2 API]
    TypeFilter --> APICall1
    
    Search --> SearchInput[검색창 입력<br/>헤더 또는 검색 컴포넌트]
    SearchInput --> APICall2[searchKeyword2 API<br/>필터 파라미터 포함]
    
    APICall1 --> DisplayList[목록 표시<br/>검색 결과 개수 표시]
    APICall2 --> DisplayList
    
    Filter --> |검색 중 필터 적용| APICall2
    Search --> |검색어 유지| Filter
    
    DisplayList --> TourCard[관광지 카드<br/>- 썸네일<br/>- 이름/주소<br/>- 타입 뱃지]
    DisplayList --> MapView[구글 지도 뷰<br/>- 마커 표시<br/>- 클러스터링]
    
    TourCard --> |클릭| DetailPage[상세페이지<br/>/places/contentId]
    MapView --> |마커 클릭| InfoWindow[인포윈도우]
    InfoWindow --> |상세보기| DetailPage
    
    TourCard --> |호버| HighlightMarker[지도 마커 강조]
    
    DetailPage --> LoadDetail[상세 정보 로드]
    LoadDetail --> APICall3[detailCommon2 API<br/>기본 정보]
    LoadDetail --> APICall4[detailIntro2 API<br/>운영 정보]
    LoadDetail --> APICall5[detailImage2 API<br/>이미지 갤러리]
    
    APICall3 --> ShowBasic[기본 정보 섹션<br/>- 관광지명<br/>- 대표 이미지<br/>- 주소/전화/홈페이지<br/>- 개요]
    APICall4 --> ShowIntro[운영 정보 섹션<br/>- 운영시간<br/>- 휴무일<br/>- 요금/주차<br/>- 반려동물 동반]
    APICall5 --> ShowGallery[이미지 갤러리<br/>- 슬라이드<br/>- 전체화면 모달]
    
    ShowBasic --> DetailMap[지도 섹션<br/>- 위치 마커<br/>- 길찾기 버튼]
    
    DetailPage --> Actions{상세페이지 액션}
    Actions --> Share[공유하기<br/>- URL 복사<br/>- 클립보드 API]
    Actions --> Bookmark[북마크<br/>- 별 아이콘]
    Actions --> BackButton[뒤로가기]
    
    Share --> Toast[복사 완료 토스트]
    
    Bookmark --> CheckAuth{사용자 인증?}
    CheckAuth --> |Yes| SaveSupabase[Supabase DB 저장<br/>bookmarks 테이블]
    CheckAuth --> |No| LocalStorage[localStorage<br/>임시 저장]
    
    LocalStorage --> LoginPrompt[로그인 유도]
    
    SaveSupabase --> BookmarkPage[북마크 페이지<br/>/bookmarks]
    
    BookmarkPage --> ShowBookmarks[북마크 목록<br/>- 카드 레이아웃<br/>- 정렬 옵션<br/>- 일괄 삭제]
    
    ShowBookmarks --> |클릭| DetailPage
    
    BackButton --> Home
    
    ViewList --> Pagination{페이지네이션}
    Pagination --> |다음 페이지| APICall1
    Pagination --> |무한 스크롤| APICall1
    
    style Home fill:#e1f5ff
    style DetailPage fill:#fff4e1
    style BookmarkPage fill:#f0e1ff
    style APICall1 fill:#ffe1e1
    style APICall2 fill:#ffe1e1
    style APICall3 fill:#ffe1e1
    style APICall4 fill:#ffe1e1
    style APICall5 fill:#ffe1e1
    style SaveSupabase fill:#e1ffe1