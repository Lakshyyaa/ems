// // assume we get the req db mongoid
// // 1. check if halls available, no time clashes, invigilation possible
import { Hall, Request } from "../model/db.js"
import { checkSlot, checkTeachers } from "./raise.js";
import { fetchSheet } from "./helper.js";
import { sendMail } from "./index.js";
import userSchema from "../model/userSchema.js";
async function checks(id) {
    // first check if cancel schedule or what nigga
    const req = await Request.findOne({ _id: id });
    const reqs = await Request.find({});
    // 1. checking halls and time
    let approved = 1
    approved = await checkSlot(req.start, req.end, req.halls, reqs, id)
    // 2. checking teachers free for invig
    if (approved) {
        const students = await fetchSheet(req.link)
        approved = await checkTeachers(req.subject, students.length)
        if (approved) {
            // send response that all conditions met
            console.log('sab checked')
        }
        else {
            // send conditions not met in a return
            console.log('rehgya')
        }
    }
    else {
        // send conditions not met in a return
        console.log('rehgya')
    }
}
async function ems(id) {
    const req = await Request.findOne({ _id: id })
    let students = await fetchSheet(req.link)
    let halls = await Hall.find({})
    let teachers = await userSchema.find({})


    // 1. making the seatgen 
    let numberOfStudents = students.length;
    let newData = [];
    let notFree = []
    var studentIndex = 0;
    let i = 0
    while (i < halls.length) {
        var rowsOfLt = halls[i].row;
        var row = 1;
        while (halls[i].free == 0) {
            i++
        }
        while (studentIndex < numberOfStudents && row <= rowsOfLt) {
            var collumnsOfLt = halls[i].collumn;
            var collumn = (row - 1) % 3 + 1;
            while (studentIndex < numberOfStudents && collumn <= collumnsOfLt) {
                students[studentIndex].LT = halls[i].hall;
                students[studentIndex].SEAT = row + '' + String.fromCharCode(collumn + 64);
                newData.push(students[studentIndex]);
                studentIndex++;
                collumn = collumn + 2;
            }
            row++;
        }
        if (studentIndex >= numberOfStudents) {
            break;
        }
        halls[i].free = 0
        notFree.push(halls[i]._id)
        i++
    }
    try {
        await Hall.updateMany({ _id: { $in: notFree } }, { $set: { free: 0 } });
        console.log('updated db for halls');
    } catch (err) {
        console.error(err);
    }


    // 2. making the invigilation
    const numOfTeachers = teachers.length;
    i = 0;
    let j = 0;
    let teachersNotFree = [];

    for (let element of newData) {
        if (i % 20 == 0) {
            while (j < numOfTeachers && (teachers[j].dep == req.subject || teachers[j].free == 0)) {
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
    try {
        await userSchema.updateMany({ _id: { $in: teachersNotFree } }, { $set: { free: 0 } });
        console.log('updated db of teachers and ems done!');
    } catch (err) {
        console.error(err);
    }


    // 3. sending mail
    await sendMail([lol], newData, 'please find attached the arrangement of your exams', 'exam arrangement', 'Exam Schedule')


    // 4. saving the update request state
    req.state = 'approved'
    req.teachers = teachersNotFree
    await req.save()
}
export { checks, ems }