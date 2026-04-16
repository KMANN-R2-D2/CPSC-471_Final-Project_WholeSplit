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

app.post("/groups", (req, res) => {
  const { StoreID, ResponderUserID, PostID } = req.body;

  // 1. Add the user to the group first
  const joinQ = `INSERT INTO splitgroups (Status, DateCreated, StoreID, CreatorUserID, PostID) VALUES (?, NOW(), ?, ?, ?)`;

  db.query(joinQ, ['Active', StoreID, ResponderUserID, PostID], (err) => {
    if (err) return res.status(500).json(err);

    // 2. CHECK: Does this group now contain AT LEAST ONE membership holder?
    const checkGroupMemberQ = `
      SELECT m.MembershipID 
      FROM splitgroups sg
      JOIN membershipholders m ON sg.CreatorUserID = m.UserID
      WHERE sg.PostID = ?
    `;

    db.query(checkGroupMemberQ, [PostID], (err2, members) => {
      if (err2) return res.status(500).json(err2);

      // 3. STATUS LOGIC: 
      // If the list of members found is > 0, someone in the group has a card!
      const finalStatus = members.length > 0 ? "Fulfillment In Progress" : "Pending Member";

      const updatePostQ = "UPDATE posts SET Status = ? WHERE PostID = ?";
      db.query(updatePostQ, [finalStatus, PostID], (err3) => {
        if (err3) return res.status(500).json(err3);
        
        return res.status(200).json({ 
          message: "Successfully joined the group!",
          currentStatus: finalStatus 
        });
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

app.get("/users", (req, res) => {
  
  const q = `
    SELECT u.FName, u.LName, u.Email, u.PostalCode, m.MembershipID
    FROM users u
    LEFT JOIN membershipholders m ON u.UserID = m.UserID
  `;
    
  db.query(q, (err, data) => {
    if (err) {
      console.error("SQL Error:", err); // This will show the error in your terminal
      return res.status(500).json(err);
    }
    console.log("Data sent to frontend:", data); // Check your terminal to see if John is here!
    return res.json(data);
  });
});
/**
 * CREATE NEW USER
 */
app.post('/users', (req, res) => {
    const q = `
        INSERT INTO users 
        (FName, LName, Email, PreferredPaymentMethod, PreferredShoppingDay, PreferredSplitLocation, PostalCode) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      req.body.FName, 
      req.body.LName, 
      req.body.Email, 
      req.body.PreferredPaymentMethod, 
      req.body.PreferredShoppingDay, 
      req.body.PreferredSplitLocation, 
      req.body.PostalCode
    ];

    db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json("User created successfully");
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


app.post("/signup", (req, res) => {
  const { FName, LName, Email, Password, PostalCode, hasMembership, MembershipStore, Expiry } = req.body;

  // STEP 1: Handle the Location Constraint
  // "INSERT IGNORE" adds the postal code if it's new, or does nothing if it exists.
  // This satisfies the Foreign Key requirement for the users table.
  const locQ = "INSERT IGNORE INTO locations (PostalCode, City, Province) VALUES (?, 'Calgary', 'AB')";
  
  db.query(locQ, [PostalCode], (err) => {
    if (err) {
      console.error("Location Error:", err);
      return res.status(500).json({ message: "Error processing location." });
    }

    // STEP 2: Create the Base User
    const userQ = `INSERT INTO users (FName, LName, Email, Password, PostalCode) VALUES (?, ?, ?, ?, ?)`;

    db.query(userQ, [FName, LName, Email, Password, PostalCode], (err2, result) => {
      if (err2) {
        if (err2.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: "Email already exists!" });
        return res.status(500).json({ message: err2.message });
      }
      
      const newUserID = result.insertId;

      // STEP 3: Handle Inheritance (MembershipHolder)
      if (hasMembership) {
        const memberQ = `INSERT INTO membershipholders (UserID, MembershipStore, MembershipExpirationDate) VALUES (?, ?, ?)`;
        db.query(memberQ, [newUserID, MembershipStore, Expiry], (err3) => {
          if (err3) {
            console.error("Membership Error:", err3);
            return res.status(500).json({ message: "User created, but membership details failed." });
          }
          return res.status(201).json("Account and Membership created!");
        });
      } else {
        return res.status(201).json("Standard Account created!");
      }
    });
  });
});