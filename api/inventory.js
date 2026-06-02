const express = require('express');
const router = express.Router();
const db = require('../db/connection');


// ==============================================
// HELPER: Tạo mã phiếu tự động
// Format: NK-YYYYMMDD-NNN hoặc XK-YYYYMMDD-NNN
// ==============================================
function generateDocumentNo(type, callback) {

    const prefix = type === 'IMPORT' ? 'NK' : 'XK';
    const today = new Date();
    const dateStr = today.getFullYear().toString()
        + String(today.getMonth() + 1).padStart(2, '0')
        + String(today.getDate()).padStart(2, '0');

    const pattern = `${prefix}-${dateStr}-%`;

    db.get(
        "SELECT COUNT(*) as cnt FROM InventoryTransactions WHERE DocumentNo LIKE ?",
        [pattern],
        (err, row) => {
            if (err) return callback(err);
            const seq = String((row.cnt || 0) + 1).padStart(3, '0');
            callback(null, `${prefix}-${dateStr}-${seq}`);
        }
    );
}


// ==============================================
// HELPER: Validate ProductId + WarehouseId tồn tại
// ==============================================
function validateProductExists(productId, callback) {
    db.get(
        "SELECT Id, ProductCode, ProductName, Unit FROM Products WHERE Id = ? AND IsActive = 1",
        [productId],
        callback
    );
}

function validateWarehouseExists(warehouseId, callback) {
    db.get(
        "SELECT Id, WarehouseCode, WarehouseName FROM Warehouses WHERE Id = ? AND IsActive = 1",
        [warehouseId],
        callback
    );
}


// ==============================================
// GET /api/inventory/transactions
// Lấy tất cả phiếu (có thể filter theo type)
// ==============================================
router.get('/transactions', (req, res) => {

    const { type } = req.query;

    let query = `
        SELECT
            t.Id,
            t.DocumentNo,
            t.TransactionType,
            t.DocumentDate,
            t.ReferenceNo,
            t.Notes,
            t.Status,
            t.TotalAmount,
            t.CreatedDate,
            w.WarehouseCode,
            w.WarehouseName
        FROM InventoryTransactions t
        LEFT JOIN Warehouses w ON t.WarehouseId = w.Id
    `;

    const params = [];

    if (type === 'IMPORT' || type === 'EXPORT') {
        query += " WHERE t.TransactionType = ?";
        params.push(type);
    }

    query += " ORDER BY t.Id DESC";

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: rows });
    });

});


// ==============================================
// GET /api/inventory/transactions/:id
// Lấy 1 phiếu kèm chi tiết items
// ==============================================
router.get('/transactions/:id', (req, res) => {

    db.get(
        `SELECT
            t.*,
            w.WarehouseCode,
            w.WarehouseName
        FROM InventoryTransactions t
        LEFT JOIN Warehouses w ON t.WarehouseId = w.Id
        WHERE t.Id = ?`,
        [req.params.id],
        (err, transaction) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            if (!transaction) return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu.' });

            db.all(
                "SELECT * FROM InventoryTransactionItems WHERE TransactionId = ?",
                [req.params.id],
                (err2, items) => {
                    if (err2) return res.status(500).json({ success: false, message: err2.message });
                    res.json({ success: true, data: { ...transaction, items } });
                }
            );
        }
    );

});


