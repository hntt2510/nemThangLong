export interface MattressLayer {
  layerIndex: string;
  name: string;
  thickness: string;
  material: string;
  features: string[];
  visualColor: string; // Tailored tint for the 3D layer
  edgeColor?: string;
  cert?: string;
}

export interface ProductAnatomy {
  slug: string;
  name: string;
  firmnessScore: number; // Scale 1 - 10
  firmnessLabel: string;
  priceTier: number; // 1: Lowest to 6: Luxury
  layers: MattressLayer[];
}

export const PRODUCT_ANATOMIES: Record<string, ProductAnatomy> = {
  // 1. Nệm Cao Su Non America (Entry / Giá tiết kiệm nhất - Tier 1)
  america: {
    slug: "america",
    name: "Nệm Cao Su Non America",
    firmnessScore: 7.0,
    firmnessLabel: "Nâng đỡ cứng vừa (Medium Firm - Chống võng lưng)",
    priceTier: 1,
    layers: [
      {
        layerIndex: "01",
        name: "Áo Nệm Thun Mè Co Giãn 4 Chiều",
        thickness: "1.5 cm",
        material: "Vải thun mè thể thao co giãn 4 chiều siêu thoát nhiệt",
        features: [
          "Thấm hút mồ hôi và tản nhiệt tức thì",
          "Bề mặt co giãn êm ái, chống xơ sợi",
          "Khóa kéo viền tháo rời vệ sinh định kỳ tiện lợi",
        ],
        visualColor: "linear-gradient(135deg, #FAF8F5 0%, #EFEBE4 100%)",
        edgeColor: "#DED6C8",
        cert: "Quatest 3 Kiểm định độ bền",
      },
      {
        layerIndex: "02",
        name: "Lõi Foam Tỷ Trọng Cao Ép Định Hình Dẻo Dai",
        thickness: "8.5 - 18.5 cm",
        material: "Foam tỷ trọng cao High-Resilience nguyên khối",
        features: [
          "Định hình nâng đỡ cột sống thẳng trục tự nhiên",
          "Dẻo dai đàn hồi, chống xẹp lún bền bỉ 10 năm",
          "Cấu trúc vi bọt khí liên kết hở thoáng khí bốn mùa",
        ],
        visualColor: "linear-gradient(135deg, #F9F2E2 0%, #ECE1C7 100%)",
        edgeColor: "#DBCFAD",
        cert: "ISO 9001:2015",
      },
      {
        layerIndex: "03",
        name: "Đế Gia Cố Cân Bằng Lực Tiếp Xúc Giường",
        thickness: "1.0 - 2.0 cm",
        material: "Lớp đáy chịu lực ma sát cao chống xô lệch",
        features: [
          "Bám chắc mặt vạt giường hoặc sàn nhà",
          "Phân tán đồng đều tải trọng toàn bộ nệm",
          "Bảo vệ kết cấu lõi bền bỉ theo thời gian",
        ],
        visualColor: "linear-gradient(135deg, #EAE5DC 0%, #D8D1C4 100%)",
        edgeColor: "#BFB7A8",
        cert: "Tiêu chuẩn xuất xưởng Nệm Thăng Long",
      },
    ],
  },

  // 2. Nệm Thăng Long Classic (Tier 2)
  classic: {
    slug: "classic",
    name: "Nệm Thăng Long Classic",
    firmnessScore: 6.5,
    firmnessLabel: "Cân bằng tiêu chuẩn (Balanced Support)",
    priceTier: 2,
    layers: [
      {
        layerIndex: "01",
        name: "Áo Vải Gấm Xốp Chần Chỉ Vi Tính Kháng Khuẩn",
        thickness: "2.0 cm",
        material: "Vải gấm xốp dệt hoa văn nổi chần vi tính đa điểm",
        features: [
          "Kháng khuẩn và chống bụi mịn bề mặt",
          "Chần bông êm ái, nâng đỡ dịu nhẹ khi tiếp xúc",
          "Độ bền màu cao, giữ form sang trọng qua nhiều năm",
        ],
        visualColor: "linear-gradient(135deg, #FAF7F0 0%, #EFE9DC 100%)",
        edgeColor: "#DCD3C3",
        cert: "An toàn dệt may Oeko-Tex",
      },
      {
        layerIndex: "02",
        name: "Lớp Đệm Cao Su Nhân Tạo Phân Bổ Trọng Lực Đa Điểm",
        thickness: "10.0 - 15.0 cm",
        material: "Cao su nhân tạo tỷ trọng cao phân bổ lực đồng đều",
        features: [
          "Cân bằng độ nảy và độ êm ái cho mọi lứa tuổi",
          "Giảm áp lực tại các điểm tỳ vai gáy và hông",
          "Khoang dẫn khí đa chiều chống ẩm mốc bốn mùa",
        ],
        visualColor: "linear-gradient(135deg, #FBF2DE 0%, #EEDBB2 100%)",
        edgeColor: "#DEC79A",
        cert: "ISO 9001:2015",
      },
      {
        layerIndex: "03",
        name: "Đáy Chống Trượt Tích Hợp Khóa Kéo Vệ Sinh",
        thickness: "1.0 cm",
        material: "Vải dệt chống trượt gia cố khóa kéo thông minh",
        features: [
          "Cố định vị trí nệm không bị trượt khi xoay trở",
          "Khóa kéo chữ L giúp tháo vỏ giặt cực kỳ nhẹ nhàng",
          "Tăng tuổi thọ vận hành tổng thể tấm nệm",
        ],
        visualColor: "linear-gradient(135deg, #E6E0D6 0%, #D0C8BB 100%)",
        edgeColor: "#B5AC9D",
        cert: "Quatest 3",
      },
    ],
  },

  // 3. Nệm Than Hoạt Tính Kháng Khuẩn (Tier 3)
  "hoat-tinh": {
    slug: "hoat-tinh",
    name: "Nệm Than Hoạt Tính Kháng Khuẩn",
    firmnessScore: 6.0,
    firmnessLabel: "Vừa vặn đàn hồi nhẹ (Medium Comfort - Thoáng khí tối đa)",
    priceTier: 3,
    layers: [
      {
        layerIndex: "01",
        name: "Áo Nệm Dệt Tencel Điều Hòa Thân Nhiệt Kháng Mùi",
        thickness: "2.0 cm",
        material: "Vải sợi sinh học Tencel tích hợp Nano Silver kháng khuẩn",
        features: [
          "Tự động điều hòa thân nhiệt thoáng mát cả đêm",
          "Kháng khuẩn ion bạc khử 99% vi khuẩn và nấm mốc",
          "Lành tính cho làn da nhạy cảm và trẻ nhỏ",
        ],
        visualColor: "linear-gradient(135deg, #F2F1EE 0%, #E2E0DB 100%)",
        edgeColor: "#C7C5BE",
        cert: "Chứng nhận Viện Pasteur",
      },
      {
        layerIndex: "02",
        name: "Lõi Foam Cấy Hạt Carbon Hoạt Tính Khử Mùi & Lọc Ẩm",
        thickness: "10.0 - 15.0 cm",
        material: "Foam cấy tinh thể than tre hoạt tính nguyên chất",
        features: [
          "Hút ẩm và tự khử mùi mồ hôi ban đêm",
          "Thanh lọc vi khí hậu phòng ngủ kín máy lạnh",
          "Đàn hồi vững chãi, nâng niu cột sống thẳng trục",
        ],
        visualColor: "linear-gradient(135deg, #E5E3DD 0%, #CDC9C0 100%)",
        edgeColor: "#AAA59B",
        cert: "Quatest 3 Kiểm định vật liệu",
      },
      {
        layerIndex: "03",
        name: "Đệm Trợ Lực Nâng Đỡ Cột Sống Đa Vùng",
        thickness: "3.0 - 5.0 cm",
        material: "High-density support foam tỷ trọng cao",
        features: [
          "Triệt tiêu hoàn toàn võng lún thắt lưng",
          "Hấp thụ rung động khi người bên cạnh trở mình",
          "Độ bền sử dụng vượt bậc trên 12 năm",
        ],
        visualColor: "linear-gradient(135deg, #DBD6CD 0%, #C4BDB1 100%)",
        edgeColor: "#A39B8F",
        cert: "ISO 9001:2015",
      },
    ],
  },

  // 4. Nệm Memory Foam Trợ Lực (Tier 4)
  "memory-foam": {
    slug: "memory-foam",
    name: "Nệm Memory Foam Trợ Lực",
    firmnessScore: 5.5,
    firmnessLabel: "Mềm êm thư giãn (Contoured Comfort - Giảm áp lực vai gáy)",
    priceTier: 4,
    layers: [
      {
        layerIndex: "01",
        name: "Lớp Vải Dệt Lụa Mát Lạnh Cool-Touch",
        thickness: "2.0 cm",
        material: "Vải dệt lụa lạnh sợi Cool-Touch công nghệ hạ nhiệt",
        features: [
          "Hạ nhiệt độ bề mặt tiếp xúc tức thì 2-3°C",
          "Cảm giác mượt mát, chống tĩnh điện",
          "Thoát nhiệt liên tục, không gây hầm lưng",
        ],
        visualColor: "linear-gradient(135deg, #F3F7F8 0%, #E1ECEE 100%)",
        edgeColor: "#C5D8DC",
        cert: "Oeko-Tex Standard 100",
      },
      {
        layerIndex: "02",
        name: "Lớp Memory Foam Hấp Thụ Phản Lực Chậm",
        thickness: "5.0 cm",
        material: "Viscoelastic Memory Foam thế hệ mới mật độ cao",
        features: [
          "Ghi nhớ và ôm sát từng đường cong sinh lý cột sống",
          "Triệt tiêu hoàn toàn điểm tỳ đè ở vai, hông và thắt lưng",
          "Tạo cảm giác không trọng lực giúp ngủ sâu giấc",
        ],
        visualColor: "linear-gradient(135deg, #E9F0F6 0%, #D3E2EE 100%)",
        edgeColor: "#B2CADB",
        cert: "CertiPUR-US chứng nhận bọt xốp sạch",
      },
      {
        layerIndex: "03",
        name: "Lõi Base Foam Chịu Lực Cách Ly Chuyển Động",
        thickness: "10.0 cm",
        material: "High-density open-cell base foam thoáng khí",
        features: [
          "Cách ly chuyển động độc lập tuyệt đối giữa hai người nằm",
          "Hệ thống lỗ thoáng khí Air-Flow luân chuyển khí mát",
          "Ngăn ngừa tình trạng lún chìm quá sâu của memory foam",
        ],
        visualColor: "linear-gradient(135deg, #E0E7EC 0%, #C8D4DC 100%)",
        edgeColor: "#A8B8C2",
        cert: "ISO 9001:2015",
      },
    ],
  },

  // 5. Nệm Cao Su Thiên Nhiên Thăng Long (3/4 & 100%) (Tier 5)
  "cao-su-thien-nhien": {
    slug: "cao-su-thien-nhien",
    name: "Nệm Cao Su Thiên Nhiên Thăng Long (3/4 & 100%)",
    firmnessScore: 6.5,
    firmnessLabel: "Đàn hồi sinh học chuẩn y khoa (Natural Latex Firm)",
    priceTier: 5,
    layers: [
      {
        layerIndex: "01",
        name: "Áo Nệm Gấm Dệt Tencel Organic Sinh Học",
        thickness: "2.5 cm",
        material: "Vải gấm dệt Jacquard sợi gỗ sồi tự nhiên chống bám bụi",
        features: [
          "Mềm mịn, kháng khuẩn tự nhiên và chống kích ứng da",
          "Thêu dệt hoa văn sang trọng, tinh xảo",
          "Khóa kéo vòng tròn tháo rời giặt giũ dễ dàng",
        ],
        visualColor: "linear-gradient(135deg, #FAF7EE 0%, #EFE8D6 100%)",
        edgeColor: "#DED3BA",
        cert: "Oeko-Tex Standard 100 Organic",
      },
      {
        layerIndex: "02",
        name: "Lõi Mủ Cao Su Thiên Nhiên 100% Đổ Khuôn Nguyên Khối",
        thickness: "7.5 - 10.0 cm",
        material: "100% Mủ cao su thiên nhiên Đông Nam Bộ với 5.000 lỗ thông hơi tổ ong",
        features: [
          "Chuẩn chỉnh hình cột sống 7 vùng giải phẫu sinh học",
          "Đàn hồi tự nhiên tức thì, không tạo tiếng động khi trở mình",
          "Cấu trúc bọt khí hở đối lưu mát rượi 4 mùa",
        ],
        visualColor: "linear-gradient(135deg, #FBF2D7 0%, #EED8A7 100%)",
        edgeColor: "#D8BC83",
        cert: "Quatest 3 - 100% Natural Latex · Eco-Institute",
      },
      {
        layerIndex: "03",
        name: "Đế Cao Su Nhân Tạo Tỷ Trọng Siêu Cao Chống Lún Xẹp",
        thickness: "10.0 cm",
        material: "Cao su nhân tạo tỷ trọng siêu cao kết hợp lỗ vuông chịu lực",
        features: [
          "Chịu tải trọng lớn, tuổi thọ sản phẩm bền bỉ 15-20 năm",
          "Gia cố mặt đáy vững chắc, bảo vệ lõi cao su thiên nhiên",
          "Kháng nấm mốc và côn trùng tự nhiên",
        ],
        visualColor: "linear-gradient(135deg, #F4E7C5 0%, #E2CF9D 100%)",
        edgeColor: "#C7B17C",
        cert: "LGA Tested Quality",
      },
    ],
  },

  // 6. Nệm Khách Sạn Dự Án Cao Cấp (Tier 6 - Luxury Top)
  "khach-san": {
    slug: "khach-san",
    name: "Nệm Khách Sạn Dự Án Cao Cấp (Vinhalatex)",
    firmnessScore: 7.5,
    firmnessLabel: "Chuẩn lưu trú khách sạn 5 sao (Hotel Luxury Firm)",
    priceTier: 6,
    layers: [
      {
        layerIndex: "01",
        name: "Pillow Top Chần Lông Vũ Nhân Tạo Siêu Mềm Êm",
        thickness: "4.0 cm",
        material: "Lớp đệm Pillow Top chần bông gòn kháng cháy và lông vũ microfiber",
        features: [
          "Cảm giác êm ái bồng bềnh đẳng cấp khách sạn 5 sao",
          "Vải bọc xử lý kháng cháy chậm theo tiêu chuẩn lưu trú quốc tế",
          "Tạo sự thư giãn tối đa cho cơ thể ngay khi vừa ngả lưng",
        ],
        visualColor: "linear-gradient(135deg, #FFFDF8 0%, #F5EFE0 100%)",
        edgeColor: "#E5DAC5",
        cert: "Tiêu chuẩn kháng cháy TB 117 · ISO 9001:2015",
      },
      {
        layerIndex: "02",
        name: "Lớp Cao Su Thiên Nhiên 100% Trợ Lực Đàn Hồi",
        thickness: "5.0 cm",
        material: "Mủ cao su thiên nhiên thuần khiết kết hợp lớp chuyển tiếp",
        features: [
          "Nâng niu đường cong sinh lý thắt lưng trọn vẹn",
          "Hỗ trợ phân tán trọng lực đồng đều cho mọi thể trạng khách nằm",
          "Thoát ẩm cực nhanh, không lưu mùi phòng khách sạn",
        ],
        visualColor: "linear-gradient(135deg, #F9F0DA 0%, #EAD5A9 100%)",
        edgeColor: "#D3BA85",
        cert: "Quatest 3 Kiểm định độ bền nén",
      },
      {
        layerIndex: "03",
        name: "Hệ Thống Lò Xo Túi Độc Lập 7 Vùng & Khung PU Bo Viền",
        thickness: "20.0 cm",
        material: "Thép tôi điện nhiệt cao tần & PU Foam gia cố thành nệm chống trượt sụt",
        features: [
          "Cách ly chuyển động độc lập tuyệt đối: trở mình không đánh thức người bên cạnh",
          "Khung bo viền kiên cố, ngồi ở mép nệm không lo trượt sụt",
          "Độ bền cơ học vượt trội cho tần suất vận hành dự án lớn",
        ],
        visualColor: "linear-gradient(135deg, #E6DECf 0%, #CFBFAB 100%)",
        edgeColor: "#B29F89",
        cert: "Chuẩn kiểm định độ bền chu kỳ 100.000 lần",
      },
    ],
  },
};

const SLUG_ALIASES: Record<string, string> = {
  "nem-cao-su-america": "america",
  "nem-thang-long-classic": "classic",
  "nem-than-hoat-tinh": "hoat-tinh",
  "nem-memory-foam": "memory-foam",
  "nem-cao-su-thien-nhien": "cao-su-thien-nhien",
  "nem-khach-san-du-an": "khach-san",
  "khach-san-du-an": "khach-san",
};

export function getProductAnatomy(slug?: string): ProductAnatomy {
  if (!slug) return PRODUCT_ANATOMIES["america"];

  if (PRODUCT_ANATOMIES[slug]) {
    return PRODUCT_ANATOMIES[slug];
  }

  const resolved = SLUG_ALIASES[slug];
  if (resolved && PRODUCT_ANATOMIES[resolved]) {
    return PRODUCT_ANATOMIES[resolved];
  }

  return PRODUCT_ANATOMIES["america"];
}
