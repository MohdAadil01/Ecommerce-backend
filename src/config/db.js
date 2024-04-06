import mongoose from "mongoose";
const connectDB = (uri) => {
  mongoose.connect(uri).then(() => console.log("Connected to databse"));
};

export default connectDB;
