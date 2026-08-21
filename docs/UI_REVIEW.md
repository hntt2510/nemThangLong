# Hướng Dẫn & Danh Mục Review Giao Diện Khách Hàng — Nệm Thăng Long (V1)

Tài liệu này phục vụ đợt đánh giá giao diện (**UI Freeze — Customer Review Candidate V1**) dành cho đối tác và khách hàng duyệt giao diện storefront trước khi tiếp tục các giai đoạn mở rộng tính năng nghiệp vụ.

---

## 1. Định Hướng Thiết Kế & Nhận Diện Thương Hiệu

- **Định vị thương hiệu**: Thương hiệu nệm Việt Nam hiện đại, chỉn chu, ấm áp, đáng tin cậy. Cao cấp nhưng gần gũi, không quá xa hoa hào nhoáng, không mang cảm giác chợ giảm giá.
- **Bảng màu chủ đạo (Core Palette)**:
  - **Warm Ivory (`#F5F2EB`)**: Nền chủ đạo tạo cảm giác thư thái, ấm cúng.
  - **Charcoal (`#20221F`)**: Màu chữ chính sắc nét, tương phản dịu mắt.
  - **Forest Green (`#29483C` / `#213B31`)**: Điểm nhấn thương hiệu cho nút bấm chính và các khối thương hiệu.
  - **Warm Camel / Gold (`#B79062`)**: Điểm nhấn phụ, số thứ tự, đường dẫn và các chi tiết viền tinh tế.
  - **Luxury Dark (`#191B19` / `#222522`)**: Phông nền cho dòng sản phẩm Signature Luxury và trải nghiệm Mattress Lab.
- **Hệ thống Font chữ (Typography)**:
  - Tiêu đề & Heading: **Lora** (Serif thanh lịch, trang nhã).
  - Nội dung & Thao tác (UI / Body): **Be Vietnam Pro** (Sans-serif hiện đại, tối ưu hiển thị tiếng Việt).

---

## 2. Nguyên Tắc Dữ Liệu & Bản Quyền Nội Dung

- **Minh bạch thông số**: Mọi thông số kích thước, độ dày, giá bán và khả năng mua hàng trực tuyến đều được liên kết trực tiếp từ hệ thống quản trị (CMS).
- **Ảnh minh họa & Dữ liệu chờ xác nhận**:
  - Các hình ảnh mẫu demo được gắn nhãn rõ ràng: `Ảnh minh họa` / `Minh họa`.
  - Các thông tin chưa được phê duyệt chính thức (chính sách bảo hành từng dòng, chứng nhận quốc tế, số lượng đối tác khách sạn) được ghi rõ `Đang cập nhật từ CMS` hoặc `Liên hệ tư vấn`, tuyệt đối không đưa ra các tuyên bố y khoa hoặc số liệu chưa kiểm chứng.

---

## 3. Danh Mục Các Trang Trọng Tâm Cần Đánh Giá (Review Checklist)

