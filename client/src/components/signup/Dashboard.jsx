import useAuth from "../Login/checkAuth";

const Dashboard = () => {
  const rolesArray = ["admin", "user", ""];
  // useEffect(()=>{
  //   const checkAuth=async()=>{
  //     try{

  //       const token = document.cookie
  //           .split('; ')
  //           .find((row) => row.startsWith('ext_name='))
  //           .split('=')[1];
  //       const res=await axios.post('http://localhost:3001/protected-route',
  //       { roles: rolesArray, route },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //         withCredentials: true,
  //       });
  //       console.log(res)
  //       if(res.status===401){
  //         console.log("we are here")
  //         navigate("/error")
  //       }
  //       else if(res.status===200){
  //         console.log("cache token verified")
  //       }
  //       else{
  //         navigate("/login")
  //         throw new Error(res.error)
  //       }

  //     }
  //     catch(err){
  //       console.log(err)
  //       console.log(": error has occured")

  //     }
  //   }
  //   checkAuth();
  // },[])
  useAuth(rolesArray);
  return (
    <div>
      <h2>Dashboard</h2>
      {/* Your dashboard content goes here */}
    </div>
  );
};

export default Dashboard;
