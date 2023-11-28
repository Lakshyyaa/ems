import jwt from 'jsonwebtoken';
export const Authenticate=async(req,res,next)=>{
    try{
        const token = req.cookies.jwtoken;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
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