| STT | Tuyến đường (Route) | Nội dung & Mục tiêu trải nghiệm |
| :--- | :--- | :--- |
| **01** | [`/`](file:///D:/HOCTAP/latvat/nemThangLong/app/page.tsx) | **Trang chủ**: Hero banner, 4 trụ cột an tâm, danh mục 6 dòng nệm, Mattress Finder intro, Luxury signature, Latex story, Phân loại theo nhu cầu, B2B teaser, Tư vấn nhanh. |
| **02** | [`/nem`](file:///D:/HOCTAP/latvat/nemThangLong/app/nem/page.tsx) | **Danh mục sản phẩm**: Bộ lọc đa chiều (dòng nệm, khoảng giá, chiều rộng, độ dày, tình trạng tồn kho, sắp xếp), lưới sản phẩm responsive. |
| **03** | [`/nem/luxury`](file:///D:/HOCTAP/latvat/nemThangLong/app/nem/luxury/page.tsx) | **Dòng nệm Signature Luxury**: Hero gallery đa góc nhìn, cấu hình kích thước/độ dày, biểu đồ cảm giác nằm (Comfort Meter), câu chuyện vật liệu, sticky purchase bar trên mobile. |
| **04** | [`/nem/america`](file:///D:/HOCTAP/latvat/nemThangLong/app/nem/america/page.tsx) | **Dòng nệm America**: Trang chi tiết sản phẩm chuẩn (Generic PDP), chọn kích thước, kiểm tra tồn kho theo biến thể, danh sách cam kết. |
| **05** | [`/nem/classic`](file:///D:/HOCTAP/latvat/nemThangLong/app/nem/classic/page.tsx) | **Dòng nệm Classic**: Bố cục chuẩn, hình ảnh minh họa rõ ràng, khối đặt hàng / liên hệ tư vấn. |
| **06** | [`/nem/hoat-tinh`](file:///D:/HOCTAP/latvat/nemThangLong/app/nem/hoat-tinh/page.tsx) | **Dòng nệm Hoạt Tính**: Bố cục chuẩn, câu chuyện vật liệu than hoạt tính, gợi ý sản phẩm liên quan. |
| **07** | [`/nem/memory-foam`](file:///D:/HOCTAP/latvat/nemThangLong/app/nem/memory-foam/page.tsx) | **Dòng nệm Memory Foam**: Trải nghiệm nâng đỡ, bộ chọn biến thể mượt mà. |
| **08** | [`/nem/cao-su-thien-nhien`](file:///D:/HOCTAP/latvat/nemThangLong/app/nem/cao-su-thien-nhien/page.tsx) | **Dòng nệm Cao Su Thiên Nhiên**: Khám phá nguồn gốc tự nhiên, độ bền và thông số kỹ thuật. |
| **09** | [`/tim-nem`](file:///D:/HOCTAP/latvat/nemThangLong/app/tim-nem/page.tsx) | **Công cụ Tìm nệm (Mattress Finder)**: Wizard 3 bước (Kích thước → Cảm giác & Ngân sách → Ưu tiên khi ngủ), hiển thị gợi ý chính & các lựa chọn tham khảo phù hợp. |
| **10** | [`/so-sanh`](file:///D:/HOCTAP/latvat/nemThangLong/app/so-sanh/page.tsx) | **Trang So sánh nệm**: Chọn các dòng nệm cần so sánh, bảng thông số ma trận trực quan với cột tiêu chí cố định (sticky). |
| **11** | [`/khach-san-du-an`](file:///D:/HOCTAP/latvat/nemThangLong/app/khach-san-du-an/page.tsx) | **Khách sạn & Dự án (B2B)**: Quy trình 3 bước hợp tác, checklist năng lực cung ứng, form đăng ký nhận hồ sơ dự án & mẫu thử. |
| **12** | [`/lien-he`](file:///D:/HOCTAP/latvat/nemThangLong/app/lien-he/page.tsx) | **Liên hệ & Tư vấn chuyên sâu**: Form gửi yêu cầu tư vấn (kèm thông tin sản phẩm quan tâm nếu chuyển tiếp từ PDP), thông tin hotline/email trực tiếp. |
| **13** | [`/gio-hang`](file:///D:/HOCTAP/latvat/nemThangLong/app/gio-hang/page.tsx) | **Giỏ hàng**: Danh sách biến thể đã chọn, thay đổi số lượng / xóa, tóm tắt tạm tính và chuyển bước thanh toán. |
| **14** | [`/checkout`](file:///D:/HOCTAP/latvat/nemThangLong/app/checkout/page.tsx) | **Thanh toán**: Form địa chỉ giao hàng, lựa chọn phương thức thanh toán (COD, Chuyển khoản ngân hàng, MoMo QR), bảng tóm tắt đơn hàng. |
| **15** | [`/checkout/result`](file:///D:/HOCTAP/latvat/nemThangLong/app/checkout/result/page.tsx) | **Kết quả đơn hàng**: Trạng thái đơn hàng, thông tin chuyển khoản ngân hàng (nếu chọn chuyển khoản), điều hướng quay lại mua sắm. |
| **16** | [`/dang-nhap`](file:///D:/HOCTAP/latvat/nemThangLong/app/dang-nhap/page.tsx) & [`/dang-ky`](file:///D:/HOCTAP/latvat/nemThangLong/app/dang-ky/page.tsx) | **Đăng nhập & Đăng ký**: Giao diện đăng nhập tài khoản khách hàng chuẩn tone thương hiệu. |
| **17** | [`/tai-khoan`](file:///D:/HOCTAP/latvat/nemThangLong/app/tai-khoan/page.tsx) | **Khu vực tài khoản khách hàng**: Dashboard hồ sơ cá nhân, lịch sử đơn hàng ([`/tai-khoan/don-hang`](file:///D:/HOCTAP/latvat/nemThangLong/app/tai-khoan/don-hang/page.tsx)), sổ địa chỉ ([`/tai-khoan/dia-chi`](file:///D:/HOCTAP/latvat/nemThangLong/app/tai-khoan/dia-chi/page.tsx)), gửi yêu cầu bảo hành ([`/tai-khoan/ho-tro`](file:///D:/HOCTAP/latvat/nemThangLong/app/tai-khoan/ho-tro/page.tsx)). |

---

## 4. Hướng Dẫn Phân Loại Góp Ý (Feedback Classification)

Khi gửi phản hồi hoặc yêu cầu điều chỉnh, quý khách hàng vui lòng phân loại theo 4 nhóm sau để đội ngũ kỹ thuật xử lý nhanh chóng và chính xác:

- **Loại A — Visual (Giao diện & Mỹ thuật)**:
  - Màu sắc, khoảng cách lề (padding/margin), kích thước chữ (font size), độ tương phản trên các màn hình di động / máy tính bảng / máy tính bàn.
- **Loại B — Content (Nội dung & Bản quyền chữ viết)**:
  - Câu chữ tiêu đề, mô tả dòng nệm, thông điệp tư vấn, nhãn điều hướng tiếng Việt.
- **Loại C — Business rule (Quy tắc nghiệp vụ & Bán hàng)**:
  - Chính sách phí vận chuyển, các bước thanh toán, thời hạn giữ hàng chuyển khoản ngân hàng, quy tắc so sánh hoặc lọc sản phẩm.
- **Loại D — Missing asset (Hình ảnh / Video thực tế)**:
  - Bổ sung ảnh chụp thực tế sản phẩm hoàn thiện tại xưởng, ảnh chất liệu chi tiết thay thế cho các nhãn `Ảnh minh họa`.
