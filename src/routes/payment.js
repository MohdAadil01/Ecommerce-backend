import express from "express";
import {
  allCoupons,
  applyDiscount,
  createPaymentIntent,
  deleteCoupon,
  newCoupon,
} from "../controllers/paymentController.js";
import { adminOnly } from "../middlewares/authMiddleware.js";
const paymentRoute = express.Router();

paymentRoute.post("/create", createPaymentIntent);

paymentRoute.get("/discount", applyDiscount);
paymentRoute.get("/coupons/all", adminOnly, allCoupons);
paymentRoute.post("/coupon/new", adminOnly, newCoupon);
paymentRoute.delete("/delete/:id", adminOnly, deleteCoupon);

export default paymentRoute;
