export type SeedVariant = readonly [number, number, number, number | null, number | null, string, number];

const officialSizes = [100, 120, 140, 160, 180].flatMap((width) =>
  [10, 15, 20].map((thickness) => [width, 200, thickness] as const),
);

function variants(prefix: string, priced: SeedVariant[]): SeedVariant[] {
  const bySize = new Map(priced.map((item) => [`${item[0]}-${item[1]}-${item[2]}`, item]));
  return officialSizes.map(([width, length, thickness]) => bySize.get(`${width}-${length}-${thickness}`) ?? [width, length, thickness, null, null, `${prefix}-${width}${length}${thickness}`, 0]);
}

export const sourceReferences = [
  { key: "classic", url: "https://nemthanglong.vn/nem-thang-long-classic", title: "Nệm Thăng Long Classic", publisher: "Nệm Thăng Long", notes: "Danh mục, kích thước và mô tả trên website chính thức.", sourceType: "OFFICIAL_WEBSITE" as const },
  { key: "natural", url: "https://nemthanglong.vn/nem-cao-su-thien-nhien-thang-long-34", title: "Nệm cao su thiên nhiên Thăng Long 3/4", publisher: "Nệm Thăng Long", notes: "Nguồn chính cho thành phần 75/25, lỗ thoáng và áo lưới 4D.", sourceType: "OFFICIAL_WEBSITE" as const },
  { key: "hoat-tinh", url: "https://nemthanglong.vn/nem-thang-long-hoat-tinh", title: "Nệm Thăng Long Hoạt Tính", publisher: "Nệm Thăng Long", notes: "Danh mục và kích thước công bố.", sourceType: "OFFICIAL_WEBSITE" as const },
  { key: "memory", url: "https://nemthanglong.vn/nem-thang-long-memoryfoam", title: "Nệm Thăng Long Memoryfoam", publisher: "Nệm Thăng Long", notes: "Danh mục và kích thước công bố.", sourceType: "OFFICIAL_WEBSITE" as const },
  { key: "hotel", url: "https://nemthanglong.vn/nem-cao-su-cho-khach-san", title: "Nệm Cao Su Cho Khách Sạn", publisher: "Nệm Thăng Long", notes: "Danh mục và kích thước công bố.", sourceType: "OFFICIAL_WEBSITE" as const },
  { key: "america", url: "https://nemthanglong.vn/nem-cao-su-thang-long-america", title: "Nệm Cao Su Thăng Long America", publisher: "Nệm Thăng Long", notes: "Danh mục và kích thước công bố.", sourceType: "OFFICIAL_WEBSITE" as const },
  { key: "quality", url: "https://nemthanglong.vn/chinh-sach-chat-luong", title: "Chính sách chất lượng", publisher: "Nệm Thăng Long", notes: "Điều kiện kiểm tra, đổi trả và bảo hành trên website chính thức.", sourceType: "OFFICIAL_WEBSITE" as const },
  { key: "dealers", url: "https://nemthanglong.vn/dai-ly", title: "Hệ thống đại lý", publisher: "Nệm Thăng Long", notes: "Danh sách showroom và đại lý công bố.", sourceType: "OFFICIAL_WEBSITE" as const },
  { key: "fixture", url: "https://nemthanglong.local/internal-fixture", title: "Dữ liệu thử nghiệm local", publisher: "Nội bộ", notes: "Giá, tồn kho, ảnh dựng và profile chỉ dành cho development/test.", sourceType: "INTERNAL_FIXTURE" as const },
] as const;

const commonFacts = (sourceKey: string) => [
  { key: "manufacturer", label: "Nhà sản xuất", value: "Công ty TNHH Nệm Thăng Long Việt Nam", sourceKey, dataStatus: "VERIFIED" as const },
  { key: "origin", label: "Xuất xứ", value: "Việt Nam", sourceKey, dataStatus: "VERIFIED" as const },
  { key: "sizes", label: "Kích thước công bố", value: "Rộng 100/120/140/160/180 cm × dài 200 cm × dày 10/15/20 cm", sourceKey, dataStatus: "VERIFIED" as const },
];

type ContentBlocks = Record<"AUDIENCE" | "MATERIAL_STORY" | "DELIVERY" | "WARRANTY", string>;
const genericBlocks = (audience: string): ContentBlocks => ({
  AUDIENCE: audience,
  MATERIAL_STORY: "Thông tin kỹ thuật chi tiết đang được cập nhật từ tài liệu nhà sản xuất.",
  DELIVERY: "Phí và thời gian giao hàng được xác nhận khi tư vấn.",
  WARRANTY: "Thực hiện theo chính sách chất lượng công bố của nhà sản xuất.",
});

