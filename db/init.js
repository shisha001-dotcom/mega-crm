const fs = require('fs');

const path = require('path');

const db = require('./connection');



// thư mục chứa schema
const schemaFolder = path.join(
    __dirname,
    '../database/schema'
);



// đọc toàn bộ file .sql
const files = fs
    .readdirSync(schemaFolder)
    .filter(file => file.endsWith('.sql'));



console.log('🚀 Initializing database...');



files.forEach(file => {

    const filePath = path.join(schemaFolder, file);

    const sql = fs.readFileSync(filePath, 'utf8');



    db.exec(sql, (err) => {

        if (err) {

            console.error(`❌ Error in ${file}`);

            console.error(err.message);

        } else {

            console.log(`✅ Loaded ${file}`);

        }

    });

});