const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/userModel");
const dotenv = require("dotenv");

const SECRET_KEY = "super-secret-key";

// connect to express app
const app = express();

dotenv.config();

// connect to mongoDB
const dbURI = process.env.MONGO_URI;
mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(3001, () => {
      console.log("Server connected to port 3001 and MongoDb");
    });
  })
  .catch((error) => {
    console.log("Unable to connect to Server and/or MongoDB", error);
  });

// middleware
app.use(bodyParser.json());
app.use(cors());

//Routes

// REGISTER
//POST REGISTER
app.post("/register", async (req, res) => {
  try {
    const { email, username, password, image } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      image,
    });
    await newUser.save();
    res.status(201).json({
      message: "User created successfully",
      name: username,
      email: email,
      image: image,
      id: newUser.id,
    });
  } catch (error) {
    res.status(500).json({ error: "Error signing up" });
  }
});

//GET Registered Users
app.get("/register", async (req, res) => {
  try {
    const users = await User.find();
    res.status(201).json(users);
  } catch (error) {
    res.status(500).json({ error: "Unable to get users" });
  }
});

//LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
      expiresIn: "1hr",
    });
    res.json({
      message: "Login successful",
      name: user.name,
      email: user.email,
      image: user.image,
      id: user.id,
    });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
});

// POST a new task for a user
app.post("/tasks/:userId", async (req, res) => {
  try {
    const creatorUserId = req.params.userId;
    const { title, content, status, deadlineTime, assigned } = req.body;

    // Find the creator user by userId
    const creatorUser = await User.findById(creatorUserId);

    if (!creatorUser) {
      return res.status(404).json({ error: "Creator user not found" });
    }

    // Create a new task with the assigned user's ObjectId
    const newTask = {
      title,
      content,
      status,
      createdTime: new Date(),
      deadlineTime,
      assigned,
      createdBy: creatorUserId,
    };

    // Push the task's ObjectId to the creator user's task array
    creatorUser.task.push(newTask);
    await creatorUser.save();

    // Find the assigned user by userId
    const assignedUser = await User.findById(assigned);

    if (!assignedUser) {
      return res.status(404).json({ error: "Assigned user not found" });
    }

    // Push the task's ObjectId to the assigned user's task array
    assignedUser.task.push(newTask);
    await assignedUser.save();

    res
      .status(201)
      .json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Error creating task" });
  }
});

// GET a user by ID
app.get("/users/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Error getting user" });
  }
});
