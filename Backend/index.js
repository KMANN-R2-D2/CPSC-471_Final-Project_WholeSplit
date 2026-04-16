// The following resources were used to create this file and in general the whole of the backend:

// Calbimonte, D. (2024, June 17). Working with SQL Server in Visual Studio Code. SQLServerCentral.
// https://www.sqlservercentral.com/articles/working-with-sql-server-in-visual-studio-code

// Calbimonte, D. (2024, June 17). Building a REST API with Node.js and Express.
// https://www.sqlservercentral.com/articles/building-a-rest-api-with-nodejs-and-express

// Lama Dev. (2022, September 18). React Node.js MySQL CRUD Tutorial for Beginners
// https://www.youtube.com/watch?v=fPuLnzSjPLE. YouTube.

// Import Express framework (used to create server + routes)
import express from 'express';

// Import MySQL driver (used to connect Node.js to MySQL database)
import mysql from 'mysql2';

// Enables Cross-Origin Resource Sharing (allows frontend to call backend API)
import cors from 'cors';

// Create Express application instance
const app = express();

// Middleware: parses incoming JSON requests into req.body
app.use(express.json());

// Middleware: allows API to be accessed from different origins (frontend/backend separation)
app.use(cors());

/**
 * Create MySQL database connection
 * This connects Node.js backend to MySQL database running locally
 */
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Pakvov-qospy7-redgok', // database password (should normally be hidden in .env file)
    database: 'wholesplitdb' // database name used for queries
});

/**
 * Establish connection to MySQL database
 * If connection fails, error is logged; otherwise success message prints
 */
db.connect((err) => {
    if (err) {
        console.error('DB connection failed:', err);
        return;
    }
    console.log('Connected to MySQL!');
});

/**
 * ROOT ROUTE
 * Used to test whether backend server is running properly
 */
app.get('/', (req, res) => {
    res.json('Hello, backend running!');
});

/**
 * GET ALL USERS
 * Retrieves every row from "users" table
 */
app.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (err, data) => {
        if (err) return res.json(err);
        res.json(data);
    });
});

/**
 * CREATE NEW USER
 * Inserts a new user into the database using values from request body
 */
