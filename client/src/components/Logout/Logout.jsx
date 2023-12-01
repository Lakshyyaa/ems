// Assume this is a component that handles the logout button
import axios from 'axios';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
    const navigate=useNavigate()
  const handleLogout = async() => {
    // Clear user data from local storage
    sessionStorage.removeItem('loginData');
    // Make a request to your server to clear the cookie and logout the user
    // You can use Axios or Fetch for this
    // Example using Axios:
    const res=await axios.get('http://localhost:3001/logout',{withCredentials:true});
    console.log("logout done",res.status)
    // Redirect the user to the login page or homepage
    navigate("/login")
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
};

export default LogoutButton;
