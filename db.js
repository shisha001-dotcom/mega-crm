const sql = require('mssql');

const baseOptions = {
  server: 'localhost',
  port: 1433,
  options: {
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
};

const configCustomer = {
  ...baseOptions,
  database: 'ERP_customer',
  user: 'sa',
  password: 'Admin@123',  // đổi thành password của bạn
};

const configSupplier = {
  ...baseOptions,
  database: 'ERP_supplier',
  user: 'sa',
  password: 'Admin@123',  // đổi thành password của bạn
};

let poolCustomer = null;
let poolSupplier = null;

async function getPoolCustomer() {
  if (!poolCustomer) {
    poolCustomer = await sql.connect(configCustomer);
    console.log('✅ Kết nối ERP_customer thành công!');
  }
  return poolCustomer;
}

async function getPoolSupplier() {
  if (!poolSupplier) {
    poolSupplier = await new sql.ConnectionPool(configSupplier).connect();
    console.log('✅ Kết nối ERP_supplier thành công!');
  }
  return poolSupplier;
}

module.exports = { getPoolCustomer, getPoolSupplier, sql };