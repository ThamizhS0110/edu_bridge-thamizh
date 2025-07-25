const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (filePath) => {
    try {
        if (!filePath) return null;

        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "image",
            folder: "EduBridge" // Specific folder for EduBridge uploads
        });
        fs.unlinkSync(filePath); // Remove the locally saved temporary file
        return response.secure_url;
    } catch (error) {
        fs.unlinkSync(filePath); // Ensure the local file is removed even on error
        console.error("Cloudinary upload error:", error);
        return null;
    }
};

module.exports = uploadToCloudinary;