const express = require("express");
const mysql = require("mysql");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const mysql2 = require("mysql2/promise");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const helmet = require("helmet");
const app = express();
const port = 8081; // Changed port to 8081 as it's the listening port for the express server

app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "http://localhost:8081"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

app.use(helmet.frameguard({ action: "deny" }));
app.use(helmet.noSniff());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  const forbiddenFiles = [".git", ".env", ".git/config"];
  if (forbiddenFiles.some((file) => req.url.includes(file))) {
    return res.status(403).send("Access Denied");
  }
  next();
});

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

let pool; // Declare pool in the higher scope

// Function to create the database if it doesn't exist
async function createDatabase() {
  const connection = await mysql2.createConnection({
    host: "localhost",
    user: "root",
    password: "",
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS dreamify`);
  await connection.end();
}

// Function to initialize the database with tables and data
async function initializeDatabase(pool) {
  try {
    const sqlStatements = [
      `CREATE TABLE IF NOT EXISTS categories (
        id int primary key auto_increment,
        name varchar(255) not null
      )`,
      `CREATE TABLE IF NOT EXISTS users (
        id int NOT NULL AUTO_INCREMENT,
        name varchar(30) NOT NULL,
        surname varchar(255) NOT NULL,
        email varchar(255) NOT NULL,
        password varchar(255) NOT NULL,
        username varchar(50) DEFAULT NULL,
        IsAdmin tinyint(1) NOT NULL DEFAULT '0',
        resetToken varchar(50) DEFAULT NULL,
        avatar_url varchar(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        country varchar(50) DEFAULT NULL,
        gender varchar(50) DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY email (email),
        UNIQUE KEY username (username)
      )`,
      `CREATE TABLE IF NOT EXISTS dream_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        lucid BOOLEAN DEFAULT FALSE,
        category INT DEFAULT NULL,
        FOREIGN KEY (category) REFERENCES categories(id) ON DELETE SET NULL
      )`,
      `CREATE TABLE IF NOT EXISTS shared_dreams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dream_id INT,
        Date DATE,
        Likes INT DEFAULT 0,
        FOREIGN KEY (dream_id) REFERENCES dream_entries(id) ON DELETE CASCADE,
        UNIQUE (dream_id)
      )`,
      `CREATE TABLE IF NOT EXISTS dream_likes (
        Userid INT,
        FOREIGN KEY (Userid) REFERENCES users(id) ON DELETE CASCADE,
        DreamId INT,
        FOREIGN KEY (DreamId) REFERENCES shared_dreams(id) ON DELETE CASCADE,
        disliked BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (Userid, DreamId)
      )`,
      `CREATE TABLE IF NOT EXISTS comments (
        ID INT AUTO_INCREMENT PRIMARY KEY,
        Dream_id INT,
        User_id INT,
        Contents TEXT,
        Date_posted DATE,
        likes INT DEFAULT 0,
        FOREIGN KEY (Dream_id) REFERENCES shared_dreams(id) ON DELETE CASCADE,
        FOREIGN KEY (User_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS comment_likes (
        User_id INT,
        Comment_id INT,
        FOREIGN KEY (User_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (Comment_id) REFERENCES comments(ID) ON DELETE CASCADE,
        disliked BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (User_id, Comment_id)
      )`,
      `CREATE TABLE IF NOT EXISTS tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tag_name VARCHAR(255) NOT NULL,
        user_id INT,
        dream_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (dream_id) REFERENCES dream_entries(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS replies (
        ID INT AUTO_INCREMENT PRIMARY KEY,
        Comment_id INT,
        User_id INT,
        Contents TEXT,
        Date_posted DATE,
        likes INT DEFAULT 0,
        FOREIGN KEY (Comment_id) REFERENCES comments(ID) ON DELETE CASCADE,
        FOREIGN KEY (User_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS reply_likes (
        User_id INT,
        Reply_id INT,
        FOREIGN KEY (User_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (Reply_id) REFERENCES replies(ID) ON DELETE CASCADE,
        disliked BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (User_id, Reply_id)
      )`,
      `
      INSERT INTO categories (id, name) VALUES 
      (1, 'Adventure & Exploration'),
      (2, 'Nightmares & Fears'),
      (3, 'Relationships & Family'),
      (4, 'Work & Career'),
      (5, 'Learning & Discovery'),
      (6, 'Fantasy & Mythology'),
      (7, 'Animals & Nature'),
      (8, 'Health & Healing'),
      (9, 'Mystical & Spiritual'),
      (10, 'Celebration & Joy')

      ON DUPLICATE KEY UPDATE name = VALUES(name);
    `,
    ];

    const connection = await pool.getConnection();
    try {
      for (const sql of sqlStatements) {
        await connection.query(sql);
      }
      console.log("All tables created or already exist");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Server setup and initialization
(async () => {
  try {
    // Create the database if it doesn't exist
    await createDatabase();

    // Create a connection pool for promise-based MySQL queries
    pool = mysql2.createPool({
      host: "localhost",
      user: "root",
      password: "",
      database: "dreamify",
    });

    // Initialize the database with tables and data
    await initializeDatabase(pool);

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running at port ${port}`);
    });
  } catch (error) {
    console.error("Error setting up the server:", error);
  }
})();

async function showCreateTable() {
  const connection = await mysql2.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "dreamify",
  });

  try {
    const [rows] = await connection.query("SHOW CREATE TABLE `tags`");
    if (rows && rows.length > 0) {
      console.log(rows[0]["Create Table"]);
    } else {
      console.log("No rows returned");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

showCreateTable();

app.use(bodyParser.json({ limit: "10mb" }));

// Upload avatar code
app.post("/upload-avatar", upload.single("avatar"), async (req, res) => {
  const userId = req.body.userId;
  let avatarPath;

  if (req.file) {
    avatarPath = `/uploads/avatars/${req.file.filename}`;
  } else if (req.body.image) {
    // Handle Base64 image data
    const base64Data = req.body.image.replace(
      /^data:image\/(png|jpeg);base64,/,
      ""
    );
    const extension = req.body.image.split(";")[0].split("/")[1];
    avatarPath = `/uploads/avatars/${Date.now()}.${extension}`;
    fs.writeFileSync(path.join(__dirname, avatarPath), base64Data, "base64");
  } else {
    return res
      .status(400)
      .json({ success: false, message: "No image provided" });
  }

  try {
    const connection = await pool.getConnection();
    try {
      // Fetch the current avatar URL for the user
      const [rows] = await connection.execute(
        "SELECT avatar_url FROM users WHERE id = ?",
        [userId]
      );
      const currentAvatarPath = rows.length > 0 ? rows[0].avatar_url : null;

      // Update the user's avatar URL
      await connection.execute("UPDATE users SET avatar_url = ? WHERE id = ?", [
        avatarPath,
        userId,
      ]);

      // Delete the previous avatar file if it exists and is not the default avatar
      if (currentAvatarPath && currentAvatarPath !== avatarPath) {
        const currentAvatarFullPath = path.join(__dirname, currentAvatarPath);
        if (fs.existsSync(currentAvatarFullPath)) {
          fs.unlinkSync(currentAvatarFullPath);
        }
      }

      res.json({ success: true, avatarPath });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating user avatar:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update avatar" });
  }
});

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Get all user information
app.get("/api/users/:userId", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      res.status(401).json({ message: "Unauthorized" });
    } else {
      const userId = req.params.userId;

      // Query the database
      pool
        .query("SELECT * FROM users WHERE id = ?", [userId])
        .then(([rows, fields]) => {
          if (rows.length > 0) {
            res.json(rows[0]); // If the user exists, send their data
          } else {
            res.status(404).json({ message: "User not found" }); // If the user doesn't exist, send an error
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ message: "Server error" }); // If there was a server error, send an error
        });
    }
  });
});

