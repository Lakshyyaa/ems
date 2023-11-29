import { useEffect } from 'react';
import axios from 'axios';



const checkAuth = async (rolesArray, route, navigate) => {

    try {
        // const token = document.cookie
        // console.log(token)
        // if(token===""){
        //   console.log("inside null token")
        //   navigate('/login');
        // }
        //   const newToken=token.split(';')
        //   .find((row) => row.startsWith('ext_name='))
        //   .split('=')[1];
        //   if(newToken===null){
        //     navigate('/login');
        //   throw new Error();
        //   }
        //   console.log("i reached here",newToken)
        const res = await axios.post(
            'http://localhost:3001/protected-route',
            { roles: rolesArray, route },
            {
                // headers: {
                //   Authorization: `Bearer ${newToken}`,
                // },
                withCredentials: true,
            }
        );

        if (res.status === 200) {
            console.log('Cache token verified');

        }
    } catch (err) {
        console.log(err.response);
        console.log(err.status, ': error has occurred');
        if (err.data === '421') {
            navigate('/login');
        }
        else {
            navigate('/error');
        }
    }
};


export default checkAuth;