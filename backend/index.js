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
            res.json(rows); // If the user has dreams, sed them
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
//for fetching dreams to save
app.get("/api/dreams/:id/fetch", (req, res) => {
  console.log("Fetch dream endpoint hit");
  const dreamId = req.params.id;

  pool
    .query("SELECT * FROM dream_entries WHERE id = ?", [dreamId])
    .then(([rows, fields]) => {
      if (rows.length > 0) {
        res.json(rows[0]);
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
/*
app.post("/api/signup", async (req, res) => {
  const { name, surname, username, password, email } = req.body;
  let haspassword = generateSecretKey();
  const query = `
    INSERT INTO users (name, surname, username, password, email)
    VALUES (?, ?, ?, ?, ?)
  `;

  try {
    const result = await pool.query(query, [
      name,
      surname,
      username,
      password,
      email,
    ]);
    res.status(201).json(result[0]); // Send back the inserted user data
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});

*/
const bcrypt = require("bcrypt");
const saltRounds = 10;
app.post("/api/signup", async (req, res) => {
  let { name, surname, username, password, email } = req.body;
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
    INSERT INTO users (name, surname, username, password, email)
    VALUES (?, ?, ?, ?, ?)
  `;
  try {
    const result = await pool.query(query, [
      name,
      surname,
      username,
      password,
      email,
    ]);
    const user = result[0];
    let token = generateToken(user);
    res.status(201).json({ user: user, token: token });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});
/*
app.post("/api/signup", async (req, res) => {
  const { name, surname, username, password, email } = req.body;

  // Validate input
  const regex = /^[a-zA-Z]+$/; // This regex allows only alphabets
  if (!regex.test(name) || !regex.test(surname) || !regex.test(username)) {
    return res
      .status(400)
      .json({ error: "Name, surname and username can only contain alphabets" });
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be at least 8 characters long",
    });
  }

  const query = `
    INSERT INTO users (name, surname, username, password, email)
    VALUES (?, ?, ?, ?, ?)
  `;

  try {
    const result = await pool.query(query, [
      name,
      surname,
      username,
      password,
      email,
    ]);
    res.status(201).json(result[0]); // Send back the inserted user data
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});
//User REgistartion
//User Registration
/*
app.post("/api/signup", (req, res) => {
  console.log(req.body);
  const { name, surname, email, username, password } = req.body;
  const sql =
    "INSERT INTO users (name, surname, email, username, password) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [name, surname, email, username, password], (err, result) => {
    if (err) {
      res.status(400).send("Error registering user");
    } else {
      res.status(200).send("User registered successfully");
    }
  });
});
*/
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
      SELECT shared_dreams.*, dream_entries.title, dream_entries.description, users.username 
      FROM shared_dreams 
      INNER JOIN dream_entries ON shared_dreams.Dream_id = dream_entries.id
      INNER JOIN users ON dream_entries.user_id = users.id
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

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) {
      res.status(500).send("Error while logging in");
    } else {
      if (result.length > 0) {
        const user = result[0];
        // Compare the password with the hashed password stored in the database
        const match = bcrypt.compareSync(password, user.password);

        if (match) {
          let token = generateToken(user);

          res
            .status(200)
            .json({ message: "Login successful", user: user, token: token });
        } else {
          // Password does not match
          res.status(401).send("Invalid email or password");
        }
      } else {
        // User not found
        res.status(401).send("Invalid email or password");
      }
    }
  });
});
// Dream entry code

app.post("/user", (req, res) => {
  const { date, title, description, lucid, tags } = req.body;
  const sqlDreamEntries =
    "INSERT INTO dream_entries (user_id, date, title, description, lucid) VALUES (?, ?, ?, ?, ?)";
  const sqlTags =
    "INSERT INTO tags (tag_name, user_id, dream_id) VALUES (?, ?, ?)";

  // Get user ID from token
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, secretKey);
  const userId = decodedToken.userId;

  // Insert dream entry
  db.query(
    sqlDreamEntries,
    [userId, date, title, description, lucid],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send("Error adding dream");
      } else {
        const dreamId = result.insertId;

        // Insert tags
        tags.forEach((tag) => {
          db.query(sqlTags, [tag, userId, dreamId], (err, result) => {
            if (err) {
              console.log(err);
              res.status(400).send("Error adding tag");
            } else {
              console.log("Tag added successfully");
            }
          });
        });
      }
    }
  );
});
// Dream entry saval code
app.post("/user/save", (req, res) => {
  console.log(req.body);
  const { dreamId, date, title, description, lucid } = req.body;
  const sqlUpdateDreamEntries =
    "UPDATE dream_entries SET date = ?, title = ?, description = ?, lucid = ? WHERE id = ? AND user_id = ?";

  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, secretKey);
  const userId = decodedToken.userId;
  console.log("users id is", userId);
  console.log("date", dreamId);
  console.log("dream id is", dreamId);

  db.query(
    sqlUpdateDreamEntries,
    [date, title, description, lucid, dreamId, userId],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send("Error updating dream");
      } else {
        console.log("Dream updated successfully");
      }
    }
  );
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
//commments needs to be changed
app.get("/api/shared-dreams/:id/comments", (req, res) => {
  console.log("Comments endpoint hit");
  const dreamId = req.params.id;
  pool
    .query(`SELECT * FROM comments WHERE dream_id = ?`, [dreamId])
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

const nodemailer = require("nodemailer");

app.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";
  console.log(email);
  db.query(sql, [email], async (err, result) => {
    if (err) {
      res.status(500).json({ message: "Error while resetting password" });
    } else {
      if (result.length > 0) {
        // Generate a password reset token
        const resetToken = crypto.randomBytes(20).toString("hex");

        // Save the reset token to the database
        const sqlUpdate = "UPDATE users SET resetToken = ? WHERE email = ?";
        db.query(sqlUpdate, [resetToken, email], async (err, result) => {
          // Add async here
          if (err) {
            res.status(500).json({ message: "Error while saving reset token" });
          } else {
            // Create a transporter
            let transporter = nodemailer.createTransport({
              service: "gmail", // replace with your email service
              auth: {
                user: "viestursemerbergs@gmail.com", // replace with your email
                pass: "hnik xldy imdc qaav", // replace with your email password
              },
            });

            // Send the email
            try {
              let info = await transporter.sendMail({
                // Now await is allowed here
                from: '"Password Reset" <viestursemerbergs@gmail.com>', // replace with your email
                to: email,
                subject: "Password Reset",
                text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\nhttp://localhost:5173/reset-password/${resetToken}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
              });

              res
                .status(200)
                .json({ message: "Password reset link sent to email" });
            } catch (err) {
              res.status(500).json({ message: "Error while sending email" });
            }
          }
        });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    }
  });
});

app.post("/reset-password/:token", (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Find the user with the reset token
  const sql = "SELECT * FROM users WHERE resetToken = ?";
  db.query(sql, [token], (err, result) => {
    if (err) {
      res.status(500).json({ message: "Error while resetting password" });
    } else {
      if (result.length > 0) {
        // Update the user's password and nullify the reset token in the database
        const sqlUpdate =
          "UPDATE users SET password = ?, resetToken = NULL WHERE resetToken = ?";
        db.query(sqlUpdate, [password, token], (err, result) => {
          if (err) {
            res.status(500).json({ message: "Error while updating password" });
          } else {
            res.status(200).json({ message: "Password updated successfully" });
          }
        });
      } else {
        res.status(404).json({ message: "Invalid reset token" });
      }
    }
  });
});

// Create the endpoint for adding comments
app.post("/api/shared-dreams/comments/:userId", (req, res) => {
  const { userId } = req.params;
  const { text, dreamId } = req.body;
  const date = new Date().toISOString().slice(0, 19).replace("T", " "); // Get current date in MySQL datetime format
  const likes = 0;

  const sql =
    "INSERT INTO comments (UserId, Contents,Dream_id,Date_posted,Likes) VALUES (?, ?, ?,?,?)";
  db.query(sql, [userId, text, dreamId, date, likes], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Error inserting comment" });
    } else {
      res.status(200).json({ message: "Comment inserted successfully" });
    }
  });
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
