const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const User = require("./models/userModel");
const dotenv = require("dotenv");
const crypto = require("crypto");
const Jimp = require("jimp");
const http = require("http");

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

//Socket setup
const server = http.createServer(app);
const io = require("socket.io")(server);

io.on("connection", (socket) => {
  // Handle socket events here
  console.log("A user connected");

  // Optionally, you can handle disconnections
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

/**
 * enpoint for storage the file of image using multer package
 * @constructor
 */
const multer = require("multer");
const Message = require("./models/messageModel");
const Organization = require("./models/organizationModel");
const organizationMessage = require("./models/organizationMessageModel");

// Create a multer storage instance to specify the destination and filename for uploaded images.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./storage"); // Specify the desired destination folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const smsKey = process.env.SMS_SECRET_KEY;
let twilioNum = process.env.TWILIO_PHONE_NUMBER;

const twilio = require("twilio")(accountSid, authToken);

//Routes

/**
 * Send the OTP.
 * @constructor
 * @param {string} phone - The phone number of the user.
 */
app.post("/sendOTP", async (req, res) => {
  const { phone } = req.body;

  //logic
  if (!phone) {
    return res.status(400).json({ message: "Phone field is required!" });
  }

  const otp = crypto.randomInt(1000, 9999);

  //hash
  const ttl = 1000 * 60 * 2; //current exp time 2min
  const expires = Date.now() + ttl;
  const data = `${phone}.${otp}.${expires}`;
  const hash = crypto.createHmac("sha256", smsKey).update(data).digest("hex");

  //send otp
  try {
    await twilio.messages.create({
      to: phone,
      from: twilioNum,
      body: `Your PushNote OTP is ${otp}`,
    });
    return res.status(200).json({
      message: "OTP sent successfully!",
      hash: `${hash}.${expires}`,
      phone,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "message sending failed" });
  }
});

/**
 * Verify the OTP.
 * @constructor
 * @param {string} otp - The OTP of the user.
 * @param {string} hash - The hash of the otp for check expire of otp.
 * @param {string} phone - The phone number of the user.
 */
app.post("/verifyOTP", async (req, res) => {
  // Logic to verify the OTP
  const { otp, hash, phone } = req.body;
  if (!otp || !hash || !phone) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const [hashedOtp, expires] = hash.split(".");
  if (Date.now() > +expires) {
    return res.status(400).json({ message: "OTP expired!" });
  }

  const data = `${phone}.${otp}.${expires}`;

  const verifyOtp = (hashedOtp, data) => {
    let computedHash = crypto
      .createHmac("sha256", smsKey)
      .update(data)
      .digest("hex");
    return computedHash === hashedOtp;
  };

  const isValid = verifyOtp(hashedOtp, data);
  if (!isValid) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  let user;

  try {
    user = await User.findOne({ phone });

    if (!user) {
      const newUser = new User({
        phone,
      });
      await newUser.save();
      return res.status(201).json({
        message: "User created successfully",
        newUser,
      });
    }

    return res.status(200).json({
      message: "OTP verified successfully",
      user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "DB error" });
  }
});

/**
 * Activate the user (add username and image).
 * @constructor
 * @param {string} name - The name of the user.
 * @param {string} userId - The userId of the user.
 * @param {string} image - The image of the user.
 */
app.post("/activate", upload.single("image"), async (req, res) => {
  const { name, userId } = req.body;

  if (!name || !userId) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  // Check if an image file was uploaded
  if (!req.file) {
    return res.status(400).json({ message: "Image file is required!" });
  }

  const imagePath = req.file.path;

  try {
    const jimpResp = await Jimp.read(imagePath);
    jimpResp.resize(150, Jimp.AUTO).write(imagePath);
  } catch (err) {
    return res.status(500).json({ message: "Could not process the image" });
  }

  try {
    // Update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    user.username = name;
    user.image = `/${imagePath}`;
    user.activated = true;

    await user.save();

    return res.status(200).json({ user, auth: true });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
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
      (request) => request.toString() !== recepientId.toString()
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
 * endpoint to send a organization invite to a user
 * @constructor
 * @param {string} senderId - The senderId of the user who send the invite.
 * @param {array} recipientIds - The recipientIds of the users whom to send invite (it can be one or more).
 * @param {string} organizationId - The organizationId is organization Id where user to add.
 */
app.post("/organization-invite/send", async (req, res) => {
  const { senderId, recipientIds, organizationId } = req.body;

  if (!Array.isArray(recipientIds)) {
    return res.status(400).json({ message: "Recipient IDs must be an array" });
  }

  try {
    // Iterate through recipientIds and send invitations individually
    for (const recipientId of recipientIds) {
      const invitation = {
        organizationId,
        senderId,
        timestamp: new Date(),
      };

      // Add the organization invitation to the recipient's document
      await User.findByIdAndUpdate(recipientId, {
        $push: { organizationInvitations: invitation },
      });
    }

    res
      .status(200)
      .json({ message: "Organization invitations sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * endpoint to get all invites user received
 * @constructor
 * @param {string} userId - The userId of the user.
 */
app.get("/organization-invite/received/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const organizationInvitations = user.organizationInvitations;
    res.status(200).json(organizationInvitations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * endpoint to accept organization invites
 * @constructor
 * @param {string} userId - The userId of the user.
 * @param {string} organizationId - The organizationId is organization Id where user to add.
 */
app.post("/organization-invite/accept", async (req, res) => {
  const { userId, organizationId } = req.body;

  try {
    // Remove the organization invitation from the user's invitations
    await User.findByIdAndUpdate(userId, {
      $pull: { organizationInvitations: { organizationId } },
    });

    // Add the user to the organization
    await Organization.findByIdAndUpdate(organizationId, {
      $push: { members: userId },
    });

    // Add the organization to the user's list of organizations
    await User.findByIdAndUpdate(userId, {
      $push: {
        organizations: {
          organizationId,
          role: "member",
        },
      },
    });

    res
      .status(200)
      .json({ message: "Organization invitation accepted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
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

    // Emit the new message to the sender and recipient
    io.to(senderId).emit("newMessage", newMessage);
    io.to(recepientId).emit("newMessage", newMessage);

    res.status(200).json({ message: "Message sent Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * endpoint to send organization Messages and store it in the backend
 * @constructor
 * @param {string} senderId - The senderId of the user who sending msg.
 * @param {string} organizationId - The organizationId of the organization where msg send.
 * @param {string} messageType - The messageType of msg can be text or image msg.
 * @param {string} messageText - The messageText is the content of msg.
 * @param {string} timestamp - The timestamp when msg send.
 * @param {string} imageUrl - The imageUrl of the msg if it's present.
 */
app.post("/organization-messages", upload.single("image"), async (req, res) => {
  try {
    const { senderId, organizationId, messageType, messageText } = req.body;

    // Find the organization by organizationId to verify if the sender is a member.
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(403).json({ error: "Organization not found" });
    }

    const isAdmin = organization.admin.toString() === senderId.toString();
    const isMember = organization.members.some(
      (member) => member.toString() === senderId.toString()
    );

    if (!isAdmin && !isMember) {
      return res
        .status(403)
        .json({ error: "You are not a member of this organization" });
    }

    // Create a new group message with the sender's ID, organization's ID, and message type.
    const newGroupMessage = new organizationMessage({
      senderId,
      organizationId,
      messageType,
      message: messageText,
      timestamp: new Date(),
      imageUrl: messageType === "image" ? req.file.path : null,
    });

    if (messageType === "image") {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: "Image file is required for image messages" });
      }

      // Store the image URL in the message
      newGroupMessage.imageUrl = req.file.path;
    }

    await newGroupMessage.save();

    // Push the organization message to the organization's messages
    organization.organizationMessages.push(newGroupMessage);
    await organization.save();

    if (organization) {
      // Emit to all members
      organization.members.forEach((member) => {
        io.to(member).emit("newOrganizationMessage", newGroupMessage);
      });

      // Emit to the admin (if there is an admin)
      if (organization.admin) {
        io.to(organization.admin).emit(
          "newOrganizationMessage",
          newGroupMessage
        );
      }
    }

    res.status(200).json({ message: "Group message sent Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
