const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: "noxiouscld",
  api_key: "159793859788778",
  api_secret: "M9C7Whjt4dHGf8pWHr0zYu8xgGI",
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      crop: "auto",
      gravity: "auto",
      // width: 300,
      // height: 300,
    });

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

module.exports = { uploadOnCloudinary };
