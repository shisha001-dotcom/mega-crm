/*bảng thiết lập kho*/
CREATE TABLE IF NOT EXISTS Warehouses (

    Id INTEGER PRIMARY KEY AUTOINCREMENT,

    WarehouseCode TEXT UNIQUE NOT NULL,

    WarehouseName TEXT NOT NULL,

    Address TEXT,

    ManagerName TEXT,

    IsActive INTEGER DEFAULT 1,

    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP

);

/*bảng dữ liệu sản phẩm*/
CREATE TABLE IF NOT EXISTS Products (

    Id INTEGER PRIMARY KEY AUTOINCREMENT,

    ProductCode TEXT UNIQUE NOT NULL,

    ProductName TEXT NOT NULL,

    Unit TEXT,

    ProductType TEXT,

    InventoryAccount TEXT,

    RevenueAccount TEXT,

    CostAccount TEXT,

    SalePrice REAL DEFAULT 0,

    CostPrice REAL DEFAULT 0,

    MinimumStock REAL DEFAULT 0,

    IsActive INTEGER DEFAULT 1,

    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP

);