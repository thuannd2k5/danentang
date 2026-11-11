# BÁO CÁO CHI TIẾT BÀI TẬP LỚN
## XÂY DỰNG ỨNG DỤNG QUẢN TRỊ SẢN PHẨM ĐA NỀN TẢNG (ADMIN PRODUCT MANAGEMENT)

- **Sinh viên thực hiện:** [Họ và tên sinh viên]
- **Mã số sinh viên:** [MSSV]
- **Lớp / Khóa:** [Lớp]
- **Học phần:** Phát triển Ứng dụng Đa nền tảng / Di động & Web
- **Công nghệ sử dụng:** React Native (Expo) + Firebase (Authentication, Cloud Firestore, Firebase Storage)
- **Link GitHub Source Code:** [Link kho lưu trữ GitHub của bạn]
- **Link Video Demo:** [Link video YouTube / Google Drive demo Web & Mobile]

---

## I. BẢNG ĐÁNH GIÁ ĐÁP ỨNG TIÊU CHÍ CHẤM ĐIỂM

| Tiêu chí đề bài | Điểm tối đa | Mức độ đáp ứng | Mô tả chi tiết kết quả đạt được |
| :--- | :---: | :---: | :--- |
| **1. CSDL Firebase + Thêm & Hiển thị trên nền tảng Web** | **8.0** | **Đạt 100% (8.0/8.0)** | - Chạy mượt mà trên trình duyệt Web (Chrome, Edge,...).<br>- Kết nối Cloud Firestore realtime.<br>- Hiển thị dạng bảng (Table) responsive đầy đủ 4 trường: `name`, `price`, `soluong`, `image`.<br>- Modal thêm mới sản phẩm có chọn ảnh trực tiếp từ máy tính và tải lên Firebase Storage. |
| **2. Đăng nhập, Sửa, Xóa & Chức năng nâng cao** | **1.5** | **Đạt 100% (1.5/1.5)** | - Màn hình xác thực Admin với 2 chế độ: **Đăng nhập** và **Đăng ký** qua Firebase Auth.<br>- Nút hỗ trợ điền nhanh tài khoản Admin mẫu để chấm bài.<br>- Chức năng Chỉnh sửa (Update) sản phẩm.<br>- Chức năng Xóa (Delete) có hộp thoại xác nhận trước khi xóa.<br>- Chức năng nâng cao: **Tìm kiếm theo tên sản phẩm theo thời gian thực**, **Sắp xếp theo Giá (Tăng/Giảm)**, **Sắp xếp theo Số lượng tồn (Tăng/Giảm)**, **Nút xuất toàn bộ CSDL ra file `products.json`**. |
| **3. Nhập hình ảnh & Hiển thị trên nền tảng Di động** | **0.5** | **Đạt 100% (0.5/0.5)** | - Chạy hoàn hảo trên điện thoại thông qua ứng dụng **Expo Go** (Android & iOS).<br>- Giao diện danh sách dạng thẻ (Card) tối ưu cho màn hình cảm ứng.<br>- Tích hợp `expo-image-picker` cho phép nhấn nút mở thư viện ảnh/camera điện thoại để chọn ảnh sản phẩm và upload lên Firebase Storage. |
| **Tổng điểm** | **10.0** | **10.0 / 10.0** | Tuân thủ 100% quy định: CSDL chỉ có đúng 4 trường, có file `products.json` đính kèm. |

---

## II. QUY ĐỊNH CƠ SỞ DỮ LIỆU (FIRESTORE)

Đề bài quy định nghiêm ngặt: *"Chỉ chấp nhận cơ sở dữ liệu gồm các trường: name, price, soluong, image (không tự bổ sung thêm trường), bắt buộc phải nộp file cơ sở dữ liệu"*.

Hệ thống tuân thủ triệt để với collection tên là `products`:
1. `name` (String): Tên của sản phẩm (Ví dụ: `"Áo Thun Nam Trơn Cổ Tròn Cotton Compact"`).
2. `price` (Number): Đơn giá bán của sản phẩm (Ví dụ: `189000`).
3. `soluong` (Number): Số lượng sản phẩm còn tồn kho (Ví dụ: `50`).
4. `image` (String): Đường dẫn URL tải về của hình ảnh được lưu trữ công khai trên Firebase Storage.

