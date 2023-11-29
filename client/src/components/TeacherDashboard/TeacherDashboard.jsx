import React, { useState, useEffect } from "react";
import styles from "./TeacherDashboard.module.css";
import axios from "axios";
import Modal from "react-modal";
import TicketForm from "./TicketForm/TicketForm";
import useAuth from "../Login/checkAuth";
import checkAuth from "../Login/checkAuth";
import { useLocation, useNavigate } from "react-router-dom";
Modal.setAppElement("#root");
const TeacherDashboard = () => {
  const [tickets, setTickets] = useState([
    { status: "pending", date: "", time: "", file: "", subject: "" },
  ]);
  const route = useLocation().pathname;
  const navigate = useNavigate();
  const rolesArray = ["teacher"]
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    console.log("I am here->  ")
    checkAuth(rolesArray, route, navigate);
    // Fetch tickets for the teacher when the component mounts
    // You'll need to replace 'teacherId' with the actual ID of the logged-in teacher
    // axios
    //   .get(`tickets/teacherId`)
    //   .then((response) => setTickets(response.data))
    //   .catch((error) => console.error("Error fetching tickets:", error));
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Reset form or other state if needed when closing the modal
  };

  return (
    <div className={styles.teacher_dashboard}>
      <div className={styles.requests}>
        <div className={styles.container}>
          <div className={styles.dashboard_heading}>Teacher Dashboard</div>

          {/* Display existing tickets */}
          <div className={styles.ticket_status}>
            <span className={styles.my_tickets}>My Tickets</span>
            <div className={styles.ticketList}>
              {tickets.map((ticket, index) => (
                <div key={index} className={styles.ticketListItem}>
                  <div>
                    {" "}
                    {ticket.status !== "" ? `Status: ${ticket.status}` : null}
                  </div>
                  <div> {`Date: ${ticket.date}`}</div>
                  <div> {`Start-Time: ${ticket.start_time}`}</div>
                  <div> {`End-Time: ${ticket.end_time}`}</div>
                  <div> {`Subject: ${ticket.subject}`}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            className={`${styles.button} ${styles.new_button}`}
            onClick={openModal}
          >
            Create New Ticket
          </button>

          {/* Modal for the form */}
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
            <TicketForm tickets setTickets />
            {/* Add form fields for new ticket data */}
          </Modal>
        </div>
      </div>
      <div className={styles.video}>
        {/* <video src="background.mp4" muted playsInline autoPlay loop></video> */}
      </div>
    </div>
  );
};

export default TeacherDashboard;