const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = 3000;


// =========================
// MIDDLEWARE
// =========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));


// =========================
// DATABASE INIT
// Tự động chạy toàn bộ *.sql trong database/schema/
// Thứ tự: auth.sql chạy trước (tạo bảng Users/Roles/Sessions/AuditLog)
// =========================
require('./db/init');


// =========================
// ROUTES
// =========================

// AUTH — login, logout, me, user management
const authRouter = require('./api/auth');
app.use('/api/auth', authRouter);

// CUSTOMERS
const customersRouter = require('./api/customers');
app.use('/api/customers', customersRouter);

// WAREHOUSE (kho + sản phẩm)
const warehouseRouter = require('./api/warehouse');
app.use('/api/warehouse', warehouseRouter);

// INVENTORY (nhập/xuất/tồn — yêu cầu đăng nhập)
const inventoryRouter = require('./api/inventory');
app.use('/api/inventory', inventoryRouter);


// =========================
// TEMPORARILY DISABLED
// =========================
// const suppliersRouter = require('./api/suppliers'); // vẫn dùng mssql — cần chuyển SQLite
// app.use('/api/suppliers', suppliersRouter);


// =========================
// CATCH-ALL → index.html
// =========================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
    console.log('');
    console.log('=========================================');
    console.log('  MEGA CRM SERVER');
    console.log('=========================================');
    console.log(`  URL      : http://localhost:${PORT}`);
    console.log(`  Database : SQLite (database/mega_crm.db)`);
    console.log('  Modules  :');
    console.log('    ✅ Auth        /api/auth');
    console.log('    ✅ Customers   /api/customers');
    console.log('    ✅ Warehouse   /api/warehouse');
    console.log('    ✅ Inventory   /api/inventory');
    console.log('    ⚠  Suppliers  DISABLED (cần chuyển SQLite)');
    console.log('=========================================');
    console.log('  Tài khoản mặc định:');
    console.log('    admin / Admin@123   → Quản trị');
    console.log('    manager / Admin@123 → Quản lý kho');
    console.log('    staff / Admin@123   → Nhân viên kho');
    console.log('  ⚠ Đổi password ngay trước khi dùng thật!');
    console.log('=========================================');
    console.log('');
});