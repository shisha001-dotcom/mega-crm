# MEGA CRM — README

> **Dành cho AI đọc trước:** Đây là tóm tắt kiến trúc toàn bộ dự án. Đọc file này trước khi đọc bất kỳ file code nào. Mục tiêu: hiểu hệ thống trong 1 lần đọc, không cần duyệt từng file.

---

## 1. Tổng quan nhanh

| Mục | Giá trị |
|---|---|
| Tên app | MEGA CRM |
| Loại | Mini ERP: CRM + Kho + Kế toán |
| Stack | Node.js + Express + SQLite + Vanilla JS |
| Chạy | `node server.js` → `http://localhost:3000` |
| Database | SQLite file tại `database/mega_crm.db` |
| Chuẩn kế toán | Thông tư 99 |

---

## 2. Cấu trúc thư mục

```
mega-crm-main/
│
├── server.js                   ← Entry point, khởi động Express server
├── package.json
│
├── db/
│   ├── connection.js           ← Kết nối SQLite (export object db)
│   └── init.js                 ← Đọc và chạy toàn bộ file .sql trong database/schema/
│
├── database/
│   ├── mega_crm.db             ← File database SQLite (tự sinh khi chạy lần đầu)
│   └── schema/
│       ├── customers.sql       ← Bảng Customers
│       ├── warehouse.sql       ← Bảng Warehouses + Products
│       ├── purchase.sql        ← Bảng PurchaseOrders, PurchaseOrderItems, GoodsReceipts, GoodsReceiptItems
│       ├── suppliers.sql       ← (trống, chưa có schema)
│       └── accounting.sql      ← (trống, chưa có schema)
│
├── api/                        ← Backend REST API (Express Router)
│   ├── customers.js            ← CRUD /api/customers — dùng SQLite ✅ ACTIVE
│   ├── warehouse.js            ← CRUD /api/warehouse/warehouses + /api/warehouse/products — dùng SQLite ✅ ACTIVE
│   ├── suppliers.js            ← CRUD /api/suppliers — vẫn dùng mssql ⚠️ DISABLED
│   ├── purchase-orders.js      ← (trống, chưa implement)
│   └── purchase-receipts.js    ← (trống, chưa implement)
│
├── css/
│   ├── variables.css           ← CSS variables: màu sắc, font, shadow, bo góc
│   ├── layout.css              ← Sidebar + main layout (fixed sidebar 270px)
│   ├── components.css          ← Card, badge, button, table, modal, form, progress bar
│   └── responsive.css          ← Breakpoints: 1400px / 992px / 640px
│
├── js/                         ← Frontend logic (Vanilla JS)
│   ├── data.js                 ← Mock data: VOUCHERS, PROGRESS_ITEMS, MODULES, ACTIVITIES
│   ├── voucher-table.js        ← Render bảng chứng từ từ VOUCHERS
│   ├── voucher-modal.js        ← Mở/đóng/lưu modal tạo chứng từ
│   ├── progress.js             ← Render progress bars từ PROGRESS_ITEMS
│   ├── modules.js              ← Render module cards từ MODULES
│   ├── activity.js             ← Render activity feed từ ACTIVITIES
│   ├── sidebar.js              ← Highlight menu item active
│   ├── customer.js             ← Toàn bộ UI logic trang CRM (load, render, CRUD, search, toast)
│   └── supplier.js             ← Toàn bộ UI logic trang NCC (tương tự customer.js)
│
├── data/                       ← API client (fetch wrapper, dùng ở frontend)
│   ├── customer.js             ← CustomerAPI: getAll, getById, create, update, remove
│   ├── supplier.js             ← SupplierAPI: getAll, getById, create, update, remove
│   └── voucher.js              ← (trống)
│
├── pages/
│   ├── crm.html                ← Trang CRM Khách hàng (load data/customer.js + js/customer.js)
│   ├── supplier.html           ← Trang Nhà cung cấp (load data/supplier.js + js/supplier.js)
│   ├── warehouse.html          ← Trang Kho hàng (Bootstrap + inline JS, gọi /api/warehouse)
│   └── purchase/
│       ├── purchase-orders/    ← (trống, chưa implement)
│       └── purchase-receipts/  ← (trống, chưa implement)
│
├── index.html                  ← Dashboard chính (load js/data.js + các js render)
└── db.js                       ← (CŨ — cấu hình mssql, không dùng nữa, giữ lại làm tham khảo)
```

---

## 3. Luồng khởi động

```
node server.js
    ↓
require('./db/init')           → đọc database/schema/*.sql → tạo bảng nếu chưa có
    ↓
Express listen :3000
    ↓
app.use('/api/customers', ...)
app.use('/api/warehouse', ...)
app.use(static files)          → phục vụ index.html, css/, js/, pages/
```

---

## 4. Database — Bảng hiện có

| Bảng | File schema | Trạng thái |
|---|---|---|
| Customers | customers.sql | ✅ Có schema + API |
| Warehouses | warehouse.sql | ✅ Có schema + API |
| Products | warehouse.sql | ✅ Có schema + API |
| PurchaseOrders | purchase.sql | ✅ Có schema, API trống |
| PurchaseOrderItems | purchase.sql | ✅ Có schema, API trống |
| GoodsReceipts | purchase.sql | ✅ Có schema, API trống |
| GoodsReceiptItems | purchase.sql | ✅ Có schema, API trống |
| Suppliers | suppliers.sql | ❌ Schema trống |

### Cấu trúc bảng chính

**Customers**
```
Id, CustomerCode (UNIQUE), CustomerShortName, CustomerFullName,
TaxCode, Address, Email, BeneficiaryBank, BankAccountNumber, CreatedDate
```

