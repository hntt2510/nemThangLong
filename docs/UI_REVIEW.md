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

## 2. Nguyên Tắc Dữ Liệu & Hiển Thị Minh Họa

- **Thông số sản phẩm**: Mọi thông số kích thước, độ dày, giá bán và khả năng đặt hàng trực tuyến được quản lý theo cấu hình dữ liệu của hệ thống.
- **Ảnh minh họa & Dữ liệu chờ công bố**:
  - Các hình ảnh mẫu demo được gắn nhãn rõ ràng: `Ảnh minh họa` / `Minh họa`.
  - Các nội dung chi tiết chưa được phê duyệt chính thức (chính sách bảo hành từng dòng, chứng nhận, đối tác dự án) được ghi nhận ở trạng thái chờ cập nhật hoặc liên hệ tư vấn trực tiếp, không tự ý công bố các tuyên bố y khoa, số năm bảo hành hay số liệu chưa được kiểm chứng.

---

## 3. Danh Mục Các Tuyến Đường Storefront Cần Đánh Giá (Review Checklist)

| STT | Tuyến đường (Route) | Nội dung & Mục tiêu trải nghiệm cần review |
| :--- | :--- | :--- |
| **01** | `/` | **Trang chủ**: Hero banner, 4 trụ cột an tâm, danh mục 6 dòng nệm, Mattress Finder intro, Luxury signature editorial, khu vực giới thiệu chất liệu khi dữ liệu được công bố, phân loại theo nhu cầu, B2B teaser, form liên hệ tư vấn nhanh. |
| **02** | `/nem` | **Danh mục sản phẩm**: Bộ lọc đa chiều (dòng nệm, khoảng giá, chiều rộng, độ dày, tình trạng còn hàng, sắp xếp), lưới sản phẩm responsive. |
| **03** | `/nem/luxury` | **Dòng nệm Signature Luxury**: Hero gallery đa góc nhìn, cấu hình kích thước/độ dày, biểu đồ cảm giác nằm (Comfort Meter), khu vực câu chuyện vật liệu khi dữ liệu được công bố, sticky purchase bar trên mobile. |
| **04** | `/nem/america` | **Dòng nệm America**: Bố cục trang chi tiết sản phẩm chuẩn (Generic PDP), chọn kích thước, kiểm tra tình trạng còn hàng theo biến thể, danh sách cam kết. |
| **05** | `/nem/classic` | **Dòng nệm Classic**: Bố cục trang chi tiết sản phẩm, hình ảnh minh họa, khu vực đặt hàng / liên hệ tư vấn. |
| **06** | `/nem/hoat-tinh` | **Dòng nệm Hoạt Tính**: Bố cục trang chi tiết sản phẩm, khu vực giới thiệu đặc tính vật liệu khi dữ liệu được công bố, gợi ý sản phẩm liên quan. |
| **07** | `/nem/memory-foam` | **Dòng nệm Memory Foam**: Bố cục trang chi tiết sản phẩm, bộ chọn kích thước và độ dày, trạng thái hiển thị giá và đặt hàng. |
| **08** | `/nem/cao-su-thien-nhien` | **Dòng nệm Cao Su Thiên Nhiên**: Bố cục trang chi tiết sản phẩm, gallery ảnh, lựa chọn biến thể và khu vực câu chuyện chất liệu khi dữ liệu được công bố. |
| **09** | `/tim-nem` | **Công cụ Tìm nệm (Mattress Finder)**: Wizard 3 bước (Kích thước → Cảm giác & Ngân sách → Ưu tiên khi ngủ), hiển thị gợi ý chính & các lựa chọn tham khảo phù hợp. |
| **10** | `/so-sanh` | **Trang So sánh nệm**: Chọn các dòng nệm cần so sánh, bảng thông số ma trận trực quan với cột tiêu chí cố định khi cuộn trên thiết bị di động. |
| **11** | `/khach-san-du-an` | **Khách sạn & Dự án (B2B)**: Bố cục trang, giới thiệu quy trình hợp tác và form đăng ký nhận hồ sơ dự án & mẫu thử. |
| **12** | `/lien-he` | **Liên hệ & Tư vấn chuyên sâu**: Form gửi yêu cầu tư vấn (tiếp nhận thông tin sản phẩm quan tâm nếu chuyển tiếp từ PDP), thông tin hotline và email trực tiếp. |
| **13** | `/gio-hang` | **Giỏ hàng**: Danh sách biến thể đã chọn, thay đổi số lượng / xóa, tóm tắt tạm tính và chuyển bước thanh toán. |
| **14** | `/checkout` | **Thanh toán**: Form địa chỉ giao hàng, lựa chọn phương thức thanh toán (COD, Chuyển khoản ngân hàng, MoMo QR), bảng tóm tắt đơn hàng. |
| **15** | `/checkout/result` | **Kết quả đơn hàng**: Trạng thái đơn hàng, thông tin chuyển khoản ngân hàng (nếu chọn chuyển khoản), điều hướng quay lại mua sắm. |
| **16** | `/dang-nhap` | **Đăng nhập**: Giao diện đăng nhập tài khoản khách hàng chuẩn nhận diện thương hiệu. |
| **17** | `/dang-ky` | **Đăng ký**: Giao diện đăng ký tài khoản khách hàng mới. |
| **18** | `/tai-khoan` | **Tổng quan tài khoản**: Dashboard quản lý hồ sơ, truy cập nhanh đơn hàng, sổ địa chỉ và yêu cầu hỗ trợ sau mua. |
| **19** | `/tai-khoan/don-hang` | **Lịch sử đơn hàng**: Danh sách đơn hàng đã đặt, trạng thái đơn và xem chi tiết từng đơn hàng. |
| **20** | `/tai-khoan/dia-chi` | **Sổ địa chỉ**: Danh sách địa chỉ nhận hàng và form thêm địa chỉ mới. |
| **21** | `/tai-khoan/ho-tro` | **Hỗ trợ sau mua**: Gửi yêu cầu bảo hành, đổi trả và theo dõi tiến độ xử lý. |

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
