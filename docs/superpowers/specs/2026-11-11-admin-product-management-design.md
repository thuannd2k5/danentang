# Bản thiết kế chi tiết: Ứng dụng Quản trị Sản phẩm Đa nền tảng (Admin Product Management)

**Ngày lập:** 2026-11-11  
**Công nghệ:** React Native (Expo) + Firebase (Cloud Firestore, Authentication, Storage)  
**Nền tảng mục tiêu:** Web (Trình duyệt) & Mobile (Điện thoại qua Expo Go)  

---

## 1. Mục tiêu và Bối cảnh (Intent & Why)

Dự án nhằm xây dựng một ứng dụng phân hệ Quản trị (Admin) để quản lý sản phẩm, đáp ứng toàn diện thang điểm và yêu cầu bài tập lớn:
- **Tiêu chí 1 (8.0 điểm):** Chạy trên nền tảng **Web**, kết nối CSDL Firebase để Thêm và Hiển thị sản phẩm gồm 4 trường dữ liệu (`name`, `price`, `soluong`, `image`).
- **Tiêu chí 2 (1.5 điểm):** Đăng nhập (Admin Authentication), Xóa, Sửa, và các chức năng nâng cao (Tìm kiếm theo tên, Sắp xếp theo giá/số lượng, Xuất CSDL).
- **Tiêu chí 3 (0.5 điểm):** Chạy trên nền tảng **Di động (Mobile)**, hỗ trợ nhập hình ảnh từ thiết bị (thư viện ảnh/camera) và hiển thị thông tin sản phẩm.
- **Sản phẩm bàn giao (Deliverables):**
  1. Mã nguồn GitHub hoàn chỉnh.
  2. File cơ sở dữ liệu `products.json` xuất từ Firestore.
  3. Tài liệu báo cáo (Word/Markdown/PDF) chi tiết các bước, lệnh cài thư viện, ảnh minh họa giao diện và ảnh chụp CSDL Firebase Console.
  4. Video demo vận hành trên Web và Mobile.

---

## 2. Mục tiêu, Giới hạn & Chống mục tiêu (Goals, Non-Goals, Anti-Goals)

### A. Goals
- **Chạy đa nền tảng từ một mã nguồn duy nhất:** Web (chạy qua `npx expo start --web`) và Mobile (chạy trên điện thoại thật qua app `Expo Go`).
- **Đúng chuẩn CSDL tuyệt đối:** Collection Firestore tên là `products`. Mỗi document **CHỈ CHỨA DUY NHẤT 4 TRƯỜNG**:
  - `name`: Tên sản phẩm (string).
  - `price`: Giá sản phẩm (number).
  - `soluong`: Số lượng tồn kho (number).
  - `image`: URL ảnh công khai lưu trữ trên Firebase Storage (string).
- **Authentication:** Màn hình đăng nhập quản trị viên (Admin Login) bằng Email & Mật khẩu qua Firebase Auth. Chưa đăng nhập thì không vào được trang quản trị.
- **Quản lý sản phẩm (CRUD):**
  - **Thêm:** Modal/Form nhập tên, giá, số lượng; nút bấm chọn ảnh từ thiết bị/điện thoại, xem trước ảnh (preview), tự động tải ảnh lên Firebase Storage và ghi bản ghi vào Firestore.
  - **Hiển thị:** Bảng dữ liệu responsive trên Web và danh sách thẻ (Cards) trực quan trên Mobile.
  - **Sửa:** Cho phép thay đổi thông tin hoặc chọn lại ảnh mới.
  - **Xóa:** Hộp thoại xác nhận trước khi xóa document khỏi Firestore.
- **Tính năng nâng cao (Advanced Features):**
  - Tìm kiếm thời gian thực (Real-time Search) theo `name`.
  - Sắp xếp (Sort) theo giá tăng/giảm hoặc số lượng tăng/giảm.
  - Bộ lọc trạng thái tồn kho (Còn hàng / Hết hàng).
  - Nút bấm **"Xuất CSDL JSON"** tải ngay file `products.json` chuẩn 4 trường để nộp bài.

### B. Non-Goals
- Không xây dựng các trường dữ liệu phụ (như `category`, `createdAt`, `description`, `updatedAt`,...) vì quy định đề bài ghi rõ: *"Chỉ chấp nhận cơ sở dữ liệu gồm các trường: name , price, soluong, image (không tự bổ sung thêm trường)"*.
- Không làm giỏ hàng hay thanh toán cho khách hàng (đây là phân hệ Admin quản trị nội bộ).
- Không build file cài đặt APK/IPA phức tạp (đề bài yêu cầu chạy trên di động, Expo Go đáp ứng 100% việc test và demo trực tiếp trên điện thoại).

### C. Anti-Goals
- Không nhúng ảnh dạng base64 dung lượng lớn vào Firestore vì làm chậm hệ thống và sai quy cách lưu trữ; bắt buộc dùng Firebase Storage để lấy URL.
- Quản lý cấu hình Firebase linh hoạt: Sử dụng file cấu hình `src/config/firebase.js` kết hợp đọc từ biến môi trường `.env`. Sẽ tạo sẵn file `.env.example` và kèm thông tin cấu hình trong tài liệu báo cáo để người chấm clone repo về là chạy được ngay.

