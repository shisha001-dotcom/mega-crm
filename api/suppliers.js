const express = require('express');
const router = express.Router();
const { getPoolSupplier: getPool, sql } = require('../db');

router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT Id, SupplierCode, SupplierShortName, SupplierFullName,
        TaxCode, Address, Email, BeneficiaryBank, BankAccountNumber,
        PaymentDays,
        CONVERT(VARCHAR(10), CreatedDate, 103) AS CreatedDate
      FROM Suppliers ORDER BY Id DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('Id', sql.Int, req.params.id)
      .query(`
        SELECT Id, SupplierCode, SupplierShortName, SupplierFullName,
          TaxCode, Address, Email, BeneficiaryBank, BankAccountNumber,
          PaymentDays,
          CONVERT(VARCHAR(10), CreatedDate, 103) AS CreatedDate
        FROM Suppliers WHERE Id = @Id
      `);
    if (result.recordset.length === 0)
      return res.status(404).json({ success: false, message: 'Không tìm thấy.' });
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  const { SupplierCode, SupplierShortName, SupplierFullName,
          TaxCode, Address, Email, BeneficiaryBank, BankAccountNumber,
          PaymentDays } = req.body;
  if (!SupplierCode || !SupplierFullName)
    return res.status(400).json({ success: false, message: 'Mã NCC và Tên đầy đủ là bắt buộc.' });
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('SupplierCode',      sql.NVarChar(50),   SupplierCode)
      .input('SupplierShortName', sql.NVarChar(255),  SupplierShortName  || null)
      .input('SupplierFullName',  sql.NVarChar(500),  SupplierFullName)
      .input('TaxCode',           sql.NVarChar(50),   TaxCode            || null)
      .input('Address',           sql.NVarChar(1000), Address            || null)
      .input('Email',             sql.NVarChar(255),  Email              || null)
      .input('BeneficiaryBank',   sql.NVarChar(255),  BeneficiaryBank    || null)
      .input('BankAccountNumber', sql.NVarChar(100),  BankAccountNumber  || null)
      .input('PaymentDays',       sql.Int,            PaymentDays || 30)
      .query(`
        INSERT INTO Suppliers
          (SupplierCode, SupplierShortName, SupplierFullName,
           TaxCode, Address, Email, BeneficiaryBank, BankAccountNumber, PaymentDays)
        OUTPUT INSERTED.Id
        VALUES
          (@SupplierCode, @SupplierShortName, @SupplierFullName,
           @TaxCode, @Address, @Email, @BeneficiaryBank, @BankAccountNumber, @PaymentDays)
      `);
    res.status(201).json({ success: true, message: 'Thêm thành công.', id: result.recordset[0].Id });
  } catch (err) {
    if (err.number === 2627 || err.number === 2601)
      return res.status(409).json({ success: false, message: `Mã "${SupplierCode}" đã tồn tại.` });
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { SupplierCode, SupplierShortName, SupplierFullName,
          TaxCode, Address, Email, BeneficiaryBank, BankAccountNumber,
          PaymentDays } = req.body;
  if (!SupplierCode || !SupplierFullName)
    return res.status(400).json({ success: false, message: 'Mã NCC và Tên đầy đủ là bắt buộc.' });
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('Id',                sql.Int,            req.params.id)
      .input('SupplierCode',      sql.NVarChar(50),   SupplierCode)
      .input('SupplierShortName', sql.NVarChar(255),  SupplierShortName  || null)
      .input('SupplierFullName',  sql.NVarChar(500),  SupplierFullName)
      .input('TaxCode',           sql.NVarChar(50),   TaxCode            || null)
      .input('Address',           sql.NVarChar(1000), Address            || null)
      .input('Email',             sql.NVarChar(255),  Email              || null)
      .input('BeneficiaryBank',   sql.NVarChar(255),  BeneficiaryBank    || null)
      .input('BankAccountNumber', sql.NVarChar(100),  BankAccountNumber  || null)
      .input('PaymentDays',       sql.Int,            PaymentDays || 30)
      .query(`
        UPDATE Suppliers SET
          SupplierCode = @SupplierCode, SupplierShortName = @SupplierShortName,
          SupplierFullName = @SupplierFullName, TaxCode = @TaxCode,
          Address = @Address, Email = @Email,
          BeneficiaryBank = @BeneficiaryBank, BankAccountNumber = @BankAccountNumber,
          PaymentDays = @PaymentDays
        WHERE Id = @Id
      `);
    if (result.rowsAffected[0] === 0)
      return res.status(404).json({ success: false, message: 'Không tìm thấy.' });
    res.json({ success: true, message: 'Cập nhật thành công.' });
  } catch (err) {
    if (err.number === 2627 || err.number === 2601)
      return res.status(409).json({ success: false, message: `Mã "${SupplierCode}" đã tồn tại.` });
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('Id', sql.Int, req.params.id)
      .query('DELETE FROM Suppliers WHERE Id = @Id');
    if (result.rowsAffected[0] === 0)
      return res.status(404).json({ success: false, message: 'Không tìm thấy.' });
    res.json({ success: true, message: 'Đã xóa.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;