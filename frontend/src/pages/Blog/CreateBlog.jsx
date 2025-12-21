import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react';
import { FaArrowLeft, FaSave, FaImage } from 'react-icons/fa';
import SubscriptionAlert from '../../middleware/SubscriptionAlert';

// Redux imports
import {
    fetchCategories,
    fetchBlogById,
    createBlog,
    updateBlog,
    clearCurrentBlog,
    clearError,
    clearSuccessMessage,
    selectCategories,
    selectCurrentBlog,
    selectIsSubmitting,
    selectError
} from '../../redux/slices/blogSlice';

const CreateBlog = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { id } = useParams(); // For edit mode
    const editorRef = useRef(null);
    
    // Redux state
    const categories = useSelector(selectCategories);
    const currentBlog = useSelector(selectCurrentBlog);
    const isSubmitting = useSelector(selectIsSubmitting);
    const reduxError = useSelector(selectError);
    
    // Get role from URL path
    const getRoleFromPath = useCallback(() => {
        const path = location.pathname;
        if (path.startsWith('/user')) return 'user';
        if (path.startsWith('/dietitian')) return 'dietitian';
        if (path.startsWith('/organization')) return 'organization';
        if (path.startsWith('/admin')) return 'admin';
        if (path.startsWith('/corporatepartner')) return 'corporatepartner';
        return 'user'; // fallback
    }, [location.pathname]);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: '',
        tags: '',
        excerpt: ''
    });
    const [featuredImage, setFeaturedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [showSubscriptionAlert, setShowSubscriptionAlert] = useState(false);
    const [subscriptionAlertData, setSubscriptionAlertData] = useState({});

    useEffect(() => {
        window.scrollTo(0, 0);
        
        // Fetch categories using Redux
        dispatch(fetchCategories());
        
        // If id exists, fetch blog data for editing
        if (id) {
            setIsEditMode(true);
            const roleFromUrl = getRoleFromPath();
            dispatch(fetchBlogById({ blogId: id, role: roleFromUrl }));
        }
        
        // Cleanup on unmount
        return () => {
            dispatch(clearCurrentBlog());
        };
    }, [id, dispatch, getRoleFromPath]);

    // Set form data when currentBlog is loaded (edit mode)
    useEffect(() => {
        if (currentBlog && id) {
            setFormData({
                title: currentBlog.title,
                content: currentBlog.content,
                category: currentBlog.category,
                tags: currentBlog.tags?.join(', ') || '',
                excerpt: currentBlog.excerpt || ''
            });
            
            if (currentBlog.featuredImage?.url) {
                setImagePreview(currentBlog.featuredImage.url);
            }
        }
    }, [currentBlog, id]);

    // Set default category when categories load
    useEffect(() => {
        if (!id && categories.length > 0 && !formData.category) {
            setFormData(prev => ({ ...prev, category: categories[0] }));
        }
    }, [categories, id, formData.category]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }
            
            setFeaturedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.title.trim()) {
            setError('Title is required');
            return;
        }

        let content = formData.content;
        if (editorRef.current) {
            content = editorRef.current.getContent();
            if (!content || content.trim().length < 50) {
                setError('Content must be at least 50 characters');
                return;
            }
        }

        if (!formData.category) {
            setError('Please select a category');
            return;
        }

        const roleFromUrl = getRoleFromPath();
        const token = roleFromUrl ? localStorage.getItem(`authToken_${roleFromUrl}`) : null;
        
        if (!token) {
            setError('You must be logged in to create a blog post');
            return;
        }
        
        const submitData = new FormData();
        submitData.append('title', formData.title);
        submitData.append('content', content);
        submitData.append('category', formData.category);
        submitData.append('tags', formData.tags);
        submitData.append('excerpt', formData.excerpt);
        
        if (featuredImage) {
            submitData.append('featuredImage', featuredImage);
        }

        let result;
        if (isEditMode) {
            result = await dispatch(updateBlog({ 
                blogId: id, 
                formData: submitData, 
                role: roleFromUrl 
            }));
            
            if (updateBlog.fulfilled.match(result)) {
                navigate(`/${roleFromUrl}/blog/${result.payload._id}`);
            } else if (result.payload?.limitReached) {
                setShowSubscriptionAlert(true);
                setSubscriptionAlertData({
                    message: result.payload.message,
                    planType: result.payload.planType || 'free',
                    limitType: 'blog',
                    currentCount: result.payload.currentCount || 0,
                    limit: result.payload.limit || 0
                });
            } else {
                setError(result.payload || 'Failed to update blog post');
            }
        } else {
            result = await dispatch(createBlog({ 
                formData: submitData, 
                role: roleFromUrl 
            }));
            
            if (createBlog.fulfilled.match(result)) {
                navigate(`/${roleFromUrl}/blog/${result.payload._id}`);
            } else if (result.payload?.limitReached) {
                setShowSubscriptionAlert(true);
                setSubscriptionAlertData({
                    message: result.payload.message,
                    planType: result.payload.planType || 'free',
                    limitType: 'blog',
                    currentCount: result.payload.currentCount || 0,
                    limit: result.payload.limit || 0
                });
            } else {
                setError(result.payload || 'Failed to create blog post');
            }
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-green-50 to-white py-8">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-[#1E6F5C] hover:text-green-700 mb-4 font-medium"
                    >
                        <FaArrowLeft /> Back
                    </button>
                    <h1 className="text-4xl font-bold text-gray-800">
                        {isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}
                    </h1>
                    <p className="text-gray-600 mt-2">Share your knowledge with the community</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter an engaging title..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E6F5C]"
                            maxLength="200"
                        />
                        <p className="text-sm text-gray-500 mt-1">{formData.title.length}/200 characters</p>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E6F5C]"
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Featured Image */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Featured Image
                        </label>
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer bg-[#1E6F5C] text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2">
                                <FaImage /> Choose Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                            <span className="text-sm text-gray-500">Max size: 5MB</span>
                        </div>
                        
                        {imagePreview && (
                            <div className="mt-4">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300"
                                />
                            </div>
                        )}
                    </div>

                    {/* Content Editor */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Content <span className="text-red-500">*</span>
                        </label>
                        <Editor
                            apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                            onInit={(evt, editor) => editorRef.current = editor}
                            value={formData.content}
                            onEditorChange={(content) => setFormData({ ...formData, content })}
                            init={{
                                height: 500,
                                menubar: true,
                                plugins: [
                                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                ],
                                toolbar: 'undo redo | blocks | ' +
                                    'bold italic forecolor | alignleft aligncenter ' +
                                    'alignright alignjustify | bullist numlist outdent indent | ' +
                                    'removeformat | help',
                                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                                placeholder: 'Write your blog content here...'
                            }}
                        />
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Excerpt (Optional)
                        </label>
                        <textarea
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleInputChange}
                            placeholder="Brief summary of your blog post..."
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E6F5C]"
                            maxLength="300"
                        />
                        <p className="text-sm text-gray-500 mt-1">{formData.excerpt.length}/300 characters</p>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Tags (Optional)
                        </label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleInputChange}
                            placeholder="Enter tags separated by commas (e.g., healthy eating, diet, nutrition)"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E6F5C]"
                        />
                        <p className="text-sm text-gray-500 mt-1">Separate tags with commas</p>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#1E6F5C] text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed inline-flex items-center gap-2"
                        >
                            <FaSave />
                            {isSubmitting ? 'Publishing...' : (isEditMode ? 'Update Post' : 'Publish Post')}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            {/* Subscription Alert Modal */}
            {showSubscriptionAlert && (
                <SubscriptionAlert
                    message={subscriptionAlertData.message}
                    planType={subscriptionAlertData.planType}
                    limitType={subscriptionAlertData.limitType}
                    currentCount={subscriptionAlertData.currentCount}
                    limit={subscriptionAlertData.limit}
                    onClose={() => setShowSubscriptionAlert(false)}
                />
            )}
        </div>
    );
};

export default CreateBlog;
