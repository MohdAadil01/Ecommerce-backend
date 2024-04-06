import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import Stripe from "stripe";

import userRoute from "./src/routes/userRoute.js";
import productRoute from "./src/routes/product.js";
import connectDB from "./src/config/db.js";
import { errorMiddleware } from "./src/middlewares/errorMiddleware.js";
const app = express();
import NodeCache from "node-cache";
import orderRoute from "./src/routes/order.js";
import paymentRoute from "./src/routes/payment.js";
import statsRouter from "./src/routes/stats.js";
import cors from "cors";

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

config({
  path: "./.env",
});

export const stripe = new Stripe(process.env.STRIPE_KEY);

let MONGO_URL = process.env.MONGO_URL || "";

connectDB(MONGO_URL);
const PORT = 4000;
export const myCache = new NodeCache();

app.use("/api/v1/user", userRoute);

app.use("/api/v1/product", productRoute);

app.use("/api/v1/order", orderRoute);

app.use("/api/v1/payment", paymentRoute);

app.use("/api/v1/dashboard", statsRouter);

app.use("/uploads", express.static("uploads"));

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log("Started listening at port " + PORT);
});
