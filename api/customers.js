const express = require('express');
const router = express.Router();
const db = require('../db/connection');



// =========================
// GET ALL CUSTOMERS
// =========================
router.get('/', (req, res) => {

    const query =
        "SELECT " +
        "Id, " +
        "CustomerCode, " +
        "CustomerShortName, " +
        "CustomerFullName, " +
        "TaxCode, " +
        "Address, " +
        "Email, " +
        "BeneficiaryBank, " +
        "BankAccountNumber, " +
        "CreatedDate " +
        "FROM Customers " +
        "ORDER BY Id DESC";

    db.all(query, [], (err, rows) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            data: rows
        });

    });

});



// =========================
// GET ONE CUSTOMER
// =========================
router.get('/:id', (req, res) => {

    const query =
        "SELECT " +
        "Id, " +
        "CustomerCode, " +
        "CustomerShortName, " +
        "CustomerFullName, " +
        "TaxCode, " +
        "Address, " +
        "Email, " +
        "BeneficiaryBank, " +
        "BankAccountNumber, " +
        "CreatedDate " +
        "FROM Customers " +
        "WHERE Id = ?";

    db.get(query, [req.params.id], (err, row) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (!row) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy.'
            });
        }

        res.json({
            success: true,
            data: row
        });

    });

});



// =========================
// CREATE CUSTOMER
// =========================
router.post('/', (req, res) => {

    const {
        CustomerCode,
        CustomerShortName,
        CustomerFullName,
        TaxCode,
        Address,
        Email,
        BeneficiaryBank,
        BankAccountNumber
    } = req.body;

    if (!CustomerCode || !CustomerFullName) {

        return res.status(400).json({
            success: false,
            message: 'Mã KH và Tên đầy đủ là bắt buộc.'
        });

    }

    const query =
        "INSERT INTO Customers (" +
        "CustomerCode, " +
        "CustomerShortName, " +
        "CustomerFullName, " +
        "TaxCode, " +
        "Address, " +
        "Email, " +
        "BeneficiaryBank, " +
        "BankAccountNumber" +
        ") VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    const values = [
        CustomerCode,
        CustomerShortName || null,
        CustomerFullName,
        TaxCode || null,
        Address || null,
        Email || null,
        BeneficiaryBank || null,
        BankAccountNumber || null
    ];

    db.run(query, values, function (err) {

        if (err) {

            if (err.message.includes('UNIQUE')) {

                return res.status(409).json({
                    success: false,
                    message: `Mã "${CustomerCode}" đã tồn tại.`
                });

            }

            return res.status(500).json({
                success: false,
                message: err.message
            });

        }

        res.status(201).json({
            success: true,
            message: 'Thêm thành công.',
            id: this.lastID
        });

    });

});



// =========================
// UPDATE CUSTOMER
// =========================
router.put('/:id', (req, res) => {

    const {
        CustomerCode,
        CustomerShortName,
        CustomerFullName,
        TaxCode,
        Address,
        Email,
        BeneficiaryBank,
        BankAccountNumber
    } = req.body;

    if (!CustomerCode || !CustomerFullName) {

        return res.status(400).json({
            success: false,
            message: 'Mã KH và Tên đầy đủ là bắt buộc.'
        });

    }

    const query =
        "UPDATE Customers SET " +
        "CustomerCode = ?, " +
        "CustomerShortName = ?, " +
        "CustomerFullName = ?, " +
        "TaxCode = ?, " +
        "Address = ?, " +
        "Email = ?, " +
        "BeneficiaryBank = ?, " +
        "BankAccountNumber = ? " +
        "WHERE Id = ?";

    const values = [
        CustomerCode,
        CustomerShortName || null,
        CustomerFullName,
        TaxCode || null,
        Address || null,
        Email || null,
        BeneficiaryBank || null,
        BankAccountNumber || null,
        req.params.id
    ];

    db.run(query, values, function (err) {

        if (err) {

            if (err.message.includes('UNIQUE')) {

                return res.status(409).json({
                    success: false,
                    message: `Mã "${CustomerCode}" đã tồn tại.`
                });

            }

            return res.status(500).json({
                success: false,
                message: err.message
            });

        }

        if (this.changes === 0) {

            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy.'
            });

        }

        res.json({
            success: true,
            message: 'Cập nhật thành công.'
        });

    });

});



// =========================
// DELETE CUSTOMER
// =========================
router.delete('/:id', (req, res) => {

    const query = "DELETE FROM Customers WHERE Id = ?";

    db.run(query, [req.params.id], function (err) {

        if (err) {

            return res.status(500).json({
                success: false,
                message: err.message
            });

        }

        if (this.changes === 0) {

            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy.'
            });

        }

        res.json({
            success: true,
            message: 'Đã xóa.'
        });

    });

});



module.exports = router;