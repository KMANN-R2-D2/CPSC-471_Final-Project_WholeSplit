# WholeSplit — Setup Guide

WholeSplit is a full-stack web application that enables community members to coordinate bulk grocery purchases from wholesale retailers such as Costco. Users can post split requests, join existing splits, and have their share cost calculated automatically.

---

## Prerequisites

Install the following before starting:

- **Node.js** (v18 or higher) — https://nodejs.org
- **MySQL 8** — https://dev.mysql.com/downloads/mysql
- **MySQL Workbench** — https://dev.mysql.com/downloads/workbench
- A terminal (Command Prompt, PowerShell, or Terminal on Mac)

---

## Step 1 — Set Up the Database

1. Open MySQL Workbench and connect to your local MySQL instance using your root credentials
2. Click **File → Open SQL Script** and open the file `database/WholeSplitDB.sql`
3. Click the lightning bolt **(Execute All)** button to run the entire script
4. The script will create the database, all tables, stored procedures, and seed data automatically
5. Verify it worked by checking that **WholeSplitDB** appears in the Schemas panel on the left side of MySQL Workbench

---

## Step 2 — Configure the Backend

1. Open the file `backend/index.js` in a text editor
2. Find this block near the top of the file:

```js
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'StridingTrident!%$709#',
    database: 'WholeSplitDB'
});
```

3. Replace the `password` value with your own MySQL root password
4. Save the file

---

## Step 3 — Run the Backend

Open a terminal, navigate to the backend folder, and run the following commands:

```
cd WholeSplit/backend
npm install
nodemon index.js
```

You should see the following output confirming everything is working:

```
Connected to MySQL!
Server running on port 3000
```

**Leave this terminal open.** The backend must stay running for the application to work.

---

## Step 4 — Run the Frontend

Open a **second terminal** (keep the first one running), navigate to the frontend folder, and run:

```
cd WholeSplit/frontend
npm install
npm run dev
```

You should see output containing a local URL:

```
  VITE ready in Xs

  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser. The application will load.

---

## Step 5 — Logging In

### Pre-seeded User Accounts

The database comes with the following accounts ready to use:

| Name | Email | Password | Type |
|---|---|---|---|
| Peter Parker | peter@example.com | securePass1! | Membership Holder |
| Mary Jane | mj@example.com | securePass2! | Standard User |
| Bruce Wayne | bruce@example.com | securePass3! | Membership Holder |
| Clark Kent | clark@example.com | securePass4! | Standard User |
| Diana Prince | diana@example.com | securePass5! | Membership Holder |

### Admin Account

| Email | Password |
|---|---|
| admin@wholesplit.com | admin123 |

Log in via the same login page. The admin view of the application will load automatically when admin credentials are used.

---

## Step 6 — Using the Application

### As a Standard User or Membership Holder

- **Browse the Feed** — The Community Split Feed is the home page. It shows all active split posts with progress bars, status badges, and action buttons.
- **Join a Split** — Click **Join Split** on any post, select a store location, use the slider to choose your quantity, and confirm. Your share cost is calculated and displayed before you confirm.
- **Leave a Split** — Click **Join Split** on a post you have already joined. A **Leave This Split** button will appear instead.
- **Create a Post** — Click **+ New Split Request** on the feed. Select a product, a store, and your desired quantity, then click **Publish to Feed**.
- **Browse Products** — Click **Products** in the navigation bar to view the full inventory catalogue with pricing and cost per unit.
- **View Community** — Click **Community** in the navigation bar to see all registered users and their membership status.
- **Sign Up** — Click **Sign Up** in the navigation bar to create a new account. Check the membership checkbox during signup if you hold a Costco membership.

### As an Administrator

- **Delete Posts** — The feed shows a **Delete Post** button on every row. Clicking it removes the post and all associated participant records.
- **Remove Users from Splits** — The **Remove User** button removes all participants from a split group.
- **Manage Products** — The Products page shows an **Add New Product** form at the top and a **Delete** button on every product card.

---

## Troubleshooting

**"DB connection failed" appears in the backend terminal**
Your MySQL password in `backend/index.js` does not match your local MySQL root password. Update the `password` field and restart the backend.

**"npm is not recognized" in the terminal**
Node.js is not installed or not added to your system PATH. Download and install it from https://nodejs.org, then close and reopen your terminal.

**PowerShell execution policy error when running npm**
Run the following command once in PowerShell as Administrator, then try again:
```
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**The page loads but the feed is empty or shows no data**
Confirm both terminals are running simultaneously — one for the backend on port 3000 and one for the frontend on port 5173. If the backend terminal shows any errors, check that the database was set up correctly in Step 1.

**"Cannot POST" or "Cannot GET" error messages in the browser**
The backend server is not running. Return to the backend terminal and run `npm run dev` again.

**Login fails for a seeded user**
The database may have been set up before the password hashing was applied. Run the following in MySQL Workbench to reset the passwords:
```sql
USE WholeSplitDB;
UPDATE Users SET PasswordHash = SHA2('securePass1!', 256) WHERE Email = 'peter@example.com';
UPDATE Users SET PasswordHash = SHA2('securePass2!', 256) WHERE Email = 'mj@example.com';
UPDATE Users SET PasswordHash = SHA2('securePass3!', 256) WHERE Email = 'bruce@example.com';
UPDATE Users SET PasswordHash = SHA2('securePass4!', 256) WHERE Email = 'clark@example.com';
UPDATE Users SET PasswordHash = SHA2('securePass5!', 256) WHERE Email = 'diana@example.com';
```

---

## Port Reference

| Service | Address |
|---|---|
| Backend API | http://localhost:3000 |
| Frontend | http://localhost:5173 |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Database | MySQL 8 |
| Backend | Node.js + Express |
| Frontend | React + Vite |
| DB Driver | mysql2 |
| HTTP Client | Axios |
