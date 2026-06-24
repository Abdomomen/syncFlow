import { Schema } from "mongoose";
import mongoose from "mongoose";
const taskSchema= new Schema({
    title:{
        type:String,
        required:true
    },
    desc:{
        type:String
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    status:{
        type:Boolean,
        default:false
    }
},
{ 
        timestamps: true 
  }

)
const Task= mongoose.models.Task || mongoose.model('Task', taskSchema);
export default Task