# Kế hoạch Triển khai Ứng dụng Quản trị Sản phẩm Đa nền tảng (Admin Product Management)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng ứng dụng phân hệ Admin quản lý sản phẩm bằng React Native (Expo) và Firebase (Auth, Firestore, Storage) chạy đa nền tảng (Web & Mobile), đáp ứng chuẩn CSDL 4 trường dữ liệu và toàn bộ tiêu chí chấm điểm 10/10 của đề bài.

**Architecture:** Sử dụng kiến trúc tách lớp rõ ràng (Services, Context, Screens, Components). Client gọi trực tiếp Firebase Web SDK v10 (Auth, Firestore, Storage). Tự động thích ứng giao diện theo nền tảng (Bảng dữ liệu trên Web, Danh sách Thẻ trên Mobile).

**Tech Stack:** React Native (Expo SDK 51/52), Firebase JS SDK v10, Expo Image Picker, Jest (Unit Testing).

**Spec:** [`docs/superpowers/specs/2026-11-11-admin-product-management-design.md`](file:///d:/LearnCode/videcode/dnt/docs/superpowers/specs/2026-11-11-admin-product-management-design.md)

---

## Global Constraints

- **Cơ sở dữ liệu Firestore:** Collection `products`. Mỗi document **CHỈ ĐƯỢC PHÉP CHỨA 4 TRƯỜNG**: `name` (string), `price` (number), `soluong` (number), `image` (string). Tuyệt đối không thêm trường khác.
- **Nền tảng hỗ trợ:** Web (chạy qua Chrome/Edge) và Mobile (chạy qua Expo Go trên iOS/Android).
- **Phân hệ Admin:** Có màn hình Đăng nhập/Đăng ký qua Firebase Authentication; chỉ khi đã xác thực mới vào Dashboard.
- **Thao tác Ảnh:** Chọn ảnh trực tiếp từ thiết bị (Image Picker) và upload lên Firebase Storage lấy link URL lưu vào trường `image`.
- **Sản phẩm nộp bài:** Mã nguồn GitHub, file `products.json`, file báo cáo chi tiết các bước, ảnh chụp CSDL và hướng dẫn demo.

---

## Review Focus

1. **Rò rỉ trường dữ liệu vào Firestore:** Bất kỳ hàm tạo/cập nhật nào cũng phải lọc qua hàm chuẩn hóa `sanitizeProduct()`, đảm bảo chỉ có đúng 4 keys `name, price, soluong, image` được lưu vào database.
2. **Giá trị số không hợp lệ:** Người dùng nhập chuỗi, số âm hoặc để trống ở trường `price` hoặc `soluong` -> phải báo lỗi validation rõ ràng trước khi submit.
3. **Huỷ hoặc lỗi khi chọn ảnh:** Người dùng mở trình chọn ảnh nhưng nhấn Huỷ (Cancel) hoặc tải ảnh thất bại -> hệ thống xử lý êm đẹp, không crash và không tạo bản ghi rác.
4. **Hiển thị đa nền tảng (Web vs Mobile):** Đảm bảo trên Web hiển thị bảng chuẩn có phân cột, trên Mobile hiển thị dạng thẻ danh sách tối ưu cảm ứng mà không vỡ layout.
5. **Định dạng xuất file JSON:** File `products.json` tải về phải là mảng các đối tượng chứa đúng 4 trường theo đúng yêu cầu đề bài.

---

## Danh sách Công việc (Tasks)

### Task 1: Khởi tạo Dự án Expo & Cấu hình Môi trường

**Files:**
- Create: `package.json`, `app.json`, `babel.config.js`, `metro.config.js` (hoặc khởi tạo qua Expo CLI)
- Create: `.env.example`, `.env`, `.gitignore`
- Test: `tests/setup.test.js`

**Interfaces:**
- Produces: Môi trường chạy Expo đa nền tảng (Web & Mobile) cùng cấu hình Jest cho kiểm thử.

- [ ] **Step 1: Viết test kiểm tra cấu hình ban đầu**

Tạo `tests/setup.test.js`:
```javascript
describe('Environment Setup', () => {
  it('should verify project configuration files exist', () => {
    const fs = require('fs');
    expect(fs.existsSync('./package.json')).toBe(true);
    expect(fs.existsSync('./app.json')).toBe(true);
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run: `npx jest tests/setup.test.js`  
Expected: FAIL (chưa có file cấu hình).

- [ ] **Step 3: Khởi tạo Expo project và cài đặt dependencies**

Chạy lệnh tạo project với Expo (SDK mới nhất tương thích Node 20), cài đặt các thư viện:
- `firebase`
- `expo-image-picker`
- `@react-native-async-storage/async-storage`
- `jest`, `jest-expo` (dev dependencies)
Tạo `.env.example` và `.gitignore` loại trừ `node_modules` và `.env`.

- [ ] **Step 4: Chạy test xác nhận PASS**

Run: `npx jest tests/setup.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json app.json babel.config.js .gitignore .env.example tests/setup.test.js
git commit -m "chore: scaffold expo project with dependencies and test setup"
```

---

### Task 2: Cấu hình Firebase & Dịch vụ Xác thực (Authentication Service)

**Files:**
- Create: `src/config/firebase.js`
- Create: `src/services/authService.js`
- Test: `tests/authService.test.js`

**Interfaces:**
- Consumes: Biến môi trường hoặc object cấu hình Firebase.
- Produces: 
  - `auth`, `db`, `storage` từ `src/config/firebase.js`.
  - `loginAdmin(email, password) -> Promise<User>`
  - `registerAdmin(email, password) -> Promise<User>`
  - `logoutAdmin() -> Promise<void>`
  - `onAuthState(callback) -> Unsubscribe`

- [ ] **Step 1: Viết test cho `authService` (Validation & State Handling)**

Tạo `tests/authService.test.js`:
```javascript
const { validateAuthInput } = require('../src/services/authService');

describe('authService validation', () => {
  it('should reject invalid email or short password', () => {
    expect(validateAuthInput('', '123456').isValid).toBe(false);
    expect(validateAuthInput('test@example.com', '123').isValid).toBe(false);
  });

  it('should accept valid email and password >= 6 chars', () => {
    expect(validateAuthInput('admin@example.com', '123456').isValid).toBe(true);
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run: `npx jest tests/authService.test.js`  
Expected: FAIL (`validateAuthInput` chưa tồn tại).

- [ ] **Step 3: Hiện thực `firebase.js` và `authService.js`**

- `src/config/firebase.js`: Khởi tạo Firebase App với cấu hình fallback/môi trường an toàn. Khởi tạo `getAuth`, `getFirestore`, `getStorage`.
- `src/services/authService.js`:
  - Hàm `validateAuthInput(email, password)`: Kiểm tra định dạng email và mật khẩu độ dài >= 6.
  - Các hàm gọi Firebase Auth: `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signOut`, `onAuthStateChanged`.

- [ ] **Step 4: Chạy test để xác nhận PASS**

Run: `npx jest tests/authService.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/config/firebase.js src/services/authService.js tests/authService.test.js
git commit -m "feat: implement firebase init and authService with validation"
```

---

### Task 3: Dịch vụ Sản phẩm (Product Service) & Ràng buộc Nghiêm ngặt 4 Trường

**Files:**
- Create: `src/services/productService.js`
- Test: `tests/productService.test.js`

**Interfaces:**
- Produces:
  - `sanitizeProduct(data) -> { name, price, soluong, image }`: Lọc bỏ triệt để mọi trường dư thừa.
  - `validateProduct(product) -> { isValid: boolean, error: string | null }`
  - `addProduct(productData) -> Promise<string>`
  - `getProducts() -> Promise<Array>`
  - `updateProduct(id, productData) -> Promise<void>`
  - `deleteProduct(id) -> Promise<void>`
  - `filterAndSortProducts(products, { keyword, sortBy, sortOrder }) -> Array`
  - `exportProductsToJSONString(products) -> string`

- [ ] **Step 1: Viết test cho `productService`**

Tạo `tests/productService.test.js`:
Kiểm tra:
1. `sanitizeProduct` loại bỏ trường ngoài `name, price, soluong, image` (Review Focus 1).
2. `validateProduct` từ chối giá âm, số lượng âm hoặc tên rỗng (Review Focus 2).
3. `filterAndSortProducts` tìm đúng theo tên và sắp xếp đúng thứ tự giá / số lượng.
4. `exportProductsToJSONString` xuất đúng JSON chỉ có 4 trường chuẩn (Review Focus 5).

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run: `npx jest tests/productService.test.js`  
Expected: FAIL.

- [ ] **Step 3: Hiện thực `src/services/productService.js`**

- Hàm `sanitizeProduct(raw)`:
  ```javascript
  return {
    name: String(raw.name || '').trim(),
    price: Number(raw.price) || 0,
    soluong: Number(raw.soluong) || 0,
    image: String(raw.image || '').trim(),
  };
  ```
- Hàm `validateProduct(product)`: Kiểm tra bắt buộc có tên, `price >= 0`, `soluong >= 0` và có link `image`.
- Các hàm Firestore CRUD: `addDoc`, `getDocs`, `updateDoc`, `deleteDoc` trên collection `products`.
- Hàm `filterAndSortProducts(list, options)`: Lọc theo `keyword` (so sánh không dấu/chữ thường) và sắp xếp linh hoạt.
- Hàm `exportProductsToJSONString(products)`: Format JSON mảng 4 trường thụt lề 2 spaces.

- [ ] **Step 4: Chạy test để xác nhận PASS**

Run: `npx jest tests/productService.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/productService.js tests/productService.test.js
git commit -m "feat: implement productService with strict 4-field schema enforcement and filter/export"
```

---

### Task 4: Dịch vụ Xử lý Ảnh (Storage Service)

**Files:**
- Create: `src/services/storageService.js`
- Test: `tests/storageService.test.js`

**Interfaces:**
- Produces:
  - `pickImageFromDevice() -> Promise<string | null>`: Mở trình chọn ảnh từ thư viện/máy, trả về URI hoặc null nếu huỷ.
  - `uploadProductImage(uri) -> Promise<string>`: Upload file/blob lên Firebase Storage thư mục `products/` và trả về Download URL.

- [ ] **Step 1: Viết test cho `storageService` logic kiểm tra URI và tạo tên file**

Tạo `tests/storageService.test.js`:
Kiểm tra hàm tạo đường dẫn file lưu trữ duy nhất (`generateStoragePath(extension)`).

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run: `npx jest tests/storageService.test.js`  
Expected: FAIL.

- [ ] **Step 3: Hiện thực `src/services/storageService.js`**

Sử dụng `expo-image-picker`:
- Cấu hình quyền truy cập (permissions) thư viện ảnh.
- Hàm `pickImageFromDevice()`: Gọi `ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 })`. Xử lý an toàn nếu người dùng huỷ (Review Focus 3).
- Hàm `uploadProductImage(uri)`: Chuyển URI thành Blob và dùng `uploadBytes` + `getDownloadURL` của Firebase Storage.

- [ ] **Step 4: Chạy test để xác nhận PASS**

Run: `npx jest tests/storageService.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/storageService.js tests/storageService.test.js
git commit -m "feat: implement storageService for cross-platform image picking and firebase storage upload"
```

---

### Task 5: Màn hình Xác thực (AuthScreen: Đăng nhập & Đăng ký Admin)

**Files:**
- Create: `src/screens/AuthScreen.js`
- Modify: `App.js`
- Test: `tests/AuthScreen.test.js`

**Interfaces:**
- Consumes: `authService.js` (`loginAdmin`, `registerAdmin`, `validateAuthInput`).
- Produces: Giao diện đăng nhập/đăng ký hoàn chỉnh với chuyển đổi tab và nút "Điền tài khoản Admin mẫu".

- [ ] **Step 1: Viết test cho AuthScreen**

Kiểm tra rendering các trường Email, Mật khẩu, nút chuyển đổi Đăng nhập / Đăng ký.

- [ ] **Step 2: Chạy test xác nhận FAIL**

Run: `npx jest tests/AuthScreen.test.js`  
Expected: FAIL.

- [ ] **Step 3: Hiện thực `AuthScreen.js` và tích hợp vào `App.js`**

- Thiết kế giao diện hiện đại, sạch đẹp.
- Hỗ trợ 2 chế độ: Đăng nhập (Login) và Đăng ký (Register).
- Bổ sung nút bấm tiện ích: **"Điền tài khoản Admin mẫu"** (tự động điền email: `admin@gmail.com` / pass: `admin123`).
- Bắt lỗi và hiển thị Alert/thông báo trực quan khi có lỗi từ Firebase.

- [ ] **Step 4: Chạy test xác nhận PASS**

Run: `npx jest tests/AuthScreen.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/AuthScreen.js App.js tests/AuthScreen.test.js
git commit -m "feat: implement AuthScreen with login, registration and demo credentials fill"
```

---

### Task 6: Màn hình Quản trị (Dashboard) & Giao diện Responsive Web / Mobile

**Files:**
- Create: `src/components/ProductCard.js` (Hiển thị thẻ trên Mobile)
- Create: `src/components/ProductTable.js` (Hiển thị bảng trên Web)
- Create: `src/components/ProductModal.js` (Form thêm/sửa, nút chọn ảnh & preview)
- Create: `src/screens/DashboardScreen.js` (Header, Toolbar tìm kiếm/sắp xếp, Danh sách sản phẩm, Xuất JSON)
- Modify: `App.js` (Điều hướng giữa AuthScreen và DashboardScreen theo phiên đăng nhập)

**Interfaces:**
- Consumes: `productService.js`, `storageService.js`, `authService.js`.
- Produces: Toàn bộ trải nghiệm quản trị CRUD sản phẩm, tìm kiếm, sắp xếp và xuất dữ liệu trên Web & Mobile.

- [ ] **Step 1: Viết test cho các component hiển thị**

Tạo `tests/components.test.js`:
- Kiểm tra `ProductCard` render đủ 4 trường (`name`, `price`, `soluong`, `image`).
- Kiểm tra `ProductTable` render tiêu đề các cột và dữ liệu dòng.

- [ ] **Step 2: Chạy test xác nhận FAIL**

Run: `npx jest tests/components.test.js`  
Expected: FAIL.

- [ ] **Step 3: Hiện thực các component và DashboardScreen**

- `ProductCard.js`: Card bo góc, bóng mờ (shadow), ảnh vuông 80x80 bên trái, giá định dạng tiền tệ VNĐ màu đỏ/cam nổi bật, nút Sửa/Xóa.
- `ProductTable.js`: Bảng HTML/RN Web chuẩn, có ảnh thumbnail, các cột căn chỉnh rõ ràng, hover effect.
- `ProductModal.js`: Modal nhập liệu, nút "Chọn ảnh từ thiết bị", preview ảnh ngay lập tức, nút "Lưu".
- `DashboardScreen.js`:
  - Header: Tiêu đề, email admin, nút Đăng xuất, nút **"Xuất JSON CSDL"** (trên Web tự tải file `products.json`, trên Mobile hiển thị modal/thông báo).
  - SearchBar & Sort Filter: Tìm kiếm theo tên thời gian thực, chọn sắp xếp Giá tăng/giảm, Số lượng tăng/giảm.
  - Phân nhánh nền tảng: `Platform.OS === 'web'` hiển thị `ProductTable`, ngược lại hiển thị `ProductCard` qua `FlatList`.

- [ ] **Step 4: Chạy test xác nhận PASS**

Run: `npx jest tests/components.test.js`  
Expected: PASS.

- [ ] **Step 5: Kiểm tra chạy thực tế trên Web**

Run: `npm run web` (hoặc `npx expo start --web`)  
Expected: Ứng dụng hiển thị mượt mà trên trình duyệt, đăng nhập thành công, thêm/sửa/xóa sản phẩm và chọn ảnh hoạt động hoàn hảo.

- [ ] **Step 6: Commit**

```bash
git add src/components/ src/screens/DashboardScreen.js App.js tests/components.test.js
git commit -m "feat: complete Dashboard with responsive Web table, Mobile cards, and ProductModal"
```

---

### Task 7: Báo cáo Chi tiết, Dữ liệu Mẫu & Đóng gói Nộp bài

**Files:**
- Create: `docs/BAO_CAO_BAI_TAP_LON.md` (Báo cáo đầy đủ từng bước, lệnh cài đặt, hướng dẫn test Web và Mobile)
- Create: `products.json` (File CSDL mẫu chuẩn 4 trường để nộp bài)
- Create: `README.md` (Hướng dẫn chạy dự án nhanh và cấu hình Firebase)

**Interfaces:**
- Produces: Bộ tài liệu và dữ liệu hoàn chỉnh để đạt điểm tối đa khi nộp bài.

- [ ] **Step 1: Tạo file CSDL mẫu `products.json`**

Tạo `products.json` gồm ít nhất 5-10 sản phẩm mẫu đúng chuẩn 4 trường:
```json
[
  {
    "name": "Áo Thun Nam Trơn Cotton",
    "price": 189000,
    "soluong": 45,
    "image": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"
  },
  {
    "name": "Giày Sneaker Thể Thao Nam",
    "price": 650000,
    "soluong": 20,
    "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"
  }
]
```

- [ ] **Step 2: Soạn thảo `docs/BAO_CAO_BAI_TAP_LON.md`**

Bao gồm:
1. Thông tin sinh viên, tên đề tài.
2. Bảng phân tích yêu cầu & thang điểm (8.0đ Web, 1.5đ Nâng cao/Auth, 0.5đ Mobile).
3. Hướng dẫn cài đặt từng lệnh (`git clone`, `npm install`, cấu hình Firebase).
4. Cấu trúc CSDL Firestore (ảnh chụp minh họa + giải thích chuẩn 4 trường).
5. Các bước kích hoạt Firebase Auth, Firestore, Storage.
6. Hình ảnh minh họa từng màn hình: Đăng nhập/Đăng ký, Thêm sản phẩm kèm chọn ảnh, Sửa sản phẩm, Xóa sản phẩm, Tìm kiếm/Sắp xếp, Giao diện Web, Giao diện Mobile Expo Go.
7. Kịch bản quay video demo (Timeline chi tiết từng giây giúp quay video nhanh và ăn trọn điểm).

- [ ] **Step 3: Soạn thảo `README.md`**

Hướng dẫn ngắn gọn, xúc tích cách chạy trên Web (`npm run web`) và quét mã QR trên điện thoại (`npx expo start`).

- [ ] **Step 4: Kiểm tra toàn bộ test suite và linting**

Run: `npx jest --all`  
Expected: Tất cả các test đều PASS.

- [ ] **Step 5: Commit**

```bash
git add docs/BAO_CAO_BAI_TAP_LON.md products.json README.md
git commit -m "docs: add comprehensive assignment report, sample json database, and readme"
```
