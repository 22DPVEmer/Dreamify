const express = require("express");
const mysql = require("mysql");

const app = express();
const port = 8081; // Changed port to 8081 as it's the listening port for the express server

const cors = require("cors");
app.use(cors());
app.use(express.json()); // Add this line to parse JSON bodies

// Create MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "dreamify",
});

//api
const mysql2 = require("mysql2/promise");

// Create a connection pool
const pool = mysql2.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "dreamify",
});
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
        .query("SELECT * FROM dream_entries WHERE user_id = ?", [userId])
        .then(([rows, fields]) => {
          if (rows.length > 0) {
            res.json(rows); // If the user has dreams, send them
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

//Dream entry delete endpoint code

app.delete("/api/dreams/:dreamId", async (req, res) => {
  const dreamId = req.params.dreamId;

  // Query the database
  pool
    .query("DELETE FROM dream_entries WHERE id = ?", [dreamId])
    .then(([rows, fields]) => {
      if (rows.affectedRows > 0) {
        res.json({ message: "Dream deleted successfully" });
      } else {
        res.status(404).json({ message: "No dream found with this id" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
});

// Connect to the dimport axios from 'axios';atabase
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("MySQL connected");
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      surname VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    )`;

  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    console.log("Table 'users' created or already exists");
  });

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

  db.query(sqlDreamEntries, (err, result) => {
    if (err) {
      throw err;
    }
    console.log("Table 'dream_entries' created or already exists");
  });
});

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});

//User REgistartion
app.post("/signup", (req, res) => {
  const { name, surname, email, password } = req.body;
  const sql =
    "INSERT INTO users (name, surname, email, password) VALUES (?, ?, ?,?)";
  db.query(sql, [name, surname, email, password], (err, result) => {
    if (err) {
      res.status(400).send("Error registering user");
    } else {
      res.status(200).send("User registered successfully");
    }
  });
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

// Shared dreams access code
app.get("/api/shared-dreams", async (req, res) => {
  // Query the database
  pool
    .query(
      `
      SELECT shared_dreams.*, dream_entries.title, dream_entries.description 
      FROM shared_dreams 
      INNER JOIN dream_entries ON shared_dreams.Dream_id = dream_entries.id
    `
    )
    .then(([rows, fields]) => {
      console.log(rows);
      res.json(rows);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
});

// User Login

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, result) => {
    if (err) {
      res.status(500).send("Error while logging in");
    } else {
      if (result.length > 0) {
        // User found, login successful
        let token = generateToken(result[0]); // Generate token with user data
        console.log(token); // Log the token for debugging
        res
          .status(200)
          .json({ message: "Login successful", user: result[0], token: token }); // Send token to client
      } else {
        // User not found or password incorrect
        res.status(401).send("Invalid email or password");
      }
    }
  });
});
// Dream entry code

app.post("/user", (req, res) => {
  const { date, title, description } = req.body;
  const sql =
    "INSERT INTO dream_entries (user_id, date, title, description) VALUES (?, ?, ?, ?)";

  // Get user ID from token

  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, secretKey);
  const userId = decodedToken.userId;
  console.log("Received token:", token);

  db.query(sql, [userId, date, title, description], (err, result) => {
    if (err) {
      console.log(err);
      res.status(400).send("Error adding dream");
    } else {
      res.status(200).send("Dream added successfully");
    }
  });
});

//token code
const jwt = require("jsonwebtoken");

// Function to generate JWT token
function generateToken(user) {
  const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: "1h" });

  return token;
}

const crypto = require("crypto");

function generateSecretKey() {
  return crypto.randomBytes(32).toString("hex"); // Generate a random 256-bit (32-byte) value and convert it to hexadecimal string
}

const secretKey = generateSecretKey();
console.log("Generated Secret Key:", secretKey);

// Code for dreamboard

app.post("/api/create-shared-dreams-table", async (req, res) => {
  // Query the database
  pool
    .query(
      `
      CREATE TABLE shared_dreams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dream_id INT,
        FOREIGN KEY (dream_id) REFERENCES dream_entries(id)
      )
    `
    )
    .then(([rows, fields]) => {
      res.json({ message: "Shared dreams table created successfully" });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
});

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

app.get("/api/shared-dreams/:id/comments", (req, res) => {
  console.log("Comments endpoint hit");
  const dreamId = req.params.id;
  pool
    .query(
      `SELECT * FROM comments WHERE ID IN (SELECT Comments FROM shared_dreams WHERE ID = ?)`,
      [dreamId]
    )
    .then(([rows, fields]) => {
      if (rows.length === 0) {
        return res
          .status(404)
          .json({ message: "No comments found for this dream" });
      }
      console.log("Results is", rows);
      res.json(rows);
    })
    .catch((error) => {
      console.log("SQL Error:", error); // Log the SQL error
      res.status(500).json({ message: error.message });
    });
});
