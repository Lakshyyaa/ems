
import jwt from 'jsonwebtoken';
export const Authenticate=async(req,res,next)=>{
    try{
        const token = req.cookies.jwtoken;
      console.log("Token is here",token)
  if (!token || token==="") {
    console.log("token is empty")
    const error='421'
    return res.status(421).json({ message: 'Unauthorized: No token provided' },error);
  }
  console.log("token is full")
  jwt.verify(token, process.env.SECRET_KEY, async (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
    
    req.user = user; // Attach user information to the request object
    next();
  });
    }
    catch(err){
        res.status(401).send('Unauthorized: No token found')
        console.log(err)
    }
}