// Get all dreams for a user Endpoint code code for profile
app.get("/api/users/:userId/dreams", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      res.status(401).json({ message: "Unauthorized" });
    } else {
      const userId = req.params.userId;
      // Query the database
      pool
        .query(
          `
          SELECT dream_entries.*, GROUP_CONCAT(tags.tag_name SEPARATOR ',') AS tags
          FROM dream_entries 
          LEFT JOIN tags ON dream_entries.id = tags.dream_id
          WHERE dream_entries.user_id = ?
          GROUP BY dream_entries.id
        `,
          [userId]
        )
        .then(([rows, fields]) => {
          if (rows.length > 0) {
            // Convert tags from string to array
            const modifiedRows = rows.map((row) => ({
              ...row,
              tags: row.tags ? row.tags.split(",") : [],
            }));
            res.json(modifiedRows); // If the user has dreams, send them
          } else {
            res.status(404).json({ message: "No dreams found for this user" }); // If the user has no dreams, send an error
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ message: "Server error" }); // If there was a server error, send an error
        });
    }
  });
});

//Dream entry access endpoint code
app.get("/api/dreams/:dreamId", async (req, res) => {
  const dreamId = req.params.dreamId;

  // Query the database
  pool
    .query("SELECT * FROM dream_entries WHERE id = ?", [dreamId])
    .then(([rows, fields]) => {
      if (rows.length > 0) {
        res.json(rows[0]); // If the dream exists, send it
      } else {
        res.status(404).json({ message: "No dream found with this id" }); // If the dream doesn't exist, send an error
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" }); // If there was a server error, send an error
    });
});

//Dream entry update endpoint code
app.put("/api/dreams/:dreamId", async (req, res) => {
  const dreamId = req.params.dreamId;
  console.log(req.body);
  const { title, description } = req.body;

  // Query the database
  pool
    .query("UPDATE dream_entries SET title = ?, description = ? WHERE id = ?", [
      title,
      description,
      dreamId,
    ])
    .then(([rows, fields]) => {
      if (rows.affectedRows > 0) {
        res.json({ message: "Dream updated successfully" });
      } else {
        res.status(404).json({ message: "No dream found with this id" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
});
//for fetching dreams to save later
//it is better
app.get("/api/dreams/:id/fetch", (req, res) => {
  console.log("Fetch dream endpoint hit");
  const dreamId = req.params.id;

  const query = `
    SELECT 
      d.id, d.title, d.description, d.date, d.lucid,d.category,
      GROUP_CONCAT(t.tag_name SEPARATOR ',') AS tags
    FROM 
      dream_entries d
    LEFT JOIN 
      tags t ON d.id = t.dream_id
    WHERE 
      d.id = ?
    GROUP BY 
      d.id
  `;

  pool
    .query(query, [dreamId])
    .then(([rows, fields]) => {
      if (rows.length > 0) {
        const dream = rows[0];
        console.log(dream);
        dream.tags = dream.tags ? dream.tags.split(",") : [];
        res.json(dream);
      } else {
        res.status(404).json({ message: "No dream found with this id" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
});

//Dream entry delete endpoint code

app.delete("/api/dreams/:id/delete", async (req, res) => {
  const dreamId = req.params.id;
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, secretKey);
  const userId = decodedToken.userId;

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [sharedDreams] = await connection.query(
        "SELECT id FROM shared_dreams WHERE dream_id = ?",
        [dreamId]
      );
      await connection.query("DELETE FROM dream_likes WHERE DreamId = ?", [
        sharedDreams[0].id,
      ]);

      await connection.query("DELETE FROM tags WHERE dream_id = ?", [dreamId]);

      const [comments] = await connection.query(
        "SELECT ID FROM comments WHERE Dream_id = ?",
        [sharedDreams[0].id]
      );

      for (let comment of comments) {
        await connection.query(
          "DELETE FROM comment_likes WHERE comment_id = ?",
          [comment.ID]
        );
      }

      await connection.query("DELETE FROM comments WHERE Dream_id = ?", [
        sharedDreams[0].id,
      ]);

      await connection.query("DELETE FROM shared_dreams WHERE dream_id = ?", [
        dreamId,
      ]);

      const [results] = await connection.query(
        "DELETE FROM dream_entries WHERE id = ? AND user_id = ?",
        [dreamId, userId]
      );

      if (results.affectedRows === 0) {
        await connection.rollback();
        res.status(404).send({ error: "Dream not found" });
      } else {
        await connection.commit();
        res.status(200).send({ message: "Dream deleted" });
      }
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error" });
  }
});
const bcrypt = require("bcrypt");
const saltRounds = 10;
app.post("/api/signup", async (req, res) => {
  let { name, surname, username, password, email, date_of_birth, gender } =
    req.body;
  let created_at = new Date().toISOString().slice(0, 19).replace("T", " ");
  console.log(req.body);
  console.log("date of birth", date_of_birth);
  console.log("gender", gender);

  const regex = /^[a-zA-Z]+$/;
  if (!regex.test(name) || !regex.test(surname)) {
    return res
      .status(400)
      .json({ error: "Name and surname can only contain alphabets" });
  }
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be at least 8 characters long",
    });
  }
  password = bcrypt.hashSync(password, saltRounds);
  const query = `
    INSERT INTO users (name, surname, username, password, email, gender, date_of_birth, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  try {
    const result = await pool.query(query, [
      name,
      surname,
      username,
      password,
      email,
      gender,
      date_of_birth,
      created_at,
    ]);

    // Retrieve the newly created user's ID
    const userId = result[0].insertId;

    // Query the database to get the user details using the newly created user's ID
    const [userResult] = await pool.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    const user = userResult[0];

    let token = generateToken(user);
    res
      .status(200)
      .json({ message: "Signup successful", user: user, token: token });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/shared-dreams/:id/dream-status", async (req, res) => {
  const dreamid = req.params.id;
  console.log(`Checking status for dream ID: ${dreamid}`); // Debugging log

  try {
    const [results] = await pool.query(
      // for next time use pool.query instead of pool.execute
      "SELECT * FROM shared_dreams WHERE Dream_id = ?",
      [dreamid]
    );
    console.log("Query executed successfully. Results:", results); // Debugging log
    if (results.length > 0) {
      console.log("Dream is shared.");
      res.status(200).json({ message: "Dream is shared" });
    } else {
      console.log("Dream not found.");
      res.status(404).json({ message: "Dream not found" });
    }
  } catch (error) {
    console.error("Database error:", error); // Debugging log
    res.status(500).json({ message: "Server error" });
  }
});

//Shared dreams creation code
app.post("/api/dreams/:dreamId/share", async (req, res) => {
  const dreamId = req.params.dreamId;
  const date = new Date().toISOString().slice(0, 19).replace("T", " "); // Get current date in MySQL datetime format

  // Query the database
  pool
    .query("INSERT IGNORE INTO shared_dreams (Dream_id, date) VALUES (?, ?)", [
      dreamId,
      date,
    ])
    .then(([rows, fields]) => {
      if (rows.affectedRows === 0) {
        res.status(409).json({ message: "Dream already shared" });
      } else {
        res.json({ message: "Dream shared successfully" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
});

app.post("/api/dreams/:id/unshare", async (req, res) => {
  const dreamId = req.params.id;

  console.log(`Attempting to unshare dream with ID: ${dreamId}`); // Added logging

  // Query the database to delete the dream from shared_dreams
  pool
    .query("DELETE FROM shared_dreams WHERE dream_id = ?", [dreamId])
    .then(([rows, fields]) => {
      console.log("Delete operation results:", rows); // Added logging
      if (rows.affectedRows === 0) {
        res.status(409).json({ message: "Dream not shared" });
      } else {
        res.json({ message: "Dream unshared successfully" });
      }
    })
    .catch((error) => {
      console.error("Database error:", error); // Debugging log
      res.status(500).json({ message: "Server error" });
    });
});

// Shared dreams access code
app.get("/api/shared-dreams", async (req, res) => {
  // Query the database
  pool
    .query(
      `
      SELECT shared_dreams.*, dream_entries.title, dream_entries.description, dream_entries.lucid, dream_entries.category, users.username, users.avatar_url, GROUP_CONCAT(tags.tag_name SEPARATOR ',') AS tags
      FROM shared_dreams 
      INNER JOIN dream_entries ON shared_dreams.Dream_id = dream_entries.id
      INNER JOIN users ON dream_entries.user_id = users.id
      LEFT JOIN tags ON dream_entries.id = tags.dream_id
      GROUP BY shared_dreams.Id
      `
    )
    .then(([rows, fields]) => {
      // Convert tags from string to array
      const modifiedRows = rows.map((row) => ({
        ...row,
        tags: row.tags ? row.tags.split(",") : [],
      }));
      res.json(modifiedRows);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
});

// User Login

app.post("/login", async (req, res) => {
  console.log("Login endpoint hit");
  const { email, password } = req.body;
  console.log(`Received email: ${email}`);

  const sql = "SELECT * FROM users WHERE email = ?";

  try {
    const [result] = await pool.query(sql, [email]);
    console.log("Query executed, result:", result);

    if (result.length > 0) {
      const user = result[0];
      console.log("User found:", user);

      // Compare the password with the hashed password stored in the database
      const match = bcrypt.compareSync(password, user.password);
      console.log("Password match:", match);

      if (match) {
        let token = generateToken(user);
        console.log("Token generated:", token);

        res
          .status(200)
          .json({ message: "Login successful", user: user, token: token });
      } else {
        // Password does not match
        console.log("Password does not match");
        res.status(401).send("Invalid email or password");
      }
    } else {
      // User not found
      console.log("User not found");
      res.status(401).send("Invalid email or password");
    }
  } catch (err) {
    console.error("Error while logging in:", err);
    res.status(500).send("Error while logging in");
  }
});

// Dream entry code

app.post("/user", async (req, res) => {
  const { date, title, description, lucid, tags, category } = req.body;
  const sqlDreamEntries =
    "INSERT INTO dream_entries (user_id, date, title, description, lucid, category) VALUES (?, ?, ?, ?, ?, ?)";
  const sqlTags =
    "INSERT INTO tags (tag_name, user_id, dream_id) VALUES (?, ?, ?)";
  const sqlRetrieveDreamId =
    "SELECT id FROM dream_entries WHERE user_id = ? AND date = ? AND title = ? AND description = ? AND lucid = ? ORDER BY id DESC LIMIT 1";

  console.log("Request body:", req.body);
  console.log("category", category);

  try {
    // Get user ID from token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.error("Authorization header missing");
      return res.status(401).send("Authorization header missing");
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, secretKey);
    const userId = decodedToken.userId;
    console.log("User ID extracted from token:", userId);

    // Ensure tags is an array
    if (!Array.isArray(tags)) {
      console.error("Tags should be an array");
      return res.status(400).send("Tags should be an array");
    }

    // Insert dream entry
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute(sqlDreamEntries, [
        userId,
        date,
        title,
        description,
        lucid,
        category,
      ]);

      // Retrieve dreamId based on unique properties
      const [dreamResult] = await connection.execute(sqlRetrieveDreamId, [
        userId,
        date,
        title,
        description,
        lucid,
      ]);
      if (dreamResult.length === 0) {
        throw new Error("Dream entry not found after insertion");
      }
      const dreamId = dreamResult[0].id;
      console.log("Dream entry retrieved successfully, dreamId:", dreamId);

      // Insert tags
      const tagPromises = tags.map((tag) =>
        connection.execute(sqlTags, [tag, userId, dreamId])
      );
      await Promise.all(tagPromises);

      await connection.commit();

      res.status(200).send("Dream entry and tags added successfully");
    } catch (err) {
      await connection.rollback();
      console.error("Error during database operation:", err);
      res.status(500).send("Error during database operation");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(401).send("Unauthorized");
  }
});

// Dream entry saval code
app.post("/user/save", async (req, res) => {
  console.log("Save dream endpoint hit");
  console.log(req.body);
  const { dreamId, date, title, description, lucid, tags, category } = req.body;

  const sqlUpdateDreamEntries =
    "UPDATE dream_entries SET date = ?, title = ?, description = ?, lucid = ?, category = ? WHERE id = ? AND user_id = ?";
  const sqlDeleteTags =
    "DELETE FROM tags WHERE dream_id = ? AND tag_name NOT IN (?)";
  const sqlInsertTag =
    "INSERT INTO tags (user_id, dream_id, tag_name) VALUES (?, ?, ?)";

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.error("Authorization header missing");
      return res.status(401).send("Authorization header missing");
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, secretKey);
    const userId = decodedToken.userId;
    console.log("User ID extracted from token:", userId);

    if (!Array.isArray(tags)) {
      console.error("Tags should be an array");
      return res.status(400).send("Tags should be an array");
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute(sqlUpdateDreamEntries, [
        date,
        title,
        description,
        lucid,
        category,
        dreamId,
        userId,
      ]);

      console.log("Dream updated successfully");

      // Prepare tags for deletion and insertion
      const tagNames = tags.map((tag) => tag.trim());

      // Delete tags not in the new tag list
      await connection.execute(sqlDeleteTags, [dreamId, tagNames]);

      console.log("Old tags deleted successfully");

      // Insert new tags
      const tagPromises = tagNames.map((tag) =>
        connection.execute(sqlInsertTag, [userId, dreamId, tag])
      );
      await Promise.all(tagPromises);

      await connection.commit();

      res.status(200).send("Dream and tags updated successfully");
    } catch (err) {
      await connection.rollback();
      console.error("Error during database operation:", err);
      res.status(500).send("Error during database operation");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(401).send("Unauthorized");
  }
});

//token code
const jwt = require("jsonwebtoken");

// Function to generate JWT token
function generateToken(user) {
  const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: "1h" });

  return token;
}

function generateSecretKey() {
  return crypto.randomBytes(32).toString("hex"); // Generate a random 256-bit (32-byte) value and convert it to hexadecimal string
}

const secretKey = generateSecretKey();
console.log("Generated Secret Key:", secretKey);

// Code for dreamboard

// code for unlike
app.post("/api/shared-dreams/:id/:userid/unlike", async (req, res) => {
  const dreamId = req.params.id;
  const userId = req.params.userid;

  // Check if the user has already liked this dream
  pool
    .query(`SELECT * FROM dream_likes WHERE UserId = ? AND DreamId = ?`, [
      userId,
      dreamId,
    ])
    .then(([rows, fields]) => {
      if (rows.length > 0 && !rows[0].disliked) {
        // The user has liked this dream, so remove the like
        pool
          .query(`UPDATE shared_dreams SET Likes = Likes - 1 WHERE Id = ?`, [
            dreamId,
          ])
          .then(([rows, fields]) => {
            pool
              .query(
                `DELETE FROM dream_likes WHERE UserId = ? AND DreamId = ?`,
                [userId, dreamId]
              )
              .then(([rows, fields]) => {
                res.json({ message: "Dream unliked successfully" });
              });
          });
      } else {
        // The user has not liked this dream
        res.status(400).json({ message: "You have not liked this dream" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
});
// Code for dreamboard like addition endpoint

app.post("/api/shared-dreams/:id/:userid/like", async (req, res) => {
  const dreamId = req.params.id;
  const userId = req.params.userid;

  // Check if the user has already liked or disliked this dream
  pool
    .query(`SELECT * FROM dream_likes WHERE UserId = ? AND DreamId = ?`, [
      userId,
      dreamId,
    ])
    .then(([rows, fields]) => {
      if (rows.length > 0) {
        // The user has already liked or disliked this dream
        if (rows[0].disliked) {
          // The user has disliked this dream, so change it to a like
          pool
            .query(`UPDATE shared_dreams SET Likes = Likes + 1 WHERE Id = ?`, [
              dreamId,
            ])
            .then(([rows, fields]) => {
              pool
                .query(
                  `UPDATE dream_likes SET disliked = FALSE WHERE UserId = ? AND DreamId = ?`,
                  [userId, dreamId]
                )
                .then(([rows, fields]) => {
                  res.json({ message: "Dream liked successfully" });
                });
            });
        } else {
          // The user has already liked this dream
          res
            .status(400)
            .json({ message: "You have already liked this dream" });
        }
      } else {
        // The user has not liked or disliked this dream yet, so add a like
        pool
          .query(`UPDATE shared_dreams SET Likes = Likes + 1 WHERE Id = ?`, [
            dreamId,
          ])
          .then(([rows, fields]) => {
            pool
              .query(
                `INSERT INTO dream_likes (UserId, DreamId, disliked) VALUES (?, ?, FALSE)`,
                [userId, dreamId]
              )
              .then(([rows, fields]) => {
                res.json({ message: "Dream liked successfully" });
              });
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
});
// endpoint for +2 likes
app.post("/api/shared-dreams/:id/:userid/likeFromDislike", async (req, res) => {
  const dreamId = req.params.id;
  const userId = req.params.userid;

  // Check if the user has already liked or disliked this dream
  pool
    .query(`SELECT * FROM dream_likes WHERE UserId = ? AND DreamId = ?`, [
      userId,
      dreamId,
    ])
    .then(([rows, fields]) => {
      if (rows.length > 0) {
        // The user has already liked or disliked this dream
        if (rows[0].disliked) {
          // The user has disliked this dream, so change it to a like and increase the likes count by 2
          pool
            .query(`UPDATE shared_dreams SET Likes = Likes + 2 WHERE Id = ?`, [
              dreamId,
            ])
            .then(([rows, fields]) => {
              pool
                .query(
                  `UPDATE dream_likes SET disliked = FALSE WHERE UserId = ? AND DreamId = ?`,
                  [userId, dreamId]
                )
                .then(([rows, fields]) => {
                  res.json({ message: "Dream liked successfully" });
                });
            });
        } else {
          // The user has already liked this dream
          res
            .status(400)
            .json({ message: "You have already liked this dream" });
        }
      } else {
        // The user has not liked or disliked this dream yet, so return an error
        res
          .status(400)
          .json({ message: "You have not disliked this dream yet" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
});
// Code for dreamboard like/dislike status check endpoint
app.get("/api/shared-dreams/:id/:userid/likeStatus", async (req, res) => {
  const dreamId = req.params.id;
  const userId = req.params.userid;

  // Check if the user has liked or disliked this dream
  pool
    .query(`SELECT * FROM dream_likes WHERE UserId = ? AND DreamId = ? `, [
      userId,
      dreamId,
    ])
    .then(([rows, fields]) => {
      if (rows.length > 0) {
        if (rows[0].disliked) {
          // The user has disliked this dream
          res.json({ likeStatus: "disliked" });
        } else {
          // The user has liked this dream
          res.json({ likeStatus: "liked" });
        }
      } else {
        // The user has not liked or disliked this dream
        res.json({ likeStatus: "neutral" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
});

app.post("/api/shared-dreams/:id/:userid/dislike", async (req, res) => {
  const dreamId = req.params.id;
  const userId = req.params.userid;

  // Check if the user has already disliked this dream
  pool
    .query(
      `SELECT * FROM dream_likes WHERE UserId = ? AND DreamId = ? AND disliked = TRUE`,
      [userId, dreamId]
    )
    .then(([rows, fields]) => {
      if (rows.length > 0) {
        // The user has already disliked this dream, so can't dislike again
        res
          .status(400)
          .json({ message: "You have already disliked this dream" });
      } else {
        // The user has not disliked this dream yet, so proceed

        // Check if the user has liked this dream
        pool
          .query(`SELECT * FROM dream_likes WHERE UserId = ? AND DreamId = ?`, [
            userId,
            dreamId,
          ])
          .then(([rows, fields]) => {
            if (rows.length > 0) {
              // The user has liked this dream, so remove the like and add the dislike
              pool
                .query(
                  `UPDATE dream_likes SET disliked = TRUE WHERE UserId = ? AND DreamId = ?`,
                  [userId, dreamId]
                )
                .then(([rows, fields]) => {
                  // Decrement the like count in the shared_dreams table if not null
                  pool
                    .query(
                      `UPDATE shared_dreams SET Likes = Likes - 1 WHERE Id = ?`,
                      [dreamId]
                    )
                    .then(([rows, fields]) => {
                      res.json({ message: "Dream disliked successfully" });
                    });
                });
            } else {
              // The user has not liked this dream yet, so just add the dislike
              pool
                .query(
                  `INSERT INTO dream_likes (UserId, DreamId, disliked) VALUES (?, ?, TRUE)`,
                  [userId, dreamId]
                )
                .then(([rows, fields]) => {
                  // Decrement the like count in the shared_dreams table if not null
                  pool
                    .query(
                      `UPDATE shared_dreams SET Likes = Likes - 1 WHERE Id = ?`,
                      [dreamId]
                    )
                    .then(([rows, fields]) => {
                      res.json({ message: "Dream disliked successfully" });
                    });
                });
            }
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
});
app.post("/api/shared-dreams/:id/:userid/dislikeFromLike", async (req, res) => {
  const dreamId = req.params.id;
  const userId = req.params.userid;

  // Check if the user has already liked or disliked this dream
  pool
    .query(`SELECT * FROM dream_likes WHERE UserId = ? AND DreamId = ?`, [
      userId,
      dreamId,
    ])
    .then(([rows, fields]) => {
      if (rows.length > 0) {
        // The user has already liked or disliked this dream
        if (!rows[0].disliked) {
          // The user has liked this dream, so change it to a dislike and increase the dislikes count by 2
          pool
            .query(`UPDATE shared_dreams SET Likes = Likes - 2 WHERE Id = ?`, [
              dreamId,
            ])
            .then(([rows, fields]) => {
              pool
                .query(
                  `UPDATE dream_likes SET disliked = TRUE WHERE UserId = ? AND DreamId = ?`,
                  [userId, dreamId]
                )
                .then(([rows, fields]) => {
                  res.json({ message: "Dream disliked successfully" });
                });
            });
        } else {
          // The user has already disliked this dream
          res
            .status(400)
            .json({ message: "You have already disliked this dream" });
        }
      } else {
        // The user has not liked or disliked this dream yet, so return an error
        res.status(400).json({ message: "You have not liked this dream yet" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
});
// code for undislike
app.post("/api/shared-dreams/:id/:userid/undislike", async (req, res) => {
  const dreamId = req.params.id;
  const userId = req.params.userid;

  // Check if the user has already disliked this dream
  pool
    .query(`SELECT * FROM dream_likes WHERE UserId = ? AND DreamId = ?`, [
      userId,
      dreamId,
    ])
    .then(([rows, fields]) => {
      if (rows.length > 0 && rows[0].disliked) {
        // The user has disliked this dream, so remove the dislike
        pool
          .query(`DELETE FROM dream_likes WHERE UserId = ? AND DreamId = ?`, [
            userId,
            dreamId,
          ])
          .then(([rows, fields]) => {
            // Only increase likes if the dislike record was successfully deleted
            if (rows.affectedRows > 0) {
              pool
                .query(
                  `UPDATE shared_dreams SET Likes = Likes + 1 WHERE Id = ?`,
                  [dreamId]
                )
                .then(([rows, fields]) => {
                  res.json({ message: "Dream undisliked successfully" });
                });
            } else {
              res.json({ message: "You have not disliked this dream" });
            }
          });
      } else {
        // The user has not disliked this dream
        res.status(400).json({ message: "You have not disliked this dream" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
});
//commments needs to be changed
app.get("/api/shared-dreams/:id/comments", (req, res) => {
  console.log("Comments endpoint hit");
  const dreamId = req.params.id;
  pool
    .query(
      `
      SELECT comments.*, DATE_FORMAT(comments.date_posted, '%m/%d/%Y') as formatted_date, users.username, users.avatar_url
      FROM comments 
      INNER JOIN users ON comments.userid = users.id 
      WHERE dream_id = ?`,
      [dreamId]
    )
    .then(([rows, fields]) => {
      if (rows.length === 0) {
        return res
          .status(404)
          .json({ message: "No comments found for this dream" });
      }

      res.json(rows);
    })
    .catch((error) => {
      console.log("SQL Error:", error); // Log the SQL error
      res.status(500).json({ message: error.message });
    });
});

app.get("/api/shared-dreams/comments/:id/replies", (req, res) => {
  const comment_id = req.params.id;
  pool
    .query(
      `
      SELECT replies.*, DATE_FORMAT(replies.date_posted, '%m/%d/%Y') as formatted_date, users.username, users.avatar_url
      FROM replies 
      INNER JOIN users ON replies.user_id = users.id 
      WHERE comment_id = ?`,
      [comment_id]
    )
    .then(([rows, fields]) => {
      if (rows.length === 0) {
        return res
          .status(404)
          .json({ message: "No replies found for this comment" });
      }

      res.json(rows);
    })
    .catch((error) => {
      console.log("SQL Error:", error);
      res.status(500).json({ message: error.message });
    });
});

const nodemailer = require("nodemailer");

app.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";
  console.log("Received email for password reset:", email);

  pool
    .query(sql, [email])
    .then(([result, fields]) => {
      console.log("SQL query result:", result);

      if (result.length > 0) {
        const resetToken = crypto.randomBytes(20).toString("hex");
        console.log("Generated reset token:", resetToken);

        const sqlUpdate = "UPDATE users SET resetToken = ? WHERE email = ?";
        return pool
          .query(sqlUpdate, [resetToken, email])
          .then(([result, fields]) => {
            console.log("Reset token saved to database:", result);

            let transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: "viestursemerbergs@gmail.com",
                pass: "hnik xldy imdc qaav",
              },
            });

            return transporter.sendMail({
              from: '"Password Reset" <viestursemerbergs@gmail.com>',
              to: email,
              subject: "Password Reset",
              text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\nhttp://localhost:5173/reset-password/${resetToken}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
            });
          });
      } else {
        console.log("User not found with email:", email);
        res.status(404).json({ message: "User not found" });
        return Promise.reject("User not found");
      }
    })
    .then((info) => {
      res.status(200).json({ message: "Password reset link sent to email" });
    })
    .catch((err) => {
      if (err !== "User not found") {
        console.error("Error while processing forgot password request:", err);
        res
          .status(500)
          .json({ message: "Error while processing forgot password request" });
      }
    });
});

app.post("/reset-password/:token", (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be at least 8 characters long",
    });
  }

  const sql = "SELECT * FROM users WHERE resetToken = ?";
  pool
    .query(sql, [token])
    .then(([result]) => {
      if (result.length > 0) {
        const hashedPassword = bcrypt.hashSync(password, saltRounds);
        const sqlUpdate =
          "UPDATE users SET password = ?, resetToken = NULL WHERE resetToken = ?";
        return pool.query(sqlUpdate, [hashedPassword, token]);
      } else {
        res.status(404).json({ message: "Invalid reset token" });
        return Promise.reject("Invalid reset token");
      }
    })
    .then(() => {
      res.status(200).json({ message: "Password updated successfully" });
    })
    .catch((err) => {
      console.error("Error while resetting password:", err);
      res.status(500).json({ message: "Error while resetting password" });
    });
});

// Create the endpoint for adding comments
app.post("/api/shared-dreams/comments/:userId", async (req, res) => {
  console.log("Add comment endpoint hit");
  const { userId } = req.params;
  const { text, dreamId } = req.body;
  const date = new Date().toISOString().slice(0, 19).replace("T", " "); // Get current date in MySQL datetime format
  const likes = 0;

  const sql =
    "INSERT INTO comments (UserId, Contents, Dream_id, Date_posted, Likes) VALUES (?, ?, ?, ?, ?)";

  try {
    const [result] = await pool.query(sql, [
      userId,
      text,
      dreamId,
      date,
      likes,
    ]);
    const commentId = result.insertId;

    console.log("Comment inserted successfully");
    res
      .status(200)
      .json({ message: "Comment inserted successfully", commentId });
  } catch (err) {
    console.error("Error inserting comment:", err);
    res.status(500).json({ message: "Error inserting comment" });
  }
});

app.post("/api/shared-dreams/replies/:userId", async (req, res) => {
  console.log("Add comment endpoint hit");
  const { userId } = req.params;
  const { text, commentId } = req.body;
  const date = new Date().toISOString().slice(0, 19).replace("T", " "); // Get current date in MySQL datetime format
  const likes = 0;

  const sql =
    "INSERT INTO replies (user_id, Contents, Comment_id, Date_posted, Likes) VALUES (?, ?, ?, ?, ?)";

  try {
    const [result] = await pool.query(sql, [
      userId,
      text,
      commentId,
      date,
      likes,
    ]);
    const replyId = result.insertId;

    console.log("Comment inserted successfully");
    res.status(200).json({ message: "Comment inserted successfully", replyId });
  } catch (err) {
    console.error("Error inserting comment:", err);
    res.status(500).json({ message: "Error inserting comment" });
  }
});

//dislike comments
app.post(
  "/api/shared-dreams/comments/:id/:userid/dislike",
  async (req, res) => {
    const commentId = req.params.id;
    const userId = req.params.userid;

    // Check if the user has already disliked this comment
    pool
      .query(
        `SELECT * FROM comment_likes WHERE User_Id = ? AND Comment_Id = ? AND disliked = TRUE`,
        [userId, commentId]
      )
      .then(([rows, fields]) => {
        if (rows.length > 0) {
          // The user has already disliked this comment, so can't dislike again
          res
            .status(400)
            .json({ message: "You have already disliked this comment" });
        } else {
          // The user has not disliked this comment yet, so proceed

          // Check if the user has liked this comment
          pool
            .query(
              `SELECT * FROM comment_likes WHERE User_Id = ? AND Comment_Id = ?`,
              [userId, commentId]
            )
            .then(([rows, fields]) => {
              if (rows.length > 0) {
                // The user has liked this comment, so remove the like and add the dislike
                pool
                  .query(
                    `UPDATE comment_likes SET disliked = TRUE WHERE User_Id = ? AND Comment_Id = ?`,
                    [userId, commentId]
                  )
                  .then(([rows, fields]) => {
                    // Decrement the like count in the comments table if not null
                    pool
                      .query(
                        `UPDATE comments SET Likes = Likes - 1 WHERE Id = ?`,
                        [commentId]
                      )
                      .then(([rows, fields]) => {
                        res.json({ message: "Comment disliked successfully" });
                      });
                  });
              } else {
                // The user has not liked this comment yet, so just add the dislike
                pool
                  .query(
                    `INSERT INTO comment_likes (User_Id, Comment_Id, disliked) VALUES (?, ?, TRUE)`,
                    [userId, commentId]
                  )
                  .then(([rows, fields]) => {
                    // Decrement the like count in the comments table if not null
                    pool
                      .query(
                        `UPDATE comments SET Likes = Likes - 1 WHERE Id = ?`,
                        [commentId]
                      )
                      .then(([rows, fields]) => {
                        res.json({ message: "Comment disliked successfully" });
                      });
                  });
              }
            });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      });
  }
);
//like comments
app.post("/api/shared-dreams/comments/:id/:userid/like", async (req, res) => {
  const commentId = req.params.id;
  const userId = req.params.userid;

  // Check if the user has already liked or disliked this comment
  pool
    .query(`SELECT * FROM comment_likes WHERE User_Id = ? AND Comment_Id = ?`, [
      userId,
      commentId,
    ])
    .then(([rows, fields]) => {
      if (rows.length > 0) {
        // The user has already liked or disliked this comment
        if (rows[0].disliked) {
          // The user has disliked this comment, so change it to a like
          pool
            .query(`UPDATE comments SET Likes = Likes + 1 WHERE Id = ?`, [
              commentId,
            ])
            .then(([rows, fields]) => {
              pool
                .query(
                  `UPDATE comment_likes SET disliked = FALSE WHERE User_Id = ? AND Comment_Id = ?`,
                  [userId, commentId]
                )
                .then(([rows, fields]) => {
                  res.json({ message: "Comment liked successfully" });
                });
            });
        } else {
          // The user has already liked this comment
          res
            .status(400)
            .json({ message: "You have already liked this comment" });
        }
      } else {
        // The user has not liked or disliked this comment yet, so add a like
        pool
          .query(`UPDATE comments SET Likes = Likes + 1 WHERE Id = ?`, [
            commentId,
          ])
          .then(([rows, fields]) => {
            pool
              .query(
                `INSERT INTO comment_likes (User_Id, Comment_Id, disliked) VALUES (?, ?, FALSE)`,
                [userId, commentId]
              )
              .then(([rows, fields]) => {
                res.json({ message: "Comment liked successfully" });
              });
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
});
//unlike comments
app.post("/api/shared-dreams/comments/:id/:userid/unlike", async (req, res) => {
  const commentId = req.params.id;
  const userId = req.params.userid;

  // Check if the user has already liked this comment
  pool
    .query(`SELECT * FROM comment_likes WHERE User_Id = ? AND Comment_Id = ?`, [
      userId,
      commentId,
    ])
    .then(([rows, fields]) => {
      if (rows.length > 0 && !rows[0].disliked) {
        // The user has liked this comment, so remove the like
        pool
          .query(`UPDATE comments SET Likes = Likes - 1 WHERE Id = ?`, [
            commentId,
          ])
          .then(([rows, fields]) => {
            pool
              .query(
                `DELETE FROM comment_likes WHERE User_Id = ? AND Comment_Id = ?`,
                [userId, commentId]
              )
              .then(([rows, fields]) => {
                res.json({ message: "Comment unliked successfully" });
              });
          });
      } else {
        // The user has not liked this comment
        res.status(400).json({ message: "You have not liked this comment" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
});
//undislike comments
app.post(
  "/api/shared-dreams/comments/:id/:userid/undislike",
  async (req, res) => {
    const commentId = req.params.id;
    const userId = req.params.userid;

    // Check if the user has already disliked this comment
    pool
      .query(
        `SELECT * FROM comment_likes WHERE User_Id = ? AND Comment_Id = ?`,
        [userId, commentId]
      )
      .then(([rows, fields]) => {
        if (rows.length > 0 && rows[0].disliked) {
          // The user has disliked this comment, so remove the dislike
          pool
            .query(
              `DELETE FROM comment_likes WHERE User_Id = ? AND Comment_Id = ?`,
              [userId, commentId]
            )
            .then(([rows, fields]) => {
              // Only increase likes if the dislike record was successfully deleted
              if (rows.affectedRows > 0) {
                pool
                  .query(`UPDATE comments SET Likes = Likes + 1 WHERE Id = ?`, [
                    commentId,
                  ])
                  .then(([rows, fields]) => {
                    res.json({ message: "Comment undisliked successfully" });
                  });
              } else {
                res.json({ message: "You have not disliked this comment" });
              }
            });
        } else {
          // The user has not disliked this comment
          res
            .status(400)
            .json({ message: "You have not disliked this comment" });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      });
  }
);
//like_status comments
app.get(
  "/api/shared-dreams/comments/:id/:userid/likeStatus",
  async (req, res) => {
    const commentId = req.params.id;
    const userId = req.params.userid;

    // Check if the user has liked or disliked this comment
    pool
      .query(
        `SELECT * FROM comment_likes WHERE User_Id = ? AND Comment_Id = ? `,
        [userId, commentId]
      )
      .then(([rows, fields]) => {
        if (rows.length > 0) {
          if (rows[0].disliked) {
            // The user has disliked this comment
            res.json({ likeStatus: "disliked" });
          } else {
            // The user has liked this comment
            res.json({ likeStatus: "liked" });
          }
        } else {
          // The user has not liked or disliked this comment
          res.json({ likeStatus: "neutral" });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      });
  }
);

//dislike from like comments
app.post(
  "/api/shared-dreams/comments/:id/:userid/dislikeFromLike",
  async (req, res) => {
    const commentId = req.params.id;
    const userId = req.params.userid;

    // Check if the user has already liked or disliked this comment
    pool
      .query(
        `SELECT * FROM comment_likes WHERE User_Id = ? AND Comment_Id = ?`,
        [userId, commentId]
      )
      .then(([rows, fields]) => {
        if (rows.length > 0) {
          // The user has already liked or disliked this comment
          if (!rows[0].disliked) {
            // The user has liked this comment, so change it to a dislike and decrease the likes count by 2
            pool
              .query(`UPDATE comments SET Likes = Likes - 2 WHERE Id = ?`, [
                commentId,
              ])
              .then(([rows, fields]) => {
                pool
                  .query(
                    `UPDATE comment_likes SET disliked = TRUE WHERE User_Id = ? AND Comment_Id = ?`,
                    [userId, commentId]
                  )
                  .then(([rows, fields]) => {
                    res.json({ message: "Comment disliked successfully" });
                  });
              });
          } else {
            // The user has already disliked this comment
            res
              .status(400)
              .json({ message: "You have already disliked this comment" });
          }
        } else {
          // The user has not liked or disliked this comment yet, so return an error
          res
            .status(400)
            .json({ message: "You have not liked this comment yet" });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      });
  }
);

app.post(
  "/api/shared-dreams/comments/:id/:userid/likeFromDislike",
  async (req, res) => {
    const commentId = req.params.id;
    const userId = req.params.userid;

    // Check if the user has already liked or disliked this comment
    pool
      .query(
        `SELECT * FROM comment_likes WHERE User_Id = ? AND Comment_Id = ?`,
        [userId, commentId]
      )
      .then(([rows, fields]) => {
        if (rows.length > 0) {
          // The user has already liked or disliked this comment
          if (rows[0].disliked) {
            // The user has disliked this comment, so change it to a like and increase the likes count by 2
            pool
              .query(`UPDATE comments SET Likes = Likes + 2 WHERE Id = ?`, [
                commentId,
              ])
              .then(([rows, fields]) => {
                pool
                  .query(
                    `UPDATE comment_likes SET disliked = FALSE WHERE User_Id = ? AND Comment_Id = ?`,
                    [userId, commentId]
                  )
                  .then(([rows, fields]) => {
                    res.json({ message: "Comment liked successfully" });
                  });
              });
          } else {
            // The user has already liked this comment
            res
              .status(400)
              .json({ message: "You have already liked this comment" });
          }
        } else {
          // The user has not liked or disliked this comment yet, so return an error
          res
            .status(400)
            .json({ message: "You have not disliked this comment yet" });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      });
  }
);

app.get("/api/users/:commentId/comments", async (req, res) => {
  const commentid = req.params.commentId;

  // Check if the user exists
  pool
    .query(`SELECT username FROM users WHERE Id = ?`, [commentid])
    .then(([rows, fields]) => {
      if (rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      } else {
        res.json({ username: rows[0].username });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
});

app.put("/api/users/settings/:id", (req, res) => {
  console.log("Settings endpoint hit");

  const { id } = req.params;
  const { name, surname, username, gender, date_of_birth } = req.body;

  const sql =
    "UPDATE users SET name = ?, surname = ?,username = ?,gender =?, date_of_birth = ? WHERE id = ?";
  pool.query(
    sql,
    [name, surname, username, gender, date_of_birth, id],
    (err, result) => {
      if (err) {
        res.status(500).json({ message: "Error updating user" });
      } else {
        res.status(200).json({ message: "User updated successfully" });
      }
    }
  );
});

app.delete("/api/userDelete/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM users WHERE id = ?";
  pool.query(sql, [id], (err, result) => {
    if (err) {
      res.status(500).json({ message: "Error deleting user" });
    } else {
      res.status(200).json({ message: "User deleted successfully" });
    }
  });
});

app.get("/api/dreams/categories", (req, res) => {
  const sql = "SELECT * FROM categories";
  pool.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({ message: "Error fetching categories" });
    } else {
      res.json(result);
    }
  });
});

//for replies
// like status code
app.get(
  "/api/shared-dreams/replies/:id/:userid/likeStatus",
  async (req, res) => {
    const replyId = req.params.id;
    const userId = req.params.userid;

    // Check if the user has liked or disliked this reply
    pool
      .query(`SELECT * FROM reply_likes WHERE UserId = ? AND ReplyId = ?`, [
        userId,
        replyId,
      ])
      .then(([rows, fields]) => {
        if (rows.length > 0) {
          if (rows[0].disliked) {
            // The user has disliked this reply
            res.json({ likeStatus: "disliked" });
          } else {
            // The user has liked this reply
            res.json({ likeStatus: "liked" });
          }
        } else {
          // The user has not liked or disliked this reply
          res.json({ likeStatus: "neutral" });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      });
  }
);

//unlike replies

app.post("/api/shared-dreams/replies/:id/:userid/unlike", async (req, res) => {
  const replyId = req.params.id;
  const userId = req.params.userid;

  // Check if the user has already liked this reply
  pool
    .query(`SELECT * FROM reply_likes WHERE UserId = ? AND ReplyId = ?`, [
      userId,
      replyId,
    ])
    .then(([rows, fields]) => {
      if (rows.length > 0 && !rows[0].disliked) {
        // The user has liked this reply, so remove the like
        pool
          .query(`UPDATE replies SET Likes = Likes - 1 WHERE Id = ?`, [replyId])
          .then(([rows, fields]) => {
            pool
              .query(
                `DELETE FROM reply_likes WHERE UserId = ? AND ReplyId = ?`,
                [userId, replyId]
              )
              .then(([rows, fields]) => {
                res.json({ message: "Reply unliked successfully" });
              });
          });
      } else {
        // The user has not liked this reply
        res.status(400).json({ message: "You have not liked this reply" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
});

//like a reply

app.post("/api/shared-dreams/replies/:id/:userid/like", async (req, res) => {
  const replyId = req.params.id;
  const userId = req.params.userid;

  // Check if the user has already liked or disliked this reply
  pool
    .query(`SELECT * FROM reply_likes WHERE UserId = ? AND ReplyId = ?`, [
      userId,
      replyId,
    ])
    .then(([rows, fields]) => {
      if (rows.length > 0) {
        // The user has already liked or disliked this reply
        if (rows[0].disliked) {
          // The user has disliked this reply, so change it to a like
          pool
            .query(`UPDATE replies SET Likes = Likes + 1 WHERE Id = ?`, [
              replyId,
            ])
            .then(([rows, fields]) => {
              pool
                .query(
                  `UPDATE reply_likes SET disliked = FALSE WHERE UserId = ? AND ReplyId = ?`,
                  [userId, replyId]
                )
                .then(([rows, fields]) => {
                  res.json({ message: "Reply liked successfully" });
                });
            });
        } else {
          // The user has already liked this reply
          res
            .status(400)
            .json({ message: "You have already liked this reply" });
        }
      } else {
        // The user has not liked or disliked this reply yet, so add a like
        pool
          .query(`UPDATE replies SET Likes = Likes + 1 WHERE Id = ?`, [replyId])
          .then(([rows, fields]) => {
            pool
              .query(
                `INSERT INTO reply_likes (UserId, ReplyId, disliked) VALUES (?, ?, FALSE)`,
                [userId, replyId]
              )
              .then(([rows, fields]) => {
                res.json({ message: "Reply liked successfully" });
              });
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
});

//dislike a reply
app.post("/api/shared-dreams/replies/:id/:userid/dislike", async (req, res) => {
  const replyId = req.params.id;
  const userId = req.params.userid;

  // Check if the user has already disliked this reply
  pool
    .query(
      `SELECT * FROM reply_likes WHERE UserId = ? AND ReplyId = ? AND disliked = TRUE`,
      [userId, replyId]
    )
    .then(([rows, fields]) => {
      if (rows.length > 0) {
        // The user has already disliked this reply, so can't dislike again
        res
          .status(400)
          .json({ message: "You have already disliked this reply" });
      } else {
        // The user has not disliked this reply yet, so proceed

        // Check if the user has liked this reply
        pool
          .query(`SELECT * FROM reply_likes WHERE UserId = ? AND ReplyId = ?`, [
            userId,
            replyId,
          ])
          .then(([rows, fields]) => {
            if (rows.length > 0) {
              pool
                .query(
                  `UPDATE reply_likes SET disliked = TRUE WHERE UserId = ? AND ReplyId = ?`,
                  [userId, replyId]
                )
                .then(([rows, fields]) => {
                  pool
                    .query(
                      `UPDATE replies SET Likes = Likes - 1 WHERE Id = ?`,
                      [replyId]
                    )
                    .then(([rows, fields]) => {
                      res.json({ message: "Reply disliked successfully" });
                    });
                });
            } else {
              pool
                .query(
                  `INSERT INTO reply_likes (UserId, ReplyId, disliked) VALUES (?, ?, TRUE)`,
                  [userId, replyId]
                )
                .then(([rows, fields]) => {
                  pool
                    .query(
                      `UPDATE replies SET Likes = Likes - 1 WHERE Id = ?`,
                      [replyId]
                    )
                    .then(([rows, fields]) => {
                      res.json({ message: "Reply disliked successfully" });
                    });
                });
            }
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
});

app.post(
  "/api/shared-dreams/replies/:id/:userid/undislike",
  async (req, res) => {
    const replyId = req.params.id;
    const userId = req.params.userid;

    pool
      .query(`SELECT * FROM reply_likes WHERE UserId = ? AND ReplyId = ?`, [
        userId,
        replyId,
      ])
      .then(([rows, fields]) => {
        if (rows.length > 0 && rows[0].disliked) {
          pool
            .query(`DELETE FROM reply_likes WHERE UserId = ? AND ReplyId = ?`, [
              userId,
              replyId,
            ])
            .then(([rows, fields]) => {
              if (rows.affectedRows > 0) {
                pool
                  .query(`UPDATE replies SET Likes = Likes + 1 WHERE Id = ?`, [
                    replyId,
                  ])
                  .then(([rows, fields]) => {
                    res.json({ message: "Reply undisliked successfully" });
                  });
              } else {
                res.json({ message: "You have not disliked this reply" });
              }
            });
        } else {
          res.status(400).json({ message: "You have not disliked this reply" });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      });
  }
);

app.post(
  "/api/shared-dreams/replies/:id/:userid/dislikeFromLike",
  async (req, res) => {
    const replyId = req.params.id;
    const userId = req.params.userid;

    pool
      .query(`SELECT * FROM reply_likes WHERE UserId = ? AND ReplyId = ?`, [
        userId,
        replyId,
      ])
      .then(([rows, fields]) => {
        if (rows.length > 0) {
          if (!rows[0].disliked) {
            pool
              .query(`UPDATE replies SET Likes = Likes - 2 WHERE Id = ?`, [
                replyId,
              ])
              .then(([rows, fields]) => {
                pool
                  .query(
                    `UPDATE reply_likes SET disliked = TRUE WHERE UserId = ? AND ReplyId = ?`,
                    [userId, replyId]
                  )
                  .then(([rows, fields]) => {
                    res.json({ message: "Reply disliked successfully" });
                  });
              });
          } else {
            res
              .status(400)
              .json({ message: "You have already disliked this reply" });
          }
        } else {
          res
            .status(400)
            .json({ message: "You have not liked this reply yet" });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      });
  }
);

app.post(
  "/api/shared-dreams/replies/:id/:userid/likeFromDislike",
  async (req, res) => {
    const replyId = req.params.id;
    const userId = req.params.userid;

    pool
      .query(`SELECT * FROM reply_likes WHERE UserId = ? AND ReplyId = ?`, [
        userId,
        replyId,
      ])
      .then(([rows, fields]) => {
        if (rows.length > 0) {
          if (rows[0].disliked) {
            pool
              .query(`UPDATE replies SET Likes = Likes + 2 WHERE Id = ?`, [
                replyId,
              ])
              .then(([rows, fields]) => {
                pool
                  .query(
                    `UPDATE reply_likes SET disliked = FALSE WHERE UserId = ? AND ReplyId = ?`,
                    [userId, replyId]
                  )
                  .then(([rows, fields]) => {
                    res.json({ message: "Reply liked successfully" });
                  });
              });
          } else {
            res
              .status(400)
              .json({ message: "You have already liked this reply" });
          }
        } else {
          res
            .status(400)
            .json({ message: "You have not disliked this reply yet" });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      });
  }
);

//streaks
app.get("/api/users/:userId/streaks", async (req, res) => {
  const userId = req.params.userId;

  try {
    // Fetch distinct dates for the user's dream entries
    const [rows] = await pool.query(
      `SELECT DISTINCT DATE(date) AS date FROM dream_entries WHERE user_id = ? ORDER BY date ASC`,
      [userId]
    );

    // Initialize streak counters
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    // Calculate streaks
    for (let i = 1; i < rows.length; i++) {
      const prevDate = new Date(rows[i - 1].date);
      const currDate = new Date(rows[i].date);
      const diffTime = Math.abs(currDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 1; // Reset streak
      }
    }

    // Final check for the last streak
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    // Determine the current streak
    const lastEntryDate = new Date(rows[rows.length - 1].date);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - lastEntryDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak = tempStreak;
    } else {
      currentStreak = 0;
    }

    res.json({
      current_streak: currentStreak,
      longest_streak: longestStreak,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/users/:userId/lucid-dreams", async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS lucidDreamCount FROM dream_entries WHERE user_id = ? AND lucid = 1`,
      [userId]
    );

    res.json({
      lucidDreamCount: rows[0].lucidDreamCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/users/:userId/popular-category", async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await pool.query(
      `SELECT category, COUNT(*) AS count 
       FROM dream_entries 
       WHERE user_id = ? AND category IS NOT NULL AND category != ''
       GROUP BY category 
       ORDER BY count DESC 
       LIMIT 1`,
      [userId]
    );

    res.json({
      popularCategory: rows[0] ? rows[0].category : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/users/:userId/dreamiest-day", async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await pool.query(
      `SELECT DAYNAME(date) as day, COUNT(*) as count
       FROM dream_entries
       WHERE user_id = ?
       GROUP BY day
       ORDER BY count DESC
       LIMIT 1`,
      [userId]
    );

    res.json({
      dreamiestDay: rows[0] ? rows[0].day : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/users/:userId/dreamiest-month", async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(date, '%M') as month, COUNT(*) as count
       FROM dream_entries
       WHERE user_id = ?
       GROUP BY month
       ORDER BY count DESC
       LIMIT 1`,
      [userId]
    );

    res.json({
      dreamiestMonth: rows[0] ? rows[0].month : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/users/:userId/avatar", (req, res) => {
  const userId = req.params.userId;
  console.log("Avatar endpoint hit");
  pool
    .query(`SELECT avatar_url FROM users WHERE id = ?`, [userId])
    .then(([rows, fields]) => {
      if (rows.length === 0) {
        return res.status(404).json({ message: "No user found with this ID" });
      }

      res.json(rows[0]);
    })
    .catch((error) => {
      console.log("SQL Error:", error); // Log the SQL error
      res.status(500).json({ message: error.message });
    });
});

app.get("api/users/:id/lucid-dreams", (req, res) => {
  const userId = req.params.id;
  const sql = "SELECT * from dream_entries  WHERE user_id = ?";
  pool.query(sql, [userId], (err, result) => {
    if (err) {
      res.status(500).json({ message: "Error fetching lucid dreams" });
    } else {
      res.json(result);
    }
  });
});

app.put("/api/shared-dreams/comments/:commentid", (req, res) => {
  const { commentid } = req.params;
  const { text } = req.body;
  console.log("Update comment endpoint hit");
  const sql = "UPDATE comments SET Contents = ? WHERE Id = ?";
  pool.query(sql, [text, commentid], (err, result) => {
    if (err) {
      res.status(500).json({ message: "Error updating comment" });
    } else {
      res.status(200).json({ message: "Comment updated successfully" });
      console.log("Comment updated successfully");
    }
  });
});

app.delete("/api/shared-dreams/comments/:commentId/:userId", (req, res) => {
  const { commentId, userId } = req.params;

  const sql = "DELETE FROM comments WHERE Id = ? AND UserId = ?";
  pool.query(sql, [commentId, userId], (err, result) => {
    if (err) {
      res.status(500).json({ message: "Error deleting comment" });
    } else {
      res.status(200).json({ message: "Comment deleted successfully" });
    }
  });
});

app.put("/api/shared-dreams/replies/:replyid", (req, res) => {
  const { replyid } = req.params;
  const { text } = req.body;
  console.log("Update reply endpoint hit");
  const sql = "UPDATE replies SET Contents = ? WHERE Id = ?";
  pool.query(sql, [text, replyid], (err, result) => {
    if (err) {
      res.status(500).json({ message: "Error updating reply" });
    } else {
      res.status(200).json({ message: "Reply updated successfully" });
      console.log("Reply updated successfully");
    }
  });
});

app.delete("/api/shared-dreams/replies/:replyid/:userid", (req, res) => {
  const { replyid, userid } = req.params;

  const sql = "DELETE FROM replies WHERE Id = ? AND User_Id = ?";
  pool.query(sql, [replyid, userid], (err, result) => {
    if (err) {
      res.status(500).json({ message: "Error deleting reply" });
    } else {
      res.status(200).json({ message: "Reply deleted successfully" });
    }
  });
});
