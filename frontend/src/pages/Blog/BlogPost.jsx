import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { 
    FaHeart, FaRegHeart, FaComment, FaEye, FaEdit, FaTrash, 
    FaArrowLeft, FaFlag, FaShare, FaPaperPlane 
} from 'react-icons/fa';

// Redux imports
import {
    fetchBlogById,
    toggleLike,
    addComment,
    deleteComment,
    deleteBlog,
    reportBlog,
    clearCurrentBlog,
    clearError,
    clearSuccessMessage,
    selectCurrentBlog,
    selectIsLoadingCurrentBlog,
    selectIsSubmitting,
    selectError,
    selectSuccessMessage
} from '../../redux/slices/blogSlice';

const BlogPost = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { id } = useParams();
    
    // Redux state
    const blog = useSelector(selectCurrentBlog);
    const loading = useSelector(selectIsLoadingCurrentBlog);
    const isSubmitting = useSelector(selectIsSubmitting);
    const reduxError = useSelector(selectError);
    const reduxSuccessMessage = useSelector(selectSuccessMessage);
    
    // Local state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [reportReason, setReportReason] = useState('');
    const [showReportModal, setShowReportModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showCommentDeleteConfirm, setShowCommentDeleteConfirm] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState('');
    const [showErrorMessage, setShowErrorMessage] = useState('');

    // Get role from URL path
    const getRoleFromPath = useCallback(() => {
        const path = location.pathname;
        if (path.startsWith('/user')) return 'user';
        if (path.startsWith('/dietitian')) return 'dietitian';
        if (path.startsWith('/organization')) return 'organization';
        if (path.startsWith('/admin')) return 'admin';
        if (path.startsWith('/corporatepartner')) return 'corporatepartner';
        return null;
    }, [location.pathname]);

    // Initialize and fetch blog
    useEffect(() => {
        window.scrollTo(0, 0);
        
        const roleFromUrl = getRoleFromPath();
        const token = roleFromUrl ? localStorage.getItem(`authToken_${roleFromUrl}`) : null;
        
        let actualUserId = null;
        
        if (token) {
            setIsAuthenticated(true);
            setUserRole(roleFromUrl);
            
            // Decode JWT to get roleId (actual user ID)
            try {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1]));
                    actualUserId = payload.roleId;
                }
            } catch (e) {
                console.error('Error decoding token:', e);
            }
            
            setUserId(actualUserId);
        } else {
            setIsAuthenticated(false);
            setUserRole(roleFromUrl);
        }
        
        // Fetch blog using Redux
        dispatch(fetchBlogById({ blogId: id, role: roleFromUrl }));
        
        // Cleanup on unmount
        return () => {
            dispatch(clearCurrentBlog());
        };
    }, [id, location.pathname, getRoleFromPath, dispatch]);

    // Update isLiked when blog data changes
    useEffect(() => {
        if (blog && blog.likes && userId) {
            const userLike = blog.likes.find(like => like.userId === userId);
            setIsLiked(!!userLike);
        }
    }, [blog, userId]);

    // Handle Redux success/error messages
    useEffect(() => {
        if (reduxSuccessMessage) {
            setShowSuccessMessage(reduxSuccessMessage);
            setTimeout(() => {
                setShowSuccessMessage('');
                dispatch(clearSuccessMessage());
            }, 3000);
        }
    }, [reduxSuccessMessage, dispatch]);

    useEffect(() => {
        if (reduxError) {
            setShowErrorMessage(reduxError);
            setTimeout(() => {
                setShowErrorMessage('');
                dispatch(clearError());
            }, 3000);
        }
    }, [reduxError, dispatch]);

    const handleLike = async () => {
        if (!isAuthenticated) {
            navigate('/signin');
            return;
        }

        const result = await dispatch(toggleLike({ blogId: id, role: userRole }));
        if (toggleLike.fulfilled.match(result)) {
            setIsLiked(result.payload.liked);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        
        if (!isAuthenticated) {
            navigate('/signin');
            return;
        }

        if (!commentText.trim()) return;

        const result = await dispatch(addComment({ 
            blogId: id, 
            content: commentText, 
            role: userRole 
        }));
        
        if (addComment.fulfilled.match(result)) {
            setCommentText('');
            setShowSuccessMessage('Comment posted successfully!');
            setTimeout(() => setShowSuccessMessage(''), 3000);
        }
    };

    const handleDeleteComment = async (commentId) => {
        setCommentToDelete(commentId);
        setShowCommentDeleteConfirm(true);
    };

    const confirmDeleteComment = async () => {
        if (!commentToDelete) return;

        const result = await dispatch(deleteComment({ 
            blogId: id, 
            commentId: commentToDelete, 
            role: userRole 
        }));
        
        if (deleteComment.fulfilled.match(result)) {
            setShowSuccessMessage('Comment deleted successfully!');
            setTimeout(() => setShowSuccessMessage(''), 3000);
        }
        
        setShowCommentDeleteConfirm(false);
        setCommentToDelete(null);
    };

    const handleReport = async () => {
        if (!reportReason.trim()) {
            setShowErrorMessage('Please provide a reason for reporting');
            setTimeout(() => setShowErrorMessage(''), 3000);
            return;
        }

        const result = await dispatch(reportBlog({ 
            blogId: id, 
            reason: reportReason, 
            role: userRole 
        }));
        
        if (reportBlog.fulfilled.match(result)) {
            setShowReportModal(false);
            setReportReason('');
            setShowSuccessMessage('Blog post reported successfully. Thank you for helping keep our community safe.');
            setTimeout(() => setShowSuccessMessage(''), 5000);
        }
    };

    const handleDelete = async () => {
        setShowDeleteConfirm(true);
    };

    const confirmDeleteBlog = async () => {
        const result = await dispatch(deleteBlog({ blogId: id, role: userRole }));
        
        if (deleteBlog.fulfilled.match(result)) {
            const blogsPath = userRole === 'dietitian' 
                ? '/dietitian/blogs' 
                : userRole === 'organization'
                ? '/organization/blogs'
                : '/user/blogs';
            navigate(blogsPath);
        }
        
        setShowDeleteConfirm(false);
    };

    const getCategoryColor = (category) => {
        const colors = {
            'Nutrition Tips': 'bg-green-100 text-green-800',
            'Weight Management': 'bg-blue-100 text-blue-800',
            'Healthy Recipes': 'bg-yellow-100 text-yellow-800',
            'Fitness & Exercise': 'bg-red-100 text-red-800',
            'Mental Health & Wellness': 'bg-purple-100 text-purple-800',
            'Disease Management': 'bg-orange-100 text-orange-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    const getRoleBadgeColor = (role) => {
        return role === 'dietitian' 
            ? 'bg-[#1E6F5C] text-white' 
            : 'bg-[#E8B86D] text-gray-800';
    };

    const getRoleLabel = (role) => {
        const roleLabels = {
            'user': 'Client',
            'dietitian': 'Dietitian',
            'admin': 'Admin',
            'organization': 'Organization',
            'corporatepartner': 'Corporate Partner'
        };
        return roleLabels[role] || 'Unknown';
    };

    const isAuthor = blog && userId && blog.author.userId === userId;
    const error = reduxError;

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-b from-green-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E6F5C]"></div>
                    <p className="mt-4 text-gray-600">Loading blog post...</p>
                </div>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen bg-linear-to-b from-green-50 to-white flex items-center justify-center px-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-600 mb-4">{error || 'Blog post not found'}</p>
                    <button
                        onClick={() => {
                            const blogsPath = userRole === 'dietitian' 
                                ? '/dietitian/blogs' 
                                : userRole === 'organization'
                                ? '/organization/blogs'
                                : '/user/blogs';
                            navigate(blogsPath);
                        }}
                        className="bg-[#1E6F5C] text-white px-6 py-2 rounded-lg hover:bg-green-700"
                    >
                        Back to Blogs
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-green-50 to-white">
            {/* Success/Error Messages */}
            {showSuccessMessage && (
                <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm">
                    <div className="flex items-center">
                        <div className="py-1">
                            <svg className="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM15 9a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V7a1 1 0 0 1 2 0v1h4a1 1 0 0 1 1 1z"/>
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold">Success!</p>
                            <p className="text-sm">{showSuccessMessage}</p>
                        </div>
                    </div>
                </div>
            )}

            {showErrorMessage && (
                <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm">
                    <div className="flex items-center">
                        <div className="py-1">
                            <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM13.41 12l1.42 1.41a1 1 0 1 1-1.42 1.42L12 13.4l-1.41 1.42a1 1 0 1 1-1.42-1.42L10.59 12l-1.42-1.41a1 1 0 1 1 1.42-1.42L12 10.59l1.41-1.42a1 1 0 1 1 1.42 1.42L13.41 12z"/>
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold">Error!</p>
                            <p className="text-sm">{showErrorMessage}</p>
                        </div>
                    </div>
                </div>
            )}
            {/* Back Button */}
            <div className="max-w-4xl mx-auto px-4 pt-8">
                <button
                    onClick={() => {
                        const blogsPath = userRole === 'dietitian' 
                            ? '/dietitian/blogs' 
                            : userRole === 'organization'
                            ? '/organization/blogs'
                            : '/user/blogs';
                        navigate(blogsPath);
                    }}
                    className="flex items-center gap-2 text-[#1E6F5C] hover:text-green-700 font-medium"
                >
                    <FaArrowLeft /> Back to Blogs
                </button>
            </div>

            {/* Main Content */}
            <article className="max-w-4xl mx-auto px-4 py-8">
                {/* Featured Image */}
                {blog.featuredImage?.url && (
                    <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
                        <img
                            src={blog.featuredImage.url}
                            alt={blog.title}
                            className="w-full h-96 object-cover"
                        />
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-lg p-8">
                    {/* Header */}
                    <div className="mb-6">
                        {/* Category and Role */}
                        <div className="flex items-center gap-3 mb-4">
                            <span className={`text-sm px-4 py-1 rounded-full font-semibold ${getCategoryColor(blog.category)}`}>
                                {blog.category}
                            </span>
                            <span className={`text-sm px-4 py-1 rounded-full font-semibold ${getRoleBadgeColor(blog.author.role)}`}>
                                {getRoleLabel(blog.author.role)}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">
                            {blog.title}
                        </h1>

                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-gray-600 pb-6 border-b border-gray-200">
                            <div>
                                <p className="font-semibold text-lg">{blog.author.name}</p>
                                <p className="text-sm">{moment(blog.createdAt).format('MMMM DD, YYYY')}</p>
                            </div>
                            
                            {/* Stats */}
                            <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                    <FaEye className="text-gray-500" /> {blog.views}
                                </span>
                                <span className="flex items-center gap-1">
                                    <FaHeart className="text-red-500" /> {blog.likesCount}
                                </span>
                                <span className="flex items-center gap-1">
                                    <FaComment className="text-blue-500" /> {blog.commentsCount}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
                        {/* Like Button */}
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                isLiked
                                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {isLiked ? <FaHeart /> : <FaRegHeart />}
                            {isLiked ? 'Liked' : 'Like'}
                        </button>

                        {/* Edit Button (only for author) */}
                        {isAuthor && (
                            <button
                                onClick={() => {
                                    const editPath = userRole === 'dietitian' 
                                        ? `/dietitian/edit-blog/${id}` 
                                        : `/user/edit-blog/${id}`;
                                    navigate(editPath);
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                            >
                                <FaEdit /> Edit
                            </button>
                        )}

                        {/* Delete Button (only for author) */}
                        {isAuthor && (
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                            >
                                <FaTrash /> Delete
                            </button>
                        )}

                        {/* Report Button (for non-authors) */}
                        {isAuthenticated && !isAuthor && (
                            <button
                                onClick={() => setShowReportModal(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors ml-auto"
                            >
                                <FaFlag /> Report
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div 
                        className="prose prose-lg max-w-none mb-8"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />

                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-gray-200">
                            {blog.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Comments Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            Comments ({blog.commentsCount})
                        </h2>

                        {/* Comment Form */}
                        {isAuthenticated ? (
                            <form onSubmit={handleComment} className="mb-8">
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E6F5C] mb-3"
                                    maxLength="1000"
                                />
                                <button
                                    type="submit"
                                    disabled={!commentText.trim() || isSubmitting}
                                    className="bg-[#1E6F5C] text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                >
                                    <FaPaperPlane /> Post Comment
                                </button>
                            </form>
                        ) : (
                            <div className="bg-gray-100 rounded-lg p-6 mb-8 text-center">
                                <p className="text-gray-600 mb-4">Please sign in to leave a comment</p>
                                <button
                                    onClick={() => navigate('/signin')}
                                    className="bg-[#1E6F5C] text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                                >
                                    Sign In
                                </button>
                            </div>
                        )}

                        {/* Comments List */}
                        <div className="space-y-4">
                            {blog.comments && blog.comments.length > 0 ? (
                                blog.comments.map((comment) => (
                                    <div key={comment._id} className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-800">{comment.userName}</span>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(comment.userRole)}`}>
                                                        {getRoleLabel(comment.userRole)}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {moment(comment.createdAt).fromNow()}
                                                </span>
                                            </div>
                                            
                                            {/* Delete comment button (for comment author or blog author) */}
                                            {isAuthenticated && (comment.userId === userId || isAuthor) && (
                                                <button
                                                    onClick={() => handleDeleteComment(comment._id)}
                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                >
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-gray-700">{comment.content}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
                            )}
                        </div>
                    </div>
                </div>
            </article>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Report Blog Post</h3>
                        <p className="text-gray-600 mb-4">
                            Please provide a reason for reporting this blog post. Our team will review it.
                        </p>
                        <textarea
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            placeholder="Reason for reporting..."
                            rows="4"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E6F5C] mb-4"
                            maxLength="500"
                        />
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleReport}
                                disabled={!reportReason.trim() || isSubmitting}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Report'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowReportModal(false);
                                    setReportReason('');
                                }}
                                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Blog Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <div className="flex items-center mb-4">
                            <div className="shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <FaTrash className="text-red-600 text-xl" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Delete Blog Post</h3>
                                <p className="text-sm text-gray-500">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this blog post? This action cannot be undone and the post will be permanently removed.
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={confirmDeleteBlog}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                            >
                                Delete Post
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Comment Confirmation Modal */}
            {showCommentDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <div className="flex items-center mb-4">
                            <div className="shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <FaTrash className="text-red-600 text-xl" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Delete Comment</h3>
                                <p className="text-sm text-gray-500">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this comment? This action cannot be undone.
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={confirmDeleteComment}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                            >
                                Delete Comment
                            </button>
                            <button
                                onClick={() => {
                                    setShowCommentDeleteConfirm(false);
                                    setCommentToDelete(null);
                                }}
                                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogPost;
