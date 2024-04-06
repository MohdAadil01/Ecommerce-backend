import { myCache } from "../../server.js";
// import { invalidateCache } from "../config/inValidateCache.js";
import Product from "../models/Product.js";
import fs from "fs";
const productController = async (req, res, next) => {
  const { pName, price, stock, category } = req.body;
  const photo = req.file;

  if (!photo) {
    return next(Error("Please add Photo"));
  }
  if (!pName || !price || !stock || !category) {
    fs.rm(photo.path, () => {
      console.log("deleted");
    });
    return next(Error("Please Enter all fields"));
  }

  await Product.create({
    pName,
    price,
    stock,
    category: category.toLowerCase(),
    photo: photo?.path,
  });
  // await invalidateCache({ product: true });
  return res.status(200).json({
    success: true,
    message: "Product created successfully",
  });
};
export default productController;

export const getLatestProducts = async (req, res, next) => {
  // let products;
  // if (myCache.has("latest-products")) {
  //   products = JSON.parse(myCache.get("latest-products"));
  // } else {
  //   const products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
  //   myCache.set("latest-products", JSON.stringify(products));
  // }
  const products = await Product.find({}).sort({ createdAt: -1 }).limit(5);

  res.status(200).json({
    success: true,
    products: products,
  });
};
export const getAllCategories = async (req, res, next) => {
  // let categories;
  // if (myCache.has("categories")) {
  //   categories = JSON.parse(myCache.get("categories"));
  // } else {
  //   const categories = await Product.distinct("category");
  //   myCache.set("categories", JSON.stringify(categories));
  // }

  const categories = await Product.distinct("category");
  res.status(200).json({
    success: true,
    categories: categories,
  });
};

export const getAdminProducts = async (req, res, next) => {
  // let products;
  // if (myCache.has("all-products")) {
  //   products = JSON.parse(myCache.get("all-products"));
  // } else {
  //   const products = await Product.find({});
  //   myCache.set("all-products", JSON.stringify(products));
  // }
  const products = await Product.find({});
  res.status(200).json({
    success: true,
    products: products,
  });
};

export const getSingleProduct = async (req, res, next) => {
  const id = req.params.id;
  // let product;
  // if (myCache.has(`product-${id}`)) {
  //   product = JSON.stringify(myCache.get(`product-${id}`));
  // } else {
  //   const product = await Product.findById(id);
  //   myCache.set(`product-${id}`, JSON.stringify(product));
  // }
  const product = await Product.findById(id);
  if (!product) {
    return next(Error("Product not found"));
  }
  return res.status(200).json({
    success: true,
    product,
  });
};

export const updateProduct = async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  const { pName, price, stock, category } = req.body;
  const photo = req.file;

  if (!product) {
    return next(Error("Product not found"));
  }

  if (photo) {
    fs.rm(product.photo, () => {
      console.log("old photo deleted");
    });
    product.photo = photo.path;
  }
  if (pName) product.pName = pName;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;

  await product.save();

  // await invalidateCache({ product: true });

  return res.status(200).json({
    success: true,
    message: "Product updated successfully",
  });
};

export const deleteProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(Error("Product not found"));
  }
  if (product.photo) {
    fs.rm(product.photo, () => {
      console.log("Product Photo deleted");
    });
  } else {
    console.log("product photo is undefined");
  }

  await Product.deleteOne();

  // await invalidateCache({ product: true });

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
};

export const getSearchedProducts = async (req, res, next) => {
  try {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    const baseQuery = {};

    if (search) {
      baseQuery.pName = {
        $regex: search,
        $options: "i",
      };
    }
    if (price) {
      baseQuery.price = {
        $lte: Number(price),
      };
    }
    if (category) {
      baseQuery.category = category;
    }

    const productsPromise = Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);

    const [products, filteredOnlyProduct] = await Promise.all([
      productsPromise,
      Product.find(baseQuery),
    ]);

    // const products = await Product.find(baseQuery)
    //   .sort(sort && { price: sort === "asc" ? 1 : -1 })
    //   .limit(limit)
    //   .skip(skip);

    // const filteredOnlyProduct = Product.find(baseQuery);

    const totalPage = Math.ceil(filteredOnlyProduct.length / limit);
    return res.status(200).json({
      success: true,
      products,
      totalPage,
    });
  } catch (error) {
    console.log(error);
    return res.json(error);
  }
};
