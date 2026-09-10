export const sleepJournalPosts = [
  {
    slug: "chon-kich-thuoc-nem-cho-phong-ngu",
    title: "Cách chọn kích thước nệm cho phòng ngủ",
    excerpt: "Bắt đầu từ diện tích phòng, số người sử dụng và khoảng trống cần thiết khi di chuyển.",
    image: "/images/products/cao-su-thien-nhien/catalog-v2.png",
    content: ["Đo phần diện tích dành cho giường trước khi chọn nệm. Hãy chừa lối đi xung quanh để phòng ngủ vẫn thông thoáng và dễ sử dụng.", "Nếu hai người cùng nằm, hãy ưu tiên chiều rộng đủ để mỗi người thay đổi tư thế thoải mái. Kiểm tra kích thước khung giường trước khi đặt mua."],
  },
  {
    slug: "ve-sinh-va-bao-quan-nem-tai-nha",
    title: "Vệ sinh và bảo quản nệm tại nhà",
    excerpt: "Một vài thói quen đơn giản giúp bề mặt nệm luôn sạch sẽ và dễ chịu khi sử dụng.",
    image: "/images/landing-care-v2.png",
    content: ["Dùng ga phủ phù hợp và vệ sinh ga định kỳ. Khi cần làm sạch bề mặt, hãy tham khảo hướng dẫn đi kèm sản phẩm trước khi sử dụng dung dịch chuyên dụng.", "Để phòng ngủ thông thoáng và tránh đặt nệm ở nơi ẩm kéo dài. Liên hệ đội ngũ tư vấn khi cần hướng dẫn theo từng dòng nệm."],
  },
  {
    slug: "khi-nao-nen-can-nhac-thay-nem",
    title: "Khi nào nên cân nhắc thay nệm?",
    excerpt: "Quan sát cảm giác nằm, bề mặt sử dụng và nhu cầu nghỉ ngơi thay đổi theo thời gian.",
    image: "/images/landing-finder-v2.png",
    content: ["Nếu cảm giác nằm không còn phù hợp với nhu cầu hiện tại, hãy thử lại các lựa chọn về độ êm, kích thước và chất liệu trước khi quyết định.", "Bạn có thể mang theo thông tin về không gian phòng và thói quen nằm để được tư vấn rõ hơn tại showroom hoặc qua kênh liên hệ."],
  },
] as const;

export function getSleepJournalPost(slug: string) {
  return sleepJournalPosts.find((post) => post.slug === slug) ?? null;
}
