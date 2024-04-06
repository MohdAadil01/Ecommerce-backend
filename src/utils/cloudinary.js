import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (filePath) => {
  try {
    if (!filePath) {
      console.log("file path does not exist");
      return null;
    }
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    // file upload ho gayi hai
    console.log("file is uplaoded on cloudinary");
    return response;
  } catch (error) {
    fs.unlinkSync(filePath);
    // it will remove the locally saved temp file ass the upload operation has failed
  }
};

export default uploadToCloudinary;
