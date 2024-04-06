import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  coupon: {
    type: String,
    required: [true, "Enter the coupon code"],
    unique: true,
  },
  amount: {
    type: Number,
    required: [true, "Enter the amount"],
  },
});

const Coupon = new mongoose.model("Coupon", couponSchema);
export default Coupon;
