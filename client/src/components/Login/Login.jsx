import React, { useState } from 'react';
import axios from 'axios';
import './login.css'; // Import the CSS file
import {Link,useNavigate} from 'react-router-dom';
import LinearProgress from '@mui/material/LinearProgress';
import { useProfile } from '../Context/Context';
const Login = () => {
  const navigate=useNavigate();
  const {updateProfile}=useProfile()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
   const [loginSuccess, setLoginSuccess] = useState(false);
  const[loading,setLoading]=useState(false)
  const handleLogin = async (e) => {
  
    
    const formData={
      email:email,
      password:password,
      role:e.target.name,
    }
    console.log(formData,e.target.name)
    e.preventDefault();

    try {
      setLoading(true)
      const response = await axios.post('http://localhost:3001/login',formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials:true,
      }
      );
      setLoading(false)
      if (response.status === 200) {
        updateProfile(response.data.user)
        setErrorMessage('');
         setLoginSuccess(true);
        console.log('Login successful!');
        navigate("/teacher-dashboard")

      }
    } catch (error) {
      setLoading(false)
      console.error('Error during login:', error);
      alert("Invalid Credentials")
    }
  };

  return (<>{loading?<LinearProgress style={{backgroundColor:"black"}}/>:null}
    <div className="container">
      <div className="card">
        <h2>Login</h2>
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
            <button type="button" onClick={handleLogin} className="loginButton teacher" name='teacher'>
              Login as Teacher
            </button>
            {loginSuccess && (
            <Link to="/dashboard" className="dashboardLink">
              Go to Dashboard
            </Link>
          )}
            <button type="button" onClick={handleLogin} className="loginButton admin" name='admin'>
              Login as Admin
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default Login;