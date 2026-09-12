import { SITE_CONFIG } from "@/config/site-config";

export interface Showroom {
  id: string;
  code: string;
  name: string;
  shortName: string;
  province: "Đồng Nai" | "Tây Ninh" | "Bình Phước" | "Long An";
  address: string;
  lat: number;
  lng: number;
  latitude: number;
  longitude: number;
  phone: string;
  hours: string;
  landmark?: string;
}

export interface ShowroomWithDistance extends Showroom {
  distanceKm?: number;
}

export const SHOWROOMS_DATA: Showroom[] = [
  {
    id: "chi-nhanh-1-trang-bom",
    code: "CN1",
    name: "Chi nhánh 1 - Trảng Bom",
    shortName: "Trảng Bom",
    province: "Đồng Nai",
    address: "18/2 Ấp Thanh Hoá, Xã Hố Nai 3, Huyện Trảng Bom, Đồng Nai",
    lat: 10.9658,
    lng: 107.0125,
    latitude: 10.9658,
    longitude: 107.0125,
    phone: SITE_CONFIG.contact.hotlineDisplay,
    hours: "07:30 - 21:00 hàng ngày",
    landmark: "Cách Quốc lộ 1A 200m",
  },
  {
    id: "chi-nhanh-2-thong-nhat",
    code: "CN2",
    name: "Chi nhánh 2 - Thống Nhất",
    shortName: "Thống Nhất",
    province: "Đồng Nai",
    address: "3/3 Ấp Gia Yên, Xã Gia Tân 3, Huyện Thống Nhất, Đồng Nai",
    lat: 11.0267,
    lng: 107.1895,
    latitude: 11.0267,
    longitude: 107.1895,
    phone: SITE_CONFIG.contact.hotlineDisplay,
    hours: "07:30 - 21:00 hàng ngày",
    landmark: "Khu vực Gia Tân 3",
  },
  {
    id: "chi-nhanh-3-hoa-thanh",
    code: "CN3",
    name: "Chi nhánh 3 - Hoà Thành",
    shortName: "Hoà Thành",
    province: "Tây Ninh",
    address: "228 Phạm Văn Đồng, Hiệp Tân, Thị Xã Hoà Thành, Tây Ninh",
    lat: 11.2785,
    lng: 106.1268,
    latitude: 11.2785,
    longitude: 106.1268,
    phone: SITE_CONFIG.contact.hotlineDisplay,
    hours: "07:30 - 21:00 hàng ngày",
    landmark: "Trục đường chính Phạm Văn Đồng",
  },
  {
    id: "chi-nhanh-4-trang-bang",
    code: "CN4",
    name: "Chi nhánh 4 - Trảng Bàng",
    shortName: "Trảng Bàng",
    province: "Tây Ninh",
    address: "268 Lộc Du, Thị Xã Trảng Bàng, Tây Ninh",
    lat: 11.0345,
    lng: 106.3578,
    latitude: 11.0345,
    longitude: 106.3578,
    phone: SITE_CONFIG.contact.hotlineDisplay,
    hours: "07:30 - 21:00 hàng ngày",
    landmark: "Khu phố Lộc Du trung tâm",
  },
  {
    id: "chi-nhanh-5-binh-long",
    code: "CN5",
    name: "Chi nhánh 5 - Bình Long",
    shortName: "Bình Long",
    province: "Bình Phước",
    address: "74 Nguyễn Huệ, Thị Xã Bình Long, Bình Phước",
    lat: 11.6482,
    lng: 106.6022,
    latitude: 11.6482,
    longitude: 106.6022,
    phone: SITE_CONFIG.contact.hotlineDisplay,
    hours: "07:30 - 21:00 hàng ngày",
    landmark: "Mặt tiền đường Nguyễn Huệ",
  },
  {
    id: "chi-nhanh-6-duc-hoa",
    code: "CN6",
    name: "Chi nhánh 6 - Đức Hòa",
    shortName: "Đức Hòa",
    province: "Long An",
    address: "761 ĐT825, TT. Đức Hòa, Huyện Đức Hòa, Long An",
    lat: 10.7513,
    lng: 106.4552,
    latitude: 10.7513,
    longitude: 106.4552,
    phone: SITE_CONFIG.contact.hotlineDisplay,
    hours: "07:30 - 21:00 hàng ngày",
    landmark: "Tuyến đường tỉnh 825 sầm uất",
  },
  {
    id: "chi-nhanh-7-long-thanh",
    code: "CN7",
    name: "Chi nhánh 7 - Long Thành",
    shortName: "Long Thành",
    province: "Đồng Nai",
    address: "Số 2 Đường 769, Hàng Gòn, Lộc An, Long Thành (Ngã 4 Lộc An), Đồng Nai",
    lat: 10.7786,
    lng: 106.9856,
    latitude: 10.7786,
    longitude: 106.9856,
    phone: SITE_CONFIG.contact.hotlineDisplay,
    hours: "07:30 - 21:00 hàng ngày",
    landmark: "Khu vực Ngã 4 Lộc An",
  },
];

export const PROVINCES = ["Tất cả", "Đồng Nai", "Tây Ninh", "Bình Phước", "Long An"] as const;
export type ProvinceFilter = (typeof PROVINCES)[number];

export const GENERAL_HOTLINE = SITE_CONFIG.contact.hotlineDisplay;
export const GENERAL_HOURS = SITE_CONFIG.contact.workHours;

/**
 * Calculates distance between two coordinates using the Haversine formula.
 * @returns Distance in kilometers, rounded to 1 decimal place.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

/**
 * Generates 1-tap Google Maps directions link for an address.
 */
export function getGoogleMapsDirectionsUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

/**
 * Sanitizes phone number string for tel: protocol.
 */
export function sanitizePhoneForTel(phone: string): string {
  return phone.replace(/[^0-9+]/g, "");
}
