/**
 * @file googlemaps.d.ts
 * @description 구글 지도 API 타입 정의
 *
 * Google Maps JavaScript API를 사용하기 위한 타입 정의입니다.
 * 스크립트로 로드된 google.maps 객체의 타입을 정의합니다.
 *
 * 참고: https://developers.google.com/maps/documentation/javascript
 *
 * 주의: @types/google.maps 패키지를 설치하면 이 파일이 필요 없을 수 있습니다.
 * 하지만 프로젝트에서 직접 정의하는 경우를 위해 준비되었습니다.
 */

declare namespace google.maps {
  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  interface LatLngBoundsLiteral {
    east: number;
    north: number;
    south: number;
    west: number;
  }

  class LatLng {
    constructor(lat: number, lng: number, noWrap?: boolean);
    lat(): number;
    lng(): number;
    equals(other: LatLng): boolean;
    toString(): string;
    toUrlValue(precision?: number): string;
  }

  class LatLngBounds {
    constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
    contains(latLng: LatLng | LatLngLiteral): boolean;
    equals(other: LatLngBounds | LatLngBoundsLiteral): boolean;
    extend(point: LatLng | LatLngLiteral): LatLngBounds;
    getCenter(): LatLng;
    getNorthEast(): LatLng;
    getSouthWest(): LatLng;
    intersects(other: LatLngBounds | LatLngBoundsLiteral): boolean;
    isEmpty(): boolean;
    toSpan(): LatLng;
    toString(): string;
    toUrlValue(precision?: number): string;
    union(other: LatLngBounds | LatLngBoundsLiteral): LatLngBounds;
  }

  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    mapTypeId?: MapTypeId;
    mapTypeControl?: boolean;
    mapTypeControlOptions?: MapTypeControlOptions;
    zoomControl?: boolean;
    zoomControlOptions?: ZoomControlOptions;
    streetViewControl?: boolean;
    streetViewControlOptions?: StreetViewControlOptions;
    fullscreenControl?: boolean;
    fullscreenControlOptions?: FullscreenControlOptions;
    minZoom?: number;
    maxZoom?: number;
    restriction?: MapRestriction;
    disableDefaultUI?: boolean;
    gestureHandling?: 'cooperative' | 'greedy' | 'none' | 'auto';
    keyboardShortcuts?: boolean;
    styles?: MapTypeStyle[];
  }

  type MapTypeId = 'hybrid' | 'roadmap' | 'satellite' | 'terrain';

  interface MapTypeControlOptions {
    mapTypeIds?: MapTypeId[];
    position?: ControlPosition;
    style?: MapTypeControlStyle;
  }

  type MapTypeControlStyle = 'DEFAULT' | 'HORIZONTAL_BAR' | 'DROPDOWN_MENU';

  interface ZoomControlOptions {
    position?: ControlPosition;
  }

  interface StreetViewControlOptions {
    position?: ControlPosition;
  }

  interface FullscreenControlOptions {
    position?: ControlPosition;
  }

  interface MapRestriction {
    latLngBounds: LatLngBounds | LatLngBoundsLiteral;
    strictBounds?: boolean;
  }

  interface MapTypeStyle {
    elementType?: 'all' | 'geometry' | 'geometry.fill' | 'geometry.stroke' | 'labels' | 'labels.icon' | 'labels.text' | 'labels.text.fill' | 'labels.text.stroke';
    featureType?: string;
    stylers?: MapTypeStyler[];
  }

  interface MapTypeStyler {
    color?: string;
    gamma?: number;
    hue?: string;
    invertLightness?: boolean;
    lightness?: number;
    saturation?: number;
    visibility?: string;
    weight?: number;
  }

  type ControlPosition =
    | typeof google.maps.ControlPosition.BOTTOM_CENTER
    | typeof google.maps.ControlPosition.BOTTOM_LEFT
    | typeof google.maps.ControlPosition.BOTTOM_RIGHT
    | typeof google.maps.ControlPosition.LEFT_BOTTOM
    | typeof google.maps.ControlPosition.LEFT_CENTER
    | typeof google.maps.ControlPosition.LEFT_TOP
    | typeof google.maps.ControlPosition.RIGHT_BOTTOM
    | typeof google.maps.ControlPosition.RIGHT_CENTER
    | typeof google.maps.ControlPosition.RIGHT_TOP
    | typeof google.maps.ControlPosition.TOP_CENTER
    | typeof google.maps.ControlPosition.TOP_LEFT
    | typeof google.maps.ControlPosition.TOP_RIGHT;

  class Map {
    constructor(mapDiv: HTMLElement | null, opts?: MapOptions);
    setCenter(latlng: LatLng | LatLngLiteral): void;
    getCenter(): LatLng | null;
    setZoom(zoom: number): void;
    getZoom(): number | undefined;
    setMapTypeId(mapTypeId: MapTypeId): void;
    getMapTypeId(): MapTypeId;
    panTo(latlng: LatLng | LatLngLiteral): void;
    panToBounds(latLngBounds: LatLngBounds | LatLngBoundsLiteral, padding?: number | Padding): void;
    getBounds(): LatLngBounds | null;
    getDiv(): HTMLElement | null;
    setOptions(options: MapOptions): void;
    fitBounds(bounds: LatLngBounds | LatLngBoundsLiteral, padding?: number | Padding): void;
    addListener(eventName: string, handler: (event: any) => void): MapsEventListener;
    removeListener(listener: MapsEventListener): void;
  }

  interface Padding {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  }

  interface MarkerOptions {
    position: LatLng | LatLngLiteral;
    map?: Map | null;
    title?: string;
    icon?: string | Icon | Symbol;
    animation?: Animation;
    clickable?: boolean;
    draggable?: boolean;
    visible?: boolean;
    zIndex?: number;
    label?: string | MarkerLabel;
  }

  type Animation = typeof google.maps.Animation.BOUNCE | typeof google.maps.Animation.DROP | null;

  interface Icon {
    url: string;
    scaledSize?: Size;
    size?: Size;
    anchor?: Point;
    origin?: Point;
  }

  interface Symbol {
    path: SymbolPath | string;
    anchor?: Point;
    fillColor?: string;
    fillOpacity?: number;
    rotation?: number;
    scale?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
  }

  type SymbolPath =
    | typeof google.maps.SymbolPath.BACKWARD_CLOSED_ARROW
    | typeof google.maps.SymbolPath.BACKWARD_OPEN_ARROW
    | typeof google.maps.SymbolPath.CIRCLE
    | typeof google.maps.SymbolPath.FORWARD_CLOSED_ARROW
    | typeof google.maps.SymbolPath.FORWARD_OPEN_ARROW;

  interface Point {
    x: number;
    y: number;
  }

  interface Size {
    width: number;
    height: number;
    widthUnit?: string;
    heightUnit?: string;
  }

  interface MarkerLabel {
    text: string;
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    getPosition(): LatLng | null;
    setPosition(position: LatLng | LatLngLiteral): void;
    getMap(): Map | null;
    setMap(map: Map | null): void;
    getTitle(): string | undefined;
    setTitle(title: string | undefined): void;
    getIcon(): string | Icon | Symbol | undefined;
    setIcon(icon: string | Icon | Symbol | undefined): void;
    getVisible(): boolean;
    setVisible(visible: boolean): void;
    getClickable(): boolean;
    setClickable(clickable: boolean): void;
    getDraggable(): boolean;
    setDraggable(draggable: boolean): void;
    getAnimation(): Animation;
    setAnimation(animation: Animation): void;
    addListener(eventName: string, handler: (event: any) => void): MapsEventListener;
    removeListener(listener: MapsEventListener): void;
  }

  interface InfoWindowOptions {
    content?: string | Node;
    position?: LatLng | LatLngLiteral;
    pixelOffset?: Size;
    maxWidth?: number;
    zIndex?: number;
    disableAutoPan?: boolean;
  }

  class InfoWindow {
    constructor(opts?: InfoWindowOptions);
    open(options?: InfoWindowOpenOptions | null, anchor?: MVCObject | null): void;
    close(): void;
    getContent(): string | Node | undefined;
    setContent(content: string | Node | undefined): void;
    getPosition(): LatLng | null | undefined;
    setPosition(position: LatLng | LatLngLiteral | null | undefined): void;
    getZIndex(): number | undefined;
    setZIndex(zIndex: number | undefined): void;
  }

  interface InfoWindowOpenOptions {
    map?: Map | null;
    anchor?: MVCObject | null;
    shouldFocus?: boolean;
  }

  class MVCObject {
    addListener(eventName: string, handler: (event: any) => void): MapsEventListener;
    bindTo(key: string, target: MVCObject, targetKey?: string, noNotify?: boolean): void;
    get(key: string): any;
    notify(key: string): void;
    set(key: string, value: any): void;
    setValues(values: { [key: string]: any }): void;
    unbind(key: string): void;
    unbindAll(): void;
  }

  interface MapsEventListener {
    remove(): void;
  }

  // 상수 정의
  namespace ControlPosition {
    const BOTTOM_CENTER: ControlPosition;
    const BOTTOM_LEFT: ControlPosition;
    const BOTTOM_RIGHT: ControlPosition;
    const LEFT_BOTTOM: ControlPosition;
    const LEFT_CENTER: ControlPosition;
    const LEFT_TOP: ControlPosition;
    const RIGHT_BOTTOM: ControlPosition;
    const RIGHT_CENTER: ControlPosition;
    const RIGHT_TOP: ControlPosition;
    const TOP_CENTER: ControlPosition;
    const TOP_LEFT: ControlPosition;
    const TOP_RIGHT: ControlPosition;
  }

  namespace Animation {
    const BOUNCE: Animation;
    const DROP: Animation;
  }

  namespace SymbolPath {
    const BACKWARD_CLOSED_ARROW: SymbolPath;
    const BACKWARD_OPEN_ARROW: SymbolPath;
    const CIRCLE: SymbolPath;
    const FORWARD_CLOSED_ARROW: SymbolPath;
    const FORWARD_OPEN_ARROW: SymbolPath;
  }
}

/**
 * 전역 google 객체 타입 정의
 * 구글 지도 API 스크립트가 로드되면 window.google에 할당됩니다.
 */
declare global {
  interface Window {
    google: {
      maps: typeof google.maps;
    };
  }
}

