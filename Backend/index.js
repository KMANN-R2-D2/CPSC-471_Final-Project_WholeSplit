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
    password: 'Pakvov-qospy7-redgok',
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


const checkAdmin = (req, res, next) => {
    const adminSSN = req.headers['admin-ssn']; 

    if (!adminSSN) {
        return res.status(403).json("Access denied. Admin credentials required.");
    }

    const q = "SELECT * FROM administrators WHERE SSN = ?";
    db.query(q, [adminSSN], (err, data) => {
        if (err) return res.status(500).json(err);
        
        if (data.length > 0) {
            next(); 
        } else {
            res.status(403).json("Unauthorized: You are not an administrator.");
        }
    });
};

// 2. Creating a store (must be admin)
app.post('/stores', checkAdmin, (req, res) => {
    const q = "INSERT INTO Stores (Name, City, Street, PostalCode) VALUES (?, ?, ?, ?)";
    const values = [req.body.Name, req.body.City, req.body.Street, req.body.PostalCode];

    db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json("Store added successfully!");
    });
});

// Only admins can delete a product
app.delete('/products/:id', checkAdmin, (req, res) => {
    const q = "DELETE FROM Products WHERE ProductID = ?";
    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json("Product removed from catalog.");
    });
});

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

// POST a new split request
app.post('/posts', (req, res) => {
    const q = 'INSERT INTO posts (QuantityRequested, DatePosted, Status, UserID, ProductID) VALUES (?, NOW(), "Open", ?, ?)';
    const values = [req.body.QuantityRequested, req.body.UserID, req.body.ProductID];
    db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json("Split post created");
    });
});

// Creating a group
app.post("/groups", (req, res) => {
  const { StoreID, ResponderUserID, PostID } = req.body;

const checkMemberQ = "SELECT * FROM membershipholders WHERE UserID = ?";

db.query(checkMemberQ, [ResponderUserID], (err, data) => {
    if (err) return res.status(500).json(err);
    
    // If the data array is empty, it means this user isn't a membership holder
    if (data.length === 0) {
      return res.status(403).json("Access Denied: You aren't in the MembershipHolders table!");
    }

    // STEP 2: If they passed the check, create the group
    const createGroupQ = `
      INSERT INTO splitgroups (Status, DateCreated, StoreID, CreatorUserID) 
      VALUES ('Active', NOW(), ?, ?)
    `;

    db.query(createGroupQ, [StoreID, ResponderUserID], (err, result) => {
      if (err) return res.status(500).json(err);

      // STEP 3: Update the Post status
      const updatePostQ = "UPDATE posts SET Status = 'Pending' WHERE PostID = ?";
      db.query(updatePostQ, [PostID], (err) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Success: Group created by verified member.");
      });
    });
  });
});


// GET all available stores for the user to choose from
app.get('/stores', (req, res) => {
    const q = "SELECT StoreID, Name, City, Street FROM Stores";
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// POST membership holder info
app.post('/memberships', (req, res) => {
    const q = 'INSERT INTO MembershipHolders (UserID, MembershipStore, MembershipExpirationDate) VALUES (?, ?, ?, ?)';
    const values = [req.body.UserID, req.body.MembershipStore, req.body.MembershipExpirationDate];
    db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json("Membership verified");
    });
});

// GET all administrators
app.get('/admins', (req, res) => {
    db.query('SELECT * FROM Administrators', (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

// POST payment transaction
app.post('/transactions', (req, res) => {
    const q = 'INSERT INTO Payment_Transactions (Date, Status, TotalAmount, GroupID) VALUES (NOW(), "Pending", ?, ?)';
    const values = [req.body.TotalAmount, req.body.GroupID];
    db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json("Transaction recorded");
    });
});

// 1. POST: To ADD an item (URL: /favourites)
app.post('/favourites', (req, res) => {
    // Note: We use the data from the Body (req.body)
    const q = "INSERT INTO Favourites (UserID, ProductID, DateAdded) VALUES (?, ?, NOW())";
    const values = [req.body.UserID, req.body.ProductID];

    db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json("Item added to favourites successfully!");
    });
});

// 2. GET: To VIEW a specific user's items (URL: /favourites/101)
app.get('/favourites/:userId', (req, res) => {
    // Note: We use the ID from the URL (req.params)
    const q = `
        SELECT f.DateAdded, p.* FROM Favourites f 
        JOIN Products p ON f.ProductID = p.ProductID 
        WHERE f.UserID = ?`;

    db.query(q, [req.params.userId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// GET prices and availability for a specific product across all stores
app.get('/products/:id/availability', (req, res) => {
    const q = `
        SELECT s.Name as StoreName, st.Price, st.LastUpdated 
        FROM Stocks st 
        JOIN Stores s ON st.StoreID = s.StoreID 
        WHERE st.ProductID = ?`;
    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

app.get('/products', (req, res) => {
    const q = "SELECT * FROM Products";
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// Joining a post
app.post('/participate', (req, res) => {
    // Links a User to a Group and tracks how much they want
    const q = "INSERT INTO Participates_In (UserID, GroupID, QuantityRequested) VALUES (?, ?, ?)";
    const values = [req.body.UserID, req.body.GroupID, req.body.QuantityRequested];
    
    db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json("User has joined the split group!");
    });
});

// GET details for a specific group split
app.get('/groups/:groupId/split', (req, res) => {
    const q = `
        SELECT sd.*, g.Status 
        FROM SplitDetail sd 
        JOIN Groups g ON sd.GroupID = g.GroupID 
        WHERE sd.GroupID = ?`;
    
    db.query(q, [req.params.groupId], (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

// GET all groups 
app.get('/groups', (req, res) => {
    const q = "SELECT * FROM splitgroups"; 
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// POST split calculation 
app.post('/split-details', (req, res) => {
    // CalculatedTotalSplit is usually a derived attribute, but we store it here
    const q = "INSERT INTO SplitDetail (GroupID, SplitID, Parts, CalculatedTotalSplit) VALUES (?, ?, ?, ?)";
    const values = [req.body.GroupID, req.body.SplitID, req.body.Parts, req.body.CalculatedTotalSplit];
    
    db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json("Split details finalized");
    });
});

// GET all registered locations
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
  
  // We JOIN with membershipholders to see if a MembershipID exists for this user
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
      // If MembershipID is null, they aren't a member. 
      // We can create a "virtual" status to make the frontend easier to read.
      user.isMember = user.MembershipID ? true : false;
      
      return res.status(200).json(user);
    } else {
      return res.status(401).json("Invalid email or password.");
    }
  });
});