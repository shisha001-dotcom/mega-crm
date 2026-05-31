const express = require('express');

const router = express.Router();

const db = require('../db/connection');



// =========================
// GET ALL WAREHOUSES
// =========================
router.get('/warehouses', (req, res) => {

    const query = `
        SELECT *
        FROM Warehouses
        ORDER BY Id DESC
    `;



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
// GET ONE WAREHOUSE
// =========================
router.get('/warehouses/:id', (req, res) => {

    const query = `
        SELECT *
        FROM Warehouses
        WHERE Id = ?
    `;



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
                message: 'Không tìm thấy kho.'
            });

        }



        res.json({
            success: true,
            data: row
        });

    });

});



// =========================
// CREATE WAREHOUSE
// =========================
router.post('/warehouses', (req, res) => {

    const {
        WarehouseCode,
        WarehouseName,
        Address,
        ManagerName
    } = req.body;



    if (!WarehouseCode || !WarehouseName) {

        return res.status(400).json({
            success: false,
            message: 'Mã kho và tên kho là bắt buộc.'
        });

    }



    const query = `
        INSERT INTO Warehouses (

            WarehouseCode,
            WarehouseName,
            Address,
            ManagerName

        )
        VALUES (?, ?, ?, ?)
    `;



    const values = [

        WarehouseCode,

        WarehouseName,

        Address || null,

        ManagerName || null

    ];



    db.run(query, values, function(err) {

        if (err) {

            if (err.message.includes('UNIQUE')) {

                return res.status(409).json({
                    success: false,
                    message: `Mã kho "${WarehouseCode}" đã tồn tại.`
                });

            }



            return res.status(500).json({
                success: false,
                message: err.message
            });

        }



        res.json({
            success: true,
            message: 'Thêm kho thành công.',
            id: this.lastID
        });

    });

});



// =========================
// UPDATE WAREHOUSE
// =========================
router.put('/warehouses/:id', (req, res) => {

    const {
        WarehouseCode,
        WarehouseName,
        Address,
        ManagerName
    } = req.body;



    const query = `
        UPDATE Warehouses
        SET

            WarehouseCode = ?,
            WarehouseName = ?,
            Address = ?,
            ManagerName = ?

        WHERE Id = ?
    `;



    const values = [

        WarehouseCode,

        WarehouseName,

        Address || null,

        ManagerName || null,

        req.params.id

    ];



    db.run(query, values, function(err) {

        if (err) {

            return res.status(500).json({
                success: false,
                message: err.message
            });

        }



        if (this.changes === 0) {

            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy kho.'
            });

        }



        res.json({
            success: true,
            message: 'Cập nhật kho thành công.'
        });

    });

});



// =========================
// DELETE WAREHOUSE
// =========================
router.delete('/warehouses/:id', (req, res) => {

    const query = `
        DELETE FROM Warehouses
        WHERE Id = ?
    `;



    db.run(query, [req.params.id], function(err) {

        if (err) {

            return res.status(500).json({
                success: false,
                message: err.message
            });

        }



        if (this.changes === 0) {

            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy kho.'
            });

        }



        res.json({
            success: true,
            message: 'Đã xóa kho.'
        });

    });

});



// =========================
// GET ALL PRODUCTS
// =========================
router.get('/products', (req, res) => {

    const query = `
        SELECT *
        FROM Products
        ORDER BY Id DESC
    `;



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
// GET ONE PRODUCT
// =========================
router.get('/products/:id', (req, res) => {

    const query = `
        SELECT *
        FROM Products
        WHERE Id = ?
    `;



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
                message: 'Không tìm thấy sản phẩm.'
            });

        }



        res.json({
            success: true,
            data: row
        });

    });

});



// =========================
// CREATE PRODUCT
// =========================
router.post('/products', (req, res) => {

    const {
        ProductCode,
        ProductName,
        Unit,
        InventoryAccount,
        RevenueAccount,
        CostAccount
    } = req.body;



    if (!ProductCode || !ProductName) {

        return res.status(400).json({
            success: false,
            message: 'Mã sản phẩm và tên sản phẩm là bắt buộc.'
        });

    }



    const query = `
        INSERT INTO Products (

            ProductCode,
            ProductName,
            Unit,
            InventoryAccount,
            RevenueAccount,
            CostAccount

        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;



    const values = [

        ProductCode,

        ProductName,

        Unit || null,

        InventoryAccount || null,

        RevenueAccount || null,

        CostAccount || null

    ];



    db.run(query, values, function(err) {

        if (err) {

            if (err.message.includes('UNIQUE')) {

                return res.status(409).json({
                    success: false,
                    message: `Mã sản phẩm "${ProductCode}" đã tồn tại.`
                });

            }



            return res.status(500).json({
                success: false,
                message: err.message
            });

        }



        res.json({
            success: true,
            message: 'Thêm sản phẩm thành công.',
            id: this.lastID
        });

    });

});



// =========================
// UPDATE PRODUCT
// =========================
router.put('/products/:id', (req, res) => {

    const {
        ProductCode,
        ProductName,
        Unit,
        InventoryAccount,
        RevenueAccount,
        CostAccount
    } = req.body;



    const query = `
        UPDATE Products
        SET

            ProductCode = ?,
            ProductName = ?,
            Unit = ?,
            InventoryAccount = ?,
            RevenueAccount = ?,
            CostAccount = ?

        WHERE Id = ?
    `;



    const values = [

        ProductCode,

        ProductName,

        Unit || null,

        InventoryAccount || null,

        RevenueAccount || null,

        CostAccount || null,

        req.params.id

    ];



    db.run(query, values, function(err) {

        if (err) {

            return res.status(500).json({
                success: false,
                message: err.message
            });

        }



        if (this.changes === 0) {

            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm.'
            });

        }



        res.json({
            success: true,
            message: 'Cập nhật sản phẩm thành công.'
        });

    });

});



// =========================
// DELETE PRODUCT
// =========================
router.delete('/products/:id', (req, res) => {

    const query = `
        DELETE FROM Products
        WHERE Id = ?
    `;



    db.run(query, [req.params.id], function(err) {

        if (err) {

            return res.status(500).json({
                success: false,
                message: err.message
            });

        }



        if (this.changes === 0) {

            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm.'
            });

        }



        res.json({
            success: true,
            message: 'Đã xóa sản phẩm.'
        });

    });

});



module.exports = router;