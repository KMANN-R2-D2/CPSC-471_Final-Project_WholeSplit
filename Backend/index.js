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
 * GET POSTS WITH JOINS
 * Combines multiple tables (users, locations, products) to enrich post data
 */
// app.get("/posts", (req, res) => {
//   const q = `
//     SELECT 
//       p.PostID, 
//       p.ProductName, 
//       p.QuantityRequested AS InitialOffer, 
//       p.DateCreated AS DatePosted, 
//       p.Status,
//       COALESCE(SUM(sg.QuantityTaken), 0) AS TotalDeducted,
//       (p.QuantityRequested - COALESCE(SUM(sg.QuantityTaken), 0)) AS UnitsRemaining
//     FROM posts p
//     LEFT JOIN splitgroups sg ON p.PostID = sg.PostID
//     GROUP BY p.PostID
//     ORDER BY p.DateCreated DESC
//   `;

//   db.query(q, (err, data) => {
//     if (err) return res.status(500).json(err);
//     res.json(data);
//   });
// });
app.get("/posts", (req, res) => {
  const q = `
    SELECT 
      p.PostID, 
      pr.ProductName, -- Getting name from the products table
      p.QuantityRequested, 
      p.DatePosted, 
      p.Status,
      COALESCE(SUM(sg.QuantityTaken), 0) AS UnitsClaimed
    FROM posts p
    JOIN products pr ON p.ProductID = pr.ProductID
    LEFT JOIN splitgroups sg ON p.PostID = sg.PostID
    GROUP BY p.PostID, pr.ProductName, p.QuantityRequested, p.DatePosted, p.Status
    ORDER BY p.DatePosted DESC
  `;

  db.query(q, (err, data) => {
    if (err) {
      console.error("DEBUG - SQL Error:", err.sqlMessage);
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
  const { StoreID, ResponderUserID, PostID, QuantityTaken } = req.body;

  // 1. FIRST: Check how many units are actually left
  const checkAvailabilityQ = `
    SELECT p.QuantityRequested, COALESCE(SUM(sg.QuantityTaken), 0) AS TotalTaken
    FROM posts p
    LEFT JOIN splitgroups sg ON p.PostID = sg.PostID
    WHERE p.PostID = ?
    GROUP BY p.PostID`;

  db.query(checkAvailabilityQ, [PostID], (err, results) => {
    if (err || results.length === 0) return res.status(500).json(err);

    const { QuantityRequested, TotalTaken } = results[0];
    const remaining = QuantityRequested - TotalTaken;

    // 2. VALIDATION: If user wants more than what's left, stop them
    if (QuantityTaken > remaining) {
      return res.status(400).json({ 
        message: `Only ${remaining} units available. You cannot claim ${QuantityTaken}.` 
      });
    }

    // 3. PROCEED: If valid, insert the record
    const joinQ = `
      INSERT INTO splitgroups (Status, DateCreated, StoreID, CreatorUserID, PostID, QuantityTaken) 
      VALUES ('Active', NOW(), ?, ?, ?, ?)`;

    db.query(joinQ, [StoreID, ResponderUserID, PostID, QuantityTaken], (err2) => {
      if (err2) return res.status(500).json(err2);

      // 4. MEMBERSHIP CHECK: Update the status (same logic as before)
      const checkMemberQ = `
        SELECT m.MembershipID FROM splitgroups sg
        JOIN membershipholders m ON sg.CreatorUserID = m.UserID
        WHERE sg.PostID = ?`;

      db.query(checkMemberQ, [PostID], (err3, members) => {
        if (err3) return res.status(500).json(err3);

        const newTotalTaken = parseInt(TotalTaken) + parseInt(QuantityTaken);
        let finalStatus = (newTotalTaken >= QuantityRequested) ? "Full" : 
                          (members.length > 0 ? "Fulfillment In Progress" : "Pending Member");

        const updatePostQ = "UPDATE posts SET Status = ? WHERE PostID = ?";
        db.query(updatePostQ, [finalStatus, PostID], (err4) => {
          if (err4) return res.status(500).json(err4);
          return res.status(200).json({ message: "Joined successfully!" });
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

app.post("/login", (req, res) => {
  const { Email, Password } = req.body;

  // 1. Check regular users table
  const userQuery = `
    SELECT u.UserID, u.FName, u.LName, u.Email, u.PreferredSplitLocation, m.MembershipID 
    FROM users u
    LEFT JOIN membershipholders m ON u.UserID = m.UserID
    WHERE u.Email = ? AND u.Password = ?
  `;

  db.query(userQuery, [Email, Password], (err, userData) => {
    if (err) return res.status(500).json(err);

    // If a regular user is found
    if (userData.length > 0) {
      const user = userData[0];
      return res.status(200).json({
        UserID: user.UserID,
        FName: user.FName,
        LName: user.LName,
        Email: user.Email,
        PreferredLocation: user.PreferredSplitLocation,
        Role: "User",
        isMember: user.MembershipID ? true : false
      });
    }

    // 2. Waterfall: Check the administrators table using the Password column
    const adminQuery = `
      SELECT SSN, FName, LName, Email, Role 
      FROM administrators 
      WHERE Email = ? AND Password = ?
    `;

    db.query(adminQuery, [Email, Password], (err2, adminData) => {
      if (err2) return res.status(500).json(err2);

      // If an admin is found
      if (adminData.length > 0) {
        const admin = adminData[0];
        return res.status(200).json({
          UserID: admin.SSN, 
          FName: admin.FName,
          LName: admin.LName,
          Email: admin.Email,
          Role: admin.Role || "Admin",
          isMember: false 
        });
      }

      // 3. No match in either table
      return res.status(401).json("Invalid email or password.");
    });
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


app.delete("/posts/:id", (req, res) => {
  const postId = req.params.id;

  const q = "DELETE FROM posts WHERE PostID = ?";

  db.query(q, [postId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }
    return res.status(200).json("Post has been deleted.");
  });
});

// Add a new product
app.post("/products", (req, res) => {
  const { ProductName, Brand, BulkSize, BulkAmount } = req.body;

  // Simple query matching your columns: ProductID is handled by AUTO_INCREMENT
  const q = "INSERT INTO products (ProductName, Brand, BulkSize, BulkAmount) VALUES (?, ?, ?, ?)";
  
  db.query(q, [ProductName, Brand, BulkSize, BulkAmount], (err, data) => {
    if (err) {
      console.error("DATABASE ERROR:", err); // Check your terminal if it fails!
      return res.status(500).json(err);
    }
    return res.status(200).json("Product added successfully.");
  });
});

app.delete("/products/:id", (req, res) => {
  const productId = req.params.id;

  
  const q = "DELETE FROM products WHERE ProductID = ?";

  db.query(q, [productId], (err, data) => {
    if (err) {
      // Logic for WholeSplit: Block delete if product is in a split request
      if (err.errno === 1451) {
        return res.status(500).json({ 
          message: "Cannot delete: This product is currently part of an active split." 
        });
      }
      return res.status(500).json(err);
    }
    return res.status(200).json("Product deleted successfully.");
  });
});