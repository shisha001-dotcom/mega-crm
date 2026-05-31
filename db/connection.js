const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const dbPath = path.join(__dirname, '../database/mega_crm.db')

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Lỗi kết nối SQLite:', err.message)
    } else {
        console.log('Đã kết nối SQLite database')
    }
})

module.exports = db