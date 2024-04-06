import express from "express";
import { adminOnly } from "../middlewares/authMiddleware.js";
import userController, {
  deleteUser,
  getAllUsers,
  getUser,
} from "../controllers/userController.js";
const router = express.Router();

router.post("/new", userController);
router.get("/all", adminOnly, getAllUsers);
router.get("/:id", getUser).delete(adminOnly, deleteUser);

export default router;
