import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';


const app = express();
app.use(express.json());
app.use(cors());
// Connects to db in MySQL Workbench, make sure to change password and database name if needed
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'wholesplitdb'
});


// Checks to make sure connection is successful, if not it will log the error
db.connect((err) => {
    if (err) {
        console.error('DB connection failed:', err);
        return;
    }
    console.log('Connected to MySQL!');
});


// Basic route to test if backend is running, will return a JSON message
app.get('/', (req, res) => {
    res.json('Hello, backend running!');
});

// Route to get all users from the database, will return a JSON array of users
app.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (err, data) => {
        if (err) return res.json(err);
        res.json(data);
    });
});

app.post('/users', (req, res) => {
    const q = 'INSERT INTO users (UserID, FName, LName, Email, PreferredPaymentMethod, PreferredShoppingDay, PreferredSplitLocation, PostalCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [req.body.UserID, req.body.FName, req.body.LName, req.body.Email, req.body.PreferredPaymentMethod, req.body.PreferredShoppingDay, req.body.PreferredSplitLocation, req.body.PostalCode];

    db.query(q, values, (err, data) => {
        if (err) return res.json(err);
        res.json("User has been created successfully");
    });
});

// Checks to make sure server is running on port 3000, will log a message in the console
app.listen(3000, () => {
    console.log('Server running on port 3000');
});

// GET all products
app.get('/products', (req, res) => {
    db.query('SELECT * FROM Products', (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

// POST new product (Moderator/Admin use)
app.post('/products', (req, res) => {
    const q = 'INSERT INTO Products (ProductID, ProductName, Brand, BulkSize, BulkAmount) VALUES (?, ?, ?, ?, ?)';
    const values = [req.body.ProductID, req.body.ProductName, req.body.Brand, req.body.BulkSize, req.body.BulkAmount];
    db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json("Product added successfully");
    });
});

// GET all active split posts (Join with Products for UI display)
app.get('/posts', (req, res) => {
    const q = `
        SELECT p.*, pr.ProductName, u.FName 
        FROM Posts p 
        JOIN Products pr ON p.ProductID = pr.ProductID 
        JOIN Users u ON p.UserID = u.UserID 
        WHERE p.Status = "Open"`;
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

// POST a new split request
app.post('/posts', (req, res) => {
    const q = 'INSERT INTO Posts (QuantityRequested, DatePosted, Status, UserID, ProductID) VALUES (?, NOW(), "Open", ?, ?)';
    const values = [req.body.QuantityRequested, req.body.UserID, req.body.ProductID];
    db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json("Split post created");
    });
});

// CREATE a group (Triggered when enough users join a split)
app.post('/groups', (req, res) => {
    const q = 'INSERT INTO Groups (DateCreated, Status) VALUES (NOW(), "Forming")';
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Group formed", GroupID: data.insertId });
    });
});

// POST user joining a group (Participates_In table)
app.post('/participate', (req, res) => {
    const q = 'INSERT INTO Participates_In (UserID, GroupID, QuantityRequested) VALUES (?, ?, ?)';
    const values = [req.body.UserID, req.body.GroupID, req.body.QuantityRequested];
    db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json("User joined group");
    });
});