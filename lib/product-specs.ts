export interface ProductTechSpec {
  brand: string;
  manufacturer: string;
  origin: string;
  coreMaterial: string;
  coverMaterial: string;
  firmnessIndex: string; // e.g. "6.5 / 10 (Cân bằng tiêu chuẩn)"
  dimensions: string;
  thicknessOptions: string;
  ventilationTech: string;
  certifications: string[];
  warrantyYears: number;
  spineSupportRating: string;
  idealFor: string;
  washableCover: boolean;
}

export const PRODUCT_SPECS_DATABASE: Record<string, ProductTechSpec> = {
  // 1. NỆM CAO SU NON AMERICA (Giá tốt nhất)
  "nem-cao-su-america": {
    brand: "Thăng Long America",
    manufacturer: "Công ty TNHH Nệm Thăng Long Việt Nam",
    origin: "Việt Nam",
    coreMaterial: "Foam tỷ trọng cao ép định hình dẻo dai High-Resilience",
    coverMaterial: "Vải thun mè thể thao co giãn 4 chiều thoáng nhiệt",
    firmnessIndex: "7.0 / 10 (Cứng vừa - Nâng đỡ cột sống thẳng trục)",
    dimensions: "100x200cm | 120x200cm | 140x200cm | 160x200cm | 180x200cm",
    thicknessOptions: "10cm • 15cm • 20cm",
    ventilationTech: "Cấu trúc vi bọt khí liên kết hở thoát ẩm tức thì",
    certifications: ["ISO 9001:2015", "Quatest 3 Kiểm định độ bền"],
    warrantyYears: 10,
    spineSupportRating: "Tiêu chuẩn (Phù hợp người hay đau mỏi lưng)",
    idealFor: "Học sinh sinh viên, căn hộ cho thuê, gia đình trẻ cần độ bền cao",
    washableCover: true,
  },

  // 2. NỆM THĂNG LONG CLASSIC
  "nem-thang-long-classic": {
    brand: "Thăng Long Classic",
    manufacturer: "Công ty TNHH Nệm Thăng Long Việt Nam",
    origin: "Việt Nam",
    coreMaterial: "Cao su nhân tạo tỷ trọng cao phân bổ trọng lực đa điểm",
    coverMaterial: "Vải Gấm chần chỉ vi tính kháng khuẩn đa điểm",
    firmnessIndex: "6.5 / 10 (Cân bằng êm ái)",
    dimensions: "100x200cm | 120x200cm | 140x200cm | 160x200cm | 180x200cm",
    thicknessOptions: "10cm • 15cm • 20cm",
    ventilationTech: "Khoang dẫn khí đa chiều chống ẩm mốc bốn mùa",
    certifications: ["ISO 9001:2015", "An toàn dệt may Oeko-Tex"],
    warrantyYears: 12,
    spineSupportRating: "Nâng đỡ sinh học 5 vùng cơ thể",
    idealFor: "Mọi lứa tuổi trong gia đình, người thích nằm êm vừa phải",
    washableCover: true,
  },

  // 3. NỆM THAN HOẠT TÍNH KHÁNG KHUẨN
  "nem-than-hoat-tinh": {
    brand: "Thăng Long Activated Carbon",
    manufacturer: "Công ty TNHH Nệm Thăng Long Việt Nam",
    origin: "Việt Nam",
    coreMaterial: "Lõi Foam cấy phân tử Carbon hoạt tính khử mùi và lọc khuẩn",
    coverMaterial: "Vải sợi sinh học Tencel tích hợp ion bạc Nano Silver",
    firmnessIndex: "6.0 / 10 (Vừa vặn đàn hồi nhẹ)",
    dimensions: "100x200cm | 120x200cm | 140x200cm | 160x200cm | 180x200cm",
    thicknessOptions: "10cm • 15cm • 20cm",
    ventilationTech: "Công nghệ than hoạt tính tự hút ẩm và khử mùi mồ hôi ban đêm",
    certifications: ["Chứng nhận kháng khuẩn Viện Pasteur", "Quatest 3"],
    warrantyYears: 12,
    spineSupportRating: "Bảo vệ đĩa đệm thắt lưng, thanh lọc giấc ngủ",
    idealFor: "Người có da mẫn cảm, trẻ em, phòng ngủ kín máy lạnh",
    washableCover: true,
  },

  // 4. NỆM MEMORY FOAM TRỢ LỰC
  "nem-memory-foam": {
    brand: "Thăng Long Memory Foam",
    manufacturer: "Công ty TNHH Nệm Thăng Long Việt Nam",
    origin: "Việt Nam",
    coreMaterial: "Viscoelastic Memory Foam thế hệ mới triệt tiêu phản lực tiếp xúc",
    coverMaterial: "Vải dệt lụa lạnh sợi Cool-Touch hạ nhiệt bề mặt 2-3°C",
    firmnessIndex: "5.5 / 10 (Mềm êm thư giãn - Giảm điểm tì đè)",
    dimensions: "120x200cm | 140x200cm | 160x200cm | 180x200cm | 220x200cm",
    thicknessOptions: "15cm • 20cm",
    ventilationTech: "Ma trận hạt gel tản nhiệt CoolGel kết hợp foam thở",
    certifications: ["CertiPUR-US chứng nhận bọt xốp sạch", "ISO 9001:2015"],
    warrantyYears: 12,
    spineSupportRating: "Ôm khít từng đường cong cơ thể, giải phóng áp lực vai gáy",
    idealFor: "Người làm việc văn phòng căng thẳng, người đau mỏi cơ khớp",
    washableCover: true,
  },

  // 5. NỆM CAO SU THIÊN NHIÊN THĂNG LONG (3/4 & 100%)
  "nem-cao-su-thien-nhien": {
    brand: "Thăng Long Natural Latex",
    manufacturer: "Công ty TNHH Nệm Thăng Long Việt Nam",
    origin: "Việt Nam",
    coreMaterial: "100% Mủ cao su thiên nhiên thuần khiết khai thác tại Đông Nam Bộ",
    coverMaterial: "Vải gấm dệt Jacquard sợi gỗ sồi tự nhiên chống bám bụi",
    firmnessIndex: "6.5 / 10 (Đàn hồi tự nhiên chuẩn y khoa)",
    dimensions: "100x200cm | 120x200cm | 140x200cm | 160x200cm | 180x200cm | 220x200cm",
    thicknessOptions: "10cm • 15cm • 20cm",
    ventilationTech: "Hệ thống 5.000 lỗ thông hơi vuông nhỏ mặt trên và lỗ tròn lớn mặt dưới",
    certifications: ["Quatest 3 - 100% Natural Latex", "LGA Tested Quality", "Eco-Institute"],
    warrantyYears: 15,
    spineSupportRating: "Chuẩn chỉnh hình cột sống 7 vùng giải phẫu",
    idealFor: "Người lớn tuổi, người có bệnh lý đĩa đệm, gia đình tìm kiếm sản phẩm bền bỉ 20 năm",
    washableCover: true,
  },

  // 6. NỆM KHÁCH SẠN DỰ ÁN CAO CẤP (Vinhalatex / Hospitality Top Tier)
  "nem-khach-san-du-an": {
    brand: "Thăng Long Hospitality (Vinhalatex)",
    manufacturer: "Công ty TNHH Nệm Thăng Long Việt Nam",
    origin: "Việt Nam",
    coreMaterial: "Lò xo túi độc lập 7 vùng bọc túi vải không dệt kết hợp tầng Foam trợ lực & cao su thiên nhiên",
    coverMaterial: "Pillow Top chần bông gòn kháng cháy tiêu chuẩn khách sạn 5 sao",
    firmnessIndex: "7.5 / 10 (Chuẩn khách sạn 5 sao)",
    dimensions: "120x200cm | 140x200cm | 160x200cm | 180x200cm | 220x200cm",
    thicknessOptions: "25cm • 30cm",
    ventilationTech: "Hệ thống đối lưu không khí tuần hoàn qua khe lò xo và bọt khí cao su",
    certifications: ["ISO 9001:2015", "Tiêu chuẩn kháng cháy TB 117", "Quatest 3"],
    warrantyYears: 15,
    spineSupportRating: "Khung lò xo túi trợ lực 7 vùng cột sống độc lập",
    idealFor: "Resort, khách sạn 4-5 sao, căn hộ cao cấp và gia đình yêu thích cảm giác nghỉ dưỡng",
    washableCover: false,
  },
};

// Aliases mapping short slugs to full keys
const SLUG_ALIASES: Record<string, string> = {
  america: "nem-cao-su-america",
  classic: "nem-thang-long-classic",
  "hoat-tinh": "nem-than-hoat-tinh",
  "memory-foam": "nem-memory-foam",
  "cao-su-thien-nhien": "nem-cao-su-thien-nhien",
  "khach-san": "nem-khach-san-du-an",
  "khach-san-du-an": "nem-khach-san-du-an",
};

export function getProductTechSpec(slug?: string): ProductTechSpec {
  if (!slug) return PRODUCT_SPECS_DATABASE["nem-cao-su-america"];

  if (PRODUCT_SPECS_DATABASE[slug]) {
    return PRODUCT_SPECS_DATABASE[slug];
  }

  const resolvedKey = SLUG_ALIASES[slug];
  if (resolvedKey && PRODUCT_SPECS_DATABASE[resolvedKey]) {
    return PRODUCT_SPECS_DATABASE[resolvedKey];
  }

  return PRODUCT_SPECS_DATABASE["nem-cao-su-america"];
}
