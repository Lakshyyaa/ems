import mongoose from "mongoose";
const Hall = mongoose.model('Hall', {
    hall: Number,
    free: Number,
    row: Number,
    collumn: Number,
});
const Request = mongoose.model('Request', {
    subject: String,
    start: Date,
    end: Date,
    link: String,
    type: String, // can be announce 'cancel', 'schedule' exam, announce 'view' sheet
    halls: Number,
    state: String,
    teachers: [String]
});
const connectDB = async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/teacherDB');
    console.log('Connected to MongoDB');
    // const Hall = mongoose.model('Hall', {
    //     hall: Number,
    //     free: Number,
    //     row: Number,
    //     collumn: Number,
    // });
    // for (let i = 0; i < 10; i++) {
    //     const newHall = new Hall({
    //         hall: i + 1,
    //         free: 1,
    //         row: 10,
    //         collumn: 10,
    //     });

    //     try {
    //         const result = await newHall.save();
    //         console.log('Hall inserted:');
    //     } catch (error) {
    //         console.error('Error inserting Hall:', error);
    //     }
    // }

    // const Teacher = mongoose.model('Teacher', {
    //     name: String,
    //     subject: String,
    //     free: Number,
    // });
    // for (let i = 0; i < 50; i++) {
    //     const newTeacher = new Teacher({
    //         name: 'John Doe' + i,
    //         subject: i % 5 ? 'A' : 'B',
    //         free: 1,
    //     });

    //     try {
    //         const result = await newTeacher.save();
    //         console.log('Teacher inserted:');
    //     } catch (error) {
    //         console.error('Error inserting teacher:', error);
    //     }
    // }
}
export { Hall, Request, connectDB };

// connectDB()
// const Teacher = mongoose.model('Teacher', {
//     name: String,
//     subject: String,
//     free: Number,
// });


// for(let i=0;i<50;i++)
// {
//     const newTeacher = new Teacher({
//         name: 'John Doe'+i,
//         subject: i%2? 'A': 'B',
//         free: 1,
//     });

//     try {
//         const result = await newTeacher.save();
//         console.log('Teacher inserted:');
//     } catch (error) {
//         console.error('Error inserting teacher:', error);
//     }
// }


// Find all documents in the 'teachers' collection after insertion
// const teachers = await Teacher.find();
// // Print the updated documents
// console.log('Teachers after insertion:', teachers);
// // Close the Mongoose connection
// await mongoose.connection.close();
// console.log('Connection closed');
