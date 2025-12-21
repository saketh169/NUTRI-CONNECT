const multer = require('multer');

// Configure memory storage (files stored in buffer in memory)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
    // Allow all file types for now (validation handled in controller)
    cb(null, true);
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024 // 20 MB max file size
    }
});

module.exports = upload;