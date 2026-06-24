import { Schema } from "mongoose";
import mongoose from "mongoose";

const subSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    next: {
      type: Date,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    price:{
        type:String
    }
  },
  {
    timestamps: true,
  },
);

const Sub= mongoose.models.Sub || mongoose.model("Sub",subSchema)

export default Sub 