// ==============================================
// POST /api/inventory/transactions
// Tạo phiếu nhập/xuất kho mới (DRAFT)
//
// Body: {
//   TransactionType: 'IMPORT' | 'EXPORT',
//   WarehouseId: number,
//   DocumentDate: 'YYYY-MM-DD',
//   ReferenceNo: string (optional),
//   Notes: string (optional),
//   items: [{ ProductId, Quantity, UnitPrice, Notes }]
// }
//
// VALIDATE:
//   - WarehouseId phải tồn tại trong bảng Warehouses và IsActive = 1
//   - Mỗi ProductId trong items phải tồn tại trong bảng Products và IsActive = 1
//   - Xuất kho: tồn kho phải đủ số lượng
// ==============================================
router.post('/transactions', (req, res) => {

    const {
        TransactionType,
        WarehouseId,
        DocumentDate,
        ReferenceNo,
        Notes,
        items
    } = req.body;

    // --- Basic validation ---
    if (!TransactionType || !['IMPORT', 'EXPORT'].includes(TransactionType)) {
        return res.status(400).json({ success: false, message: 'TransactionType phải là IMPORT hoặc EXPORT.' });
    }
    if (!WarehouseId) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn kho.' });
    }
    if (!DocumentDate) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập ngày chứng từ.' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Phiếu phải có ít nhất 1 sản phẩm.' });
    }

    // --- Validate kho ---
    validateWarehouseExists(WarehouseId, (err, warehouse) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!warehouse) {
            return res.status(400).json({
                success: false,
                message: `Kho ID "${WarehouseId}" không tồn tại hoặc đã ngừng hoạt động. Vui lòng chọn kho đã được thiết lập.`
            });
        }

        // --- Validate từng sản phẩm ---
        let validatedItems = [];
        let validationErrors = [];
        let pending = items.length;

        items.forEach((item, index) => {

            if (!item.ProductId || !item.Quantity || item.Quantity <= 0) {
                validationErrors.push(`Dòng ${index + 1}: Thiếu mã sản phẩm hoặc số lượng không hợp lệ.`);
                pending--;
                if (pending === 0) proceed();
                return;
            }

            validateProductExists(item.ProductId, (err2, product) => {
                if (err2) {
                    validationErrors.push(`Dòng ${index + 1}: Lỗi kiểm tra sản phẩm.`);
                } else if (!product) {
                    validationErrors.push(
                        `Dòng ${index + 1}: Sản phẩm ID "${item.ProductId}" không tồn tại hoặc đã ngừng kinh doanh. Chỉ được dùng sản phẩm đã thiết lập trong hệ thống.`
                    );
                } else {
                    validatedItems[index] = {
                        ...item,
                        ProductCode: product.ProductCode,
                        ProductName: product.ProductName,
                        Unit: product.Unit || '',
                        LineTotal: (item.Quantity || 0) * (item.UnitPrice || 0)
                    };
                }
                pending--;
                if (pending === 0) proceed();
            });
        });

        function proceed() {

            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: validationErrors.join(' | ')
                });
            }

            // Lọc bỏ undefined
            validatedItems = validatedItems.filter(Boolean);

            // --- Nếu EXPORT: kiểm tra tồn kho ---
            if (TransactionType === 'EXPORT') {
                checkStockForExport(WarehouseId, validatedItems, (stockErr, stockErrors) => {
                    if (stockErr) return res.status(500).json({ success: false, message: stockErr.message });
                    if (stockErrors.length > 0) {
                        return res.status(400).json({
                            success: false,
                            message: stockErrors.join(' | ')
                        });
                    }
                    insertTransaction();
                });
            } else {
                insertTransaction();
            }
        }

        function insertTransaction() {
            const totalAmount = validatedItems.reduce((sum, i) => sum + (i.LineTotal || 0), 0);

            generateDocumentNo(TransactionType, (genErr, documentNo) => {
                if (genErr) return res.status(500).json({ success: false, message: genErr.message });

                db.run(
                    `INSERT INTO InventoryTransactions
                        (DocumentNo, TransactionType, WarehouseId, DocumentDate, ReferenceNo, Notes, Status, TotalAmount)
                     VALUES (?, ?, ?, ?, ?, ?, 'DRAFT', ?)`,
                    [documentNo, TransactionType, WarehouseId, DocumentDate, ReferenceNo || null, Notes || null, totalAmount],
                    function(insErr) {
                        if (insErr) return res.status(500).json({ success: false, message: insErr.message });

                        const transactionId = this.lastID;
                        insertItems(transactionId, validatedItems, documentNo);
                    }
                );
            });
        }

        function insertItems(transactionId, itemList, documentNo) {
            let done = 0;
            const errors = [];

            itemList.forEach(item => {
                db.run(
                    `INSERT INTO InventoryTransactionItems
                        (TransactionId, ProductId, ProductCode, ProductName, Unit, Quantity, UnitPrice, LineTotal, Notes)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        transactionId,
                        item.ProductId,
                        item.ProductCode,
                        item.ProductName,
                        item.Unit,
                        item.Quantity,
                        item.UnitPrice || 0,
                        item.LineTotal || 0,
                        item.Notes || null
                    ],
                    (itemErr) => {
                        if (itemErr) errors.push(itemErr.message);
                        done++;
                        if (done === itemList.length) {
                            if (errors.length > 0) {
                                return res.status(500).json({ success: false, message: errors.join(', ') });
                            }
                            res.status(201).json({
                                success: true,
                                message: 'Tạo phiếu thành công.',
                                id: transactionId,
                                documentNo
                            });
                        }
                    }
                );
            });
        }
    });

});


// ==============================================
// PUT /api/inventory/transactions/:id/confirm
// Xác nhận phiếu → cập nhật tồn kho
// ==============================================
router.put('/transactions/:id/confirm', (req, res) => {

    db.get(
        "SELECT * FROM InventoryTransactions WHERE Id = ?",
        [req.params.id],
        (err, transaction) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            if (!transaction) return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu.' });
            if (transaction.Status !== 'DRAFT') {
                return res.status(400).json({ success: false, message: `Phiếu đang ở trạng thái "${transaction.Status}", không thể xác nhận.` });
            }

            db.all(
                "SELECT * FROM InventoryTransactionItems WHERE TransactionId = ?",
                [req.params.id],
                (err2, items) => {
                    if (err2) return res.status(500).json({ success: false, message: err2.message });

                    // Kiểm tra tồn kho lần cuối trước khi confirm (cho EXPORT)
                    if (transaction.TransactionType === 'EXPORT') {
                        checkStockForExport(transaction.WarehouseId, items, (stockErr, stockErrors) => {
                            if (stockErr) return res.status(500).json({ success: false, message: stockErr.message });
                            if (stockErrors.length > 0) {
                                return res.status(400).json({ success: false, message: stockErrors.join(' | ') });
                            }
                            doConfirm();
                        });
                    } else {
                        doConfirm();
                    }

                    function doConfirm() {
                        // Cập nhật Status
                        db.run(
                            "UPDATE InventoryTransactions SET Status = 'CONFIRMED' WHERE Id = ?",
                            [req.params.id],
                            (updateErr) => {
                                if (updateErr) return res.status(500).json({ success: false, message: updateErr.message });

                                // Cập nhật tồn kho từng dòng
                                updateStock(transaction.WarehouseId, transaction.TransactionType, items, (stockUpdateErr) => {
                                    if (stockUpdateErr) return res.status(500).json({ success: false, message: stockUpdateErr.message });
                                    res.json({ success: true, message: 'Xác nhận phiếu thành công. Tồn kho đã được cập nhật.' });
                                });
                            }
                        );
                    }
                }
            );
        }
    );

});


// ==============================================
// PUT /api/inventory/transactions/:id/cancel
// Hủy phiếu (chỉ DRAFT mới hủy được)
// ==============================================
router.put('/transactions/:id/cancel', (req, res) => {

    db.run(
        "UPDATE InventoryTransactions SET Status = 'CANCELLED' WHERE Id = ? AND Status = 'DRAFT'",
        [req.params.id],
        function(err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            if (this.changes === 0) {
                return res.status(400).json({ success: false, message: 'Không thể hủy. Phiếu không tồn tại hoặc đã xác nhận.' });
            }
            res.json({ success: true, message: 'Đã hủy phiếu.' });
        }
    );

});


// ==============================================
// GET /api/inventory/stock
// Lấy tồn kho (có thể filter theo WarehouseId)
// ==============================================
router.get('/stock', (req, res) => {

    const { warehouseId } = req.query;

    let query = `
        SELECT
            s.*,
            w.WarehouseCode,
            w.WarehouseName
        FROM InventoryStock s
        LEFT JOIN Warehouses w ON s.WarehouseId = w.Id
    `;

    const params = [];

    if (warehouseId) {
        query += " WHERE s.WarehouseId = ?";
        params.push(warehouseId);
    }

    query += " ORDER BY w.WarehouseCode, s.ProductCode";

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: rows });
    });

});


// ==============================================
// GET /api/inventory/stock/:warehouseId/:productId
// Lấy tồn kho 1 sản phẩm tại 1 kho
// ==============================================
router.get('/stock/:warehouseId/:productId', (req, res) => {

    db.get(
        "SELECT * FROM InventoryStock WHERE WarehouseId = ? AND ProductId = ?",
        [req.params.warehouseId, req.params.productId],
        (err, row) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({
                success: true,
                data: row || { StockQuantity: 0 }
            });
        }
    );

});


// ==============================================
// HELPER: Kiểm tra tồn kho đủ để xuất
// ==============================================
function checkStockForExport(warehouseId, items, callback) {

    const errors = [];
    let pending = items.length;

    if (pending === 0) return callback(null, errors);

    items.forEach(item => {
        db.get(
            "SELECT StockQuantity FROM InventoryStock WHERE WarehouseId = ? AND ProductId = ?",
            [warehouseId, item.ProductId],
            (err, stock) => {
                if (err) return callback(err);

                const currentStock = stock ? stock.StockQuantity : 0;
                if (currentStock < item.Quantity) {
                    errors.push(
                        `Sản phẩm "${item.ProductCode || item.ProductId}" tồn kho hiện tại: ${currentStock} ${item.Unit || ''}, không đủ để xuất ${item.Quantity} ${item.Unit || ''}.`
                    );
                }

                pending--;
                if (pending === 0) callback(null, errors);
            }
        );
    });
}


// ==============================================
// HELPER: Cập nhật bảng InventoryStock
// ==============================================
function updateStock(warehouseId, transactionType, items, callback) {

    let done = 0;
    let error = null;

    if (items.length === 0) return callback(null);

    items.forEach(item => {

        const delta = transactionType === 'IMPORT' ? item.Quantity : -item.Quantity;

        // Upsert: nếu chưa có thì tạo mới, có rồi thì cộng/trừ
        db.get(
            "SELECT Id FROM InventoryStock WHERE WarehouseId = ? AND ProductId = ?",
            [warehouseId, item.ProductId],
            (err, existing) => {
                if (err) { error = err; done++; if (done === items.length) callback(error); return; }

                if (existing) {
                    db.run(
                        "UPDATE InventoryStock SET StockQuantity = StockQuantity + ?, LastUpdated = CURRENT_TIMESTAMP WHERE WarehouseId = ? AND ProductId = ?",
                        [delta, warehouseId, item.ProductId],
                        (updateErr) => {
                            if (updateErr) error = updateErr;
                            done++;
                            if (done === items.length) callback(error);
                        }
                    );
                } else {
                    db.run(
                        `INSERT INTO InventoryStock (WarehouseId, ProductId, ProductCode, ProductName, Unit, StockQuantity)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [warehouseId, item.ProductId, item.ProductCode, item.ProductName, item.Unit, Math.max(0, delta)],
                        (insertErr) => {
                            if (insertErr) error = insertErr;
                            done++;
                            if (done === items.length) callback(error);
                        }
                    );
                }
            }
        );
    });
}


module.exports = router;