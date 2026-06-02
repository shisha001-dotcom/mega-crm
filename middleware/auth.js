/**
 * middleware/auth.js
 *
 * Cung cấp:
 *   requireAuth        — kiểm tra token hợp lệ, gắn req.user
 *   requireRole(roles) — kiểm tra role, ví dụ requireRole(['admin','manager'])
 *
 * Token được gửi qua header:  Authorization: Bearer <token>
 * hoặc query string:          ?token=<token>  (dùng cho dev)
 */

const db     = require('../db/connection');
const crypto = require('crypto');

// ─── TẠO TOKEN NGẪU NHIÊN ────────────────────
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// ─── LẤY USER TỪ TOKEN ───────────────────────
function getUserFromToken(token, callback) {
    db.get(
        `SELECT s.UserId, s.ExpiresAt,
                u.Username, u.FullName, u.IsActive,
                r.Code AS RoleCode, r.Name AS RoleName
         FROM Sessions s
         JOIN Users u ON s.UserId = u.Id
         JOIN Roles r ON u.RoleId  = r.Id
         WHERE s.Token = ?`,
        [token],
        callback
    );
}

// ─── MIDDLEWARE: YÊU CẦU ĐĂNG NHẬP ──────────
function requireAuth(req, res, next) {
    const authHeader = req.headers['authorization'] || '';
    const token      = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : req.query.token;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.' });
    }

    getUserFromToken(token, (err, session) => {
        if (err)      return res.status(500).json({ success: false, message: err.message });
        if (!session) return res.status(401).json({ success: false, message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });

        if (new Date(session.ExpiresAt) < new Date()) {
            db.run('DELETE FROM Sessions WHERE Token = ?', [token]);
            return res.status(401).json({ success: false, message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
        }

        if (!session.IsActive) {
            return res.status(403).json({ success: false, message: 'Tài khoản đã bị vô hiệu hóa.' });
        }

        req.user  = session;
        req.token = token;
        next();
    });
}

// ─── MIDDLEWARE: YÊU CẦU ROLE CỤ THỂ ────────
function requireRole(roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Chưa xác thực.' });
        }
        if (!roles.includes(req.user.RoleCode)) {
            return res.status(403).json({
                success: false,
                message: `Thao tác này yêu cầu quyền: ${roles.join(' hoặc ')}. Tài khoản của bạn (${req.user.RoleName}) không có quyền này.`
            });
        }
        next();
    };
}

// ─── HELPER: GHI AUDIT LOG ───────────────────
function writeAuditLog(user, action, targetTable, targetId, detail) {
    db.run(
        `INSERT INTO AuditLog (UserId, Username, Action, TargetTable, TargetId, Detail)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            user?.UserId   || null,
            user?.Username || 'system',
            action,
            targetTable || null,
            targetId    || null,
            typeof detail === 'object' ? JSON.stringify(detail) : (detail || null)
        ]
    );
}

module.exports = { requireAuth, requireRole, generateToken, writeAuditLog };