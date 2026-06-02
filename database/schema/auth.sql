-- =====================================
-- ROLES
-- Admin   : toàn quyền — void, unconfirm, edit, delete
-- Manager : void + unconfirm + edit phiếu đã confirmed
-- Staff   : chỉ tạo phiếu, xác nhận, hủy DRAFT
-- =====================================
CREATE TABLE IF NOT EXISTS Roles (
    Id   INTEGER PRIMARY KEY AUTOINCREMENT,
    Code TEXT UNIQUE NOT NULL,   -- 'admin' | 'manager' | 'staff'
    Name TEXT NOT NULL
);

INSERT OR IGNORE INTO Roles (Code, Name) VALUES
    ('admin',   'Quản trị hệ thống'),
    ('manager', 'Quản lý kho'),
    ('staff',   'Nhân viên kho');


-- =====================================
-- USERS
-- =====================================
CREATE TABLE IF NOT EXISTS Users (
    Id           INTEGER PRIMARY KEY AUTOINCREMENT,
    Username     TEXT UNIQUE NOT NULL,
    PasswordHash TEXT NOT NULL,        -- bcryptjs hash
    FullName     TEXT NOT NULL,
    RoleId       INTEGER NOT NULL,
    IsActive     INTEGER DEFAULT 1,
    CreatedDate  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (RoleId) REFERENCES Roles(Id)
);

-- Tài khoản mặc định (password: Admin@123)
-- Hash được tạo sẵn bằng bcryptjs rounds=10
INSERT OR IGNORE INTO Users (Username, PasswordHash, FullName, RoleId) VALUES
    ('admin',
     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
     'Quản trị viên',
     (SELECT Id FROM Roles WHERE Code = 'admin')),
    ('manager',
     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
     'Quản lý kho',
     (SELECT Id FROM Roles WHERE Code = 'manager')),
    ('staff',
     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
     'Nhân viên kho',
     (SELECT Id FROM Roles WHERE Code = 'staff'));
-- ⚠ Đổi password ngay sau khi deploy!


-- =====================================
-- SESSIONS (token đơn giản, không dùng JWT)
-- =====================================
CREATE TABLE IF NOT EXISTS Sessions (
    Id          INTEGER PRIMARY KEY AUTOINCREMENT,
    Token       TEXT UNIQUE NOT NULL,
    UserId      INTEGER NOT NULL,
    ExpiresAt   DATETIME NOT NULL,
    CreatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);


-- =====================================
-- AUDIT LOG — ghi lại mọi thao tác nhạy cảm
-- =====================================
CREATE TABLE IF NOT EXISTS AuditLog (
    Id            INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId        INTEGER,
    Username      TEXT,
    Action        TEXT NOT NULL,
    -- 'VOID_CONFIRMED' | 'UNCONFIRM' | 'EDIT_CONFIRMED' | 'CONFIRM' | 'CANCEL_DRAFT'
    TargetTable   TEXT,
    TargetId      INTEGER,
    Detail        TEXT,              -- JSON string mô tả thay đổi
    CreatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);