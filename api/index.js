import express from "express";
import dotenv from "dotenv";
import User from "./model/userSchema.js";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import { Authenticate } from "./middleware/authenticate.js";
import cookieParser from "cookie-parser";
//import { addToRequests } from "./functions/raise.js";

const app = express();
dotenv.config();
app.use(
  cors({
    credentials: true, // Allow credentials (cookies) to be sent
    origin: "http://localhost:3000", // Replace with your frontend URL
  })
);
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
const Connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });
    console.log("Database Connected Successfully");
  } catch (error) {
    console.log("There is some error while connecting the database", error);
  }
};

app.post("/login", async (req, res) => {
  const { email, password, role } = req.body;
  // try {
  //   const user = await User.findOne({ email });
  //   if (user) return res.status(422).json({ error: "Email Already exists" });
  //   const userData = new User({ email, password,role});
  //   await userData.save();
  // } catch (error) {
  //   console.error("Error during signup:", error);
  // }
  try {
    const user = await User.findOne({ email });
    //  console.log(user);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (role !== user.role)
      return res.status(401).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    const token = await user.generateAuthToken();
    console.log(token);
    //res.cookie("test1","hello")

    // Check if the password is correct
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.cookie("jwtoken", token, {
      
      expires: new Date(Date.now() + 250000),
      httpOnly: true,
      path:"/",
    });
    // If both email and password are correct, send a success response
    return res.status(200).json({ message: "This is a protected route", user });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
app.post("/protected-route", Authenticate, async (req, res) => {
  console.log("request is in protected route")
  const user = req.user;
  const { roles, route } = req.body;
  const _id = user._id;
  const userCheck = await User.findOne({ _id });
  console.log(userCheck.role);
  if (!roles.includes(userCheck.role)) {
    res
      .status(401)
      .json({ message: "User does not have acces to this resource", user });
  } else {
    res.status(200).json({ message: "This is a protected route", user });
  }
});
app.post("/tickets", async (req, res) => {
  const user = req.user;
  const { date, start_time,end_time, file, subject,request_type } = req.body;
  console.log(req.body);
  if (date && start_time && file && subject && end_time && request_type ) {
    //addToRequests(subject,start_time,end_time,date,request_type,file)
    res.status(200).json({ message: "Ticket Recieved by Backend" });
  } else {
    res.status(401).json({ message: "Ticket Package Faulty" });
  }
});
app.listen(3001, (req, res) => {
  console.log("app is listening on port 8000");
});

Connection();
