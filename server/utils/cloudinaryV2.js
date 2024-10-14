const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "noxiouscld",
  api_key: "159793859788778",
  api_secret: "M9C7Whjt4dHGf8pWHr0zYu8xgGI",
});

const uploadOnCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Write the buffer to the upload stream
    uploadStream.end(fileBuffer);
  });
};

module.exports = { uploadOnCloudinary };
