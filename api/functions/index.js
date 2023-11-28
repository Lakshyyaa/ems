const xlsx = require('xlsx');
const fs = require('fs');
const mongoose = require('mongoose');
const axios = require('axios');
const nodemailer = require('nodemailer')
const connectDB = require('./db.js');
require('dotenv').config();
const Hall = mongoose.model('Hall', {
    hall: Number,
    free: Number,
    row: Number,
    collumn: Number,
});
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'lnmiitems123@gmail.com', // replace with your Gmail email address
        pass: process.env.PW,        // replace with your Gmail password (or app-specific password)
    },
});
// ADD A FEATURE TO ALTER SEATS? NOT IMPORTANT THOUGH

// AFTER SEATGEN INITIATED BY THE ADMIN, IT MAY RETURN DENY AS IT COULD

async function fetchSheet(filePath) {
    const url = `https://api.github.com/repos/Lakshyyaa/emscdn/contents/files/${filePath}`;
    try {
        const response = await axios.get(url);
        const base64Content = response.data.content;
        const fileBuffer = Buffer.from(base64Content, 'base64');
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        return sheetData
    } catch (error) {
        console.error('Error fetching sheet:', error.message);
        throw error;
    }
}

async function invigilationGen(newData, subName) {
    await connectDB();
    const Teacher = mongoose.model('Teacher', {
        name: String,
        subject: String,
        free: Number,
    });
    let teachers = await Teacher.find();
    const numOfTeachers = teachers.length;
    let i = 0;
    let j = 0;
    let teachersNotFree = [];

    for (let element of newData) {
        if (i % 20 == 0) {
            while (j < numOfTeachers && (teachers[j].subject == subName || teachers[j].free == 0)) {
                j++;
                console.log('j increased.');
            }
            teachersNotFree.push(teachers[j]._id);
            teachers[j].free = 0;
            element.INVI = teachers[j].name;
        } else {
            element.INVI = teachers[j].name;
        }
        i++;
    }

    // below code updates the teachers to not free
    try {
        await Teacher.updateMany({ _id: { $in: teachersNotFree } }, { $set: { free: 0 } });
        console.log('updated db');
    } catch (err) {
        console.error(err);
    }
    writeToSheet(newData, subName);
    return 1;
    // return the right thing, to let the user know what error/right thing has happened
}

async function seatGen(subName, inputStudentList) {
    // delete the arrangement file, just to refresh
    fs.unlink(`${subName}` + 'arrangement.xlsx', (err) => {
        if (err) {
            console.error(`Error deleting arrangement file: ${err}`);
        } else {
            console.log(`arrangement has been deleted.`);
        }
    });

    // main function starts from here
    await connectDB()
    let studentList = await fetchSheet(inputStudentList);
    let numberOfStudents = studentList.length;
    let ltSheet = await Hall.find({})
    //  U S E   A   H A L L S   D A T A B A S E : FREE, NAME, CAPACITY  
    // HERE WE SEE IF ENOUGH SEATS AVAILABLE TO SEND A BIG FOFF
    // BUT REMEMBER TO ADD AN AVAILABLE COLUMN TO IT AS WELL 0/1
    // THAT WILL BE CHANGED JUST LIKE THE TEACHERDB IN THE END OF THIS FUNCTION.
    let newData = [];
    let notFree = []
    var studentIndex = 0;
    let i = 0
    while (i < ltSheet.length) {
        var rowsOfLt = ltSheet[i].row;
        var row = 1;
        while (ltSheet[i].free == 0) {
            i++
        }
        while (studentIndex < numberOfStudents && row <= rowsOfLt) {
            var collumnsOfLt = ltSheet[i].collumn;
            var collumn = (row - 1) % 3 + 1;

            while (studentIndex < numberOfStudents && collumn <= collumnsOfLt) {
                studentList[studentIndex].LT = ltSheet[i].hall;
                studentList[studentIndex].SEAT = row + '' + String.fromCharCode(collumn + 64);
                newData.push(studentList[studentIndex]);
                studentIndex++;
                collumn = collumn + 2;
            }
            row++;
        }
        if (studentIndex >= numberOfStudents) {
            break;
            // NEED TO CHECK IF LESS STUDENTS?
        }
        console.log(ltSheet[i].hall)
        ltSheet[i].free = 0
        notFree.push(ltSheet[i]._id)
        i++
    }
    // console.log(newData)
    try {
        await Hall.updateMany({ _id: { $in: notFree } }, { $set: { free: 0 } });
        console.log('updated db for halls');
    } catch (err) {
        console.error(err);
    }
    invigilationGen(newData, subName);
    // return the right thing, to let the user know what error/right thing has happened
    return 1;
}

// The function below writes to the sheet we want the data we want
async function writeToSheet(newData, subName) {
    try {
        const wb = xlsx.utils.book_new();
        const wsName = "Sheet1";
        // Convert the array of objects to a worksheet
        const ws = xlsx.utils.json_to_sheet(newData);
        // Add the worksheet to the workbook
        xlsx.utils.book_append_sheet(wb, ws, wsName);
        // Write the workbook to a file
        await xlsx.writeFile(wb, `${subName}arrangement.xlsx`);
        console.log('File written successfully.');
        // return the right thing, to let the user know what error/right thing has happened
        return 1;
    } catch (error) {
        console.error('Error writing to file:', error);
        // return the right thing, to let the user know what error/right thing has happened
        return 0;
    }
}

// ONCE THE WRITE SHEET IS DONE, IT WILL PUSH IT TO GITHUB AND MAIL TO STUDENTS
async function sendMail(recipients, text, subject) {
    for (const recipient of recipients) {
        const mailOptions = {
            from: 'lnmiitems123@gmail.com',
            to: recipient,
            subject: subject,
            text: text,
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${recipient}:`, info.response);
        } catch (error) {
            console.error(`Error sending email to ${recipient}:`, error);
        }
    }
}



let subName = 'CN'; // will come from frontend
let inputStudentList = 'lt.xlsx'; // will come from frontend
// seatGen(subName, inputStudentList);
//sendMail(['lakshyaasin@gmail.com'], 'hello', 'hello')
