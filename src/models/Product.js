import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    pName: {
      type: String,
      required: [true, "Please enter product Name"],
    },
    photo: {
      type: String,
      required: [true, "Please enter product image"],
    },
    price: {
      type: Number,
      required: [true, "Please Enter price of the product"],
    },
    stock: {
      type: Number,
      required: [true, "Please Enter stock of the product"],
    },
    category: {
      type: String,
      required: [true, "Please enter the category of the product"],
      trim: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
