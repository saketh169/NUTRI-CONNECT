const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { 
    verifyBlogAuth, 
    optionalAuth, 
    canCreateBlog, 
    isOrganization 
} = require('../middlewares/blogMiddleware');
const { 
    uploadBlogImage, 
    uploadToCloudinary 
} = require('../middlewares/cloudinaryMiddleware');
const { checkBlogLimit } = require('../middlewares/subscriptionMiddleware');

// ----------------------------------------------------------------------
// PUBLIC ROUTES (No authentication required or optional)
// ----------------------------------------------------------------------

// Get all blog categories
router.get('/categories', blogController.getCategories);

// Get all blogs (with filters) - Optional auth to check likes
router.get('/', optionalAuth, blogController.getAllBlogs);

// Get single blog by ID - Optional auth to check likes
router.get('/:id', optionalAuth, blogController.getBlogById);

// ----------------------------------------------------------------------
// PROTECTED ROUTES (Authentication required)
// ----------------------------------------------------------------------

// Create new blog post (only users and dietitians with subscription check)
router.post(
    '/', 
    verifyBlogAuth,
    canCreateBlog,
    checkBlogLimit,
    uploadBlogImage.single('featuredImage'),
    uploadToCloudinary,
    blogController.createBlog
);

// Get user's own blogs
router.get('/my/blogs', verifyBlogAuth, blogController.getMyBlogs);

// Update blog post (only author)
router.put(
    '/:id', 
    verifyBlogAuth,
    uploadBlogImage.single('featuredImage'),
    uploadToCloudinary,
    blogController.updateBlog
);

// Delete blog post (author or organization)
router.delete('/:id', verifyBlogAuth, blogController.deleteBlog);

// Like/Unlike blog post
router.post('/:id/like', verifyBlogAuth, blogController.toggleLike);

// Add comment to blog post
router.post('/:id/comments', verifyBlogAuth, blogController.addComment);

// Delete comment
router.delete('/:id/comments/:commentId', verifyBlogAuth, blogController.deleteComment);

// Report blog post
router.post('/:id/report', verifyBlogAuth, blogController.reportBlog);

// ----------------------------------------------------------------------
// ORGANIZATION MODERATION ROUTES
// ----------------------------------------------------------------------

// Get reported blogs (organization only)
router.get('/moderation/reported', verifyBlogAuth, isOrganization, blogController.getReportedBlogs);

// Dismiss reports for a blog (organization only)
router.put('/:id/moderation/dismiss', verifyBlogAuth, isOrganization, blogController.dismissReports);

// Delete reported blog (organization only) - Uses same delete endpoint
// Organization role is checked in the controller

module.exports = router;
