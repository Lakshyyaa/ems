import express from "express";
import dotenv from "dotenv";
import User from "./model/userSchema.js";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import { checks, ems } from "./functions/admindash.js";
import { Authenticate } from "./middleware/authenticate.js";
import cookieParser from "cookie-parser";
import { addToRequests } from "./functions/raise.js";
import { Hall, Request, connectDB } from "./model/db.js";
import exceljs from "exceljs"
import { uploadSheet } from "./functions/helper.js";
import xlsx from 'xlsx';
import multer from "multer";
import userSchema from "./model/userSchema.js";

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
await connectDB()
// const Connection = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URL);
//     console.log("Database Connected Successfully");
//   } catch (error) {
//     console.log("There is some error while connecting the database", error);
//   }
// };

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

    const fileBuffer = await file.buffer;
    const workbook = await xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = await workbook.SheetNames[0];
    const worksheet = await workbook.Sheets[sheetName];
    const newfile = await xlsx.utils.sheet_to_json(worksheet);
    const hallsize = 40
    // here we also add the number of halls the exam will requre in the reqeust db to be later used
    const newRequest = await new Request({
      subject: subject,
      start: startTime,
      end: endTime,
      link: (_id) + subject + '.xlsx',
      type: request_type, // Adjust the type accordingly
      state: 'pending',
      id:_id,
      halls: Math.ceil(newfile.length / hallsize)
    });
    // const fileBuffer = await file.buffer;
    // const workbook = await xlsx.read(fileBuffer, { type: 'buffer' });
    // const sheetName = await workbook.SheetNames[0];
    // const worksheet = await workbook.Sheets[sheetName];
    // const newfile = await xlsx.utils.sheet_to_json(worksheet);
    await newRequest.save()
      .then(savedRequest => {
        console.log('Request saved successfully:', savedRequest._id);
      })
      .catch(error => {
        console.error('Error saving request:', error);
      });
    res.status(200).json({ message: "Ticket Recieved by Backend" });
  } else {
    res.status(401).json({ message: "Ticket Package Faulty" });
  }
});

app.post("/teacher",async(req,res)=>{
  const {name,email,password,subjects,free,dep,role}=req.body
   try {
    const user = await User.findOne({ email });
    if (user) return res.status(201).json({message:"Email Already Exists"});
    const userData = new User({ email,password,role,name,free,subjects,dep});
    // how to save the rest of the deets
    await userData.save();
  } catch (error) {
    console.error("Error in Adding Teacher:", error);
  }
})
app.get('/teacher/:_id',async(req,res)=>{
  const {name,email,password,subjects,free,dep,role}=req.body;
  const id=req.params._id
   try {
    const requests = await Request.find({id});
    res.status(200).json({ requests });
  } catch (error) {
    console.error("Error in Adding Teacher:", error);
  }
});
app.get('/admin/:_id',async(req,res)=>{
  const {name,email,password,subjects,free,dep,role}=req.body;
  const id=req.params._id
   try {
    const requests = await Request.find();
    res.status(200).json({ requests });
  } catch (error) {
    console.error("Error in Adding Teacher:", error);
  }
});
app.get("/logout", (req, res) => {
  // Clear the HTTP-only cookie on the server
  res.clearCookie("jwtoken", { httpOnly: true });
  // Send a response (you can customize this based on your needs)
  console.log("The request is here")
  res.status(200).json({ success: true, message: "Logout successful" });
});
app.post('/admin/check', async (req, res) => {
  const {_id}= req.body;
  
  try {
    const conditionsmet = await checks(_id)
    if (conditionsmet) {
      res.status(200).json({ message: 'Conditions are fulfilled' });
    }
    else {
      res.status(400).json({ message: 'Conditions are not fulfilled' });
    }
  }
  catch (err) {
    console.error(err)
  }
})

app.post('/admin/approve', async (req, res) => {
  
  const {_id}=req.body
  try {
    await ems(_id)
    res.status(200).json({ message: 'EMS DONE!' });
  }
  catch (err) {
    console.error(err)
  }
})

app.post('/admin/deny', async (req, res) => {
  const {_id}= req.body;
  
  try {
    await Request.updateOne({ _id }, { $set: { state: 'denied' } });
    res.status(200).json({ message: 'Data denied successfully' });
  } catch (error) {
    console.error(error)
  }
})
app.listen(3001, (req, res) => {
  console.log("app is listening on port 3001");
});

async function deleteExpiredObjects() {
  console.log('called')
  try {
    const currentDate = new Date();
    const requests = await Request.find({})
    const halls = await Hall.find({})
    for (let req of requests) {
      if (req.end >= currentDate) {
        let hallstofree = [];
        let numofhalls = req.halls;
        let i = 0;
        while (i < halls.length && numofhalls > 0) {
          if (halls[i].free == 0) {
            halls[i].free = 1;
            numofhalls--
            hallstofree.push(halls[i]._id);
          }
          i++;
        }
        await Hall.updateMany({ _id: { $in: hallstofree } }, { $set: { free: 1 } });
        await userSchema.updateMany({ _id: { $in: req.teachers } }, { $set: { free: 1 } });
      }
    }
  } catch (error) {
    console.error('Error deleting expired objects:', error);
  }
}
// Run the deletion logic at regular intervals
setInterval(deleteExpiredObjects, 30 * 60 * 1000);

// const conditionsmet = await checks('6569ded0571625eadb88bc16')
// return the value
// ASSUMING MET, WE NOW DO SEAT AND INIV GEN
// const seatingexcel = await ems('6568f32f424b4e234562f221')
