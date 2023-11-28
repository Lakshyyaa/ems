// A SCHEMA FOR EXAMS SCHEDULED FOR FUTURE: SUB AND TIME AND LT
// A SCHEMA FOR THE REQUESTS SENT: SUB, TIME, EXCEL SHEET LINK, TYPE? ANNOUNCE OR SCHEDULE

// UPON LOGIN OF A TEACHER, WHENEVER THE TEACHER TYPES IN THE TIME, THE FRONTEND CHECKS IN THE DB
// 1. IF THE TEACHER HAS SCHEDULED ONE ALREADY AS ONE REQUEST PER TEACHER UNTIL CONCLUDED
// 2. OR IF THE TIME SLOT IS BOOKED AND RETURN FOFF IF SO OR
// 3. IF SEATS ENOUGH (WRITE ITS FUNCTIONS WHICH SEES AVAILABLE COLLUMNS IN EXCEL SHEET OF LT) - W R I T E
// EACH SUB CAN HAVE ONLY ONE EXAM PER TIME AND NO REQUESTS UNTIL NEW OCCURRED.

// THE FRONTEND RECEIVES THE XLSX SHEET AND UPLOADS THEM TO GITHUB, THEN SEND THE DATA AS SCHEMA OBJECT TO BACKEND
// AND GETS STORED IN MONGODB - W R I T E

// ON OPENING THE ACCOUNT, THE ADMIN CAN VIEW ALL THE REQUESTS, THEN TAKE THE ACTION:
// 1. ANNOUNCEMENT: SEND EMAIL TO THE STUDENTS IN THE SHEET AFTER FETCHING IT, AND WRITE THE E-MAIL
// 2. CLICK ON THE SEATGEN FUNCTION AND SEND IT ALL AS EMAIL TO THE SAME STUDENTS.

// AFTER THE WORK IS DONE, IT DELETES THE SHEET FROM THE REPO, ADD TO CALENDAR, REMOVE FROM REQUESTS.
// THE NAME OF THE SHEET IS SUB_STUDENTS
// DO CTRL+F AND SEARCH FOR HALLS AND ADD LOGIC TO CALCULATE AND USE HALLS IN THE CODE BELOW MARK/UNMARK


// THE BELOW CODE IS FOR THE SCHEMA OF SCHEDULED EXAMS AND REQUESTS PENDING AND THEIR USE


import mongoose from 'mongoose';
import xlsx from 'xlsx';
import {connectDB} from './db.js';
const maxhalls = 17 // shweta maam told us that we can have halls uniform and equal, 
// though seatgen function works regardless, just counting seats will take time

const Hall = mongoose.model('Hall', {
    hall: Number,
    free: Number,
    row: Number,
    collumn: Number,
});
const Schedule = mongoose.model('Schedule', {
    subject: String,
    start: Date,
    end: Date,
    halls: Number
});
const Request = mongoose.model('Request', {
    subject: String,
    start: Date,
    end: Date,
    link: String,
    type: String, // can be announce 'cancel', 'schedule' exam, announce 'view' sheet
});


async function addToSchedule(subName, startTime, endTime, halls) {
    await connectDB()
    const newSchedule = new Schedule({
        subject: subName,
        start: startTime,
        end: endTime,
        halls: halls,
        // request type
    });

    try {
        const result = await newSchedule.save();
        console.log('Schedule inserted:', result);
    } catch (error) {
        console.error('Error inserting schedule:', error);
    }
}


export async function addToRequests(subName, startTime, endTime, link, requestType, fileName) {
    const approved = await checkSlot(subName, startTime, endTime, hallNeeded(fileName))
    if (approved) {
        // HERE FIRST SEND AN APPROVED THING
        await connectDB()
        const newRequest = new Request({
            subject: subName,
            start: startTime,
            end: endTime,
            link: link,
            type: requestType,
        });

        try {
            const result = await newRequest.save();
            console.log('Request inserted:', result);
        } catch (error) {
            console.error('Error inserting request:', error);
        }
    }
    else {
        console.log('slot not availabale')
        return // RETURN A DENIED THING WITH REASON
    }
}

// ALSO ADD TO FREE THE NUMBER OF HALLS ONCE REQUEST DONE (KEEP CHECKING TIME), ALSO DO SAME FOR REQUESTS?
async function removeFromScheduled(subName) {
    await connectDB()
    let toChange = []
    try {
        const result = await Schedule.findOne({ subject: subName });
        if (result) {
            numOfHalls = result.halls
            const getHalls = await Hall.find({})
            let i = 0
            while (numOfHalls > 0) {
                while (getHalls[i].hall == 1) {
                    i++
                }
                toChange.push(getHalls[i]._id)
                i++
                numOfHalls--
            }
        } else {
            console.log(`No schedule found with subject: ${subName}`);
        }
    } catch (error) {
        console.error('Error removing schedule:', error);
    }
    try {
        await Hall.updateMany({ _id: { $in: toChange } }, { $set: { free: 1 } });
        console.log('updated db for halls');
    } catch (err) {
        console.error(err);
    }
    try {
        const result = await Schedule.deleteOne({ subject: subName });
        if (result.deletedCount > 0) {
            console.log(`Successfully deleted schedule with subject: ${subName}: `, result);
        } else {
            console.log(`No schedule found with subject: ${subName}`);
        }
    } catch (error) {
        console.error('Error removing schedule:', error);
    }
}


