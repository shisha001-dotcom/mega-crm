-- =====================================
-- INVENTORY TRANSACTIONS (Phiếu nhập/xuất kho)
-- =====================================

CREATE TABLE IF NOT EXISTS InventoryTransactions (

    Id INTEGER PRIMARY KEY AUTOINCREMENT,

    DocumentNo TEXT UNIQUE NOT NULL,

    TransactionType TEXT NOT NULL CHECK (TransactionType IN ('IMPORT', 'EXPORT')),
    -- IMPORT = Phiếu nhập kho
    -- EXPORT = Phiếu xuất kho

    WarehouseId INTEGER NOT NULL,

    DocumentDate TEXT NOT NULL,

    ReferenceNo TEXT,
    -- Số chứng từ gốc (hóa đơn, lệnh xuất, ...)

    Notes TEXT,

    Status TEXT DEFAULT 'DRAFT' CHECK (Status IN ('DRAFT', 'CONFIRMED', 'CANCELLED')),

    TotalAmount REAL DEFAULT 0,

    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (WarehouseId) REFERENCES Warehouses(Id)

);


-- =====================================
-- INVENTORY TRANSACTION ITEMS (Chi tiết phiếu)
-- =====================================

CREATE TABLE IF NOT EXISTS InventoryTransactionItems (

    Id INTEGER PRIMARY KEY AUTOINCREMENT,

    TransactionId INTEGER NOT NULL,

    ProductId INTEGER NOT NULL,

    ProductCode TEXT NOT NULL,

    ProductName TEXT NOT NULL,

    Unit TEXT,

    Quantity REAL NOT NULL DEFAULT 0,

    UnitPrice REAL DEFAULT 0,

    LineTotal REAL DEFAULT 0,

    Notes TEXT,

    FOREIGN KEY (TransactionId) REFERENCES InventoryTransactions(Id) ON DELETE CASCADE,

    FOREIGN KEY (ProductId) REFERENCES Products(Id)

);


-- =====================================
-- INVENTORY STOCK (Tồn kho hiện tại)
-- Tự động cập nhật qua trigger khi xác nhận phiếu
-- =====================================

CREATE TABLE IF NOT EXISTS InventoryStock (

    Id INTEGER PRIMARY KEY AUTOINCREMENT,

    WarehouseId INTEGER NOT NULL,

    ProductId INTEGER NOT NULL,

    ProductCode TEXT NOT NULL,

    ProductName TEXT NOT NULL,

    Unit TEXT,

    StockQuantity REAL DEFAULT 0,

    LastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (WarehouseId, ProductId),

    FOREIGN KEY (WarehouseId) REFERENCES Warehouses(Id),

    FOREIGN KEY (ProductId) REFERENCES Products(Id)

);