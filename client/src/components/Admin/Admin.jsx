// Admin.jsx

import React, { useEffect, useState } from "react";
import styles from "./Admin.module.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "react-modal";
import TicketForm from "../TeacherDashboard/TicketForm/TicketForm";
import AddForm from "./AddForm/AddForm";
import checkAuth from "../Login/checkAuth";
import DashboardComponent from "../TeacherDashboard/DashboardComponent/DashboardComponent";
import { useProfile } from "../Context/Context";
import { Button } from "@mui/material";

export default function Admin() {
  const [expandedTickets, setExpandedTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState({});
  const rolesArray = ["admin"];
  const { profile } = useProfile();
  const [tickets, setTickets] = useState([]);
  const route = useLocation().pathname;
  const [checker, setChecker] = useState(3);

  useEffect(() => {
    checkAuth(rolesArray, route, navigate);
    // Fetch tickets for the teacher when the component mounts
    // You'll need to replace 'teacherId' with the actual ID of the logged-in teacher
    const fetchTicket = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/admin/${profile._id}`
        );
        setTickets(res.data.requests);
        console.log(tickets);
      } catch (err) {
        console.log("Error fetching tickets", err);
      }
    };
    fetchTicket();
  }, []);
  const checkForAvailability = async (index, ticket) => {

    try {
      const res = await axios.post("http://localhost:3001/admin/check", ticket);
      if (res.status === 200) {
        setChecker(1);
      }
      else { setChecker(2) };
    } catch (error) {
      console.log(error)
    }
  }
  const denyRequest = async (ticket) => {
    try {
      const res = await axios.post("http://localhost:3001/admin/deny", ticket)
      if (res.status === 200) {
        console.log("Request Approved")
        window.location.reload()
      }
    } catch (error) {
      console.log(error)
    }
  }
  const approveRequest = async (ticket) => {
    try {
      const res = await axios.post("http://localhost:3001/admin/approve", ticket)
      if (res.status === 200) {
        console.log("Request Approved")
        window.location.reload()

      }
    } catch (error) {
      console.log(error)
    }
  }


  const handleTicketClick = (index, ticket) => {
    setExpandedTickets((prevExpandedTickets) => {
      const newExpandedTickets = [...prevExpandedTickets];
      newExpandedTickets[index] = !newExpandedTickets[index];
      return newExpandedTickets;
    });
    if(ticket.state==="pending"){
    checkForAvailability(index, ticket);}
  };
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Reset form or other state if needed when closing the modal
  };
  return (
    <div className={styles.mainBox}>
      <div className={styles.box}>
        <div className={styles.requestBox}>
          <div className={styles.ticket_status}>
            <span className={styles.my_tickets}>My Tickets</span>
            <div className={styles.ticketList}>
              {tickets?.map((ticket, index) => (
                <div
                  key={index}
                  className={styles.ticketListItem}
                  onClick={() => handleTicketClick(index, ticket)}
                >
                  <div>{`Status: ${ticket.state}`}</div>
                  {expandedTickets[index] && (
                    <>
                      {ticket.state==="pending"?<div className={`${styles.pending} ${checker === 1 ? styles.accept : checker === 2 ? styles.reject : styles.loading}`}>{checker === 1 ? "Free" : checker === 2 ? "Busy" : "Loading"}</div>:null}
                      {ticket.start && <div> {`Start-Time: ${new Date(ticket.start).toLocaleTimeString()}`}</div>}
                      {ticket.end && <div> {`End-Time: ${new Date(ticket.end).toLocaleTimeString()}`}</div>}
                      {ticket.end && <div> {`Date: ${new Date(ticket.end).toLocaleDateString()}`}</div>}
                      <div>{`Subject: ${ticket.subject}`}</div>
                      {ticket.state==="pending"?<div style={{ display: "flex" }} className={`${ticket.state === "pending" ? '' : styles.remove}`}>
                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ width: "fit-content", marginRight: "1rem" }}
                          onClick={() => denyRequest(ticket)}
                        >
                          Deny
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ width: "fit-content" }}
                          onClick={() => approveRequest(ticket)}
                        >
                          Approve
                        </Button>
                      </div>:null}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.buttons}>
          <button className={styles.addButton} onClick={openModal} value="add">
            Add Teacher
          </button>

          <Modal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            contentLabel="Create New Ticket Modal"
            className={styles.modalContent}
            overlayClassName={styles.modalOverlay}
          >
            <button onClick={closeModal} className={styles.close_button}>
              X
            </button>
            <AddForm />
            {/* Add form fields for new ticket data */}
          </Modal>
          {/* <button className={styles.deleteButton} value="delete">
            Delete Teacher
          </button> */}
        </div>
      </div>
    </div>
  );
}
