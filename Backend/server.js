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

/**
 * enpoint for storage the file of image using multer package
 * @constructor
 */
const multer = require("multer");
const Message = require("./models/messageModel");
const Organization = require("./models/organizationModel");

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "storage/"); // Specify the desired destination folder
  },
  filename: function (req, file, cb) {
    // Generate a unique filename for the uploaded file
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

//Routes

/**
 * Register the user.
 * @constructor
 * @param {string} email - The email of the user.
 * @param {string} username - The username of the user.
 * @param {string} password - The password of the user.
 * @param {string} image - The image url of the user.
 */
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

/**
 * Login the user.
 * @constructor
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 */
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

/**
 * Get the all register users.
 * @constructor
 */
app.get("/register", async (req, res) => {
  try {
    const users = await User.find();
    res.status(201).json(users);
  } catch (error) {
    res.status(500).json({ error: "Unable to get users" });
  }
});

/**
 * GET a user by ID.
 * @constructor
 * @param {string} userId - The userId of the user.
 */
app.get("/user/:userId", async (req, res) => {
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

/**
 * endpoint to access all the users except the user who's is currently logged in!
 * @constructor
 * @param {string} userId - The userId of the user.
 */
app.get("/users/:userId", (req, res) => {
  const loggedInUserId = req.params.userId;

  User.find({ _id: { $ne: loggedInUserId } })
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.log("Error retrieving users", err);
      res.status(500).json({ message: "Error retrieving users" });
    });
});

/**
 * endpoint to send a request to a user
 * @constructor
 * @param {string} currentUserId - The currentUserId of the user who currently logged in.
 * @param {string} selectedUserId - The selectedUserId of the user whom to send friend request.
 */
app.post("/friend-request", async (req, res) => {
  const { currentUserId, selectedUserId } = req.body;

  try {
    //update the recepient's friendRequestsArray!
    await User.findByIdAndUpdate(selectedUserId, {
      $push: { freindRequests: currentUserId },
    });

    //update the sender's sentFriendRequests array
    await User.findByIdAndUpdate(currentUserId, {
      $push: { sentFriendRequests: selectedUserId },
    });

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

/**
 * endpoint to show all the friend-requests of a particular user
 * @constructor
 * @param {string} userId - The userId of the user.
 */
app.get("/friend-request/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    //fetch the user document based on the User id
    const user = await User.findById(userId);

    const freindRequests = user.freindRequests;

    res.json(freindRequests);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * endpoint to accept a friend-request of a particular person
 * @constructor
 * @param {string} senderId - The senderId of the user who send friend request.
 * @param {string} recepientId - The recepientId of the user who recived the friend request.
 */
app.post("/friend-request/accept", async (req, res) => {
  try {
    const { senderId, recepientId } = req.body;

    //retrieve the documents of sender and the recipient
    const sender = await User.findById(senderId);
    const recepient = await User.findById(recepientId);

    sender.friends.push(recepientId);
    recepient.friends.push(senderId);

    recepient.freindRequests = recepient.freindRequests.filter(
      (request) => request.toString() !== senderId.toString()
    );

    sender.sentFriendRequests = sender.sentFriendRequests.filter(
      (request) => request.toString() !== recepientId.toString
    );

    await sender.save();
    await recepient.save();

    res.status(200).json({ message: "Friend Request accepted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * endpoint to access all the friends of the logged in user!
 * @constructor
 * @param {string} userId - The userId of the user.
 */
app.get("/accepted-friends/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate(
      "friends",
      "username email image"
    );
    const acceptedFriends = user.friends;
    res.json(acceptedFriends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * enpoint for create organization
 * @constructor
 * @param {string} name - The name of the organization.
 * @param {string} image - The image of the organization.
 * @param {array} members - The members of the organization.
 * @param {object} admin - The admin of the organization.
 */
app.post("/organizations", async (req, res) => {
  try {
    const { name, image, members, admin } = req.body;

    // Create a new organization
    const newOrganization = new Organization({
      name,
      image,
      members: [],
      admin,
    });

    // Validate and add members
    const validMembers = [];

    for (const memberId of members) {
      const user = await User.findById(memberId);

      if (user) {
        validMembers.push(memberId);
        // Update the user's data to include the organization
        user.organizations.push({
          organizationId: newOrganization._id,
          role: memberId === admin ? "admin" : "member",
        });
        await user.save();
      }
    }

    // Update the organization with the valid members
    newOrganization.members = validMembers;

    // Save the organization to the database
    await newOrganization.save();

    // Update the admin's data to include the organization
    const adminUser = await User.findById(admin);
    if (adminUser) {
      adminUser.organizations.push({
        organizationId: newOrganization._id,
        role: "admin",
      });
      await adminUser.save();
    }

    res.status(201).json({
      message: "Organization created successfully",
      organization: newOrganization,
    });
  } catch (error) {
    console.error("Error creating organization:", error);
    res.status(500).json({ error: "Error creating organization" });
  }
});

/**
 * Create or schedule a task for a member
 * @constructor
 * @param {string} title - The title of the task.
 * @param {string} content - The content of the task.
 * @param {string} status - The status of the task (progress, completed, incompleted).
 * @param {string} createdTime - The time of the task created.
 * @param {string} deadlineTime - The deadline of the task.
 * @param {string} assigned - The task assigned to user.
 */
app.post("/tasks/:userId", async (req, res) => {
  try {
    const creatorUserId = req.params.userId;
    const { title, content, status, createdTime, deadlineTime, assigned } =
      req.body;

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
      createdTime,
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

/**
 * endpoint to post Messages and store it in the backend
 * @constructor
 * @param {string} senderId - The senderId of the user who sending msg.
 * @param {string} recepientId - The recepientId of the user who recived msg.
 * @param {string} messageType - The messageType of msg can be text or image msg.
 * @param {string} messageText - The messageText is the content of msg.
 * @param {string} timestamp - The timestamp when msg send.
 * @param {string} imageUrl - The imageUrl of the msg if it's present.
 */
app.post("/messages", upload.single("imageFile"), async (req, res) => {
  try {
    const { senderId, recepientId, messageType, messageText } = req.body;

    const newMessage = new Message({
      senderId,
      recepientId,
      messageType,
      message: messageText,
      timestamp: new Date(),
      imageUrl: messageType === "image" ? req.file.path : null,
    });

    await newMessage.save();
    res.status(200).json({ message: "Message sent Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
