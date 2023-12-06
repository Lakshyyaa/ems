import React, { useState } from "react";
import styles from "./TicketForm.module.css";
import axios from "axios";
import { useProfile } from "../../Context/Context";
import { Button, Input } from "@mui/joy";
import { InputLabel, MenuItem, Select } from "@mui/material";

const TicketForm = ({ tickets, setTickets }) => {
  const { profile } = useProfile();
  const subjects = profile.subject;
  const [newTicketData, setNewTicketData] = useState({
    date: "",
    start_time: "",
    end_time: "",
    file: null,
    subject: "",
    request_type: "",
    free: profile.free,
    dep: profile.dep,
    _id: profile._id,
  });
  const handleCreateTicket = async (e) => {
    console.log(newTicketData.file);
    e.preventDefault();
    // Make a POST request to create a new ticket using Axios
    if (
      newTicketData.date !== "" &&
      newTicketData.start_time !== "" &&
      newTicketData.end_time !== "" &&
      newTicketData.file !== null &&
      newTicketData.subject !== "" &&
      newTicketData.request_type !== "" &&
      newTicketData.free !== "" &&
      newTicketData._id !== ""
    ) {
      try {
        const response = await axios.post(
          "http://localhost:3001/tickets",
          newTicketData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          console.log("Ticket Submitted", response);
          window.location.reload();
        }
      } catch (error) {
        console.log("Ticket Creation Failed:", error);
      }
    } else {
      alert("Please enter the data in correct format");
    }
  };

  return (
    <div className={styles.ticket_form}>
      <form>
        <div className={styles.name}>Name: {profile.name}</div>
        <div className={styles.email}> Email: {profile.email}</div>
        <div ></div>
        <div className={styles.form_inputs}>
          <label htmlFor="excel">Subject</label>

          <select
            required
            value={newTicketData.subject}
            onChange={(e) =>
              setNewTicketData({ ...newTicketData, subject: e.target.value })
            }
          >
            <option value="" disabled>
              Select a Subject
            </option>
            {subjects.map((subject, index) => (
              <option key={index} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.form_inputs}>
          <label htmlFor="excel">Request Type</label>
          <select
            required
            value={newTicketData.request_type}
            onChange={(e) =>
              setNewTicketData({
                ...newTicketData,
                request_type: e.target.value,
              })
            }
          >
            <option value="" disabled>
              Select Request Type
            </option>
            <option value="schedule">Schedule</option>
            <option value="cancel">Cancel</option>
            <option value="view">View Sheet</option>
          </select>
        </div>
        <div className={styles.form_inputs}>
          <label htmlFor="excel">Date</label>
          <Input
            size="md"
            type="date"
            value={newTicketData.date}
            onChange={(e) =>
              setNewTicketData({ ...newTicketData, date: e.target.value })
            }
            required
            id="excel"
            sx={{ width: 240 }}
          ></Input>
        </div>
        <div className={styles.form_inputs}>
          <label htmlFor="excel">Start Time:</label>
          <Input
            size="md"
            type="time"
            value={newTicketData.start_time}
            onChange={(e) =>
              setNewTicketData({ ...newTicketData, start_time: e.target.value })
            }
            sx={{ width: 240 }}
            required
            id="excel"
          ></Input>
        </div>
        <div className={styles.form_inputs}>
          <label htmlFor="excel">End Time:</label>
          <Input
            size="md"
            type="time"
            sx={{ width: 240 }}
            value={newTicketData.end_time}
            onChange={(e) =>
              setNewTicketData({ ...newTicketData, end_time: e.target.value })
            }
            required
            id="excel"
          ></Input>
        </div>
        <div className={styles.form_inputs}>
          <label htmlFor="excel">Upload</label>
          <Input
            type="file"
            required
            id="excel"
            sx={{ width: 240 }}
            onChange={(e) =>
              setNewTicketData({ ...newTicketData, file: e.target.files[0] })
            }
          ></Input>
        </div>
        <Button
          className={styles.button}
          style={{ alignSelf: "center" }}
          onClick={handleCreateTicket}
        >
          Submit Ticket
        </Button>
      </form>
    </div>
  );
};

export default TicketForm;
