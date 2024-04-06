import User from "../models/User.js";

export const adminOnly = async (req, res, next) => {
  let { id } = req.query;
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Please prove the id",
    });
  }
  let user = await User.findById(id);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User not found",
    });
  }
  if (user.role !== "admin") {
    return res.status(400).json({
      success: false,
      message: "Only admin can access",
    });
  }
  next();
};
