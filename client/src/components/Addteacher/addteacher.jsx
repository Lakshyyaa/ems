import React, { useState } from 'react';
import axios from 'axios';
import './addteacher.css'; // Import the CSS file


const AddUser = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

//   const handleAddUser = async (e) => {
//     e.preventDefault();

//     const formData = {
//       email: email,
//       password: password,
//     };

//     try {
//       const response = await axios.post('http://localhost:3001/addUser', formData, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.status === 200) {
//         setErrorMessage('');
//         console.log('User added successfully!');
//       }
//     } catch (error) {
//       console.error('Error adding user:', error);
//       setErrorMessage('Failed to add user. Please check the data.');
//     }
//   };

  return (
    <div className="container">
      <div className="card">
        <h2>Add User</h2>
        {errorMessage && <p className="errorMessage">{errorMessage}</p>}
        <form>
          <div className="inputGroup">
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="inputField"
              required
            />
          </div>
          <div className="inputGroup">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="inputField"
              required
            />
          </div>
          <div className="buttonGroup">
            <button type="button"  className="addUserButton">
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
