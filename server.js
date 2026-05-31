const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;



// =========================
// MIDDLEWARE
// =========================
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

app.use(express.static(path.join(__dirname)));



// =========================
// DATABASE INIT
// =========================
require('./db/init');



// =========================
// ROUTES
// =========================

// CUSTOMERS
const customersRouter = require('./api/customers');

app.use('/api/customers', customersRouter);



// =========================
// TEMPORARY DISABLED MODULES
// =========================

// const suppliersRouter = require('./api/suppliers');
// app.use('/api/suppliers', suppliersRouter);

const warehouseRouter = require('./api/warehouse');
app.use('/api/warehouse', warehouseRouter);



// =========================
// HOME PAGE
// =========================
app.get('*', (req, res) => {

    res.sendFile(path.join(__dirname, 'index.html'));

});



// =========================
// START SERVER
// =========================
app.listen(PORT, () => {

    console.log('');
    console.log('=================================');
    console.log('MEGA CRM SERVER RUNNING');
    console.log('=================================');
    console.log(`Server: http://localhost:${PORT}`);
    console.log('Database: SQLite');
    console.log('Customers Module: ACTIVE');
    console.log('Suppliers Module: DISABLED');
    console.log('Warehouse Module: DISABLED');
    console.log('=================================');
    console.log('');

});
