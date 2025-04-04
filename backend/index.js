import express from "express";
import mysql from "mysql2";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import cors from 'cors';
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import session from "express-session";
import { authenticateUser, authorizeRole } from "./middlewares/authMiddleware.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(cors({
  origin: 'https://museoningangeles.com/', // Ensure React app can access the API
  credentials: true
}));


const uploadDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadDir));  // Serve static files from the 'uploads' folder

// Set up express-session middleware
app.use(session({
  secret: 'your_secret_key', // Replace with a secure key
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // Session valid for 24 hours
}));


// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.message);
    return;
  }
  console.log("Connected to MySQL database.");
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Ensure this folder exists
  },
  filename: function (req, file, cb) {
    // Use a unique name (you can customize as needed)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Visitor logging middleware
app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const referrer = req.headers['referer'] || '';

  const query = 'INSERT INTO visitor_logs (ip_address, user_agent, referrer) VALUES (?, ?, ?)';
  db.query(query, [ip, userAgent, referrer], (error) => {
    if (error) {
      console.error('Visitor log insertion error:', error);
      // Continue even if logging fails
    }
    next();
  });
});


// Home route
app.get("/", (req, res) => {
  res.send("Welcome to the website! Your visit has been recorded if not already done.");
});

/////////////////////////////USERS/////////////////////////////////////

// User Authentication
app.post("/api/register", async (req, res) => {
  const { username, name, email, password, role = "user" } = req.body;

  if (!username || !name || !email || !password) {
    return res.status(400).send({ error: "All fields are required" });
  }

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

    res.status(200).send({ 
      token, 
      user: { id: user.id, username: user.username, role: user.role } 
    });
  });
});



app.get("/api/users", (req, res) => {
  console.log("Request received to /api/users");
  const query = "SELECT id, username, name, email, role FROM users";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Database query error:", err.message);
      return res.status(500).send({ error: "Failed to fetch users" });
    }
    res.status(200).send({ users: results });
  });
});

app.get("/api/user-details", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify JWT
    const userId = decoded.id;

    const query = "SELECT id, name, email FROM users WHERE id = ?";
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Database query error:", err.message);
        return res.status(500).json({ error: "Failed to fetch user data" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json(results[0]);
    });

  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
});


