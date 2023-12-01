import React, { useState, useEffect } from "react";
import styles from "./TeacherDashboard.module.css";
import axios from "axios";
import Modal from "react-modal";
import TicketForm from "./TicketForm/TicketForm";
import useAuth from "../Login/checkAuth";
import checkAuth from "../Login/checkAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { useProfile } from "../Context/Context";
import ExcelUploader from "../../ExcelUploader";
Modal.setAppElement("#root");
const TeacherDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const route = useLocation().pathname;
  const navigate = useNavigate();
  const rolesArray = ["teacher"];
  const { profile } = useProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  useEffect(() => {
    console.log("I am here->  ");
    checkAuth(rolesArray, route, navigate);
    // Fetch tickets for the teacher when the component mounts
    // You'll need to replace 'teacherId' with the actual ID of the logged-in teacher
    const fetchTicket = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/teacher/${profile._id}`
        );
        setTickets(res.data.requests);
        console.log(tickets);
      } catch (err) {
        console.log("Error fetching tickets", err);
      }
    };
    fetchTicket();
    
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Reset form or other state if needed when closing the modal
  };
  const openModal2 = () => {
    setIsModalOpen2(true);
  };

  const closeModal2 = () => {
    setIsModalOpen2(false);
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
              {tickets?.map((ticket, index) => (
                <div key={index} className={styles.ticketListItem}>
                  
                  <div> {`Status: ${ticket.state}`}</div>
                  <div> {`Date: ${ticket.date}`}</div>
                  <div> {`Start-Time: ${ticket.start}`}</div>
                  <div> {`End-Time: ${ticket.end}`}</div>
                  <div> {`Subject: ${ticket.subject}`}</div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.teacher_buttons}>
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
            <button
              className={`${styles.button} ${styles.new_button}`}
              onClick={openModal2}
            >
              Show Class Progress
            </button>
            <Modal
              isOpen={isModalOpen2}
              onRequestClose={closeModal2}
              contentLabel="Show Class Progress"
              className={styles.modalContent}
              overlayClassName={styles.modalOverlay}
            >
              <button onClick={closeModal2} className={styles.close_button}>
                X
              </button>
              <ExcelUploader />
              {/* Add form fields for new ticket data */}
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
