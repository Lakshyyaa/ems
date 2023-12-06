import mongoose from 'mongoose';
import xlsx from 'xlsx';
import { connectDB, Hall, Request } from '../model/db.js';
import userSchema from '../model/userSchema.js';
export async function addToRequests(subName, startTime, endTime, link, requestType, fileName) {
    const approved = await checkSlot(subName, startTime, endTime, hallNeeded(fileName))
    if (approved) {
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
async function checkSlot(start, end, halls, requests, id) {
    let approve = 1;
    const maxhalls = 17 // shweta maam told us that we can have halls uniform and equal, 
    // though seatgen function works regardless, just counting seats will take time
    try {
        requests.forEach(r => {
            // add to check same req not being compared
            if (r._id != id) {
                if (r.state == 'approved') {
                    halls += r.halls
                    if (halls > maxhalls) {
                        approve = 0
                    }
                }
                if (r.state == 'approved' && (r.start > start && r.start < end) || (r.end > start && r.end < end)) {
                    approve = 0
                }
            }
        })
    } catch (error) {
        console.error('Error checking slot:', error);
    }
    return approve; // all checks passed
}

async function checkTeachers(subject, studentsnum) {
    let approve = 1
    try {
        const teachers = await userSchema.find({})
        teachers.forEach(t => {
            if (t.dep != subject && t.free) {
                studentsnum -= 20
            }
        })
        if (studentsnum > 0) {
            approve = 0
        }
        return approve
    }
    catch (err) {
        console.log(err)
    }
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


// async function main() {
// const a = new Date(2023, 10, 20, 12, 30, 0)
// const b = new Date(2023, 10, 20, 12, 45, 0)
// const c = new Date(2023, 10, 20, 12, 50, 0)
// }
// main().catch(err => console.log(err))
export { checkSlot, checkTeachers }