app.put("/api/users/:id", authenticateUser, authorizeRole("super_admin"), (req, res) => {
  const { role } = req.body;
  const { id } = req.params;

  // Check if the role is 'super_admin' and prevent it from being changed
  if (role === "super_admin") {
    return res.status(400).json({ message: "The super_admin role cannot be changed" });
  }

  if (!role) {
    return res.status(400).send({ error: "Role is required" });
  }

  const query = "UPDATE users SET role = ? WHERE id = ?";
  db.query(query, [role, id], (err, result) => {
    if (err) {
      console.error("Error updating role:", err);
      return res.status(500).json({ message: "Failed to update role" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Role updated successfully" });
  });
});

app.delete("/api/users/:id", authenticateUser, authorizeRole("super_admin"), (req, res) => {
  const { id } = req.params;
  console.log(`Attempting to delete user with id: ${id}`);

  // First, check the role of the user to be deleted
  const selectQuery = "SELECT role FROM users WHERE id = ?";
  db.query(selectQuery, [id], (err, results) => {
    if (err) {
      console.error("Error fetching user:", err.message);
      return res.status(500).json({ message: "Database error while fetching user" });
    }
    if (results.length === 0) {
      console.warn(`User with id ${id} not found`);
      return res.status(404).json({ message: "User not found" });
    }
    if (results[0].role === "super_admin") {
      console.warn(`Attempted deletion of super_admin user with id: ${id}`);
      return res.status(403).json({ message: "Cannot delete a super_admin user" });
    }

    // Proceed with deletion if the user is not a super_admin
    const deleteQuery = "DELETE FROM users WHERE id = ?";
    db.query(deleteQuery, [id], (err, result) => {
      if (err) {
        console.error("Error deleting user:", err.message);
        return res.status(500).json({ message: "Failed to delete user" });
      }
      if (result.affectedRows === 0) {
        console.warn(`No rows affected. User with id ${id} may not exist`);
        return res.status(404).json({ message: "User not found" });
      }
      console.log(`User with id ${id} deleted successfully.`);
      res.status(200).json({ message: "User deleted successfully" });
    });
  });
});


/////////////////////////////EXHIBITS/////////////////////////////////////

// Add a new exhibit
app.post("/api/exhibits", upload.single("image"), (req, res) => {
  const { name, description, date } = req.body; // Include the date from the request
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const query = `
    INSERT INTO exhibits (name, description, image, exhibit_date, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;
  db.query(query, [name, description, image, date], (err, result) => {
    if (err) {
      console.error("Error inserting exhibit:", err);
      return res.status(500).json({ message: "Failed to add exhibit" });
    }

    res.status(201).json({ message: "Exhibit added successfully" });
  });
});

// Fetch all exhibits
app.get("/api/exhibits", (req, res) => {
  const query = "SELECT * FROM exhibits ORDER BY exhibit_date DESC, created_at DESC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching exhibits:", err);
      return res.status(500).json({ message: "Failed to fetch exhibits" });
    }
    res.status(200).json(results);
  });
});

// Update an exhibit
app.put("/api/exhibits/:id", upload.single("image"), (req, res) => {
  const { name, description, date } = req.body; // Include the date from the request
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const query = `
    UPDATE exhibits
    SET name = ?, description = ?, image = ?, exhibit_date = ?, created_at = NOW()
    WHERE id = ?
  `;
  db.query(query, [name, description, image, date, req.params.id], (err, result) => {
    if (err) {
      console.error("Error updating exhibit:", err);
      return res.status(500).json({ message: "Failed to update exhibit" });
    }

    res.status(200).json({ message: "Exhibit updated successfully" });
  });
});

// Delete an exhibit
app.delete("/api/exhibits/:id", (req, res) => {
  const query = "DELETE FROM exhibits WHERE id = ?";
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.error("Error deleting exhibit:", err);
      return res.status(500).json({ message: "Failed to delete exhibit" });
    }

    res.status(200).json({ message: "Exhibit deleted successfully" });
  });
});


/////////////////////////////FEEDBACKS/////////////////////////////////////

//Feedbacks
app.post("/api/feedback", (req, res) => {
  const { feedback, rating } = req.body;
  
  if (!feedback) {
    return res.status(400).json({ message: "Feedback cannot be empty" });
  }

  const query = "INSERT INTO feedbacks (feedback_text, rating, created_at) VALUES (?, ?, NOW())";
  db.query(query, [feedback, rating], (err, result) => {
    if (err) {
      console.error("Error inserting feedback:", err);
      return res.status(500).json({ message: "Failed to submit feedback" });
    }
    res.status(201).json({ message: "Thank you for your feedback!" });
  });
});

app.get("/api/feedback", (req, res) => {
  const query = `
    SELECT 
      id, 
      feedback_text, 
      rating, 
      created_at
    FROM feedbacks 
    ORDER BY created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching feedback:", err);
      return res.status(500).json({ message: "Failed to fetch feedback", error: err });
    }
    res.status(200).json(results);
  });
});



/////////////////////////////APPOINTMENT/////////////////////////////////////

