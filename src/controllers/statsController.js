import { calcPercent } from "../config/calcPercent.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

export const getDashboardStats = async (req, res, next) => {
  const today = new Date();

  const sixMonthAgo = new Date();
  sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);

  const thisMonth = {
    start: new Date(today.getFullYear(), today.getMonth(), 1),
    end: today,
  };
  const lastMonth = {
    start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
    end: new Date(today.getFullYear(), today.getMonth(), 0),
  };

  const thisMonthProductsPromise = Product.find({
    createdAt: {
      $gte: thisMonth.start,
      $lte: thisMonth.end,
    },
  });
  const lastMonthProductsPromise = Product.find({
    createdAt: {
      $gte: lastMonth.start,
      $lte: lastMonth.end,
    },
  });

  const thisMonthUsersPromise = User.find({
    createdAt: {
      $gte: thisMonth.start,
      $lte: thisMonth.end,
    },
  });
  const lastMonthUsersPromise = User.find({
    createdAt: {
      $gte: lastMonth.start,
      $lte: lastMonth.end,
    },
  });

  const thisMonthOrdersPromise = Order.find({
    createdAt: {
      $gte: thisMonth.start,
      $lte: thisMonth.end,
    },
  });
  const lastMonthOrdersPromise = Order.find({
    createdAt: {
      $gte: lastMonth.start,
      $lte: lastMonth.end,
    },
  });
  const sixMonthAgoOrdersPromise = Order.find({
    createdAt: {
      $gte: sixMonthAgo,
      $lte: today,
    },
  });

  const latestTransactionPromise = Order.find({})
    .select(["discount", "total", "status", "orderItems"])
    .limit(4);

  let [
    thisMonthProducts,
    thisMonthUsers,
    thisMonthOrders,
    lastMonthProducts,
    lastMonthUsers,
    lastMonthOrders,
    sixMonthAgoOrders,
    categories,
    femaleCount,
    latestTransaction,
  ] = await Promise.all([
    thisMonthProductsPromise,
    thisMonthUsersPromise,
    thisMonthOrdersPromise,
    lastMonthProductsPromise,
    lastMonthUsersPromise,
    lastMonthOrdersPromise,
    sixMonthAgoOrdersPromise,
    Product.distinct("category"),
    User.countDocuments({ gender: "female" }),
    latestTransactionPromise,
  ]);

  const orderAccToMonth = [0, 0, 0, 0, 0, 0];
  const revenueAccToMonth = [0, 0, 0, 0, 0, 0];

  sixMonthAgoOrders.forEach((order) => {
    const createdAt = order.createdAt;
    const createdAgo = (today.getMonth() - createdAt.getMonth() + 12) % 12;
    if (createdAgo < 6) {
      orderAccToMonth[6 - createdAgo - 1] += 1;
      revenueAccToMonth[6 - createdAgo - 1] += order.total;
    }
  });

  const usersIncrement = calcPercent(
    thisMonthUsers.length,
    lastMonthUsers.length
  );
  const ordersIncrement = calcPercent(
    thisMonthOrders.length,
    lastMonthOrders.length
  );
  const productsIncrement = calcPercent(
    thisMonthProducts.length,
    lastMonthProducts.length
  );
  const thisMonthRevenue = thisMonthOrders.reduce(
    (total, order) => total + (order.total || 0),
    0
  );
  const lastMonthRevenue = lastMonthOrders.reduce(
    (total, order) => total + (order.total || 0),
    0
  );
  const revenueIncrement = calcPercent(thisMonthRevenue, lastMonthRevenue);

  const usersCount = await User.countDocuments();
  const productsCount = await Product.countDocuments();
  const allOrders = await Order.find({}).select("total");
  const ordersCount = allOrders.length;
  const revenue = allOrders.reduce(
    (total, order) => total + (order.total || 0),
    0
  );

  let increment = {
    inUsers: usersIncrement,
    inOrders: ordersIncrement,
    inProducts: productsIncrement,
    inRevenue: revenueIncrement,
  };

  let count = {
    inUsers: usersCount,
    inProducts: productsCount,
    inOrders: ordersCount,
  };

  let chart = {
    order: orderAccToMonth,
    revenue: revenueAccToMonth,
  };

  let categoriesCountPromise = categories.map((category) =>
    Product.countDocuments({ category })
  );
  let categoriesCount = await Promise.all(categoriesCountPromise);

  let categoryCount = [];
  console.log(categoriesCount);

  categories.forEach((category, i) =>
    categoryCount.push({
      [category]: Math.round((categoriesCount[i] / productsCount) * 100),
    })
  );

  const genderRatio = {
    male: usersCount - femaleCount,
    female: femaleCount,
  };

  latestTransaction = latestTransaction.map((i) => ({
    _id: i._id,
    discount: i.discount,
    total: i.total,
    status: i.status,
    quantity: i.orderItems.length,
  }));
  let stats = {
    categoryCount,
    increment,
    count,
    allOrders,
    chart,
    revenue,
    genderRatio,
    latestTransaction,
  };
  return res.status(200).json({
    success: true,
    stats,
  });
};

