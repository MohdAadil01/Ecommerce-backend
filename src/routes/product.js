import express from "express";
import productController, {
  deleteProduct,
  getAdminProducts,
  getAllCategories,
  getLatestProducts,
  getSearchedProducts,
  getSingleProduct,
  updateProduct,
} from "../controllers/productController.js";
import { upload } from "../middlewares/multer.js";
import { adminOnly } from "../middlewares/authMiddleware.js";

const productRoute = express.Router();

productRoute.get("/all", getSearchedProducts);
productRoute.post("/new", adminOnly, upload, productController);
productRoute.get("/latest", getLatestProducts);
productRoute.get("/categories", getAllCategories);
productRoute.get("/admin-products", adminOnly, getAdminProducts);
productRoute.get("/:id", getSingleProduct);
productRoute.put("/:id", adminOnly, upload, updateProduct);
productRoute.delete("/:id", adminOnly, deleteProduct);
export default productRoute;
