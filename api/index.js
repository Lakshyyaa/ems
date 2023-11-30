import express from "express";
import dotenv from "dotenv";
import User from "./model/userSchema.js";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import { Authenticate } from "./middleware/authenticate.js";
import cookieParser from "cookie-parser";
import { addToRequests } from "./functions/raise.js";
import { Request } from "./model/db.js";
import exceljs from "exceljs"
import { uploadSheet } from "./functions/helper.js";
import xlsx from 'xlsx';
import multer from "multer";
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
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const Connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.log("There is some error while connecting the database", error);
  }
};

app.post("/login", async (req, res) => {

  const { email, password, role } = req.body;
  // const name="Ayush"
  // const free=1
  // const subject=["CN", "AI"]
  // const dep=""
  // try {
  //   const user = await User.findOne({ email });
  //   if (user) return res.status(422).json({ error: "Email Already exists" });
  //   const userData = new User({ email, password, role, name, free, subject, dep });
  //   // how to save the rest of the deets
  //   await userData.save();
  // } catch (error) {
  //   console.error("Error during signup:", error);
  //}
  try {
    const user = await User.findOne({ email });
    // console.log(user);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (role !== user.role)
      return res.status(401).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    const token = await user.generateAuthToken();
    //console.log(token);
    //res.cookie("test1","hello")

    // Check if the password is correct
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.cookie("jwtoken", token, {
      expires: new Date(Date.now() + 250000),
      httpOnly: true,
      path: "/",
    });
    // If both email and password are correct, send a success response
    return res.status(200).json({ message: "This is a protected route", user });
  }
  catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
app.post("/protected-route", Authenticate, async (req, res) => {
  const user = req.user;
  const { roles, route } = req.body;
  const _id = user._id;
  const userCheck = await User.findOne({ _id });

  if (!roles.includes(userCheck.role)) {
    res
      .status(401)
      .json({ message: "User does not have acces to this resource", user });
  } else {
    res.status(200).json({ message: "This is a protected route", user });
  }
});
// receiving tickets from the teacher to put in the requests db
app.post("/tickets", upload.single('file'), async (req, res) => {
  // const user = req.user
  const { date, start_time, end_time, subject, request_type, _id } = req.body;
  const file = (req.file)
  console.log(file)
  // console.log(date, start_time, end_time, subject, request_type, _id, req.file)
  // object with the userdata
  // also the request db has a field for file url in github
  // HERE THE FILE WILL BE PUSHED TO GITHUB
  // AND ITS URL ALONG WITH ALL OTHER OBJECTS WITH REQUEST TYPE PUSHED IN DB
  // free, dep, teacher_id, and all above and halls to mark number of halls taken and a teacher array to show
  // which teacher occupied which happens when approved
  //console.log("file->",file.name);
  if (date && start_time && file && subject && end_time && request_type) {
    // addToRequests(subject,start_time,end_time,date,request_type,file,teachername)
    // Combine date string and time string to create complete date-time strings

    // HERE GITHUB PUSH HAPPENS FIRST
    const startDateTimeString = `${date}T${start_time}`;
    const endDateTimeString = `${date}T${end_time}`;

    // Create Date objects for start_time and end_time
    const startTime = new Date(startDateTimeString);
    const endTime = new Date(endDateTimeString);
    try {
      await uploadSheet(file, (_id) + subject + '.xlsx')
    }
    catch (err) {
      console.error(err)
    }
    const newRequest = await new Request({
      subject: subject,
      start: startTime,
      end: endTime,
      link: (_id) + subject + '.xlsx',
      type: request_type, // Adjust the type accordingly
      state: 'pending'
    });
    // const fileBuffer = await file.buffer;
    // const workbook = await xlsx.read(fileBuffer, { type: 'buffer' });
    // const sheetName = await workbook.SheetNames[0];
    // const worksheet = await workbook.Sheets[sheetName];
    // const newfile = await xlsx.utils.sheet_to_json(worksheet);
    await newRequest.save()
      .then(savedRequest => {
        console.log('Request saved successfully:', savedRequest);
      })
      .catch(error => {
        console.error('Error saving request:', error);
      });
    res.status(200).json({ message: "Ticket Recieved by Backend" });
  } else {
    res.status(401).json({ message: "Ticket Package Faulty" });
  }
});
app.listen(3001, (req, res) => {
  console.log("app is listening on port 8000");
});

Connection();

// add path to get all tickets by teacher name
// teacher sends a teacher id with each req, which is the mongodb id of the teacher object from the userSchema
// frontend checks no teacher can do same subject request again using teahcer(mongo id) and subname