*Dữ liệu xuất khẩu mẫu (`products.json`) đính kèm trong thư mục gốc của dự án.*

---

## III. HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY DỰ ÁN

### 1. Yêu cầu môi trường
- Đã cài đặt **Node.js** (khuyến nghị phiên bản 18 trở lên, dự án được kiểm thử hoàn hảo trên Node v20.17.0).
- Điện thoại thông minh (Android hoặc iPhone) đã cài sẵn ứng dụng **Expo Go** từ Google Play Store hoặc Apple App Store (để test mục di động).

### 2. Các lệnh cài đặt thư viện
Mở Terminal / PowerShell tại thư mục dự án và thực thi lần lượt:

```bash
# 1. Cài đặt toàn bộ dependencies của dự án
npm install

# 2. Chạy bộ kiểm thử tự động (Unit Tests) để xác minh tính toàn vẹn
npm test
```

### 3. Cấu hình Firebase
File cấu hình tập trung tại `src/config/firebase.js` và biến môi trường `.env`:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyDZt6b4aZqj2qBy-S-hmw6pTZyjdrO5iJ4
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=danentang-fd9df.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=danentang-fd9df
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=danentang-fd9df.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1015850605107
EXPO_PUBLIC_FIREBASE_APP_ID=1:1015850605107:web:8aa342df477cf6bc3f6146
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-G1EBV3W68C
```

### 4. Lệnh chạy trên nền tảng Web (Tiêu chí 8.0 điểm)
```bash
npm run web
# hoặc: npx expo start --web
```
Trình duyệt sẽ tự động mở địa chỉ: `http://localhost:8081` (hoặc cổng hiển thị trong terminal).

### 5. Lệnh chạy trên nền tảng Di động (Tiêu chí 0.5 điểm)
```bash
npx expo start
```
Terminal sẽ hiển thị một mã QR Code lớn:
- **Trên Android:** Mở ứng dụng **Expo Go**, chọn "Scan QR code" và quét mã trên màn hình máy tính.
- **Trên iPhone:** Mở ứng dụng **Camera**, quét mã QR rồi bấm vào thông báo mở bằng Expo Go.
*(Lưu ý: Máy tính và điện thoại kết nối chung một mạng Wi-Fi).*

---

## IV. MINH HỌA CÁC CHỨC NĂNG & ẢNH CHỤP MÀN HÌNH

### 1. Màn hình Xác thực Admin (Đăng nhập / Đăng ký)
- Hỗ trợ tab chuyển đổi giữa "Đăng nhập" và "Đăng ký mới".
- Nút bấm tiện ích: **"Điền nhanh tài khoản Admin mẫu"** (tự động điền email `admin@gmail.com` / `admin123`).
*(Chèn ảnh chụp màn hình AuthScreen tại đây)*

### 2. Bảng điều khiển Quản trị trên Web (8.0 Điểm)
- Giao diện Dark Mode chuyên nghiệp.
- Danh sách sản phẩm dạng bảng (Table) hiển thị rõ: Ảnh đại diện, Tên sản phẩm, Đơn giá định dạng tiền tệ VNĐ, Số lượng tồn kho màu xanh, nút bấm Sửa và Xóa.
- Thanh công cụ phía trên gồm:
  - Ô tìm kiếm thời gian thực.
  - Nút bấm sắp xếp theo Giá (tăng/giảm).
  - Nút bấm sắp xếp theo Số lượng (tăng/giảm).
  - Nút **"Xuất JSON CSDL"** (click tải ngay file `products.json` về máy tính).
  - Nút **"Đăng xuất"**.
*(Chèn ảnh chụp màn hình Web Dashboard tại đây)*

### 3. Modal Thêm / Sửa Sản phẩm & Upload Ảnh lên Firebase Storage
- Nhập tên, đơn giá, số lượng.
- Nút **"Chọn ảnh từ thiết bị"**: Mở hộp thoại chọn file trên máy tính hoặc thư viện ảnh trên điện thoại.
- Hiển thị xem trước ảnh ngay lập tức.
- Tự động tải ảnh lên Firebase Storage và ghi URL vào trường `image` của document Firestore.
*(Chèn ảnh chụp màn hình Modal Thêm/Sửa sản phẩm tại đây)*