---

## 3. Kiến trúc Hệ thống & Luồng Dữ liệu (Architecture & Data Flow)

### 3.1. Sơ đồ luồng hoạt động
```
[User trên Web / Mobile]
       │
       ▼
[Màn hình Đăng nhập] ──(Firebase Auth)──► [Xác thực Email/Pass]
       │
       ▼ (Thành công)
[Admin Dashboard]
   ├── Thanh công cụ: Tìm kiếm, Bộ lọc sắp xếp, Nút Thêm mới, Nút Xuất JSON, Đăng xuất
   ├── Danh sách Sản phẩm:
   │     ├── Web: Bảng dữ liệu (Table) có ảnh đại diện, giá định dạng VNĐ, số lượng
   │     └── Mobile: Danh sách dạng thẻ (Card) tối ưu thao tác cảm ứng
   └── Modal Thêm / Sửa:
         ├── Nhập: name, price, soluong
         ├── Nút: [Chọn ảnh từ thiết bị] (expo-image-picker)
         │       └── Tải file lên Firebase Storage ──► Trả về Download URL
         └── Lưu vào Firestore `products` collection
```

### 3.2. Cấu trúc Thư mục Dự án Dự kiến
```
dnt/
├── assets/                  # Icons, splash screen, ảnh mẫu
├── docs/                    # Tài liệu báo cáo, kịch bản video demo, hướng dẫn cài đặt
│   └── superpowers/specs/   # Bản thiết kế chi tiết
├── src/
│   ├── config/
│   │   └── firebase.js      # Khởi tạo Firebase App, Auth, Firestore, Storage
│   ├── context/
│   │   └── AuthContext.js   # Quản lý trạng thái đăng nhập của Admin
│   ├── services/
│   │   ├── authService.js   # Đăng nhập, đăng xuất Firebase Auth
│   │   ├── productService.js# CRUD Firestore, tìm kiếm, lọc
│   │   └── storageService.js# Upload ảnh lên Firebase Storage lấy URL
│   ├── components/
│   │   ├── ProductCard.js   # Hiển thị sản phẩm dạng thẻ trên Mobile
│   │   ├── ProductTable.js  # Hiển thị sản phẩm dạng bảng trên Web
│   │   ├── ProductModal.js  # Form thêm/sửa sản phẩm và chọn ảnh
│   │   └── SearchBar.js     # Thanh tìm kiếm và bộ lọc sắp xếp
│   └── screens/
│       ├── LoginScreen.js   # Màn hình đăng nhập Admin
│       └── DashboardScreen.js # Màn hình quản trị chính
├── App.js                   # Điểm khởi đầu ứng dụng, phân luồng điều hướng
├── app.json                 # Cấu hình Expo (tên app, biểu tượng, quyền truy cập camera/ảnh)
└── package.json             # Danh sách dependencies
```

---

## 4. Đặc tả Chi tiết các Chức năng (Functional Specifications)

### 4.1. Màn hình Đăng nhập & Đăng ký (AuthScreen)
- Gồm 2 tab chuyển đổi linh hoạt: **Đăng nhập** và **Đăng ký** (giúp thầy cô chấm bài có thể tự tạo tài khoản mới để kiểm tra, hoặc dùng tài khoản admin mẫu có sẵn).
- Form gồm: Ô nhập Email, ô nhập Mật khẩu, nút bấm thực thi ("Đăng nhập" hoặc "Đăng ký tài khoản mới").
- Kiểm tra tính hợp lệ: Email đúng định dạng, mật khẩu tối thiểu 6 ký tự.
- Xử lý lỗi Firebase Auth: Thông báo rõ ràng (Sai mật khẩu, Email đã tồn tại, Lỗi kết nối).
- Khi đăng nhập/đăng ký thành công: Tự động lưu phiên đăng nhập và chuyển vào `DashboardScreen`.
- Có sẵn nút "Điền nhanh tài khoản Admin mẫu" để chấm bài nhanh không cần gõ.

### 4.2. Màn hình Quản trị (DashboardScreen)
- **Header:**
  - Tiêu đề hệ thống "Admin Product Management".
  - Hiển thị email quản trị viên đang đăng nhập.
  - Nút **"Xuất JSON CSDL"**: Xuất file `products.json` chứa danh sách hiện tại của Firestore để nộp bài.
  - Nút **"Đăng xuất"**.
- **Action Bar (Thanh công cụ):**
  - Ô tìm kiếm: Tìm kiếm theo tên sản phẩm (`name`) với cơ chế lọc realtime hoặc sau khi gõ.
  - Bộ chọn sắp xếp: Sắp xếp theo Giá (Tăng dần/Giảm dần), Số lượng (Tăng dần/Giảm dần).
  - Nút **"Thêm sản phẩm mới"** (+): Mở modal nhập sản phẩm.