export const localStorefrontProducts = [
  {
    slug: "classic", name: "Nệm Thăng Long Classic", eyebrow: "THĂNG LONG CLASSIC", sortOrder: 10, presentation: "STANDARD" as const,
    description: "Dòng Classic trong danh mục Nệm Thăng Long; thông số vật liệu chi tiết cần được đối chiếu thêm trước khi xác minh.",
    profile: ["Đang xác minh", null, null, null, null] as const, profileStatus: "SOURCE_CONFLICT" as const,
    media: ["/images/products/classic/catalog-v2.png", "/images/products/classic/01.webp", "/images/products/classic/02.webp", "/images/products/classic/03.webp", "/images/products/classic/04.webp"],
    facts: [...commonFacts("classic"), { key: "material", label: "Vật liệu", value: "Website có mô tả cao su non nhưng chưa có tài liệu kỹ thuật độc lập để xác minh.", sourceKey: "classic", dataStatus: "SOURCE_CONFLICT" as const }],
    contentBlocks: { ...genericBlocks("Phù hợp để tham khảo theo nhu cầu và kích thước; đội ngũ tư vấn sẽ xác nhận dòng nệm phù hợp."), MATERIAL_STORY: "Thông tin vật liệu trên trang Classic đang được lưu với trạng thái cần đối chiếu thêm." },
    variants: variants("TL-CL", [[120,200,10,6900000,7700000,"TL-CL-12020010",10],[140,200,10,7500000,8400000,"TL-CL-14020010",12],[160,200,10,8100000,9000000,"TL-CL-16020010",15],[160,200,15,8700000,9700000,"TL-CL-16020015",8],[180,200,15,9300000,10400000,"TL-CL-18020015",6],[180,200,20,9900000,11000000,"TL-CL-18020020",4]]),
  },
  {
    slug: "cao-su-thien-nhien", name: "Nệm cao su thiên nhiên Thăng Long 3/4", eyebrow: "NATURAL LATEX 3/4", sortOrder: 20, presentation: "LUXURY" as const,
    description: "Nệm cao su thiên nhiên Thăng Long 3/4 với cấu trúc hai mặt lỗ thoáng và áo lưới 4D theo thông tin nhà sản xuất công bố.",
    profile: ["Đang xác minh", null, null, null, null] as const, profileStatus: "PLACEHOLDER" as const,
    media: ["/images/products/cao-su-thien-nhien/catalog-v2.png", "/images/products/cao-su-thien-nhien/01.webp", "/images/products/cao-su-thien-nhien/02.webp", "/images/products/cao-su-thien-nhien/03.webp", "/images/products/cao-su-thien-nhien/04.webp"],
    facts: [...commonFacts("natural"), { key: "composition", label: "Thành phần", value: "75% cao su thiên nhiên, 25% cao su tổng hợp", sourceKey: "natural", dataStatus: "VERIFIED" as const }, { key: "ventilation", label: "Thông khí", value: "Hai mặt lỗ thoáng", sourceKey: "natural", dataStatus: "VERIFIED" as const }, { key: "cover", label: "Áo nệm", value: "Áo lưới 4D", sourceKey: "natural", dataStatus: "VERIFIED" as const }],
    contentBlocks: { ...genericBlocks("Người cần lựa chọn nệm cao su theo kích thước tiêu chuẩn; tư vấn viên sẽ hỗ trợ xác nhận độ dày phù hợp."), MATERIAL_STORY: "Theo website chính thức: nệm gồm 75% cao su thiên nhiên và 25% cao su tổng hợp; hai mặt lỗ thoáng, áo lưới 4D." },
    variants: variants("TL-LT", [[120,200,10,12900000,14400000,"TL-LT-12020010",8],[140,200,10,14300000,15900000,"TL-LT-14020010",7],[160,200,10,15700000,17500000,"TL-LT-16020010",10],[160,200,15,17100000,19100000,"TL-LT-16020015",6],[180,200,15,18500000,20600000,"TL-LT-18020015",5],[180,200,20,19900000,22200000,"TL-LT-18020020",3]]),
  },
  {
    slug: "hoat-tinh", name: "Nệm Thăng Long Hoạt Tính", eyebrow: "THĂNG LONG HOẠT TÍNH", sortOrder: 30, presentation: "STANDARD" as const,
    description: "Dòng Nệm Thăng Long Hoạt Tính trong catalog chính thức; các chỉ số cảm giác nằm đang chờ nguồn kỹ thuật xác nhận.",
    profile: ["Đang xác minh", null, null, null, null] as const, profileStatus: "PLACEHOLDER" as const,
    media: ["/images/products/hoat-tinh/catalog-v2.png", "/images/products/hoat-tinh/01.webp", "/images/products/hoat-tinh/02.webp", "/images/products/hoat-tinh/03.webp", "/images/products/hoat-tinh/04.webp"],
    facts: commonFacts("hoat-tinh"), contentBlocks: genericBlocks("Tham khảo theo nhu cầu và kích thước; thông tin phù hợp cụ thể được tư vấn viên xác nhận."),
    variants: variants("TL-HT", [[120,200,10,8900000,9900000,"TL-HT-12020010",8],[140,200,10,9700000,10800000,"TL-HT-14020010",10],[160,200,10,10500000,11700000,"TL-HT-16020010",12],[160,200,15,11300000,12600000,"TL-HT-16020015",8],[180,200,15,12100000,13500000,"TL-HT-18020015",5],[180,200,20,12900000,14400000,"TL-HT-18020020",3]]),
  },
  {
    slug: "memory-foam", name: "Nệm Thăng Long Memoryfoam", eyebrow: "THĂNG LONG MEMORYFOAM", sortOrder: 40, presentation: "STANDARD" as const,
    description: "Dòng Nệm Thăng Long Memoryfoam trong catalog chính thức; mô tả vật liệu chi tiết cần nguồn kỹ thuật bổ sung.",
    profile: ["Đang xác minh", null, null, null, null] as const, profileStatus: "PLACEHOLDER" as const,
    media: ["/images/products/memory-foam/catalog-v2.png", "/images/products/memory-foam/01.webp", "/images/products/memory-foam/02.webp", "/images/products/memory-foam/03.webp", "/images/products/memory-foam/04.webp"],
    facts: commonFacts("memory"), contentBlocks: genericBlocks("Tham khảo theo nhu cầu và kích thước; đội ngũ tư vấn sẽ xác nhận cấu hình phù hợp."),
    variants: variants("TL-MF", [[140,200,15,10900000,12200000,"TL-MF-14020015",8],[160,200,15,12100000,13500000,"TL-MF-16020015",10],[160,200,20,13300000,14800000,"TL-MF-16020020",6],[180,200,15,14500000,16200000,"TL-MF-18020015",5],[180,200,20,15900000,17700000,"TL-MF-18020020",4]]),
  },
  {
    slug: "khach-san", name: "Nệm Cao Su Cho Khách Sạn", eyebrow: "HOSPITALITY COLLECTION", sortOrder: 50, presentation: "STANDARD" as const,
    description: "Dòng nệm cao su cho khách sạn trong catalog chính thức; cần tư vấn trực tiếp để xác nhận cấu hình dự án.",
    profile: ["Đang xác minh", null, null, null, null] as const, profileStatus: "PLACEHOLDER" as const,
    media: ["/images/products/khach-san/catalog-v2.png", "/images/products/khach-san/01.webp", "/images/products/khach-san/02.webp", "/images/products/khach-san/03.webp", "/images/products/khach-san/04.webp"],
    facts: commonFacts("hotel"), contentBlocks: { ...genericBlocks("Dành cho nhu cầu trang bị khách sạn và dự án; số lượng, độ dày và tiến độ được xác nhận khi tư vấn."), DELIVERY: "Phí và thời gian giao hàng được xác nhận theo dự án." },
    variants: variants("TL-HS", [[140,200,15,18900000,21000000,"TL-HS-14020015",5],[160,200,15,20900000,23300000,"TL-HS-16020015",8],[160,200,20,22900000,25500000,"TL-HS-16020020",6],[180,200,15,24900000,27700000,"TL-HS-18020015",5],[180,200,20,26900000,29900000,"TL-HS-18020020",4]]),
  },
  {
    slug: "america", name: "Nệm Cao Su Thăng Long America", eyebrow: "THĂNG LONG AMERICA", sortOrder: 60, presentation: "STANDARD" as const,
    description: "Dòng Nệm Cao Su Thăng Long America trong catalog chính thức; thông số kỹ thuật chi tiết đang chờ xác minh.",
    profile: ["Đang xác minh", null, null, null, null] as const, profileStatus: "PLACEHOLDER" as const,
    media: ["/images/products/america/catalog-v2.png", "/images/products/america/01.webp", "/images/products/america/02.webp", "/images/products/america/03.webp", "/images/products/america/04.webp"],
    facts: commonFacts("america"), contentBlocks: genericBlocks("Tham khảo theo nhu cầu và kích thước; tư vấn viên sẽ xác nhận cấu hình phù hợp."),
    variants: variants("TL-AM", [[100,200,10,4900000,5500000,"TL-AM-10020010",12],[120,200,10,5500000,6200000,"TL-AM-12020010",15],[140,200,10,6100000,6800000,"TL-AM-14020010",10],[160,200,10,6700000,7500000,"TL-AM-16020010",8],[160,200,15,7300000,8100000,"TL-AM-16020015",6],[180,200,15,7900000,8800000,"TL-AM-18020015",5]]),
  },
] as const;

