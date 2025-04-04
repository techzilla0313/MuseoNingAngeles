import express from "express";
import mysql from "mysql2";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import cors from 'cors';
import jwt from "jsonwebtoken";
import { authenticateUser, authorizeRole } from "./middlewares/authMiddleware.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.message);
    return;
  }
  console.log("Connected to MySQL database.");
});

// Root route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Registration route
app.post("/api/register", async (req, res) => {
  const { username, name, email, password, role = "user" } = req.body;

  if (!username || !name || !email || !password) {
    return res.status(400).send({ error: "All fields are required" });
  }

  // Check if user already exists
  const query = "SELECT * FROM users WHERE username = ? OR email = ?";
  db.query(query, [username, email], async (err, results) => {
    if (err) {
      return res.status(500).send({ error: "Database error" });
    }
    if (results.length > 0) {
      return res.status(400).send({ error: "Username or email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery = "INSERT INTO users (username, name, email, password, role) VALUES (?, ?, ?, ?, ?)";
    db.query(insertQuery, [username, name, email, hashedPassword, role], (err, result) => {
      if (err) {
        return res.status(500).send({ error: "Error registering user" });
      }
      res.status(201).send({ message: "User registered successfully" });
    });
  });
});

// Login route
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send({ error: "Username and password are required" });
  }

  const query = "SELECT * FROM users WHERE username = ?";
  db.query(query, [username], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send({ error: "User not found" });
    }

    const user = results[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).send({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).send({ token });
  });
});

// Protected route for admin only
app.get("/api/admin", authenticateUser, authorizeRole("admin"), (req, res) => {
  res.send("Welcome Admin!");
});

// Protected route for regular users
app.get("/api/user-profile", authenticateUser, (req, res) => {
  res.send(`Welcome User! Your ID: ${req.user.id}`);
});

// Start the server
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
