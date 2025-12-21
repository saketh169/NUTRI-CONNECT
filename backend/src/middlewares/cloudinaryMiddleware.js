const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

// Load environment variables
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer memory storage
const storage = multer.memoryStorage();

// File filter for images only
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

// Multer upload instance for blog images
const uploadBlogImage = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB max file size
    }
});

// Middleware to upload image to Cloudinary
const uploadToCloudinary = async (req, res, next) => {
    try {
        if (!req.file) {
            // No file uploaded, continue
            return next();
        }

        // Create a readable stream from buffer
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'fdfed-blogs',
                resource_type: 'image',
                transformation: [
                    { width: 1200, height: 630, crop: 'limit' },
                    { quality: 'auto' },
                    { fetch_format: 'auto' }
                ]
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to upload image',
                        error: error.message
                    });
                }

                // Attach cloudinary result to request
                req.cloudinaryResult = result;
                next();
            }
        );

        // Convert buffer to stream and pipe to cloudinary
        const bufferStream = Readable.from(req.file.buffer);
        bufferStream.pipe(stream);

    } catch (error) {
        console.error('Upload middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process image upload',
            error: error.message
        });
    }
};

// Function to delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return;
        
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('Cloudinary delete result:', result);
        return result;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw error;
    }
};

module.exports = {
    cloudinary,
    uploadBlogImage,
    uploadToCloudinary,
    deleteFromCloudinary
};
