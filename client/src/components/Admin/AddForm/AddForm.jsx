import React, { useState } from "react";
import styles from "./AddForm.module.css";
import Input from "@mui/joy/Input";
import { Button, FormHelperText, FormLabel, TextField } from "@mui/material";
import axios from "axios";

const AddForm = () => {
  const [subject, setSubject] = useState('');
  const [inputArray, setInputArray] = useState([]);
  const [teacherData, setTeacherData] = useState({
    name: "",
    email: "",
    password: "",
    subjects: inputArray,
    free: Number(1),
    dep: "",
    role: "teacher",

  });


  const handleAddInput = () => {

    teacherData.subjects.push(subject)
    setSubject(''); // Clear input field after adding to the array
  };
  const handleSubmit = async (e) => {
    console.log(teacherData)
    try {

      const res = await axios.post("http://localhost:3001/teacher", teacherData);
      if (res.status === 200) {
        console.log("Ticket Submitted", res);
        alert("teacher added successfully")
      }
      if (res.status === 201) {
        alert("Email Already Exists");
        console.log(res.status)
      }
    } catch (error) {
      console.log("error is here", error)
    }
  }
  return (
    <div className={styles.add_form}>
      <h3>AddTeacher</h3>
      <form>
        <div className={styles.input_field}>
          <div className={styles.label}>Name:</div>
          <Input
            size="md"
            placeholder="Enter the Teacher's Name"
            value={teacherData.name}
            onChange={(e) =>
              setTeacherData({ ...teacherData, name: e.target.value })
            }
          />
        </div>
        <div className={styles.input_field}>
          <div className={styles.label}>Email:</div>
          <Input
            size="md"
            placeholder="Enter email"
            value={teacherData.email}
            onChange={(e) =>
              setTeacherData({ ...teacherData, email: e.target.value })
            }

          />
        </div>
        <div className={styles.input_field}>
          <div className={styles.label}>Password:</div>
          <Input
            size="md"
            placeholder="Enter password"
            value={teacherData.password}
            onChange={(e) =>
              setTeacherData({ ...teacherData, password: e.target.value })
            }
          />
        </div>
        <div className={styles.input_field}>
          <div className={styles.label}>Department Head(optional):</div>
          <Input
            size="md"
            placeholder="Department Head(optional)"
            value={teacherData.dep}
            onChange={(e) =>
              setTeacherData({ ...teacherData, dep: e.target.value })
            }
          />
        </div>
        <div className={styles.input_field} >
          <div className={styles.label}>Subject:</div>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <Input
              size="md"
              placeholder="Enter Subjects"
              value={subject}
              onChange={(e) =>
                setSubject(e.target.value)
              }
            />
            <Button variant="contained" color="primary" onClick={handleAddInput} sx={{ width: "fit-content" }}>
              Add
            </Button></div>
          {/* <FormHelperText>This is a helper text.</FormHelperText> */}
        </div>
        <Button type="submit" variant="contained" onClick={handleSubmit} sx={{ width: "fit-content", alignSelf: "center" }}>Submit</Button>
      </form>
    </div>
  );
};

export default AddForm;
