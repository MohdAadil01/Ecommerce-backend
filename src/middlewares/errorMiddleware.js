// import ErrorHandler from "../utils/utility-classes";

export const errorMiddleware = (err, req, res, next) => {
  //   err.message = err.message || "";
  err.message ||= "Internval Server Error";
  res.status(400).json({
    success: false,
    message: err.message,
  });
};
