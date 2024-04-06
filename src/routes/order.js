import express from "express";
import {
  allOrders,
  deleteOrder,
  getSingleOrder,
  myOrders,
  newOrder,
  processOrder,
} from "../controllers/orderController.js";
import { adminOnly } from "../middlewares/authMiddleware.js";
const orderRoute = express.Router();

orderRoute.post("/new", newOrder);
orderRoute.get("/my", myOrders);
orderRoute.get("/all", adminOnly, allOrders);
orderRoute.get("/:id", getSingleOrder);
orderRoute.put("/:id", adminOnly, processOrder);
orderRoute.delete("/:id", adminOnly, deleteOrder);

export default orderRoute;
