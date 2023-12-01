import React from "react";
import styles from "../TeacherDashboard.module.css";
const DashboardComponent = ({tickets}) => {
  return (
    <div className={styles.ticket_status}>
      <span className={styles.my_tickets}>My Tickets</span>
      <div className={styles.ticketList}>
        {tickets.length>0?(tickets?.map((ticket, index) => (
          <div key={index} className={styles.ticketListItem}>
            <div> {`Status: ${ticket.state}`}</div>
            <div> {`Date: ${ticket.date}`}</div>
            <div> {`Start-Time: ${ticket.start}`}</div>
            <div> {`End-Time: ${ticket.end}`}</div>
            <div> {`Subject: ${ticket.subject}`}</div>
          </div>
        ))):null}
      </div>
    </div>
  );
};

export default DashboardComponent;
