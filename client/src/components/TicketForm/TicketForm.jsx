import React, { useState } from "react";
import styles from "./TicketForm.module.css";
import axios from "axios";
import { useProfile } from "../../Context/Context";

const TicketForm = ({ tickets, setTickets }) => {
  const{profile}=useProfile()
  const [newTicketData, setNewTicketData] = useState({
    date: "",
    start_time: "",
    end_time: "",
    file: null,
    subject: "",
    request_type: "",
    profile
  });
  const handleCreateTicket = async (e) => {
    console.log();
    e.preventDefault();
    // Make a POST request to create a new ticket using Axios
    if (
      newTicketData.date !== "" &&
      newTicketData.start_time !== "" &&
      newTicketData.end_time !== "" &&
      newTicketData.file !== null &&
      newTicketData.subject !== "" &&
      newTicketData.request_type!==""
    ) {
      console.log("data->", newTicketData);
      try {
        const response = await axios.post(
          "http://localhost:3001/tickets",
          newTicketData,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          console.log("Ticket Submitted", response);
        }
      } catch (error) {
        console.log("Ticket Creation Failed:", error);
      }
    } else {
      alert("Please enter the data in correct format");
    }
  };
  const [subjects, setSubjects] = useState(["PTS", "M1", "M2"]);
  return (
    <div className={styles.ticket_form}>
      <form>
        <div>{profile.email}</div>
        <div></div>
        <div></div>
        <div className={styles.form_inputs}>
          <select
            required
            value={newTicketData.subject}
            onChange={(e) =>
              setNewTicketData({ ...newTicketData, subject: e.target.value })
            }
          >
            <option value="" disabled>
              Select a subject
            </option>
            {subjects.map((subject, index) => (
              <option key={index} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.form_inputs}>
          <select
            required
            value={newTicketData.request_type}
            onChange={(e) =>
              setNewTicketData({ ...newTicketData, request_type: e.target.value })
            }
          >
            <option value="" disabled>
              Select Request Type
            </option>
            <option value="schedule">
              Schedule
            </option>
            <option value="cancel" >
              Cancel
            </option>
            
          </select>
        </div>
        <div className={styles.form_inputs}>
          <label htmlFor="excel">Upload</label>
          <input
            type="date"
            value={newTicketData.date}
            onChange={(e) =>
              setNewTicketData({ ...newTicketData, date: e.target.value })
            }
            required
            id="excel"
          ></input>
        </div>
        <div className={styles.form_inputs}>
          <label htmlFor="excel">Start Time:</label>
          <input
            type="time"
            value={newTicketData.start_time}
            onChange={(e) =>
              setNewTicketData({ ...newTicketData, start_time: e.target.value })
            }
            required
            id="excel"
          ></input>
        </div>
        <div className={styles.form_inputs}>
          <label htmlFor="excel">End Time:</label>
          <input
            type="time"
            value={newTicketData.end_time}
            onChange={(e) =>
              setNewTicketData({ ...newTicketData, end_time: e.target.value })
            }
            required
            id="excel"
          ></input>
        </div>
        <div className={styles.form_inputs}>
          <label htmlFor="excel">Upload</label>
          <input
            type="file"
            required
            id="excel"
            onChange={(e) =>
              setNewTicketData({ ...newTicketData, file: e.target.files[0] })
            }
          ></input>
        </div>
        <button
          className={styles.button}
          style={{ alignSelf: "center" }}
          onClick={handleCreateTicket}
        >
          Submit Ticket
        </button>
      </form>
    </div>
  );
};

export default TicketForm;
