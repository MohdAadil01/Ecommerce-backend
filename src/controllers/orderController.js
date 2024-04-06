import { reduceStock } from "../config/reduceStock.js";
// import { invalidateCache} "../config/inValidateCache.js"
import Order from "../models/Order.js";

export const newOrder = async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    user,
    subtotal,
    tax,
    shippingCharges,
    discount,
    total,
  } = req.body;

  if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !total) {
    return next(Error("Please Enter all fields"));
  }
  await Order.create({
    shippingInfo,
    orderItems,
    user,
    subtotal,
    tax,
    shippingCharges,
    discount,
    total,
  });

  await reduceStock(orderItems);

  // await invalidateCache({product: true, order: true, admin : true})

  return res.status(200).json({
    success: true,
    message: "Order Placed Successfully",
  });
};

export const myOrders = async (req, res, next) => {
  const { id: user } = req.query;

  // const key = `my-orders-${id}`
  // let orders = []
  // if(myCache.has(key)){
  //   orders = await myCache.get(key)
  // }else{
  //  orders = await Order.find({ user: user });
  //  myCache.set(key, orders)
  // }

  let orders = await Order.find({ user: user });
  res.status(200).json({
    success: true,
    orders,
  });
};

export const allOrders = async (req, res, next) => {
  // const { id: user } = req.body;

  // const key = `my-orders-${id}`
  // let orders = []
  // if(myCache.has(key)){
  //   orders = await myCache.get(key)
  // }else{
  //  orders = await Order.find({ user: user });
  //  myCache.set(key, orders)
  // }

  let orders = await Order.find().populate("user", "name");
  res.status(200).json({
    success: true,
    orders,
  });
};

export const getSingleOrder = async (req, res, next) => {
  const { id } = req.params;

  // const key = `my-orders-${id}`
  // let orders = []
  // if(myCache.has(key)){
  //   orders = await myCache.get(key)
  // }else{
  //  orders = await Order.find({ user: user });
  //  myCache.set(key, orders)
  // }

  let order = await Order.findById(id).populate("user", "name");

  if (!order) return next(Error("Order not found"));
  res.status(200).json({
    success: true,
    order,
  });
};

export const processOrder = async (req, res, next) => {
  const { id } = req.params;

  // const key = `my-orders-${id}`
  // let orders = []
  // if(myCache.has(key)){
  //   orders = await myCache.get(key)
  // }else{
  //  orders = await Order.find({ user: user });
  //  myCache.set(key, orders)
  // }

  let order = await Order.findById(id).populate("user", "name");

  if (!order) return next(Error("Order not found"));

  switch (order.status) {
    case "Processing":
      order.status = "Shipped";
      break;
    case "Shipped":
      order.status = "Delivered";
      break;
    default:
      order.status = "Delivered";
      break;
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order updated successfully",
  });
};

export const deleteOrder = async (req, res, next) => {
  const { id } = req.params;

  // const key = `my-orders-${id}`
  // let orders = []
  // if(myCache.has(key)){
  //   orders = await myCache.get(key)
  // }else{
  //  orders = await Order.find({ user: user });
  //  myCache.set(key, orders)
  // }

  let order = await Order.findById(id).populate("user", "name");

  if (!order) return next(Error("Order not found"));

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: "Order deleted successfully",
  });
};