export const localPages = [
  { slug: "home", title: "Thăng Long", sections: [
    { key: "hero", type: "hero", payload: { eyebrow: "THĂNG LONG / SLEEP, CONSIDERED.", title: "Ngủ ngon hơn, mỗi ngày.", body: "Khám phá các dòng nệm Thăng Long và nhận tư vấn theo nhu cầu, kích thước phòng ngủ.", primaryCta: { label: "Tìm nệm phù hợp", href: "/tim-nem" }, secondaryCta: { label: "Khám phá sản phẩm", href: "/nem" } } },
    { key: "company", type: "company", payload: { name: "Công ty TNHH Nệm Thăng Long Việt Nam", taxCode: "0317564090", phone: "0987 068 277", email: "nemthanglong@gmail.com", address: "79 Đường số 11, Bình Hưng Hòa, TP.HCM" } },
  ] },
  { slug: "contact", title: "Liên hệ", sections: [{ key: "intro", type: "intro", payload: { eyebrow: "THĂNG LONG", title: "Liên hệ", body: "Công ty TNHH Nệm Thăng Long Việt Nam · hotline 0987 068 277 · nemthanglong@gmail.com." } }] },
  { slug: "hotel-project", title: "Khách sạn & dự án", sections: [{ key: "intro", type: "intro", payload: { eyebrow: "THĂNG LONG B2B", title: "Khách sạn & dự án", body: "Trao đổi cùng đội ngũ về nhu cầu trang bị không gian nghỉ ngơi." } }] },
  { slug: "chinh-sach", title: "Chính sách chất lượng", sections: [{ key: "quality", type: "policy", payload: { body: "Khách hàng kiểm tra sản phẩm khi nhận; điều kiện đổi trả và bảo hành áp dụng theo chính sách chất lượng công bố của nhà sản xuất. Phí và thời gian giao hàng được xác nhận khi tư vấn." } }] },
  { slug: "showrooms", title: "Hệ thống showroom & đại lý", sections: [{ key: "dealers", type: "dealers", payload: { body: "Danh sách showroom và đại lý được cập nhật theo trang đại lý chính thức. Vui lòng liên hệ hotline để xác nhận điểm gần nhất và thời gian phục vụ." } }] },
] as const;