export const getPieCharts = async (req, res, next) => {
  const processedOrderPromise = await Order.countDocuments({
    status: "Processing",
  });
  const shippedOrderPromise = await Order.countDocuments({ status: "Shipped" });
  const deliveredOrderPromise = await Order.countDocuments({
    status: "Delivered",
  });

  const [
    processedOrder,
    shippedOrder,
    deliveredOrder,
    categories,
    outOfStock,
    allOrders,
    usersCounts,
    adminCounts,
    ageGroup,
  ] = await Promise.all([
    processedOrderPromise,
    shippedOrderPromise,
    deliveredOrderPromise,
    Product.distinct("category"),
    Product.countDocuments({ stock: 0 }),
    Order.find({}).select([
      "total",
      "shippingCharges",
      "discount",
      "subtotal",
      "tax",
    ]),
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "admin" }),
    User.find({}).select(["dob"]),
  ]);

  const ordersStatus = {
    inProcessing: processedOrder,
    hasShipped: shippedOrder,
    hasDelivered: deliveredOrder,
  };

  const productsCount = await Product.countDocuments();
  let categoriesCountPromise = categories.map((category) =>
    Product.countDocuments({ category })
  );
  let categoriesCount = await Promise.all(categoriesCountPromise);

  let productCategory = [];

  categories.forEach((category, i) =>
    productCategory.push({
      [category]: Math.round((categoriesCount[i] / productsCount) * 100),
    })
  );

  const stockAvailability = {
    inStock: productsCount - outOfStock,
    outOfStock: outOfStock,
  };

  //   console.log(allOrders);

  const grossIncome = allOrders.reduce(
    (prev, order) => prev + (order.total || 0),
    0
  );
  //   console.log(grossIncome);
  const discount = allOrders.reduce(
    (prev, order) => prev + (order.discount || 0),
    0
  );
  const productionCost = allOrders.reduce(
    (prev, order) => prev + (order.shippingCharges || 0),
    0
  );
  const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);

  const marketingCost = Math.round(grossIncome * (30 / 100));

  const netMargin =
    grossIncome - discount - productionCost - burnt - marketingCost;

  const balanceSheet = {
    grossIncome,
    discount,
    productionCost,
    burnt,
    marketingCost,
    netMargin,
  };

  const adminCustomerRatio = {
    admins: adminCounts,
    users: usersCounts,
  };

  const usersAgeGroup = {
    teen: ageGroup.filter((user) => user.age <= 18).length,
    adult: ageGroup.filter((user) => user.age >= 19 && user.age <= 40).length,
    old: ageGroup.filter((user) => user.age > 40).length,
  };

  let charts = {
    ordersStatus,
    productCategory,
    stockAvailability,
    balanceSheet,
    adminCustomerRatio,
    usersAgeGroup,
  };

  res.status(200).json({
    success: true,
    charts,
  });
};

