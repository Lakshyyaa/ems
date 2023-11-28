
import { useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const useAuth = (rolesArray) => {
  const route = useLocation().pathname;
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find((row) => row.startsWith('ext_name='))
          .split('=')[1];

        const res = await axios.post(
          'http://localhost:3001/protected-route',
          { roles: rolesArray, route },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        if (res.status === 401) {
          navigate('/error');
        } else if (res.status === 200) {
          console.log('Cache token verified');
        } else {
          navigate('/login');
          throw new Error(res.error);
        }
      } catch (err) {
        console.log(err);
        console.log(': error has occurred');
      }
    };

    checkAuth();
  }, []);

  return null; // or you can return any value you want to use in your component
};

export default useAuth;
