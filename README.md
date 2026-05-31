# MEGA CRM - KIẾN TRÚC DỰ ÁN & DATABASE DOCS

## 1. Tổng quan dự án

MEGA CRM hiện tại là một ứng dụng quản lý CRM / kho / kế toán mini viết bằng:

* Frontend: HTML + CSS + JavaScript thuần
* Backend API: Node.js + Express
* Database hiện tại: Microsoft SQL Server (mssql)

Mục tiêu của file DOCS này:

* Giúp AI (ChatGPT / Claude) hiểu cấu trúc dự án mà không cần đọc toàn bộ code.
* Giúp mở rộng module dễ hơn.
* Chuẩn hóa kiến trúc dự án.
* Chuẩn bị cho việc chuyển sang database local nằm trong thư mục dự án.

---

# 2. Cấu trúc thư mục hiện tại

```plaintext
mega-crm-main/
│
├── api/                    # Backend API routes
│   ├── customers.js
│   ├── suppliers.js
│   └── warehouse.js
│
├── css/                    # CSS giao diện
│   ├── components.css
│   ├── layout.css
│   ├── responsive.css
│   └── variables.css
│
├── data/                   # Fake data / local data mẫu
│   ├── customer.js
│   ├── supplier.js
│   └── voucher.js
│
├── js/                     # Frontend logic
│   ├── activity.js
│   ├── customer.js
│   ├── data.js
│   ├── modules.js
│   ├── progress.js
│   ├── sidebar.js
│   ├── supplier.js
│   ├── voucher-modal.js
│   └── voucher-table.js
│
├── db.js                   # Cấu hình kết nối database
├── index.html              # Trang chính
├── package.json
└── node_modules/
```

---

# 3. Luồng hoạt động hệ thống

## Frontend

Frontend được load từ:

```plaintext
index.html
```

Sau đó gọi:

* CSS trong thư mục `/css`
* JavaScript trong thư mục `/js`

Frontend hiện tại dùng JavaScript thuần (vanilla JS).

---

## Backend API

API nằm trong:

```plaintext
/api
```

Các file API:

### customers.js

Quản lý:

* khách hàng
* CRUD khách hàng
* tìm kiếm khách hàng

### suppliers.js

Quản lý:

* nhà cung cấp
* CRUD nhà cung cấp

### warehouse.js

Quản lý:

* kho hàng
* nhập xuất tồn

---

## Database Layer

File:

```plaintext
/db.js
```

Hiện tại đang:

* dùng package `mssql`
* kết nối SQL Server
* tạo 2 database:

  * ERP_customer
  * ERP_supplier

---

# 4. Database hiện tại

## Công nghệ

```plaintext
Microsoft SQL Server
```

Kết nối bằng:

```js
const sql = require('mssql')
```

---

## Database đang dùng

### ERP_customer

Chứa:

* khách hàng
* công nợ
* lịch sử giao dịch

### ERP_supplier

Chứa:

* nhà cung cấp
* nhập hàng
* công nợ NCC

---

# 5. Vấn đề hiện tại của hệ thống

## 1. Database không nằm trong project

Hiện tại:

```plaintext
SQL Server chạy ngoài hệ thống
```

Điều này gây:

* khó backup
* khó deploy
* khó copy sang máy khác
* AI khó hiểu toàn hệ thống
* cần cài SQL Server riêng

---

## 2. AI phải đọc quá nhiều file

Do chưa có:

* docs kiến trúc
* docs module
* docs database
* docs luồng dữ liệu

nên Claude / GPT phải đọc nhiều code mới hiểu.

---

# 6. Kiến trúc mới đề xuất

Mục tiêu:

```plaintext
Toàn bộ project self-contained
```

Bao gồm:

* database nằm trong thư mục project
* backup đơn giản
* copy portable
* AI đọc docs là hiểu luôn

---

# 7. Đề xuất chuyển database sang SQLite

## Lý do

SQLite phù hợp hơn với:

* desktop app
* offline app
* mini ERP
* vibe coding
* AI coding

---

## Ưu điểm

### Không cần cài SQL Server

### Database chỉ là 1 file:

```plaintext
mega-crm-main/database/mega_crm.db
```

### Dễ backup

### Dễ copy

### Dễ debug

### AI hiểu tốt hơn

---

# 8. Cấu trúc project mới đề xuất

