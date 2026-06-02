/**
 * api/auth.js
 * Routes: POST /api/auth/login
 *         POST /api/auth/logout
 *         GET  /api/auth/me
 *         GET  /api/auth/users          (admin only)
 *         POST /api/auth/users          (admin only)
 *         PUT  /api/auth/users/:id      (admin only)
 *         PUT  /api/auth/users/:id/password  (admin or self)
 */

const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const db       = require('../db/connection');
const { requireAuth, requireRole, generateToken, writeAuditLog } = require('../middleware/auth');

const SESSION_HOURS = 8; // phiên hết hạn sau 8 giờ

// ─── LOGIN ───────────────────────────────────
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
    }

    db.get(
        `SELECT u.*, r.Code AS RoleCode, r.Name AS RoleName
         FROM Users u JOIN Roles r ON u.RoleId = r.Id
         WHERE u.Username = ?`,
        [username.trim().toLowerCase()],
        async (err, user) => {
            if (err)   return res.status(500).json({ success: false, message: err.message });
            if (!user) return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
            if (!user.IsActive) return res.status(403).json({ success: false, message: 'Tài khoản đã bị vô hiệu hóa.' });

            const match = await bcrypt.compare(password, user.PasswordHash);
            if (!match) return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });

            const token     = generateToken();
            const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000).toISOString();

            db.run(
                'INSERT INTO Sessions (Token, UserId, ExpiresAt) VALUES (?, ?, ?)',
                [token, user.Id, expiresAt],
                (insErr) => {
                    if (insErr) return res.status(500).json({ success: false, message: insErr.message });

                    writeAuditLog({ UserId: user.Id, Username: user.Username }, 'LOGIN', 'Users', user.Id, null);

                    res.json({
                        success: true,
                        message: `Xin chào, ${user.FullName}!`,
                        token,
                        user: {
                            id:       user.Id,
                            username: user.Username,
                            fullName: user.FullName,
                            role:     user.RoleCode,
                            roleName: user.RoleName
                        }
                    });
                }
            );
        }
    );
});


// ─── LOGOUT ──────────────────────────────────
router.post('/logout', requireAuth, (req, res) => {
    db.run('DELETE FROM Sessions WHERE Token = ?', [req.token], () => {
        res.json({ success: true, message: 'Đã đăng xuất.' });
    });
});


// ─── ME (thông tin user hiện tại) ────────────
router.get('/me', requireAuth, (req, res) => {
    res.json({
        success: true,
        user: {
            id:       req.user.UserId,
            username: req.user.Username,
            fullName: req.user.FullName,
            role:     req.user.RoleCode,
            roleName: req.user.RoleName
        }
    });
});


// ─── DANH SÁCH USERS (admin) ─────────────────
router.get('/users', requireAuth, requireRole(['admin']), (req, res) => {
    db.all(
        `SELECT u.Id, u.Username, u.FullName, u.IsActive, u.CreatedDate,
                r.Code AS RoleCode, r.Name AS RoleName
         FROM Users u JOIN Roles r ON u.RoleId = r.Id
         ORDER BY u.Id`,
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, data: rows });
        }
    );
});


// ─── TẠO USER (admin) ────────────────────────
router.post('/users', requireAuth, requireRole(['admin']), async (req, res) => {
    const { username, password, fullName, roleCode } = req.body;

    if (!username || !password || !fullName || !roleCode) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc.' });
    }

    db.get('SELECT Id FROM Roles WHERE Code = ?', [roleCode], async (err, role) => {
        if (err || !role) return res.status(400).json({ success: false, message: `Role "${roleCode}" không tồn tại.` });

        const hash = await bcrypt.hash(password, 10);
        db.run(
            'INSERT INTO Users (Username, PasswordHash, FullName, RoleId) VALUES (?, ?, ?, ?)',
            [username.trim().toLowerCase(), hash, fullName, role.Id],
            function (insErr) {
                if (insErr) {
                    if (insErr.message.includes('UNIQUE')) {
                        return res.status(409).json({ success: false, message: `Username "${username}" đã tồn tại.` });
                    }
                    return res.status(500).json({ success: false, message: insErr.message });
                }
                writeAuditLog(req.user, 'CREATE_USER', 'Users', this.lastID, { username, roleCode });
                res.status(201).json({ success: true, message: 'Tạo tài khoản thành công.', id: this.lastID });
            }
        );
    });
});


// ─── CẬP NHẬT USER (admin) ───────────────────
router.put('/users/:id', requireAuth, requireRole(['admin']), (req, res) => {
    const { fullName, roleCode, isActive } = req.body;

    db.get('SELECT Id FROM Roles WHERE Code = ?', [roleCode], (err, role) => {
        if (err || !role) return res.status(400).json({ success: false, message: `Role "${roleCode}" không tồn tại.` });

        db.run(
            'UPDATE Users SET FullName = ?, RoleId = ?, IsActive = ? WHERE Id = ?',
            [fullName, role.Id, isActive ? 1 : 0, req.params.id],
            function (updErr) {
                if (updErr) return res.status(500).json({ success: false, message: updErr.message });
                if (this.changes === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy user.' });
                writeAuditLog(req.user, 'UPDATE_USER', 'Users', req.params.id, { fullName, roleCode, isActive });
                res.json({ success: true, message: 'Cập nhật thành công.' });
            }
        );
    });
});


// ─── ĐỔI MẬT KHẨU ────────────────────────────
router.put('/users/:id/password', requireAuth, async (req, res) => {
    const targetId = parseInt(req.params.id);
    const isSelf   = req.user.UserId === targetId;
    const isAdmin  = req.user.RoleCode === 'admin';

    if (!isSelf && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Chỉ Admin hoặc chính chủ tài khoản mới được đổi mật khẩu.' });
    }

    const { oldPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    }

    db.get('SELECT PasswordHash FROM Users WHERE Id = ?', [targetId], async (err, user) => {
        if (err || !user) return res.status(404).json({ success: false, message: 'Không tìm thấy user.' });

        // Nếu là chính chủ → cần xác nhận mật khẩu cũ
        if (isSelf && !isAdmin) {
            const match = await bcrypt.compare(oldPassword || '', user.PasswordHash);
            if (!match) return res.status(401).json({ success: false, message: 'Mật khẩu cũ không đúng.' });
        }

        const hash = await bcrypt.hash(newPassword, 10);
        db.run('UPDATE Users SET PasswordHash = ? WHERE Id = ?', [hash, targetId], (updErr) => {
            if (updErr) return res.status(500).json({ success: false, message: updErr.message });
            // Xóa toàn bộ session cũ để buộc đăng nhập lại
            db.run('DELETE FROM Sessions WHERE UserId = ?', [targetId]);
            writeAuditLog(req.user, 'CHANGE_PASSWORD', 'Users', targetId, null);
            res.json({ success: true, message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' });
        });
    });
});


// ─── AUDIT LOG (admin + manager) ─────────────
router.get('/audit-log', requireAuth, requireRole(['admin', 'manager']), (req, res) => {
    db.all(
        `SELECT * FROM AuditLog ORDER BY Id DESC LIMIT 200`,
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, data: rows });
        }
    );
});


module.exports = router;