export const localMenus = [
  { key: "header-mattress", label: "Nệm", items: localStorefrontProducts.map((product, sortOrder) => ({ id: `seed-menu-mattress-${product.slug}`, label: product.name.replace("Nệm Thăng Long ", "").replace("Nệm Cao Su ", ""), href: `/nem/${product.slug}`, sortOrder })) },
  { key: "header-primary", label: "Điều hướng chính", items: [{ id: "seed-menu-primary-need", label: "Theo nhu cầu", href: "/tim-nem", sortOrder: 10 },{ id: "seed-menu-primary-project", label: "Khách sạn & dự án", href: "/khach-san-du-an", sortOrder: 20 },{ id: "seed-menu-primary-about", label: "Về Thăng Long", href: "/ve-thang-long", sortOrder: 30 },{ id: "seed-menu-primary-blog", label: "Blog", href: "/kien-thuc-giac-ngu", sortOrder: 40 }] },
  { key: "footer-explore", label: "Khám phá", items: [{ id: "seed-menu-footer-products", label: "Sản phẩm", href: "/nem", sortOrder: 10 },{ id: "seed-menu-footer-finder", label: "Theo nhu cầu", href: "/tim-nem", sortOrder: 20 },{ id: "seed-menu-footer-blog", label: "Blog", href: "/kien-thuc-giac-ngu", sortOrder: 30 },{ id: "seed-menu-footer-about", label: "Về Thăng Long", href: "/ve-thang-long", sortOrder: 40 }] },
  { key: "footer-support", label: "Hỗ trợ", items: [{ id: "seed-menu-support-contact", label: "Liên hệ", href: "/lien-he", sortOrder: 10 },{ id: "seed-menu-support-project", label: "Khách sạn & dự án", href: "/khach-san-du-an", sortOrder: 20 },{ id: "seed-menu-support-policy", label: "Chính sách chất lượng", href: "/chinh-sach", sortOrder: 30 },{ id: "seed-menu-support-showrooms", label: "Showroom & đại lý", href: "/showrooms", sortOrder: 40 }] },
] as const;