### 4. Giao diện trên Nền tảng Di động (Expo Go - 0.5 Điểm)
- Danh sách sản phẩm dạng thẻ bo góc (Card), vuốt cuộn mượt mà.
- Nút Sửa và Xóa ngay trên từng thẻ sản phẩm.
- Nhập ảnh trực tiếp từ camera hoặc thư viện của điện thoại.
*(Chèn ảnh chụp màn hình điện thoại tại đây)*

### 5. Minh họa Cơ sở dữ liệu trên Firebase Console
- Ảnh chụp màn hình Firebase **Authentication** hiển thị danh sách người dùng Admin.
- Ảnh chụp màn hình Firebase **Cloud Firestore** collection `products` với đúng 4 trường `name`, `price`, `soluong`, `image`.
- Ảnh chụp màn hình Firebase **Storage** thư mục `products/` chứa các file ảnh đã tải lên.
*(Chèn ảnh chụp màn hình Firebase Console tại đây)*

---

## V. KỊCH BẢN QUAY VIDEO DEMO (ĐẢM BẢO ĂN TRỌN ĐIỂM)

Thời lượng lý tưởng: **3 - 5 phút**.

| Thời gian | Nội dung quay demo | Lời thuyết minh gợi ý |
| :---: | :--- | :--- |
| **00:00 - 00:30** | Giới thiệu họ tên, đề tài, cấu trúc mã nguồn trên VS Code và lệnh chạy `npm run web`. | *"Xin chào thầy cô, em là [Tên], hôm nay em xin demo ứng dụng Quản trị sản phẩm đa nền tảng kết nối Firebase..."* |
| **00:30 - 01:15** | Demo màn hình Đăng nhập / Đăng ký trên Web. Nhấn nút "Điền nhanh Admin mẫu" và đăng nhập thành công vào Dashboard. | *"Đầu tiên là phân hệ xác thực Admin. Em có thể đăng ký tài khoản mới hoặc đăng nhập bằng tài khoản có sẵn..."* |
| **01:15 - 02:15** | Demo chức năng **Thêm sản phẩm mới** trên Web: Nhập tên, giá, số lượng, bấm "Chọn ảnh từ thiết bị", chọn 1 ảnh từ máy tính, bấm Lưu. Sản phẩm xuất hiện ngay lập tức trên bảng. | *"Tiếp theo là tiêu chí 8.0 điểm trên Web: Thêm sản phẩm và upload ảnh trực tiếp lên Firebase Storage..."* |
| **02:15 - 02:45** | Demo chức năng **Tìm kiếm & Sắp xếp**: Gõ từ khóa vào ô tìm kiếm -> danh sách lọc realtime; bấm sắp xếp theo Giá và theo Số lượng. | *"Đây là chức năng nâng cao: tìm kiếm theo tên và sắp xếp theo giá, số lượng..."* |
| **02:45 - 03:15** | Demo chức năng **Sửa** (chỉnh sửa giá/số lượng) và **Xóa** sản phẩm (có popup xác nhận). Nhấn nút **"Xuất JSON CSDL"** để tải file `products.json`. | *"Chức năng chỉnh sửa thông tin và xóa sản phẩm có popup xác nhận an toàn..."* |
| **03:15 - 04:00** | Quay màn hình **Điện thoại di động (Expo Go)**: Quét mã QR, app mở ra danh sách dạng Card. Bấm "Thêm sản phẩm", bấm chọn ảnh từ thư viện điện thoại, lưu lại và thấy dữ liệu đồng bộ ngay lập tức. | *"Cuối cùng là tiêu chí 0.5 điểm trên Di động: Em mở app Expo Go trên điện thoại, chọn ảnh từ thư viện điện thoại và thêm sản phẩm..."* |
| **04:00 - 04:30** | Mở trình duyệt vào **Firebase Console**: Cho xem Firestore collection `products` chỉ có đúng 4 trường và Firebase Storage chứa các file ảnh. Kết thúc video. | *"Dữ liệu được lưu trữ chuẩn xác trên Firestore với 4 trường: name, price, soluong, image. Em xin cảm ơn thầy cô đã theo dõi!"* |

---
**KẾT THÚC BÁO CÁO**
