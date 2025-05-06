import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';



import cors from "cors";
import https from 'https'
import http from 'http'
import fs from 'fs';


dotenv.config();

const uri = process.env.DB_PASSWORD;
// Database schemas and connection setup
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});

const ChallengeSchema = new mongoose.Schema({
  challenge_number: { type: String, required: true},
  challenge_prompt: { type: String, required: true},
  challenge_description: { type: String, required: true},
  challenge_flag: { type: String, required: true},
});

const Challenge = mongoose.model('Challenge', ChallengeSchema);
const User = mongoose.model('User', UserSchema);

const connectDB = async () => {
    return await mongoose.connect(uri)
        .then(() => console.log("Connected to MongoDB!"))
        .catch(err => console.error("Error connecting to MongoDB:", err));
};  



const app = express();
const PORT = 5001

app.use(cors({
  origin: ["http://localhost:3000", "https://commandcracker.com","https://www.commandcracker.com", "https://commandcracker.com:5001"],
  credentials: true
}));    

const httpServer = http.createServer(app);

const JWT_SECRET = process.env.JWT_SECRET

console.log(JWT_SECRET)

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`HTTP Server running at http://0.0.0.0:${PORT}`);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PASSWORD = process.env.AUTH_PASSWORD 

function authenticate(req, res, next) {
  const token = req.cookies.auth;
  try{
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded
    return next();
  }
  catch (error){
    return res.sendFile(path.join(__dirname, "public", "password.html"));
  }
}

// Public routes (no authentication required)
app.get("/password", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "password.html"));
});

app.post("/authenticate", async (req, res) => {
  try {
    await connectDB();
    const { username, password } = req.body;
    console.log(username, password)
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.send("User not found. Please try again.");
    }
    if (user.password === password) {
      const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: "1h" });
      res.cookie("auth", token, {secure: true, path: '/', sameSite: "None"});
      return res.redirect("/");
    } else {
      return res.send("Incorrect password. Please try again.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Serve public files without authentication
app.use(express.static(path.join(__dirname, "public")));

// Protected routes (require authentication)
app.use(authenticate);

// Serve React build directory
app.use(express.static(path.join(__dirname, "build")));

// API endpoints
app.get('/completed-challenge-fetch', async (req, res) => {
  const user = req.user;
  const result = await fetch_completed_challenges(user.username);
  console.log(result);
  res.json(result); 
});

app.get('/unlocked-challenge-fetch', async (req, res) => {
  const user = req.user;
  const result = await fetch_unlocked_challenges(user.username);
  res.json(result); 
});

app.get('/user-data-fetch', async (req, res) => {
  console.log("FETCHING USER DATA")
  res.json(req.user); 
});

// Handle ALL other routes - THIS IS THE KEY FIX for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Database functions
async function fetch_completed_challenges(username) {
  await connectDB();
  try {
    const user = await User.findOne({ username }).lean();
    if (!user) return []; 
    const completedList = user.completed || []; 
    const completedChallenges = await Challenge.find({
      challenge_number: { $in: completedList } 
    });
    return completedChallenges;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function fetch_unlocked_challenges(username) {
  await connectDB();
  try {
    const user = await User.findOne({ username }).lean();
    if (!user) return [];
    const unlockedList = user.unlocked || [];
    const unlockedChallenges = await Challenge.find({
      challenge_number: { $in: unlockedList } 
    });
    return unlockedChallenges;
  } catch (err) {
    console.error(err);
    throw err;
  }
}