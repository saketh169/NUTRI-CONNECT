import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { FaHeart, FaComment, FaEye, FaSearch, FaPlus } from 'react-icons/fa';

// Redux imports
import {
    fetchBlogs,
    fetchCategories,
    fetchMyBlogs,
    setCategory,
    setSearchQuery,
    setSortBy,
    setPage,
    selectBlogs,
    selectPagination,
    selectCategories,
    selectFilters,
    selectMyBlogs,
    selectMyBlogsStats,
    selectIsLoading,
    selectIsLoadingMyBlogs
} from '../redux/slices/blogSlice';

const BlogPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    
    // Redux state selectors
    const blogs = useSelector(selectBlogs);
    const pagination = useSelector(selectPagination);
    const categories = useSelector(selectCategories);
    const filters = useSelector(selectFilters);
    const myBlogs = useSelector(selectMyBlogs);
    const myBlogsStats = useSelector(selectMyBlogsStats);
    const isLoading = useSelector(selectIsLoading);
    const isLoadingMyBlogs = useSelector(selectIsLoadingMyBlogs);
    
    // Local state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [showMyBlogsSection, setShowMyBlogsSection] = useState(false);
    const [localSearchQuery, setLocalSearchQuery] = useState('');
    
    // Refs for smooth scrolling
    const blogsGridRef = useRef(null);
    const myBlogsRef = useRef(null);

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

    // Initial load effect
    useEffect(() => {
        window.scrollTo(0, 0);
        
        const roleFromUrl = getRoleFromPath();
        const token = roleFromUrl ? localStorage.getItem(`authToken_${roleFromUrl}`) : null;
        
        setUserRole(roleFromUrl);
        setIsAuthenticated(!!token);
        
        // Fetch categories
        dispatch(fetchCategories());
        
        // Fetch user's blogs if authenticated
        if (token) {
            dispatch(fetchMyBlogs({ role: roleFromUrl }));
        }
    }, [location.pathname, getRoleFromPath, dispatch]);

    // Fetch blogs when filters or pagination changes
    useEffect(() => {
        const roleFromUrl = getRoleFromPath();
        dispatch(fetchBlogs({
            page: pagination.page,
            limit: 9,
            category: filters.category,
            search: filters.search,
            sortBy: filters.sortBy,
            role: roleFromUrl
        }));
    }, [dispatch, pagination.page, filters.category, filters.search, filters.sortBy, getRoleFromPath]);

    const handleSearch = (e) => {
        e.preventDefault();
        dispatch(setSearchQuery(localSearchQuery));
    };

    const handleCategoryClick = (category) => {
        dispatch(setCategory(category));
        setTimeout(() => {
            const element = blogsGridRef.current;
            if (element) {
                const rect = element.getBoundingClientRect();
                const offsetPixels = 100;
                window.scrollTo({
                    top: window.scrollY + rect.top - offsetPixels,
                    behavior: 'smooth'
                });
            }
        }, 100);
    };

    const handleSortChange = (newSortBy) => {
        dispatch(setSortBy(newSortBy));
    };

    const handlePageChange = (newPage) => {
        dispatch(setPage(newPage));
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
            ? 'bg-[#28B463] text-white' 
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

    const stripHtmlTags = (html) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white border-b-4 border-[#28B463] py-4 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-5xl font-bold mb-4 text-center text-[#1E6F5C]">Nutrition & Wellness Blog</h1>
                    <p className="text-xl text-center mb-8 text-gray-600">
                        Discover insights, tips, and stories from our community
                    </p>
                    
                    {/* Create Blog and My Blogs Buttons */}
                    {isAuthenticated && (userRole === 'user' || userRole === 'dietitian') && (
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => {
                                    navigate(`/${userRole}/create-blog`);
                                }}
                                className="bg-[#28B463] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1E6F5C] transition-colors duration-300 inline-flex items-center gap-2 shadow-md"
                            >
                                <FaPlus /> Create New Blog Post
                            </button>
                            <button
                                onClick={() => {
                                    setShowMyBlogsSection(!showMyBlogsSection);
                                    if (!showMyBlogsSection) {
                                        setTimeout(() => {
                                            const element = myBlogsRef.current;
                                            if (element) {
                                                const rect = element.getBoundingClientRect();
                                                const offsetPixels = 100;
                                                window.scrollTo({
                                                    top: window.scrollY + rect.top - offsetPixels,
                                                    behavior: 'smooth'
                                                });
                                            }
                                        }, 100);
                                    }
                                }}
                                className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-300 inline-flex items-center gap-2 shadow-md ${
                                    showMyBlogsSection 
                                        ? 'bg-[#1E6F5C] text-white hover:bg-[#28B463]' 
                                        : 'bg-white text-[#1E6F5C] border-2 border-[#28B463] hover:bg-gray-50'
                                }`}
                            >
                                My Blogs {myBlogsStats.totalBlogs > 0 && `(${myBlogsStats.totalBlogs})`}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Search and Filter Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="md:col-span-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search blogs..."
                                    value={localSearchQuery}
                                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28B463]"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#28B463] hover:text-[#1E6F5C]"
                                >
                                    <FaSearch size={20} />
                                </button>
                            </div>
                        </form>

                        {/* Sort By */}
                        <select
                            value={filters.sortBy}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28B463]"
                        >
                            <option value="createdAt">Latest</option>
                            <option value="views">Most Viewed</option>
                            <option value="likesCount">Most Liked</option>
                            <option value="commentsCount">Most Commented</option>
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            onClick={() => handleCategoryClick('all')}
                            className={`px-4 py-2 rounded-full font-medium transition-colors ${
                                filters.category === 'all'
                                    ? 'bg-[#28B463] text-white shadow-md'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:border-[#28B463] hover:text-[#28B463]'
                            }`}
                        >
                            All Categories
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => handleCategoryClick(category)}
                                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                                    filters.category === category
                                        ? 'bg-[#28B463] text-white shadow-md'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:border-[#28B463] hover:text-[#28B463]'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* My Blogs Section */}
                {isAuthenticated && (userRole === 'user' || userRole === 'dietitian') && showMyBlogsSection && (
                    <div ref={myBlogsRef} className="mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-[#28B463]">My Blogs</h2>
                                <button
                                    onClick={() => setShowMyBlogsSection(false)}
                                    className="text-gray-500 hover:text-red-600 font-medium px-3 py-1 rounded hover:bg-gray-100 transition-colors"
                                >
                                    ✕ Close
                                </button>
                            </div>

                            {/* Stats Cards */}
                            {myBlogs.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-[#28B463] text-white rounded-lg p-4 shadow-md">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm opacity-90">Total Blogs</p>
                                                    <p className="text-3xl font-bold mt-1">{myBlogsStats.totalBlogs}</p>
                                                </div>
                                                <FaPlus className="text-4xl opacity-50" />
                                            </div>
                                        </div>
                                        <div className="bg-[#1E6F5C] text-white rounded-lg p-4 shadow-md">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm opacity-90">Total Likes</p>
                                                    <p className="text-3xl font-bold mt-1">{myBlogsStats.totalLikes}</p>
                                                </div>
                                                <FaHeart className="text-4xl opacity-50" />
                                            </div>
                                        </div>
                                        <div className="bg-[#E8B86D] text-gray-800 rounded-lg p-4 shadow-md">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm opacity-90">Total Views</p>
                                                    <p className="text-3xl font-bold mt-1">{myBlogsStats.totalViews}</p>
                                                </div>
                                                <FaEye className="text-4xl opacity-50" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* My Blogs Grid */}
                                    {isLoadingMyBlogs ? (
                                        <div className="text-center py-8">
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#28B463]"></div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {myBlogs.slice(0, 6).map((blog) => (
                                                <div
                                                    key={blog._id}
                                                    className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:shadow-lg hover:border-[#28B463] transition-all duration-300 cursor-pointer"
                                                    onClick={() => navigate(`/${userRole}/blog/${blog._id}`)}
                                                >
                                                    {/* Featured Image */}
                                                    {blog.featuredImage?.url ? (
                                                        <img
                                                            src={blog.featuredImage.url}
                                                            alt={blog.title}
                                                            className="w-full h-40 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-40 bg-[#28B463] flex items-center justify-center">
                                                            <span className="text-white text-3xl font-bold">
                                                                {blog.title.charAt(0)}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="p-4">
                                                        {/* Category Badge */}
                                                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getCategoryColor(blog.category)}`}>
                                                            {blog.category}
                                                        </span>

                                                        {/* Title */}
                                                        <h3 className="text-lg font-bold text-gray-800 mt-2 mb-2 line-clamp-2">
                                                            {blog.title}
                                                        </h3>

                                                        {/* Date */}
                                                        <p className="text-xs text-gray-500 mb-3">
                                                            {moment(blog.createdAt).format('MMM DD, YYYY')}
                                                        </p>

                                                        {/* Stats */}
                                                        <div className="flex items-center gap-3 text-sm text-gray-600 pt-2 border-t border-gray-200">
                                                            <span className="flex items-center gap-1">
                                                                <FaHeart className="text-red-500" /> {blog.likesCount || 0}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <FaComment className="text-blue-500" /> {blog.commentsCount || 0}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <FaEye className="text-gray-500" /> {blog.views || 0}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* View All My Blogs Link */}
                                    {myBlogs.length > 6 && (
                                        <div className="text-center mt-4">
                                            <button
                                                onClick={() => navigate(`/${userRole}/my-blogs`)}
                                                className="text-[#28B463] hover:text-[#1E6F5C] font-semibold"
                                            >
                                                View All My Blogs ({myBlogs.length})
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg mb-4">You haven't created any blog posts yet</p>
                                    <button
                                        onClick={() => navigate(`/${userRole}/create-blog`)}
                                        className="bg-[#28B463] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1E6F5C] transition-colors inline-flex items-center gap-2 shadow-md"
                                    >
                                        <FaPlus /> Create Your First Blog
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* All Blogs Section */}
                <div>
                    <h2 ref={blogsGridRef} className="text-2xl font-bold text-[#1E6F5C] mb-6">All Blogs</h2>
                </div>

                {/* Blog Grid */}
                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#28B463]"></div>
                        <p className="mt-4 text-gray-600">Loading blogs...</p>
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-600">No blogs found</p>
                        <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {blogs.map((blog) => (
                                <div
                                    key={blog._id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                                    onClick={() => {
                                        if (userRole) {
                                            navigate(`/${userRole}/blog/${blog._id}`);
                                        } else {
                                            navigate(`/blog/${blog._id}`);
                                        }
                                    }}
                                >
                                    {/* Featured Image */}
                                    {blog.featuredImage?.url ? (
                                        <img
                                            src={blog.featuredImage.url}
                                            alt={blog.title}
                                            className="w-full h-48 object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-48 bg-[#28B463] flex items-center justify-center">
                                            <span className="text-white text-4xl font-bold">
                                                {blog.title.charAt(0)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="p-5">
                                        {/* Category and Role Badge */}
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getCategoryColor(blog.category)}`}>
                                                {blog.category}
                                            </span>
                                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getRoleBadgeColor(blog.author.role)}`}>
                                                {getRoleLabel(blog.author.role)}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                                            {blog.title}
                                        </h3>

                                        {/* Excerpt */}
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                            {blog.excerpt || stripHtmlTags(blog.content).substring(0, 150) + '...'}
                                        </p>

                                        {/* Author and Date */}
                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                            <span className="font-medium">{blog.author.name}</span>
                                            <span>{moment(blog.createdAt).format('MMM DD, YYYY')}</span>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 text-sm text-gray-600 pt-3 border-t border-gray-200">
                                            <span className="flex items-center gap-1">
                                                <FaHeart className="text-red-500" /> {blog.likesCount || 0}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FaComment className="text-blue-500" /> {blog.commentsCount || 0}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FaEye className="text-gray-500" /> {blog.views || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="px-4 py-2 bg-[#1E6F5C] text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="text-gray-600">
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages}
                                    className="px-4 py-2 bg-[#1E6F5C] text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default BlogPage;