```plaintext
mega-crm-main/
│
├── api/
├── css/
├── js/
├── docs/
│
├── database/
│   ├── mega_crm.db
│   ├── schema.sql
│   └── seed.sql
│
├── backups/
│
├── db/
│   ├── connection.js
│   ├── customer.repository.js
│   ├── supplier.repository.js
│   └── warehouse.repository.js
│
├── index.html
├── server.js
└── package.json
```

---

# 9. Database location chuẩn

Database PHẢI nằm trong:

```plaintext
mega-crm-main/database/
```

Ví dụ:

```plaintext
mega-crm-main/database/mega_crm.db
```

Không dùng:

* SQL Server ngoài máy
* database cloud
* database remote

---

# 10. Kiến trúc database đề xuất

## Các bảng chính

### users

Thông tin người dùng.

### roles

Phân quyền.

### customers

Khách hàng.

### suppliers

Nhà cung cấp.

### products

Sản phẩm.

### warehouses

Kho.

### inventory_transactions

Nhập xuất tồn.

### vouchers

Phiếu kế toán.

### journal_entries

Bút toán kế toán.

### receivables

Công nợ phải thu.

### payables

Công nợ phải trả.

---

# 11. Flow dữ liệu kho

```plaintext
Nhập kho
    ↓
inventory_transactions
    ↓
Cập nhật tồn kho
    ↓
Sinh bút toán kế toán
```

---

# 12. Flow dữ liệu bán hàng

```plaintext
Tạo đơn hàng
    ↓
Xuất kho
    ↓
Sinh hóa đơn
    ↓
Sinh công nợ
    ↓
Sinh bút toán kế toán
```

---

# 13. Flow dữ liệu kế toán

```plaintext
Phiếu kế toán
    ↓
Journal Entries
    ↓
Sổ cái
    ↓
Báo cáo tài chính
```

---

# 14. Mô tả các file frontend

## js/sidebar.js

Quản lý sidebar menu.

## js/modules.js

Điều hướng module.

## js/customer.js

Logic khách hàng.

## js/supplier.js

Logic nhà cung cấp.

## js/voucher-modal.js

Popup phiếu kế toán.

## js/voucher-table.js

Bảng phiếu kế toán.

## js/progress.js

Progress / loading.

## js/activity.js

Activity log.

---

# 15. Quy tắc code dự án

## 1 file = 1 chức năng rõ ràng

Ví dụ:

* customer.js → chỉ khách hàng
* warehouse.js → chỉ kho
* voucher.js → chỉ chứng từ

---

## Không viết logic lớn trong index.html

Toàn bộ logic phải nằm trong:

```plaintext
/js
```

---

## API không chứa HTML

API chỉ:

* nhận request
* xử lý dữ liệu
* trả JSON

---

# 16. Quy tắc đặt tên

## Database

snake_case:

```plaintext
inventory_transactions
journal_entries
```

---

## JavaScript

camelCase:

```js
getCustomerList()
createVoucher()
```

---

# 17. Quy tắc module mới

Khi tạo module mới:

PHẢI tạo:

```plaintext
api/module-name.js
js/module-name.js
```

Ví dụ:

```plaintext
api/product.js
js/product.js
```

---

# 18. Quy tắc AI coding

Khi dùng Claude / ChatGPT:

KHÔNG yêu cầu:

```plaintext
Hãy viết toàn bộ ERP
```

MÀ chia nhỏ:

* tạo module sản phẩm
* tạo CRUD khách hàng
* tạo form nhập kho
* tạo bảng công nợ
* tạo dashboard

---

# 19. File docs AI cần đọc đầu tiên

AI phải đọc theo thứ tự:

```plaintext
1. docs/project-architecture.md
2. docs/database-structure.md
3. docs/module-flow.md
4. docs/coding-rules.md
```

Sau đó mới đọc code.

---

# 20. Kế hoạch nâng cấp tiếp theo

## Giai đoạn 1

* Chuyển SQL Server → SQLite
* Đưa database vào thư mục project
* Chuẩn hóa API

---

## Giai đoạn 2

* Chuẩn hóa module
* Tách repository
* Thêm auth

---

## Giai đoạn 3

* Electron desktop app
* Backup tự động
* Export Excel/PDF

---

## Giai đoạn 4

* AI OCR hóa đơn
* AI định khoản
* AI dashboard

---

# 21. Kết luận

Kiến trúc phù hợp nhất cho dự án:

```plaintext
Electron + HTML/JS + SQLite
```

Mục tiêu:

* chạy offline
* database local
* portable
* dễ backup
* AI hiểu dễ
* vibe coding tốt