- **Danh sách sản phẩm:**
  - Tự động nhận diện nền tảng:
    - Nếu là **Web**: Hiển thị bảng dạng lưới (Table) chuyên nghiệp, gồm các cột: Ảnh preview, Tên sản phẩm, Đơn giá (định dạng `x.xxx.xxx đ`), Số lượng tồn, Thao tác (Sửa / Xóa).
    - Nếu là **Mobile**: Hiển thị danh sách cuộn mượt mà (FlatList), mỗi item là 1 thẻ Card bo góc gồm ảnh lớn bên trái, thông tin bên phải và nút bấm thao tác nhanh.
  - Khi danh sách trống: Hiển thị minh họa "Chưa có sản phẩm nào, hãy thêm sản phẩm đầu tiên".

### 4.3. Modal Thêm / Sửa Sản phẩm (ProductModal)
- Form nhập gồm:
  1. `name`: Tên sản phẩm (Bắt buộc).
  2. `price`: Giá bán (Bắt buộc, số dương).
  3. `soluong`: Số lượng (Bắt buộc, số nguyên không âm).
  4. `image`: Khung chọn ảnh:
     - Nút bấm **"Chọn ảnh từ thiết bị"** (trên máy tính mở File Explorer, trên điện thoại mở Photo Library/Camera thông qua `expo-image-picker`).
     - Hiển thị ảnh xem trước (Preview) ngay sau khi chọn.
     - Thanh tiến trình tải ảnh (Loading indicator) khi đang upload lên Firebase Storage.
- Nút **"Lưu sản phẩm"**:
  - Khi tạo mới: Gọi `storageService.uploadImage()` để lấy URL -> Gọi `productService.addProduct({ name, price, soluong, image })`.
  - Khi sửa: Nếu người dùng không chọn ảnh mới thì giữ nguyên URL ảnh cũ; nếu chọn ảnh mới thì upload ảnh mới và cập nhật bản ghi.

### 4.4. Chức năng Xóa Sản phẩm
- Bấm nút "Xóa": Hiển thị Dialog / Alert xác nhận ("Bạn có chắc chắn muốn xóa sản phẩm [Tên sản phẩm] không?").
- Nếu đồng ý: Xóa document khỏi Firestore và cập nhật lại giao diện ngay lập tức.

### 4.5. Xuất dữ liệu CSDL (Export JSON)
- Một hàm tiện ích đọc toàn bộ collection `products` và tạo file `products.json` chuẩn định dạng mảng JSON:
```json
[
  {
    "name": "Áo Thun Nam Cotton",
    "price": 250000,
    "soluong": 50,
    "image": "https://firebasestorage.googleapis.com/..."
  }
]
```
- Trên Web: Trình duyệt tự động tải xuống file `products.json`.
- Trên Mobile: Hiển thị thông báo hoặc chia sẻ file qua hộp thoại chia sẻ của điện thoại.

---

## 5. Quy trình Chấm điểm & Bàn giao Sản phẩm (Deliverables & Scoring Plan)

1. **Chấm điểm Web (8.0 điểm):**
   - Chạy lệnh: `npx expo start --web`
   - Kiểm tra mở trên Chrome, hiển thị đầy đủ danh sách, thêm sản phẩm thành công, ảnh load mượt từ Storage, dữ liệu lưu vào Firestore.
2. **Chấm điểm Nâng cao & Auth (1.5 điểm):**
   - Đăng nhập tài khoản Admin, đăng xuất.
   - Thử nghiệm sửa thông tin, xóa sản phẩm.
   - Thử tìm kiếm theo tên và sắp xếp theo giá / số lượng.
3. **Chấm điểm Mobile (0.5 điểm):**
   - Chạy `npx expo start`, mở app **Expo Go** trên điện thoại quét mã QR.
   - Nhấn "Thêm sản phẩm", nhấn "Chọn ảnh từ thiết bị", chọn một ảnh từ thư viện điện thoại, nhập tên/giá/số lượng và bấm lưu.
4. **File Báo cáo & Nộp bài:**
   - Tạo sẵn tài liệu hướng dẫn chi tiết từng bước: các lệnh cài đặt `npm install`, cách cấu hình Firebase, ảnh chụp giao diện từng màn hình, ảnh chụp Firestore Database và Storage, hướng dẫn quay video demo.
   - Chuẩn bị file `products.json` đính kèm.
   - Hướng dẫn push toàn bộ code lên GitHub.

---

## 6. Quyết định Kỹ thuật để người thực hiện tự quyết (Left to Builder)
- Bộ màu sắc chủ đạo của giao diện: Phong cách hiện đại (Indigo/Blue hoặc Slate/Teal).
- Phiên bản Expo SDK: Sử dụng phiên bản ổn định mới nhất (Expo SDK 51/52) tương thích với Node.js v20.
- Phương pháp điều hướng: Phân chia màn hình đơn giản và ổn định qua State hoặc React Navigation / Expo Router.
