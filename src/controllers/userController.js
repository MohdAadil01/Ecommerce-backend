import User from "../models/User.js";
const userController = async (req, res) => {
  try {
    // return next(new Error());
    const { _id, name, email, photo, role, gender, dob } = req.body;

    if (!_id || !name || !email || !gender || !dob) {
      return next(Error("Enter all fields"));
    }

    const existingUser = await User.findById(_id);
    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: `Welcome, ${existingUser.name}`,
      });
    }

    const user = await User.create({
      _id,
      name,
      email,
      photo,
      role,
      gender,
      dob: new Date(dob),
    });
    res.status(200).json({
      success: true,
      message: `Welcome, ${user.name}`,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error,
    });
  }
};
export const getAllUsers = async (req, res) => {
  let allUsers = await User.find({});
  res.status(200).json({
    success: true,
    users: allUsers,
  });
};

export const getUser = async (req, res) => {
  const _id = req.params.id;
  let user = await User.findById(_id);
  if (user) {
    res.status(200).json({
      success: true,
      user,
    });
  } else {
    res.status(404).json({
      success: false,
      message: "user not found",
    });
  }
};

export const deleteUser = async (req, res) => {
  const _id = req.params.id;
  let user = await User.findById(_id);
  if (user) {
    await user.deleteOne();
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } else {
    res.status(404).json({
      success: false,
      message: "invalid id",
    });
  }
};
export default userController;