export const getBarCharts = async (req, res, next) => {
  const today = new Date();

  const sixMonthAgo = new Date();
  sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);

  const twelveMonthAgo = new Date();
  twelveMonthAgo.setMonth(twelveMonthAgo.getMonth() - 12);

  const sixMonthAgoProductsPromise = Product.find({
    createdAt: {
      $gte: sixMonthAgo,
      $lte: today,
    },
  }).select("createdAt");
  const sixMonthAgoUsersPromise = User.find({
    createdAt: {
      $gte: sixMonthAgo,
      $lte: today,
    },
  }).select("createdAt");

  const twelveMonthAgoOrdersPromise = Order.find({
    createdAt: {
      $gte: twelveMonthAgo,
      $lte: today,
    },
  }).select("createdAt");

  const [products, users, orders] = await Promise.all([
    sixMonthAgoProductsPromise,
    sixMonthAgoUsersPromise,
    twelveMonthAgoOrdersPromise,
  ]);

  const productsAccToMonth = [0, 0, 0, 0, 0, 0];
  const usersAccToMonth = [0, 0, 0, 0, 0, 0];
  const ordersAccToMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  products.forEach((product) => {
    const createdAt = product.createdAt;
    const createdAgo = (today.getMonth() - createdAt.getMonth() + 12) % 12;
    if (createdAgo < 6) {
      productsAccToMonth[6 - createdAgo - 1] += 1;
    }
  });

  users.forEach((user) => {
    const createdAt = user.createdAt;
    const createdAgo = (today.getMonth() - createdAt.getMonth() + 12) % 12;
    if (createdAgo < 6) {
      usersAccToMonth[6 - createdAgo - 1] += 1;
    }
  });

  orders.forEach((order) => {
    const createdAt = order.createdAt;
    const createdAgo = (today.getMonth() - createdAt.getMonth() + 12) % 12;
    if (createdAgo < 12) {
      ordersAccToMonth[12 - createdAgo - 1] += 1;
    }
  });

  let barCharts = {
    productsAccToMonth,
    usersAccToMonth,
    ordersAccToMonth,
  };
  res.status(200).json({
    success: true,
    barCharts,
  });
};

export const getLineCharts = async (req, res, next) => {
  const today = new Date();

  const twelveMonthAgo = new Date();
  twelveMonthAgo.setMonth(twelveMonthAgo.getMonth() - 12);

  const baseQuery = {
    createdAt: {
      $gte: twelveMonthAgo,
      $lte: today,
    },
  };

  const [products, users, orders] = await Promise.all([
    Product.find(baseQuery).select("createdAt"),
    User.find(baseQuery).select("createdAt"),
    Order.find(baseQuery).select("createdAt"),
  ]);

  const productsAccToMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const usersAccToMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const discountAccToMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const revenueAccToMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  products.forEach((product) => {
    const createdAt = product.createdAt;
    const createdAgo = (today.getMonth() - createdAt.getMonth() + 12) % 12;
    if (createdAgo < 6) {
      productsAccToMonth[6 - createdAgo - 1] += 1;
    }
  });

  users.forEach((user) => {
    const createdAt = user.createdAt;
    const createdAgo = (today.getMonth() - createdAt.getMonth() + 12) % 12;
    if (createdAgo < 6) {
      usersAccToMonth[6 - createdAgo - 1] += 1;
    }
  });

  orders.forEach((order) => {
    const createdAt = order.createdAt;
    const createdAgo = (today.getMonth() - createdAt.getMonth() + 12) % 12;
    if (createdAgo < 12) {
      discountAccToMonth[12 - createdAgo - 1] += order["discount"];
    }
  });

  orders.forEach((order) => {
    const createdAt = order.createdAt;
    const createdAgo = (today.getMonth() - createdAt.getMonth() + 12) % 12;
    if (createdAgo < 12) {
      revenueAccToMonth[12 - createdAgo - 1] += order["total"];
    }
  });

  let barCharts = {
    productsAccToMonth,
    usersAccToMonth,
    discountAccToMonth,
    revenueAccToMonth,
  };
  res.status(200).json({
    success: true,
    barCharts,
  });
};