// Create a new appointment
app.post('/api/appointments', (req, res) => {
  const { name, email, date, time, contact, person, message } = req.body;

  const query = `
    INSERT INTO appointments (name, email, date, time, contact, person, message)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [name, email, date, time, contact, person, message], (error, result) => {
    if (error) {
      console.error("Error inserting appointment:", error);
      return res.status(500).json({ error: "Error saving appointment" });
    }
    res.status(201).json({
      message: "Appointment booked successfully",
      appointmentId: result.insertId,
    });
  });
});


// Retrieve all appointments (for the admin panel)
app.get('/api/appointments', (req, res) => {
  const query = 'SELECT * FROM appointments ORDER BY created_at DESC';
  
  db.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching appointments:", error);
      return res.status(500).json({ error: "Error retrieving appointments" });
    }
    res.json(results);
  });
});

app.delete("/api/appointments/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM appointments WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting appointment:", err);
      return res.status(500).json({ error: "Error deleting appointment" });
    }
    res.json({ message: "Appointment deleted successfully" });
  });
});


app.put("/api/appointments/:id", (req, res) => {
  const { id } = req.params;
  const { name, email, date, time, contact, person, message } = req.body;
  const query = `
    UPDATE appointments
    SET name = ?, email = ?, date = ?, time = ?, contact = ?, person = ?, message = ?
    WHERE id = ?
  `;
  db.query(query, [name, email, date, time, contact, person, message, id], (err, result) => {
    if (err) {
      console.error("Error updating appointment:", err);
      return res.status(500).json({ error: "Error updating appointment" });
    }
    // Optionally, return the updated appointment. For this example, we'll send back the updated object.
    res.json({ id, name, email, date, time, contact, person, message, updated_at: new Date() });
  });
});

///////////////////////////// ANNOUNCEMENTS ENDPOINTS /////////////////////////////

// GET /api/announcements: Fetch announcements sorted by event_date ascending
app.get("/api/announcements", (req, res) => {
  const query = "SELECT * FROM announcements ORDER BY event_date ASC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching announcements:", err);
      return res.status(500).json({ error: "Error fetching announcements" });
    }
    res.json(results);
  });
});

// POST /api/announcements: Create an announcement with image upload
app.post("/api/announcements", upload.single("image"), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    const { title, content, event_date } = req.body; // Extract event_date
    if (!title || !content || !event_date) {
      return res.status(400).json({ error: "Title, content, and event date are required." });
    }

    // Build image path if a file was uploaded
    const imagePath = req.file ? "/uploads/" + req.file.filename : null;

    // Insert announcement including event_date
    const [result] = await db.promise().query(
      "INSERT INTO announcements (title, content, image, event_date) VALUES (?, ?, ?, ?)",
      [title, content, imagePath, event_date]
    );

    res.status(201).json({ message: "Announcement created successfully" });
  } catch (err) {
    console.error("Error creating announcement:", err);
    res.status(500).json({ error: "Failed to create announcement", details: err.message });
  }
});

// PUT /api/announcements/:id: Update an announcement (with optional image upload)
app.put("/api/announcements/:id", upload.single("image"), (req, res) => {
  const { id } = req.params;
  const { title, content, event_date } = req.body;
  if (!title || !content || !event_date) {
    return res.status(400).json({ error: "Title, content, and event date are required." });
  }
  const image = req.file ? "/uploads/" + req.file.filename : null;
  let query, params;
  if (image) {
    query = "UPDATE announcements SET title = ?, content = ?, event_date = ?, image = ? WHERE id = ?";
    params = [title, content, event_date, image, id];
  } else {
    query = "UPDATE announcements SET title = ?, content = ?, event_date = ? WHERE id = ?";
    params = [title, content, event_date, id];
  }

  db.query(query, params, (err, result) => {
    if (err) {
      console.error("Error updating announcement:", err);
      return res.status(500).json({ error: "Error updating announcement" });
    }
    res.json({ message: "Announcement updated successfully" });
  });
});

// DELETE /api/announcements/:id: Delete an announcement
app.delete("/api/announcements/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM announcements WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting announcement:", err);
      return res.status(500).json({ error: "Error deleting announcement" });
    }
    res.json({ message: "Announcement deleted successfully" });
  });
});



/////////////////////////////ARTS/////////////////////////////////////

// GET /api/artGroups – Retrieve all art groups with their arts
app.get("/api/artGroups", async (req, res) => {
  try {
    const [groups] = await db.promise().query("SELECT * FROM art_groups");
    const groupsWithArts = await Promise.all(
      groups.map(async (group) => {
        const [arts] = await db.promise().query("SELECT * FROM arts WHERE group_id = ?", [group.id]);
        return { ...group, arts };
      })
    );
    res.json(groupsWithArts);
  } catch (err) {
    console.error("Error fetching art groups:", err);
    res.status(500).json({ error: "Failed to fetch art groups" });
  }
});

// POST /api/artGroups – Create a new art group and add art items with file uploads
app.post("/api/artGroups", upload.array("images"), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded files:", req.files);

    const { title, translation, descriptions } = req.body;
    if (!title || !translation || !descriptions) {
      console.error("Missing required fields");
      return res.status(400).json({ error: "Title, translation, and descriptions are required" });
    }

    let descArray;
    try {
      descArray = JSON.parse(descriptions);
      console.log("Parsed descriptions:", descArray);
    } catch (jsonErr) {
      console.error("JSON parsing error for descriptions:", jsonErr);
      return res.status(400).json({ error: "Descriptions must be a valid JSON array" });
    }

    const files = req.files;
    if (!files || files.length !== descArray.length) {
      console.error("Files count and descriptions count do not match", files ? files.length : 0, descArray.length);
      return res.status(400).json({ error: "Number of images and descriptions do not match" });
    }

    // Insert the new art group
    const [result] = await db.promise().query(
      "INSERT INTO art_groups (title, translation) VALUES (?, ?)",
      [title, translation]
    );
    const groupId = result.insertId;
    console.log(`Created art group with ID ${groupId}`);

    // Insert each art item linked to this group
    for (let i = 0; i < files.length; i++) {
      const imagePath = "/uploads/" + files[i].filename;
      const desc = descArray[i];
      console.log(`Inserting art ${i + 1}: groupId=${groupId}, image=${imagePath}, description=${desc}`);
      await db.promise().query(
        "INSERT INTO arts (group_id, image, description) VALUES (?, ?, ?)",
        [groupId, imagePath, desc]
      );
    }

    res.status(201).json({ message: "Art group and arts added successfully" });
  } catch (err) {
    console.error("Error creating art group with arts:", err);
    res.status(500).json({ error: "Failed to create art group with arts", details: err.message });
  }
});

// DELETE /api/artGroups/:id – Delete an art group along with its associated arts
app.delete("/api/artGroups/:id", async (req, res) => {
  try {
    const groupId = req.params.id;
    // First, delete all arts associated with this group
    await db.promise().query("DELETE FROM arts WHERE group_id = ?", [groupId]);
    // Then, delete the art group itself
    const [result] = await db.promise().query("DELETE FROM art_groups WHERE id = ?", [groupId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Art group not found" });
    }
    res.json({ message: "Art group and associated arts deleted successfully" });
  } catch (err) {
    console.error("Error deleting art group:", err);
    res.status(500).json({ error: "Failed to delete art group", details: err.message });
  }
});

// PUT /api/artGroups/:id – Update an art group and its arts (if new images are provided)
app.put("/api/artGroups/:id", upload.array("images"), async (req, res) => {
  try {
    const groupId = req.params.id;
    const { title, translation, descriptions } = req.body;
    if (!title || !translation || !descriptions) {
      return res.status(400).json({ error: "Title, translation, and descriptions are required" });
    }
    let descArray;
    try {
      descArray = JSON.parse(descriptions);
    } catch (jsonErr) {
      return res.status(400).json({ error: "Descriptions must be a valid JSON array" });
    }

    const files = req.files;
    // If new image files are provided, their count must match the number of descriptions
    if (files && files.length > 0 && files.length !== descArray.length) {
      return res.status(400).json({ error: "Number of images and descriptions do not match" });
    }

    // Update the art group's title and translation
    await db.promise().query(
      "UPDATE art_groups SET title = ?, translation = ? WHERE id = ?",
      [title, translation, groupId]
    );

    // If new images are provided, update the arts
    if (files && files.length > 0) {
      // Delete existing arts for the group
      await db.promise().query("DELETE FROM arts WHERE group_id = ?", [groupId]);
      // Insert new arts for the group
      for (let i = 0; i < files.length; i++) {
        const imagePath = "/uploads/" + files[i].filename;
        const desc = descArray[i];
        await db.promise().query(
          "INSERT INTO arts (group_id, image, description) VALUES (?, ?, ?)",
          [groupId, imagePath, desc]
        );
      }
    }

    res.json({ message: "Art group updated successfully" });
  } catch (err) {
    console.error("Error updating art group:", err);
    res.status(500).json({ error: "Failed to update art group", details: err.message });
  }
});


/////////////////////////////QUIZ/////////////////////////////////////

// GET endpoint – Retrieve all quiz questions
app.get('/api/quiz', (req, res) => {
  const query = 'SELECT * FROM quiz_questions';
  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: 'Database error' });
    }

    const quiz = {
      quizTitle: "Angeles City History Quiz",
      quizSynopsis: "Test your knowledge about the history and culture of Angeles City.",
      questions: results.map(row => {
        let answers;
        // Check if row.answers is a string or already an object/array
        if (typeof row.answers === 'string') {
          try {
            answers = JSON.parse(row.answers);
          } catch (error) {
            console.warn(`Error parsing JSON for row id ${row.id}:`, error);
            // Fallback: treat it as a comma-separated string
            answers = row.answers.split(',').map(ans => ans.trim());
          }
        } else {
          // Already parsed (or not a string)
          answers = row.answers;
        }

        return {
          id: row.id,
          question: row.question,
          questionType: row.question_type,
          answers: answers,
          correctAnswer: row.correct_answer,
          messageForCorrectAnswer: row.message_for_correct,
          messageForIncorrectAnswer: row.message_for_incorrect,
          point: row.point
        };
      })
    };

    res.json(quiz);
  });
});

// POST endpoint – Add a new quiz question
app.post('/api/quiz', (req, res) => {
  const {
    question,
    question_type,
    answers,
    correct_answer,
    message_for_correct,
    message_for_incorrect,
    point
  } = req.body;
  
  const query = `
    INSERT INTO quiz_questions 
      (question, question_type, answers, correct_answer, message_for_correct, message_for_incorrect, point)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  // 'answers' is expected to be a JSON string.
  db.query(
    query,
    [question, question_type, answers, correct_answer, message_for_correct, message_for_incorrect, point],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: results.insertId, message: 'Question added successfully' });
    }
  );
});

