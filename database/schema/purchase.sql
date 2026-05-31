-- =====================================
-- PURCHASE ORDERS
-- =====================================

CREATE TABLE IF NOT EXISTS PurchaseOrders (

    Id INTEGER PRIMARY KEY AUTOINCREMENT,

    DocumentNo TEXT UNIQUE NOT NULL,

    SupplierId INTEGER NOT NULL,

    EmployeeName TEXT,

    DocumentDate TEXT,

    ExpectedDeliveryDate TEXT,

    Status TEXT DEFAULT 'DRAFT',

    Notes TEXT,

    TotalAmount REAL DEFAULT 0,

    TotalVAT REAL DEFAULT 0,

    GrandTotal REAL DEFAULT 0,

    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP

);



-- =====================================
-- PURCHASE ORDER ITEMS
-- =====================================

CREATE TABLE IF NOT EXISTS PurchaseOrderItems (

    Id INTEGER PRIMARY KEY AUTOINCREMENT,

    PurchaseOrderId INTEGER NOT NULL,

    ProductId INTEGER NOT NULL,

    ProductCode TEXT,

    ProductName TEXT,

    Unit TEXT,

    Quantity REAL DEFAULT 0,

    ReceivedQuantity REAL DEFAULT 0,

    RemainingQuantity REAL DEFAULT 0,

    UnitPrice REAL DEFAULT 0,

    VATRate REAL DEFAULT 0,

    VATAmount REAL DEFAULT 0,

    LineTotal REAL DEFAULT 0,

    Notes TEXT

);



-- =====================================
-- GOODS RECEIPTS
-- =====================================

CREATE TABLE IF NOT EXISTS GoodsReceipts (

    Id INTEGER PRIMARY KEY AUTOINCREMENT,

    DocumentNo TEXT UNIQUE NOT NULL,

    PurchaseOrderId INTEGER,

    SupplierId INTEGER,

    ReceiptDate TEXT,

    InvoiceNo TEXT,

    InvoiceDate TEXT,

    Notes TEXT,

    TotalAmount REAL DEFAULT 0,

    TotalVAT REAL DEFAULT 0,

    GrandTotal REAL DEFAULT 0,

    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP

);



-- =====================================
-- GOODS RECEIPT ITEMS
-- =====================================

CREATE TABLE IF NOT EXISTS GoodsReceiptItems (

    Id INTEGER PRIMARY KEY AUTOINCREMENT,

    GoodsReceiptId INTEGER NOT NULL,

    PurchaseOrderItemId INTEGER,

    ProductId INTEGER NOT NULL,

    ProductCode TEXT,

    ProductName TEXT,

    Unit TEXT,

    Quantity REAL DEFAULT 0,

    UnitPrice REAL DEFAULT 0,

    VATRate REAL DEFAULT 0,

    VATAmount REAL DEFAULT 0,

    LineTotal REAL DEFAULT 0,

    ExpiryDate TEXT

);