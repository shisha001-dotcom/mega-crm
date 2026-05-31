/*bảng khách hàng*/
CREATE TABLE IF NOT EXISTS Customers (

    Id INTEGER PRIMARY KEY AUTOINCREMENT,

    CustomerCode TEXT UNIQUE NOT NULL,

    CustomerShortName TEXT,

    CustomerFullName TEXT NOT NULL,

    TaxCode TEXT,

    Address TEXT,

    Email TEXT,

    BeneficiaryBank TEXT,

    BankAccountNumber TEXT,

    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP

);