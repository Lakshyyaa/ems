import mongoose from "mongoose";
import bcrypt from "bcryptjs"; 
import jwt from "jsonwebtoken"
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role:String,
  name: String, 
  free: Number,
  subjects: [String],
  dep: String
});
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 16);
  }
  next();
});
userSchema.methods.generateAuthToken=async function(){
  try{
    let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY, { expiresIn: '30d' })
    return token;
  }
  catch(error){
    console.log("Failed to generate Auth Token",error)
  };
}
export default mongoose.model("User", userSchema);
