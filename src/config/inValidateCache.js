import { myCache } from "../../server";
import Product from "../models/Product";

export const invalidateCache = async ({ product, order, admin }) => {
  if (product) {
    const productKeys = ["latest-products", "categories", "all-products"];

    const allIds = await Product.find({}).select("_id");
    allIds.forEach((element) => {
      productKeys.push(`product-${element._id}`);
    });
    myCache.del(productKeys);
  }
};
