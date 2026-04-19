// The following resources were used to create this file and in general the whole of the backend:

// Calbimonte, D. (2024, June 17). Working with SQL Server in Visual Studio Code. SQLServerCentral.
// https://www.sqlservercentral.com/articles/working-with-sql-server-in-visual-studio-code

// Calbimonte, D. (2024, June 17). Building a REST API with Node.js and Express.
// https://www.sqlservercentral.com/articles/building-a-rest-api-with-nodejs-and-express

// Lama Dev. (2022, September 18). React Node.js MySQL CRUD Tutorial for Beginners
// https://www.youtube.com/watch?v=fPuLnzSjPLE. YouTube.

import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// ─── DATABASE CONNECTION ──────────────────────────────────────────────────────
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'StridingTrident!%$709#', // change to your password
    database: 'WholeSplitDB'
});

db.connect((err) => {
    if (err) { console.error('DB connection failed:', err); return; }
    console.log('Connected to MySQL!');
});

app.get('/', (_req, res) => res.json('WholeSplit backend running!'));

// ══════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ══════════════════════════════════════════════════════════════════════════════

/**
 * ADMIN CHECK MIDDLEWARE
 * Pass admin-ssn header to access protected admin routes.
 */
const checkAdmin = (req, res, next) => {
    const adminSSN = req.headers['admin-ssn'];
    if (!adminSSN) return res.status(403).json("Access denied. Admin credentials required.");
    db.query("SELECT * FROM Administrators WHERE SSN = ?", [adminSSN], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length > 0) next();
        else res.status(403).json("Unauthorized: You are not an administrator.");
    });
};

// ══════════════════════════════════════════════════════════════════════════════
// REUSABLE STATUS CALCULATOR
// ══════════════════════════════════════════════════════════════════════════════
const recalcPostStatus = (PostID, callback) => {
    db.query(`
        SELECT pr.BulkAmount,
               COALESCE(SUM(pi.QuantityRequested), 0) AS TotalClaimed,
               COUNT(m.MembershipID) AS MemberCount
        FROM Posts po
        JOIN Products pr ON po.ProductID = pr.ProductID
        LEFT JOIN Participates_In pi ON po.PostID = pi.PostID
        LEFT JOIN MembershipHolders m ON pi.UserID = m.UserID
        WHERE po.PostID = ?
        GROUP BY pr.BulkAmount
    `, [PostID], (err, rows) => {
        if (err) return callback(err);
        const { BulkAmount, TotalClaimed, MemberCount } = rows[0] || { BulkAmount: 1, TotalClaimed: 0, MemberCount: 0 };

        let newStatus;
        if (Number(TotalClaimed) === 0) {
            newStatus = 'Open';
        } else if (Number(TotalClaimed) >= Number(BulkAmount)) {
            newStatus = MemberCount > 0 ? 'Full - Member In' : 'Full - No Member';
        } else if (Number(MemberCount) > 0) {
            newStatus = 'Member Joined';
        } else {
            newStatus = 'Member Required';
        }

        db.query("UPDATE Posts SET Status = ? WHERE PostID = ?", [newStatus, PostID], (err2) => {
            callback(err2, newStatus);
        });
    });
};

// ══════════════════════════════════════════════════════════════════════════════
// AUTH — LOGIN & SIGNUP
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /login
 * Checks users table first, then administrators.
 * Returns user object with Role and isMember flag.
 */
app.post("/login", (req, res) => {
    const { Email, Password } = req.body;
    console.log(`Attempting login for: ${Email}`);

    // Check users table — compare against SHA2 hash
    const userQuery = `
        SELECT u.UserID, u.FName, u.LName, u.Email,
               u.PreferredPaymentMethod, u.PreferredShoppingDay,
               m.MembershipID
        FROM Users u
        LEFT JOIN MembershipHolders m ON u.UserID = m.UserID
        WHERE u.Email = ? AND u.PasswordHash = SHA2(?, 256)
    `;

    db.query(userQuery, [Email, Password], (err, userData) => {
        if (err) return res.status(500).json(err);

        if (userData.length > 0) {
            const u = userData[0];
            console.log(`Login success for: ${Email}`);
            return res.status(200).json({
                UserID:   u.UserID,
                FName:    u.FName,
                LName:    u.LName,
                Email:    u.Email,
                Role:     "User",
                isMember: u.MembershipID ? true : false
            });
        }

        // Waterfall: check administrators table
        console.log("User not found, checking Admin table...");
        db.query(
            "SELECT SSN, FName, LName, Email, Role FROM Administrators WHERE Email = ? AND Password = ?",
            [Email, Password], (err2, adminData) => {
                if (err2) return res.status(500).json(err2);
                if (adminData.length > 0) {
                    const admin = adminData[0];
                    return res.status(200).json({
                        UserID: admin.SSN,
                        FName:  admin.FName,
                        LName:  admin.LName,
                        Email:  admin.Email,
                        Role:   admin.Role || "Admin",
                        isMember: false
                    });
                }
                return res.status(401).json("Invalid email or password.");
            });
    });
});

