import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: [true, "Please provide the ID"],
    },
    name: {
      type: String,
      required: [true, "Please Enter your Name"],
    },
    email: {
      type: String,
      required: [true, "Please Enter your Email"],
      unique: [true, "Email already exists"],
      validate: validator.isEmail,
    },
    photo: {
      type: String,
      required: [true, "Please add Photo"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Please Enter your Gender"],
    },
    dob: {
      type: Date,
      required: [true, "Please enter your Date of birth"],
    },
  },
  { timestamps: true }
);

userSchema.virtual("age").get(function () {
  const today = new Date();
  const dob = this.dob;
  let age = today.getFullYear() - dob.getFullYear();
  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < today.getDate())
  ) {
    age--;
  }
  return age;
});

const User = mongoose.model("User", userSchema);
export default User;
