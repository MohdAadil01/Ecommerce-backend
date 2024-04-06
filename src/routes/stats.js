import express from "express";
import { adminOnly } from "../middlewares/authMiddleware.js";
import {
  getBarCharts,
  getDashboardStats,
  getLineCharts,
  getPieCharts,
} from "../controllers/statsController.js";
const statsRouter = express.Router();

statsRouter.get("/stats", adminOnly, getDashboardStats);

statsRouter.get("/pie", adminOnly, getPieCharts);

statsRouter.get("/bar", adminOnly, getBarCharts);

statsRouter.get("/line", adminOnly, getLineCharts);

export default statsRouter;