// PUT endpoint – Update an existing quiz question
app.put('/api/quiz/:id', (req, res) => {
  const { id } = req.params;
  const {
    question,
    question_type,
    answers,
    correct_answer,
    message_for_correct,
    message_for_incorrect,
    point
  } = req.body;
  
  const query = `
    UPDATE quiz_questions
    SET question = ?, question_type = ?, answers = ?, correct_answer = ?, message_for_correct = ?, message_for_incorrect = ?, point = ?
    WHERE id = ?
  `;
  
  db.query(
    query,
    [question, question_type, answers, correct_answer, message_for_correct, message_for_incorrect, point, id],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Question updated successfully' });
    }
  );
});

// DELETE endpoint – Remove a quiz question
app.delete('/api/quiz/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM quiz_questions WHERE id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Question deleted successfully' });
  });
});


////////////////////////VISITOR LOGS/////////////////////////

app.get('/api/visitor-stats', (req, res) => {
  const { startDate, endDate, groupBy } = req.query;

  // Validate required parameters
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate are required.' });
  }

  // Convert ISO date strings to MySQL datetime format "YYYY-MM-DD HH:MM:SS"
  const formatDate = (isoDate) =>
    new Date(isoDate).toISOString().slice(0, 19).replace('T', ' ');

  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);

  // Define grouping format based on groupBy parameter
  let groupQuery;
  switch(groupBy) {
    case 'daily':
      groupQuery = "DATE(created_at)";
      break;
    case 'weekly':
      groupQuery = "YEARWEEK(created_at, 1)";
      break;
    case 'monthly':
      groupQuery = "DATE_FORMAT(created_at, '%Y-%m')";
      break;
    case 'yearly':
      groupQuery = "YEAR(created_at)";
      break;
    default:
      groupQuery = "DATE(created_at)";
  }

  const sql = `SELECT ${groupQuery} as period, COUNT(*) as visitors 
               FROM visitor_logs 
               WHERE created_at BETWEEN ? AND ?
               GROUP BY period
               ORDER BY period ASC`;

  db.query(sql, [formattedStartDate, formattedEndDate], (err, results) => {
    if (err) {
      console.error('Error fetching visitor stats:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});



const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