/**
 * POST /signup
 * Creates user and optionally a MembershipHolder record.
 * Handles the Locations FK constraint via INSERT IGNORE.
 */
app.post("/signup", (req, res) => {
    const { FName, LName, Email, Password, PostalCode,
            hasMembership, MembershipStore, Expiry } = req.body;

    const locQ = "INSERT IGNORE INTO locations (PostalCode, City, Province) VALUES (?, 'Calgary', 'AB')";
    db.query(locQ, [PostalCode], (err) => {
        if (err) return res.status(500).json({ message: "Error processing location." });

        // Store password as SHA2 hash directly — consistent with login check below
        const { PreferredPaymentMethod, PreferredShoppingDay } = req.body;
        const userQ = `
            INSERT INTO users (FName, LName, Email, PasswordHash, PostalCode, PreferredPaymentMethod, PreferredShoppingDay)
            VALUES (?, ?, ?, SHA2(?, 256), ?, ?, ?)
            `;
        db.query(userQ, [FName, LName, Email, Password, PostalCode, PreferredPaymentMethod, PreferredShoppingDay], (err2, result) => {
            if (err2) {
                if (err2.code === 'ER_DUP_ENTRY')
                    return res.status(409).json({ message: "Email already exists!" });
                return res.status(500).json({ message: err2.message });
            }
            const newUserID = result.insertId;

            if (hasMembership) {
                db.query(
                    "INSERT INTO MembershipHolders (MembershipID, UserID, MembershipStore, MembershipExpirationDate) VALUES (?, ?, ?, ?)",
                    [`MEMB-${newUserID}-${Date.now()}`, newUserID, MembershipStore, Expiry], (err3) => {
                        if (err3) return res.status(500).json({ message: "User created but membership failed." });
                        return res.status(201).json("Account and Membership created!");
                    });
            } else {
                return res.status(201).json("Standard account created!");
            }
        });
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// USERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /users
 * Returns all users with membership status joined in.
 */
app.get("/users", (req, res) => {
    const q = `
        SELECT u.UserID, u.FName, u.LName, u.Email, u.PostalCode,
               u.PreferredPaymentMethod, u.PreferredShoppingDay, u.PreferredSplitLocation,
               m.MembershipID, m.MembershipStore, m.MembershipExpirationDate
        FROM users u
        LEFT JOIN membershipholders m ON u.UserID = m.UserID
    `;
    db.query(q, (err, data) => {
        if (err) { console.error("SQL Error:", err); return res.status(500).json(err); }
        return res.json(data);
    });
});

/**
 * POST /users
 */
app.post('/users', (req, res) => {
    const q = `INSERT INTO users (FName, LName, Email, PreferredPaymentMethod, PreferredShoppingDay, PreferredSplitLocation, PostalCode) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [req.body.FName, req.body.LName, req.body.Email,
                    req.body.PreferredPaymentMethod, req.body.PreferredShoppingDay,
                    req.body.PreferredSplitLocation, req.body.PostalCode];
    db.query(q, values, (err) => {
        if (err) return res.status(500).json(err);
        return res.json("User created successfully");
    });
});

/**
 * GET /users/:id/history
 * Returns all splits a user has participated in with costs and statuses.
 */
app.get("/users/:id/history", (req, res) => {
    const q = `
        SELECT sg.GroupID, sg.Status AS GroupStatus, sg.DateCreated,
               st.Name AS StoreName,
               pr.ProductName, pr.Brand, pr.BulkAmount,
               pi.QuantityRequested, pi.CalculatedShareCost,
               stk.Price AS TotalPrice,
               po.Status AS PostStatus
        FROM Participates_In pi
        JOIN SplitGroups sg  ON pi.GroupID   = sg.GroupID
        JOIN Stores st       ON sg.StoreID   = st.StoreID
        JOIN Posts po        ON po.GroupID   = sg.GroupID
        JOIN Products pr     ON po.ProductID = pr.ProductID
        JOIN Stocks stk      ON stk.StoreID  = sg.StoreID AND stk.ProductID = po.ProductID
        WHERE pi.UserID = ?
        ORDER BY sg.DateCreated DESC
    `;
    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /products
 * Returns all products with lowest available price.
 * Optional query params: ?brand=Kirkland  ?storeId=101
 */
app.get('/products', (req, res) => {
    const { brand, storeId } = req.query;

    let q, params;

    if (storeId) {
        q = `
            SELECT p.*, stk.Price, stk.LastUpdated, st.Name AS StoreName
            FROM Products p
            JOIN Stocks stk ON p.ProductID = stk.ProductID
            JOIN Stores st  ON stk.StoreID = st.StoreID
            WHERE stk.StoreID = ?
            ${brand ? 'AND p.Brand = ?' : ''}
            ORDER BY p.ProductName
        `;
        params = brand ? [storeId, brand] : [storeId];
    } else {
        q = `
            SELECT p.*, MIN(stk.Price) AS Price, COUNT(stk.StoreID) AS StoreCount
            FROM Products p
            LEFT JOIN Stocks stk ON p.ProductID = stk.ProductID
            ${brand ? 'WHERE p.Brand = ?' : ''}
            GROUP BY p.ProductID
            ORDER BY p.ProductName
        `;
        params = brand ? [brand] : [];
    }

    db.query(q, params, (err, data) => {
        if (err) { console.error("Products Error:", err); return res.status(500).json(err); }
        return res.json(data);
    });
});

/**
 * GET /products/brands
 * Returns distinct brands for filter dropdowns.
 */
app.get('/products/brands', (req, res) => {
    db.query('SELECT DISTINCT Brand FROM Products ORDER BY Brand', (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

/**
 * GET /products/:id
 * Single product with pricing at every store that carries it.
 */
app.get('/products/:id', (req, res) => {
    const q = `
        SELECT p.*, stk.Price, stk.LastUpdated, st.StoreID, st.Name AS StoreName
        FROM Products p
        LEFT JOIN Stocks stk ON p.ProductID = stk.ProductID
        LEFT JOIN Stores st  ON stk.StoreID = st.StoreID
        WHERE p.ProductID = ?
    `;
    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (!data.length) return res.status(404).json("Product not found.");
        return res.json(data);
    });
});

/**
 * GET /products/:id/availability
 * Price and availability across all stores for one product.
 */
app.get('/products/:id/availability', (req, res) => {
    const q = `
        SELECT st.Name AS StoreName, stk.Price, stk.LastUpdated
        FROM Stocks stk
        JOIN Stores st ON stk.StoreID = st.StoreID
        WHERE stk.ProductID = ?
    `;
    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

/**
 * POST /products (Admin)
 */
app.post("/products", (req, res) => {
    const { ProductName, Brand, BulkSize, BulkAmount } = req.body;
    db.query(
        "INSERT INTO products (ProductName, Brand, BulkSize, BulkAmount) VALUES (?, ?, ?, ?)",
        [ProductName, Brand, BulkSize, BulkAmount], (err) => {
            if (err) { console.error("DATABASE ERROR:", err); return res.status(500).json(err); }
            return res.status(200).json("Product added successfully.");
        });
});

/**
 * PUT /products/:id (Admin)
 * Updates product name, brand, and bulk info.
 */
app.put("/products/:id", (req, res) => {
    const { ProductName, Brand, BulkSize, BulkAmount } = req.body;
    db.query(
        "UPDATE Products SET ProductName=?, Brand=?, BulkSize=?, BulkAmount=? WHERE ProductID=?",
        [ProductName, Brand, BulkSize, BulkAmount, req.params.id], (err) => {
            if (err) return res.status(500).json(err);
            return res.json("Product updated.");
        });
});

/**
 * DELETE /products/:id (Admin)
 * Blocked if product is in an active split.
 */
app.delete("/products/:id", (req, res) => {
    db.query("DELETE FROM products WHERE ProductID = ?", [req.params.id], (err) => {
        if (err) {
            if (err.errno === 1451)
                return res.status(409).json({ message: "Cannot delete: product is part of an active split." });
            return res.status(500).json(err);
        }
        return res.json("Product deleted successfully.");
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// POSTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /posts
 * All posts with product info, price, store, and units remaining.
 * Status lifecycle: Posted → Member Required → Full → Bought → Completed
 */
app.get("/posts", (req, res) => {
    const q = `
        SELECT
            po.PostID,
            po.QuantityRequested,
            po.DatePosted,
            po.Status,
            po.GroupID,
            pr.ProductID,
            pr.ProductName,
            pr.Brand,
            pr.BulkSize,
            pr.BulkAmount,
            st.Name AS StoreName,
            sg.StoreID,
            stk.Price,
            u.FName,
            u.LName,
            COALESCE(SUM(pi.QuantityRequested), 0) AS TotalClaimed,
            (pr.BulkAmount - COALESCE(SUM(pi.QuantityRequested), 0)) AS UnitsRemaining,
            ROUND((stk.Price / pr.BulkAmount), 2) AS CostPerUnit,
            GROUP_CONCAT(pi.UserID) AS ParticipantUserIDs
        FROM Posts po
        JOIN Products pr         ON po.ProductID  = pr.ProductID
        JOIN SplitGroups sg      ON po.GroupID    = sg.GroupID
        JOIN Users u             ON sg.CreatorUserID = u.UserID
        JOIN Stores st           ON sg.StoreID    = st.StoreID
        JOIN Stocks stk          ON sg.StoreID    = stk.StoreID AND po.ProductID = stk.ProductID
        LEFT JOIN Participates_In pi ON po.PostID = pi.PostID
        GROUP BY
            po.PostID, po.QuantityRequested, po.DatePosted, po.Status,
            po.GroupID, pr.ProductID, pr.ProductName, pr.Brand,
            pr.BulkSize, pr.BulkAmount, st.Name, sg.StoreID,
            stk.Price, u.FName, u.LName
        ORDER BY po.DatePosted DESC
    `;
    db.query(q, (err, data) => {
        if (err) { console.error("SQL Error:", err.sqlMessage); return res.status(500).json(err); }
        return res.json(data);
    });
});

/**
 * GET /posts/:id
 * Single post with full product/store/price detail and all current participants.
 */
app.get("/posts/:id", (req, res) => {
    const postQ = `
        SELECT po.PostID, po.QuantityRequested, po.DatePosted, po.Status,
               po.GroupID, pr.ProductID, pr.ProductName, pr.Brand,
               pr.BulkSize, pr.BulkAmount, st.Name AS StoreName,
               sg.StoreID, stk.Price,
               ROUND((stk.Price / pr.BulkAmount), 2) AS CostPerUnit,
               COALESCE(SUM(pi.QuantityRequested), 0) AS TotalClaimed,
               (pr.BulkAmount - COALESCE(SUM(pi.QuantityRequested), 0)) AS UnitsRemaining
        FROM Posts po
        JOIN Products pr         ON po.ProductID  = pr.ProductID
        JOIN SplitGroups sg      ON po.GroupID    = sg.GroupID
        JOIN Stores st           ON sg.StoreID    = st.StoreID
        JOIN Stocks stk          ON sg.StoreID    = stk.StoreID AND po.ProductID = stk.ProductID
        LEFT JOIN Participates_In pi ON po.PostID = pi.PostID
        WHERE po.PostID = ?
        GROUP BY po.PostID
    `;

    db.query(postQ, [req.params.id], (err, posts) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!posts.length) return res.status(404).json({ message: "Post not found." });

        const post = posts[0];

        // Get all current participants with their share costs
        db.query(`
            SELECT u.FName, u.LName, pi.QuantityRequested, pi.CalculatedShareCost,
                   m.MembershipID
            FROM Participates_In pi
            JOIN Users u ON pi.UserID = u.UserID
            LEFT JOIN MembershipHolders m ON pi.UserID = m.UserID
            WHERE pi.PostID = ?
        `, [req.params.id], (err2, participants) => {
            if (err2) return res.status(500).json({ message: err2.message });
            return res.json({ post, participants });
        });
    });
});

/**
 * POST /posts
 * Creates a post + SplitGroup. Adds creator to Participates_In with calculated share.
 *
 * Cost formula: (QuantityRequested / BulkAmount) * Price
 * Body: { UserID, ProductID, StoreID, QuantityRequested }
 */
app.post('/create-post', (req, res) => {
    const UserID = Number(req.body.UserID);
    const ProductID = Number(req.body.ProductID);
    const StoreID = Number(req.body.StoreID);
    const QuantityRequested = Number(req.body.QuantityRequested);

    // 1. Get price and BulkAmount
    db.query(
        "SELECT stk.Price, pr.BulkAmount FROM Stocks stk JOIN Products pr ON stk.ProductID = pr.ProductID WHERE stk.StoreID = ? AND stk.ProductID = ?",
        [StoreID, ProductID], (err, priceData) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!priceData.length)
                return res.status(400).json({ message: "Product not available at selected store." });

            const { Price, BulkAmount } = priceData[0];

            if (QuantityRequested > BulkAmount)
                return res.status(400).json({ message: `Max quantity is ${BulkAmount}.` });

            const shareCost = ((QuantityRequested / BulkAmount) * Price).toFixed(2);

            // 2. Create SplitGroup
            db.query(
                "INSERT INTO SplitGroups (StoreID, CreatorUserID, DateCreated, Status) VALUES (?, ?, CURDATE(), 'Open')",
                [StoreID, UserID], (err2, groupResult) => {
                    if (err2) return res.status(500).json({ message: err2.message });
                    const groupID = groupResult.insertId;

                    // 3. Create Post (no UserID column in your schema)
                    db.query(
                        "INSERT INTO Posts (GroupID, ProductID, QuantityRequested, DatePosted, Status) VALUES (?, ?, ?, CURDATE(), 'Open')",
                        [groupID, ProductID, QuantityRequested], (err3, postResult) => {
                            if (err3) return res.status(500).json({ message: err3.message });
                            const postID = postResult.insertId;

                            // 4. Add creator to Participates_In (links to PostID in your schema)
                            db.query(
                                "INSERT INTO Participates_In (UserID, PostID, QuantityRequested, CalculatedShareCost) VALUES (?, ?, ?, ?)",
                                [UserID, postID, QuantityRequested, shareCost], (err4) => {
                                    if (err4) return res.status(500).json({ message: err4.message });
                                    return res.status(201).json({
                                        message: "Post created!",
                                        postID,
                                        groupID,
                                        shareCost: `$${shareCost}`
                                    });
                                });
                        });
                });
        });
});

/**
 * POST /posts/:id/join
 * Joins an existing post. Recalculates ALL member shares after join.
 *
 * Cost formula: each member pays (their qty / BulkAmount) * TotalPrice
 *
 * Status logic after join:
 *   TotalClaimed >= BulkAmount           → 'Full'
 *   Membership holder in group           → 'Posted'
 *   No membership holder in group        → 'Member Required'
 *
 * Body: { UserID, QuantityRequested }
 */
app.post("/posts/:id/join", (req, res) => {
    const postId = parseInt(req.params.id);
    const UserID = Number(req.body.UserID);
    const QuantityRequested = Number(req.body.QuantityRequested);

    // 1. Get post info, price, and current claimed amount
    const infoQ = `
        SELECT po.GroupID, pr.BulkAmount, sg.StoreID, stk.Price,
               COALESCE(SUM(pi.QuantityRequested), 0) AS TotalClaimed
        FROM Posts po
        JOIN Products pr         ON po.ProductID  = pr.ProductID
        JOIN SplitGroups sg      ON po.GroupID    = sg.GroupID
        JOIN Stocks stk          ON sg.StoreID    = stk.StoreID AND po.ProductID = stk.ProductID
        LEFT JOIN Participates_In pi ON po.PostID = pi.PostID
        WHERE po.PostID = ?
        GROUP BY po.GroupID, pr.BulkAmount, sg.StoreID, stk.Price
    `;

    db.query(infoQ, [postId], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!rows.length) return res.status(404).json({ message: "Post not found." });

        const { BulkAmount, Price, TotalClaimed } = rows[0];
        const available = Number(BulkAmount) - Number(TotalClaimed);

        if (QuantityRequested > available)
            return res.status(400).json({ message: `Only ${available} unit(s) remaining.` });

        // 2. Check for duplicate join
        db.query(
            "SELECT * FROM Participates_In WHERE UserID = ? AND PostID = ?",
            [UserID, postId], (err2, dup) => {
                if (err2) return res.status(500).json({ message: err2.message });
                if (dup.length)
                    return res.status(409).json({ message: "You have already joined this split." });

                const shareCost = ((QuantityRequested / BulkAmount) * Price).toFixed(2);

                // 3. Insert participant
                db.query(
                    "INSERT INTO Participates_In (UserID, PostID, QuantityRequested, CalculatedShareCost) VALUES (?, ?, ?, ?)",
                    [UserID, postId, QuantityRequested, shareCost], (err3) => {
                        if (err3) return res.status(500).json({ message: err3.message });

                        // 4. Update status
                        const newTotal = Number(TotalClaimed) + QuantityRequested;
                        let newStatus;

                        if (newTotal >= Number(BulkAmount)) {
                            db.query("UPDATE Posts SET Status = 'Full' WHERE PostID = ?", [postId], (err4) => {
                                if (err4) return res.status(500).json({ message: err4.message });
                                return res.json({ message: "Joined! Group is now Full.", status: "Full", shareCost: `$${shareCost}` });
                            });
                        } else {
                            db.query(`
                                SELECT m.MembershipID FROM Participates_In pi
                                JOIN MembershipHolders m ON pi.UserID = m.UserID
                                WHERE pi.PostID = ? LIMIT 1
                            `, [postId], (err5, memRows) => {
                                if (err5) return res.status(500).json({ message: err5.message });
                                const newStatus = memRows.length ? 'Member Joined' : 'Member Required';
                                db.query("UPDATE Posts SET Status = ? WHERE PostID = ?", [newStatus, postId], (err6) => {
                                    if (err6) return res.status(500).json({ message: err6.message });
                                    return res.json({ message: "Joined successfully!", status: newStatus, shareCost: `$${shareCost}` });
                                });
                            });
                        }
                    });
            });
    });
});

/**
 * POST /posts/:id/buy
 * Advances status from Full → Bought. Only a membership holder can trigger this.
 * Body: { UserID }
 */
app.post("/posts/:id/buy", (req, res) => {
    const { UserID } = req.body;

    db.query("SELECT * FROM MembershipHolders WHERE UserID = ?", [UserID], (err, memRows) => {
        if (err) return res.status(500).json(err);
        if (!memRows.length)
            return res.status(403).json({ message: "Only membership holders can confirm purchases." });

        db.query("SELECT Status FROM Posts WHERE PostID = ?", [req.params.id], (err2, posts) => {
            if (err2) return res.status(500).json(err2);
            if (!posts.length) return res.status(404).json("Post not found.");
            if (posts[0].Status !== 'Full')
                return res.status(400).json({ message: "Group must be Full before marking as Bought." });

            db.query("UPDATE Posts SET Status = 'Bought' WHERE PostID = ?", [req.params.id], (err3) => {
                if (err3) return res.status(500).json(err3);
                return res.json({ message: "Status updated to Bought." });
            });
        });
    });
});

/**
 * POST /posts/:id/complete
 * Advances status from Bought → Completed. Records Payment_Transaction.
 * Body: { PaymentMethod }
 */
app.post("/posts/:id/complete", (req, res) => {
    const { PaymentMethod } = req.body;

    db.query("SELECT Status, GroupID FROM Posts WHERE PostID = ?", [req.params.id], (err, posts) => {
        if (err) return res.status(500).json(err);
        if (!posts.length) return res.status(404).json("Post not found.");
        if (posts[0].Status !== 'Bought')
            return res.status(400).json({ message: "Post must be Bought before completing." });

        const { GroupID } = posts[0];

        db.query("SELECT SUM(CalculatedShareCost) AS Total FROM Participates_In WHERE GroupID = ?", [GroupID], (err2, totals) => {
            if (err2) return res.status(500).json(err2);
            const total = totals[0]?.Total ?? 0;

            db.query(
                "INSERT INTO Payment_Transactions (Date, Status, PaymentMethod, TotalAmount, GroupID) VALUES (NOW(), 'Completed', ?, ?, ?)",
                [PaymentMethod, total, GroupID], (err3) => {
                    if (err3) return res.status(500).json(err3);

                    db.query("UPDATE Posts SET Status = 'Completed' WHERE PostID = ?", [req.params.id], (err4) => {
                        if (err4) return res.status(500).json(err4);
                        db.query("UPDATE SplitGroups SET Status = 'Completed' WHERE GroupID = ?", [GroupID], (err5) => {
                            if (err5) return res.status(500).json(err5);
                            return res.json({ message: "Purchase completed!", totalAmount: total });
                        });
                    });
                });
        });
    });
});

/**
 * DELETE /posts/:id (Admin)
 */
app.delete("/posts/:id", (req, res) => {
    const postId = req.params.id;

    // Step 1: Remove all participants linked to this post
    db.query("DELETE FROM Participates_In WHERE PostID = ?", [postId], (err) => {
        if (err) return res.status(500).json({ message: err.message });

        // Step 2: Get the GroupID so we can clean up the SplitGroup too
        db.query("SELECT GroupID FROM Posts WHERE PostID = ?", [postId], (err2, rows) => {
            if (err2) return res.status(500).json({ message: err2.message });

            const groupID = rows[0]?.GroupID;

            // Step 3: Delete the post
            db.query("DELETE FROM Posts WHERE PostID = ?", [postId], (err3) => {
                if (err3) return res.status(500).json({ message: err3.message });

                // Step 4: Delete the now-orphaned SplitGroup if it exists
                if (groupID) {
                    db.query("DELETE FROM SplitGroups WHERE GroupID = ?", [groupID], (err4) => {
                        if (err4) console.error("Group cleanup failed:", err4);
                    });
                }

                return res.json({ message: "Post deleted." });
            });
        });
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// FAVOURITES
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /favourites/:userId
 * Returns all favourited products for a user with best available price.
 */
app.get('/favourites/:userId', (req, res) => {
    const q = `
        SELECT f.DateAdded,
               p.ProductID, p.ProductName, p.Brand, p.BulkSize, p.BulkAmount,
               MIN(stk.Price) AS Price
        FROM Favourites f
        JOIN Products p     ON f.ProductID  = p.ProductID
        LEFT JOIN Stocks stk ON p.ProductID = stk.ProductID
        WHERE f.UserID = ?
        GROUP BY f.DateAdded, p.ProductID, p.ProductName, p.Brand, p.BulkSize, p.BulkAmount
        ORDER BY f.DateAdded DESC
    `;
    db.query(q, [req.params.userId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

/**
 * POST /favourites
 * Adds product to user favourites. INSERT IGNORE silently skips duplicates.
 * Body: { UserID, ProductID }
 */
app.post('/favourites', (req, res) => {
    db.query(
        "INSERT IGNORE INTO Favourites (UserID, ProductID, DateAdded) VALUES (?, ?, CURDATE())",
        [req.body.UserID, req.body.ProductID], (err) => {
            if (err) return res.status(500).json(err);
            return res.json("Added to favourites!");
        });
});

/**
 * DELETE /favourites/:userId/:productId
 * Removes a product from a user's favourites.
 */
app.delete('/favourites/:userId/:productId', (req, res) => {
    db.query(
        "DELETE FROM Favourites WHERE UserID = ? AND ProductID = ?",
        [req.params.userId, req.params.productId], (err) => {
            if (err) return res.status(500).json(err);
            return res.json("Removed from favourites.");
        });
});

// ══════════════════════════════════════════════════════════════════════════════
// GROUPS & SPLIT DETAILS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /groups
 * All split groups with store and creator info.
 */
app.get('/groups', (req, res) => {
    const q = `
        SELECT sg.*, st.Name AS StoreName,
               u.FName AS CreatorFName, u.LName AS CreatorLName
        FROM SplitGroups sg
        JOIN Stores st ON sg.StoreID      = st.StoreID
        JOIN Users u   ON sg.CreatorUserID = u.UserID
        ORDER BY sg.DateCreated DESC
    `;
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

/**
 * GET /groups/:groupId/split
 * Participant breakdown for a group: who owes what.
 */
app.get('/groups/:groupId/split', (req, res) => {
    const q = `
        SELECT pi.UserID, u.FName, u.LName,
               pi.QuantityRequested, pi.CalculatedShareCost,
               sg.Status AS GroupStatus,
               stk.Price AS TotalPrice,
               pr.BulkAmount, pr.ProductName
        FROM Participates_In pi
        JOIN Users u         ON pi.UserID   = u.UserID
        JOIN SplitGroups sg  ON pi.GroupID  = sg.GroupID
        JOIN Posts po        ON po.GroupID  = sg.GroupID
        JOIN Products pr     ON po.ProductID = pr.ProductID
        JOIN Stocks stk      ON stk.StoreID  = sg.StoreID AND stk.ProductID = po.ProductID
        WHERE pi.GroupID = ?
    `;
    db.query(q, [req.params.groupId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

/**
 * POST /split-details
 * Manually inserts a split detail record.
 */
app.post('/split-details', (req, res) => {
    db.query(
        "INSERT INTO Split_Details (GroupID, SplitID, Parts, CalculatedTotalSplit) VALUES (?, ?, ?, ?)",
        [req.body.GroupID, req.body.SplitID, req.body.Parts, req.body.CalculatedTotalSplit], (err) => {
            if (err) return res.status(500).json(err);
            return res.json("Split details finalized.");
        });
});

// ══════════════════════════════════════════════════════════════════════════════
// STORES & LOCATIONS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /stores
 * All stores with location info joined in.
 */
app.get('/stores', (req, res) => {
    const q = `
        SELECT s.StoreID, s.Name, l.City, l.Street, l.Province, l.PostalCode
        FROM Stores s
        JOIN Locations l ON s.PostalCode = l.PostalCode
    `;
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

/**
 * POST /stores (Admin only)
 */
app.post('/stores', checkAdmin, (req, res) => {
    db.query("INSERT INTO Stores (Name, PostalCode) VALUES (?, ?)",
        [req.body.Name, req.body.PostalCode], (err) => {
            if (err) return res.status(500).json(err);
            return res.json("Store added successfully!");
        });
});

/**
 * GET /locations
 */
app.get('/locations', (req, res) => {
    db.query("SELECT * FROM Locations", (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// MEMBERSHIPS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /memberships (Admin)
 */
app.get('/memberships', (req, res) => {
    db.query(`SELECT m.*, u.FName, u.LName, u.Email FROM MembershipHolders m JOIN Users u ON m.UserID = u.UserID`,
        (err, data) => {
            if (err) return res.status(500).json(err);
            return res.json(data);
        });
});

/**
 * POST /memberships
 */
app.post('/memberships', (req, res) => {
    db.query(
        "INSERT INTO MembershipHolders (UserID, MembershipStore, MembershipExpirationDate) VALUES (?, ?, ?)",
        [req.body.UserID, req.body.MembershipStore, req.body.MembershipExpirationDate], (err) => {
            if (err) return res.status(500).json(err);
            return res.json("Membership added.");
        });
});

// ══════════════════════════════════════════════════════════════════════════════
// TRANSACTIONS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /transactions
 */
app.post('/transactions', (req, res) => {
    db.query(
        "INSERT INTO Payment_Transactions (Date, Status, PaymentMethod, TotalAmount, GroupID) VALUES (NOW(), 'Pending', ?, ?, ?)",
        [req.body.PaymentMethod ?? 'E-Transfer', req.body.TotalAmount, req.body.GroupID], (err) => {
            if (err) return res.status(500).json(err);
            return res.json("Transaction recorded.");
        });
});

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /admins
 */
app.get('/admins', (req, res) => {
    db.query('SELECT * FROM Administrators', (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

/**
 * GET /admin/dashboard
 * Single endpoint that returns users, posts, memberships, groups, and products
 * for the admin panel — avoids five separate fetches from the frontend.
 */
app.get('/admin/dashboard', (_req, res) => {
    const run = (sql, params = []) => new Promise((resolve, reject) =>
        db.query(sql, params, (e, d) => e ? reject(e) : resolve(d)));

    Promise.all([
        run(`SELECT u.UserID, u.FName, u.LName, u.Email, u.PostalCode,
                    m.MembershipID, m.MembershipStore, m.MembershipExpirationDate
             FROM Users u LEFT JOIN MembershipHolders m ON u.UserID = m.UserID`),

        run(`SELECT p.PostID, p.Status, p.DatePosted, p.QuantityRequested,
                    pr.ProductName, st.Name AS StoreName
             FROM Posts p
             JOIN Products pr         ON p.ProductID = pr.ProductID
             LEFT JOIN SplitGroups sg ON p.GroupID   = sg.GroupID
             LEFT JOIN Stores st      ON sg.StoreID  = st.StoreID`),

        run(`SELECT m.*, u.FName, u.LName
             FROM MembershipHolders m JOIN Users u ON m.UserID = u.UserID`),

        run(`SELECT sg.*, st.Name AS StoreName, u.FName, u.LName
             FROM SplitGroups sg
             JOIN Stores st ON sg.StoreID       = st.StoreID
             JOIN Users u   ON sg.CreatorUserID = u.UserID
             WHERE sg.Status != 'Completed'`),

        run(`SELECT * FROM Products ORDER BY ProductName`)
    ])
    .then(([users, posts, memberships, groups, products]) =>
        res.json({ users, posts, memberships, groups, products }))
    .catch(err => res.status(500).json(err));
});

// --- ADD THIS TO THE BOTTOM OF index.js ---

// Endpoint to leave a split
app.post("/leave-split", (req, res) => {
    const { UserID, PostID } = req.body;

    db.query(
        "DELETE FROM Participates_In WHERE UserID = ? AND PostID = ?",
        [UserID, PostID], (err) => {
            if (err) return res.status(500).json({ message: err.message });

            recalcPostStatus(PostID, (err2, newStatus) => {
                if (err2) return res.status(500).json({ message: err2.message });
                return res.json({ message: "Left split.", newStatus });
            });
        });
});

// Endpoint to update quantity
app.put("/update-quantity", (req, res) => {
    const { UserID, PostID, NewQty } = req.body;
    db.query("CALL UpdateSplitQuantity(?, ?, ?)", [UserID, PostID, NewQty], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(200).json("Quantity updated.");
    });
});

/**
 * DELETE /admin/remove-participant
 * Admin removes a specific user from a split group
 */
app.delete("/admin/remove-participant", (req, res) => {
    const { UserID, PostID } = req.body;

    db.query(
        "DELETE FROM Participates_In WHERE UserID = ? AND PostID = ?",
        [UserID, PostID], (err) => {
            if (err) return res.status(500).json({ message: err.message });

            recalcPostStatus(PostID, (err2, newStatus) => {
                if (err2) return res.status(500).json({ message: err2.message });
                return res.json({ message: "Participant removed.", newStatus });
            });
        });
});

app.listen(3000, () => console.log('Server running on port 3000'));