async function removeFromRequests(subName) {
    await connectDB()
    try {
        const result = await Request.deleteOne({ subject: subName });
        if (result.deletedCount > 0) {
            console.log(`Successfully deleted schedule with subject: ${subName}`);
        } else {
            console.log(`No schedule found with subject: ${subName}`);
        }
    } catch (error) {
        console.error('Error removing schedule:', error);
    }
}

// first check if any subject has happened and needs to be removed by looking at current time
async function checkSlot(subName, start, end, reqHalls) {
    let approve = 1;
    await connectDB()
    let halls = reqHalls;
    try {
        const requests = await Request.find({})
        requests.forEach(r => {
            halls += r.halls
            if (r.subject == subName) {
                approve = 0
            }
            else if ((r.start > start && r.start < end) || (r.end > start && r.end < end)) {
                approve = 0
            }
            else if (halls + 5 > maxhalls) {
                approve = 0
            }
        })
    } catch (error) {
        console.error('Error checking slot:', error);
    }
    // check the sub in scheduled, if time clashes and lt not available cancel
    try {
        const existingSchedule = await Schedule.find({ subject: subName });
        if (existingSchedule.length > 0) {
            existingSchedule.forEach(s => {
                halls += s.halls
                if (halls + 5 > maxhalls) {  // Always keeping a buffer of 5 halls.
                    approve = 0  // as enough halls not left
                }
                else if ((s.start > start && s.start < end) || (s.end > start && s.end < end)) {
                    approve = 0; // as it overlapped with an existing schedule
                }
            })
        }
    } catch (error) {
        console.error('Error checking slot:', error);
    }
    return approve; // all checks passed
}

function hallNeeded(fileName) {
    const hallCapacity = 100;
    const workbook = xlsx.readFile(fileName);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const sheetData = xlsx.utils.sheet_to_json(sheet);
    const numStudents = sheetData.length
    return Math.ceil(numStudents / hallSize);
}


async function main() {
    const a = new Date(2023, 10, 20, 12, 30, 0)
    const b = new Date(2023, 10, 20, 12, 45, 0)
    const c = new Date(2023, 10, 20, 12, 50, 0)
    // await addToSchedule('CN',a,b,6)
    await removeFromScheduled('CN')
    // await addToRequests('CN', a, b, 'as', 'cancel', 'staff.xlsx')
    // await addToRequests('CN', a, c, 'as', 'cancel', 'staff.xlsx')
}
main().catch(err => console.log(err))

// USER SENDS REQ,
// 1. CHECK IF REQ SECTION FULL HAS ONE, IF IT HAS, DENY
// 2. CHECK IF THE REQ HAS ENOUGH TIME OR SLOT, IF NOT, FOFF THEN
// 2. WHEN THE ADMIN LOGS IN, HE WILL PUSH REQ TO SCHEDULED AFTER USING THE SEATGEN/OTHER FUNCTIONS, AND DELETE
// ITS XLSX FILE
// 3. IF THE REQUEST IS TO CANCEL, CHECK IF EXAM HAPPENDED, ELSE REMOVE IT.
// 4. KEEP CHECKING TIME IF EXAM PASSED, REMOVE IT FOM THE SCHEDULE.

// WRITE THE ABOVE CODE AND WRITE FOR THE WHEN USER ACTUALLY HITS THE BUTTON TO SCHEDULE ONE



// 1. M A I N  :  KEEP CHECKING FOR WHEN AN EXAM ENDED, REMOVE IT FROM THE SCHEDULED, FETCH AND DELETE FROM GITHUB
// THEN READ IT AND FREE ALL THOSE HALLS AND TEACHERS
// FOR THIS TO WORK, AFTER COMPLETING SEATGEN PUSH THIS TO GITHUB TOO.  
// 2. WE HAVE INFINITE TEACHERS.


// EDIT: WHEN USER RAISES: CHECK IF ANOTHER REQ EXIST OR SCHEDULE HAS CLASHES, IF YES OF EITHER CANT RAISE.
// APPROVE, DENY BY AMDIN LATER BY CHECKING HALLS, LT, TIME or let the admin do it???/
// MAKE CAPACITY TO ACTUAL NOT 100
// WHEN REQ APP/DENY PUT IN ANOTHER DB THAT IS FETCHED IN FRONTEND TO SHOW AND MARK AS READ BUTTON TO EMPTY THE DB 
// THIS DB WILL ALSO NEED THE ID(NAME) OF THE TEACHER TO SHOW HIM THAT AND SO WOULD THE REQ DB NEED ONE