import { Schema } from "mongoose";
import mongoose from "mongoose";
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select:false
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
    required: true,
  },
});
const User= mongoose.models.User || mongoose.model('User', userSchema);
export default User