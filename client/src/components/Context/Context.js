
import React, { createContext, useState, useContext } from 'react';

const ProfileContext = createContext();

const Context = ({ children }) => {
    const storedLoginData = sessionStorage.getItem('loginData');
  const initialLoginData = storedLoginData ? JSON.parse(storedLoginData) : null;
  const [profile, setProfile] = useState(initialLoginData);

  const updateProfile = (newProfile) => {
    setProfile(newProfile);
    sessionStorage.setItem('loginData', JSON.stringify(newProfile));
  };
  const clearLoginData = () => {
    setProfile(null);
    // Clear the login data from sessionStorage
    sessionStorage.removeItem('loginData');
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile ,clearLoginData}}>
      {children}
    </ProfileContext.Provider>
  );
};

const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export { Context, useProfile };