**Warehouses**
```
Id, WarehouseCode (UNIQUE), WarehouseName, Address, ManagerName,
IsActive (default 1), CreatedDate
```

**Products**
```
Id, ProductCode (UNIQUE), ProductName, Unit, ProductType,
InventoryAccount, RevenueAccount, CostAccount,
SalePrice, CostPrice, MinimumStock, IsActive, CreatedDate
```

**PurchaseOrders**
```
Id, DocumentNo (UNIQUE), SupplierId, EmployeeName, DocumentDate,
ExpectedDeliveryDate, Status (default 'DRAFT'), Notes,
TotalAmount, TotalVAT, GrandTotal, CreatedDate
```

---

## 5. API Routes

Tất cả response dạng `{ success: true/false, data: ..., message: ... }`

### Customers `/api/customers`
| Method | Path | Chức năng |
|---|---|---|
| GET | `/api/customers` | Lấy tất cả khách hàng |
| GET | `/api/customers/:id` | Lấy 1 khách hàng |
| POST | `/api/customers` | Tạo mới (bắt buộc: CustomerCode, CustomerFullName) |
| PUT | `/api/customers/:id` | Cập nhật |
| DELETE | `/api/customers/:id` | Xóa |

### Warehouse `/api/warehouse`
| Method | Path | Chức năng |
|---|---|---|
| GET | `/api/warehouse/warehouses` | Lấy tất cả kho |
| POST | `/api/warehouse/warehouses` | Tạo kho mới |
| PUT | `/api/warehouse/warehouses/:id` | Cập nhật kho |
| DELETE | `/api/warehouse/warehouses/:id` | Xóa kho |
| GET | `/api/warehouse/products` | Lấy tất cả sản phẩm |
| POST | `/api/warehouse/products` | Tạo sản phẩm mới |
| PUT | `/api/warehouse/products/:id` | Cập nhật sản phẩm |
| DELETE | `/api/warehouse/products/:id` | Xóa sản phẩm |

---

## 6. Frontend — Cách hoạt động

### index.html (Dashboard)
Dữ liệu hiển thị từ **mock data** trong `js/data.js`, không gọi API thật.
Thứ tự load script:
```html
js/data.js → js/voucher-table.js → js/progress.js → js/modules.js
→ js/activity.js → js/sidebar.js → js/voucher-modal.js
```

### pages/crm.html (CRM Khách hàng)
Gọi API thật qua `CustomerAPI` (trong `data/customer.js`).
Thứ tự load: `data/customer.js` → `js/customer.js`

### pages/supplier.html (Nhà cung cấp)
Gọi API thật qua `SupplierAPI` (trong `data/supplier.js`).
⚠️ API `api/suppliers.js` vẫn dùng **mssql** và bị DISABLED trong server.js.
Cần viết lại sang SQLite trước khi dùng.

### pages/warehouse.html (Kho hàng)
Dùng Bootstrap 5 (CDN). Logic inline trong file HTML, gọi `/api/warehouse`.

---

## 7. Trạng thái module

| Module | Schema | API Backend | Frontend Page | Ghi chú |
|---|---|---|---|---|
| Customers | ✅ | ✅ SQLite | ✅ crm.html | Hoạt động đầy đủ |
| Warehouses | ✅ | ✅ SQLite | ✅ warehouse.html | Hoạt động |
| Products | ✅ | ✅ SQLite | ✅ warehouse.html | Hoạt động |
| Suppliers | ❌ | ⚠️ mssql | ✅ supplier.html | Cần viết schema + chuyển sang SQLite |
| Purchase Orders | ✅ | ❌ trống | ❌ trống | Cần implement API + trang |
| Purchase Receipts | ✅ | ❌ trống | ❌ trống | Cần implement API + trang |
| Accounting | ❌ | ❌ | ❌ | Chưa bắt đầu |

---

## 8. Quy ước code

### Thêm module mới — checklist:
1. Tạo schema: `database/schema/ten-module.sql`
2. Tạo API: `api/ten-module.js` (dùng `db` từ `db/connection.js`, callback style)
3. Đăng ký route trong `server.js`: `app.use('/api/ten-module', require('./api/ten-module'))`
4. Tạo API client: `data/ten-module.js` (fetch wrapper, pattern giống `data/customer.js`)
5. Tạo trang: `pages/ten-module.html` + `js/ten-module.js`

### Pattern API (SQLite callback style):
```js
const db = require('../db/connection');

router.get('/', (req, res) => {
    db.all("SELECT * FROM Table ORDER BY Id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: rows });
    });
});
```

### Đặt tên:
- Database columns: `PascalCase` (CustomerCode, FullName)
- API routes: `kebab-case` (/api/purchase-orders)
- JS functions: `camelCase` (loadCustomers, openEditModal)
- CSS classes: `kebab-case` (form-group, modal-overlay)

---

## 9. Chạy dự án

```bash
# Cài dependencies
npm install

# Chạy server (tự tạo database nếu chưa có)
node server.js

# Hoặc dev mode (cần cài nodemon)
npm run dev
```

Truy cập: `http://localhost:3000`

---

## 10. Việc cần làm tiếp theo

1. **Suppliers module**: viết `database/schema/suppliers.sql` → chuyển `api/suppliers.js` sang SQLite
2. **Purchase Orders**: implement `api/purchase-orders.js` + trang `pages/purchase/`
3. **Purchase Receipts**: implement `api/purchase-receipts.js`
4. **Accounting**: thiết kế schema + API cho journal entries, vouchers
5. **Xóa db.js cũ**: file `db.js` (mssql config) không còn dùng, có thể xóa