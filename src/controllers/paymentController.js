import { stripe } from "../../server.js";
import Coupon from "../models/Coupon.js";

export const newCoupon = async (req, res, next) => {
  const { coupon, amount } = req.body;
  if (!coupon || !amount) {
    return next(Error("Please Enter both amount and coupon"));
  }
  await Coupon.create({
    coupon,
    amount,
  });

  res.status(200).json({
    success: true,
    message: "Coupon created successfully",
  });
};
export const applyDiscount = async (req, res, next) => {
  const { coupon } = req.query;
  const discount = await Coupon.findOne({ coupon });
  if (!discount) {
    return next(Error("Invalid coupon code"));
  }
  res.status(200).json({
    status: true,
    message: discount.amount,
  });
};

export const allCoupons = async (req, res, next) => {
  const coupons = await Coupon.find();
  if (!coupons) {
    return next(Error("No coupons"));
  }
  res.status(200).json({
    status: true,
    coupons,
  });
};

export const deleteCoupon = async (req, res, next) => {
  const { id } = req.params;
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    return next(Error("Coupon does not exist"));
  }
  await coupon.deleteOne();
  res.status(200).json({
    status: true,
    message: "Successfully deleted coupon",
  });
};

export const createPaymentIntent = async (req, res, next) => {
  const { amount } = req.body;
  if (!amount) {
    return next(Error("Please Enter amount."));
  }
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number(amount) * 100,
    currency: "inr",
  });

  res.status(200).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
  });
};