app.post('/users', (req, res) => {
    const q = `
        INSERT INTO users 
        (UserID, FName, LName, Email, PreferredPaymentMethod, PreferredShoppingDay, PreferredSplitLocation, PostalCode) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Values are mapped from frontend request body
    const values = [
        req.body.UserID,
        req.body.FName,
        req.body.LName,
        req.body.Email,
        req.body.PreferredPaymentMethod,
        req.body.PreferredShoppingDay,
        req.body.PreferredSplitLocation,
        req.body.PostalCode
    ];

    db.query(q, values, (err, data) => {
        if (err) return res.json(err);
        res.json("User has been created successfully");
    });
});

/**
 * START SERVER
 * Backend listens on port 3000 for incoming requests
 */
app.listen(3000, () => {
    console.log('Server running on port 3000');
});

/**
 * GET ALL PRODUCTS
 */
app.get('/products', (req, res) => {
    db.query('SELECT * FROM Products', (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

/**
 * MIDDLEWARE: ADMIN CHECK
 * Ensures user is an administrator before allowing access to protected routes
 */
const checkAdmin = (req, res, next) => {

    // Admin identity is passed through request headers
    const adminSSN = req.headers['admin-ssn'];

    // If no admin ID provided, deny access
    if (!adminSSN) {
        return res.status(403).json("Access denied. Admin credentials required.");
    }

    // Check if SSN exists in administrators table
    const q = "SELECT * FROM administrators WHERE SSN = ?";

    db.query(q, [adminSSN], (err, data) => {
        if (err) return res.status(500).json(err);

        // If record exists → user is admin → allow request to continue
        if (data.length > 0) {
            next();
        } else {
            // Otherwise deny access
            res.status(403).json("Unauthorized: You are not an administrator.");
        }
    });
};

/**
 * CREATE STORE (ADMIN ONLY)
 */
app.post('/stores', checkAdmin, (req, res) => {
    const q = "INSERT INTO Stores (Name, City, Street, PostalCode) VALUES (?, ?, ?, ?)";
    const values = [req.body.Name, req.body.City, req.body.Street, req.body.PostalCode];

    db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json("Store added successfully!");
    });
});

/**
 * DELETE PRODUCT (ADMIN ONLY)
 */
app.delete('/products/:id', checkAdmin, (req, res) => {
    const q = "DELETE FROM Products WHERE ProductID = ?";

    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json("Product removed from catalog.");
    });
});

/**
 * GET POSTS WITH JOINS
 * Combines multiple tables (users, locations, products) to enrich post data
 */
app.get("/posts", (req, res) => {
  const q = `
    SELECT 
      p.PostID, 
      p.QuantityRequested, 
      p.DatePosted, 
      p.Status, 
      u.FName, 
      u.LName, 
      l.City, 
      pr.ProductName, 
      pr.Brand
    FROM posts p
    JOIN users u ON p.UserID = u.UserID
    JOIN locations l ON u.PostalCode = l.PostalCode
    JOIN products pr ON p.ProductID = pr.ProductID
  `;

  db.query(q, (err, data) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json(err);
    }
    return res.json(data);
  });
});

/**
 * CREATE NEW POST (SPLIT REQUEST)
 */
app.post('/posts', (req, res) => {
    const q = `
        INSERT INTO posts (QuantityRequested, DatePosted, Status, UserID, ProductID) 
        VALUES (?, NOW(), "Open", ?, ?)
    `;

    const values = [
        req.body.QuantityRequested,
        req.body.UserID,
        req.body.ProductID
    ];

    db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json("Split post created");
    });
});

/**
 * CREATE GROUP WITH VALIDATION
 * Ensures user is a membership holder before group creation
 */
app.post("/groups", (req, res) => {
  const { StoreID, ResponderUserID, PostID } = req.body;

  const checkMemberQ = "SELECT * FROM membershipholders WHERE UserID = ?";

  db.query(checkMemberQ, [ResponderUserID], (err, data) => {
    if (err) return res.status(500).json(err);

    // Reject if user is not a member
    if (data.length === 0) {
      return res.status(403).json("Access Denied: You aren't in the MembershipHolders table!");
    }

    // Create group if membership check passes
    const createGroupQ = `
      INSERT INTO splitgroups (Status, DateCreated, StoreID, CreatorUserID) 
      VALUES ('Active', NOW(), ?, ?)
    `;

    db.query(createGroupQ, [StoreID, ResponderUserID], (err, result) => {
      if (err) return res.status(500).json(err);

      // Update post status after group creation
      const updatePostQ = "UPDATE posts SET Status = 'Pending' WHERE PostID = ?";
      db.query(updatePostQ, [PostID], (err) => {
        if (err) return res.status(500).json(err);

        return res.status(200).json("Success: Group created by verified member.");
      });
    });
  });
});

/**
 * GET ALL STORES
 */
app.get('/stores', (req, res) => {
    const q = "SELECT StoreID, Name, City, Street FROM Stores";
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

/**
 * ADD MEMBERSHIP RECORD
 */
app.post('/memberships', (req, res) => {
    const q = `
        INSERT INTO MembershipHolders 
        (UserID, MembershipStore, MembershipExpirationDate) 
        VALUES (?, ?, ?, ?)
    `;

    const values = [
        req.body.UserID,
        req.body.MembershipStore,
        req.body.MembershipExpirationDate
    ];

    db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json("Membership verified");
    });
});

/**
 * GET ADMIN USERS
 */
app.get('/admins', (req, res) => {
    db.query('SELECT * FROM Administrators', (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

/**
 * CREATE PAYMENT TRANSACTION
 */
app.post('/transactions', (req, res) => {
    const q = `
        INSERT INTO Payment_Transactions (Date, Status, TotalAmount, GroupID) 
        VALUES (NOW(), "Pending", ?, ?)
    `;

    const values = [req.body.TotalAmount, req.body.GroupID];

    db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json("Transaction recorded");
    });
});

/**
 * ADD TO FAVOURITES
 */
app.post('/favourites', (req, res) => {
    const q = `
        INSERT INTO Favourites (UserID, ProductID, DateAdded) 
        VALUES (?, ?, NOW())
    `;

    const values = [req.body.UserID, req.body.ProductID];

    db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json("Item added to favourites successfully!");
    });
});

/**
 * GET USER FAVOURITES
 */
app.get('/favourites/:userId', (req, res) => {
    const q = `
        SELECT f.DateAdded, p.* 
        FROM Favourites f 
        JOIN Products p ON f.ProductID = p.ProductID 
        WHERE f.UserID = ?
    `;

    db.query(q, [req.params.userId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

/**
 * GET PRODUCT AVAILABILITY ACROSS STORES
 */
app.get('/products/:id/availability', (req, res) => {
    const q = `
        SELECT s.Name as StoreName, st.Price, st.LastUpdated 
        FROM Stocks st 
        JOIN Stores s ON st.StoreID = s.StoreID 
        WHERE st.ProductID = ?
    `;

    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

/**
 * GET ALL PRODUCTS (duplicate route — last one overrides earlier one)
 */
app.get('/products', (req, res) => {
    const q = "SELECT * FROM Products";

    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

/**
 * JOIN A GROUP
 */
app.post('/participate', (req, res) => {
    const q = `
        INSERT INTO Participates_In (UserID, GroupID, QuantityRequested) 
        VALUES (?, ?, ?)
    `;

    const values = [
        req.body.UserID,
        req.body.GroupID,
        req.body.QuantityRequested
    ];

    db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json("User has joined the split group!");
    });
});

/**
 * GET SPLIT DETAILS FOR GROUP
 */
app.get('/groups/:groupId/split', (req, res) => {
    const q = `
        SELECT sd.*, g.Status 
        FROM SplitDetail sd 
        JOIN Groups g ON sd.GroupID = g.GroupID 
        WHERE sd.GroupID = ?
    `;

    db.query(q, [req.params.groupId], (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

/**
 * GET ALL GROUPS
 */
app.get('/groups', (req, res) => {
    const q = "SELECT * FROM splitgroups";

    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

/**
 * CREATE SPLIT DETAIL ENTRY
 */
app.post('/split-details', (req, res) => {
    const q = `
        INSERT INTO SplitDetail (GroupID, SplitID, Parts, CalculatedTotalSplit) 
        VALUES (?, ?, ?, ?)
    `;

    const values = [
        req.body.GroupID,
        req.body.SplitID,
        req.body.Parts,
        req.body.CalculatedTotalSplit
    ];

    db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json("Split details finalized");
    });
});

/**
 * GET ALL LOCATIONS
 */
app.get('/locations', (req, res) => {
    const q = "SELECT * FROM locations";

    db.query(q, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        return res.json(data);
    });
});

/**
 * LOGIN ROUTE
 * Verifies user credentials and checks membership status
 */
app.post("/login", (req, res) => {
  const { Email, Password } = req.body;

  const q = `
    SELECT u.UserID, u.FName, u.LName, u.Email, m.MembershipID 
    FROM users u
    LEFT JOIN membershipholders m ON u.UserID = m.UserID
    WHERE u.Email = ? AND u.Password = ?
  `;

  db.query(q, [Email, Password], (err, data) => {
    if (err) return res.status(500).json(err);

    if (data.length > 0) {
      const user = data[0];

      // Convert DB result into frontend-friendly boolean
      user.isMember = user.MembershipID ? true : false;

      return res.status(200).json(user);
    } else {
      return res.status(401).json("Invalid email or password.");
    }
  });
});