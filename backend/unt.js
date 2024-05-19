const express = require("express");
const mysql = require("mysql");
const mysql2 = require("mysql2/promise");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");

// Set up storage for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads/avatars")); // Directory to store images
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

const upload = multer({ storage: storage });

const app = express();
const port = 8081; // Changed port to 8081 as it's the listening port for the express server

app.use(cors());
app.use(express.json()); // Add this line to parse JSON bodies

// Function to initialize the database
async function initializeDatabase() {
  try {
    const db = await mysql2.createConnection({
      host: "localhost",
      user: "root",
      password: "",
    });

    console.log("MySQL connected");

    // Create database if it doesn't exist
    await db.query("CREATE DATABASE IF NOT EXISTS dreamify");
    console.log("Database 'dreamify' created or already exists");

    // Connect to the newly created database
    await db.changeUser({ database: "dreamify" });

    // Create users table
    const sqlUsers = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        surname VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )`;

    await db.query(sqlUsers);
    console.log("Table 'users' created or already exists");

    // Create dream_entries table with foreign key user_id
    const sqlDreamEntries = `
      CREATE TABLE IF NOT EXISTS dream_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`;

    await db.query(sqlDreamEntries);
    console.log("Table 'dream_entries' created or already exists");

    return db;
  } catch (err) {
    console.error("Error initializing database", err);
    throw err;
  }
}

// Initialize the database and start the server
initializeDatabase()
  .then((db) => {
    // Create a connection pool for promise-based MySQL queries
    const pool = mysql2.createPool({
      host: "localhost",
      user: "root",
      password: "",
      database: "dreamify",
    });

    // Example route
    app.get("/", (req, res) => {
      res.send("Welcome to Dreamify!");
    });

    app.post("/login", async (req, res) => {
      const { email, password } = req.body;
      try {
        const [results] = await pool.query(
          "SELECT * FROM users WHERE email = ? AND password = ?",
          [email, password]
        );
        if (results.length > 0) {
          res.send("Login successful!");
        } else {
          res.status(401).send("Invalid credentials");
        }
      } catch (err) {
        res.status(500).send(err);
      }
    });

    app.listen(port, () => {
      console.log(`Server is running at port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Error initializing database", err);
  });
