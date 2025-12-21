import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form'; // 1. Import necessary hooks
import { yupResolver } from '@hookform/resolvers/yup'; // 2. Import Yup resolver
import * as Yup from 'yup'; // 3. Import Yup

// --- Color constants for UI consistency ---
const primaryGreen = '#1E6F5C';
const lightGreen = '#6a994e';

// --- Role-based redirection routes ---
const roleRoutes = {
    user: '/user/home',
    admin: '/admin/home',
    // Note: Signup component redirects these roles to document upload on successful registration
    organization: `/upload-documents?role=organization`, 
    corporatepartner: `/upload-documents?role=corporatepartner`,
    dietitian: `/upload-documents?role=dietitian`,
};

// --- Initial Form Values Based on Role ---
const getInitialValues = (role) => {
    // Base fields common to many roles
    const base = {
        name: '',
        email: '',
        phone: '',
        password: '',
        address: '',
    };

    switch (role) {
        case 'user':
            return { ...base, dob: '', gender: '' };
        case 'admin':
            return { ...base, dob: '', gender: '', address: '' };
        case 'dietitian':
            return { ...base, age: '', licenseNumber: '' };
        case 'organization':
            return { ...base, organizationLicenseNumber: '' };
        case 'corporatepartner':
            return { ...base, corporatepartnerLicenseNumber: '' };
        default:
            return {};
    }
};

// --- Formik & Yup Validation Schema Builder ---
const buildSignupValidationSchema = (role) => {
    // Helper for common name validation
    const nameValidation = Yup.string()
        .trim()
        .required(`${role.charAt(0).toUpperCase() + role.slice(1)} Name is required.`)
        .min(5, 'Name must be at least 5 characters long.')
        .max(50, 'Name must not exceed 50 characters.')
        .matches(
            /^[a-zA-Z\s._]+$/,
            'Name can only contain letters, spaces, dots, or underscores.'
        )
        .test(
            'has-at-least-4-letters',
            'Name must contain at least 4 letters.',
            (value) => (value.match(/[a-zA-Z]/g) || []).length >= 4
        );

    // Base schema for all roles
    let schema = Yup.object().shape({
        email: Yup.string()
            .matches(
                /^[a-zA-Z][a-zA-Z0-9._]{2,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                'Invalid email address.'
            )
            .required('Email is required.')
            .min(10, 'Email must be at least 10 characters.')
            .max(50, 'Email must not exceed 50 characters.'),
        password: Yup.string()
            .required('Password is required.')
            .min(6, 'Password must be at least 6 characters.')
            .max(20, 'Password must not exceed 20 characters.'),
        phone: Yup.string()
            .required('Phone Number is required.')
            .matches(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number.'),
    });

    // Role-specific field additions and conditional validation
    switch (role) {
        case 'user':
            schema = schema.shape({
                name: nameValidation.label('Full Name'),
                dob: Yup.date()
                    .required('Date of Birth is required.')
                    .nullable()
                    .max(new Date(new Date().setFullYear(new Date().getFullYear() - 10)), 'You must be at least 10 years old.')
                    .label('Date of Birth'),
                gender: Yup.string().required('Please select your gender.').oneOf(['male', 'female', 'other'], 'Invalid gender selection.'),
                address: Yup.string()
                    .required('Address is required.')
                    .min(5, 'Address must be at least 5 characters.')
                    .max(200, 'Address must not exceed 200 characters.'),
            });
            break;

        case 'admin':
            schema = schema.shape({
                name: nameValidation.label('Full Name'),
                dob: Yup.date()
                    .required('Date of Birth is required.')
                    .nullable()
                    .max(new Date(new Date().setFullYear(new Date().getFullYear() - 10)), 'You must be at least 10 years old.')
                    .label('Date of Birth'),
                gender: Yup.string().required('Please select your gender.').oneOf(['male', 'female', 'other'], 'Invalid gender selection.'),
                address: Yup.string()
                    .required('Address is required.')
                    .min(5, 'Address must be at least 5 characters.')
                    .max(200, 'Address must not exceed 200 characters.'),
            });
            break;

        case 'dietitian':
            schema = schema.shape({
                name: nameValidation.label('Full Name'),
                age: Yup.number()
                    .required('Age is required.')
                    .min(18, 'Age must be at least 18.')
                    .typeError('Age must be a number.'),
                licenseNumber: Yup.string()
                    .required('License Number is required.')
                    .matches(/^DLN[0-9]{6}$/, 'License Number must be in the format DLN followed by 6 digits (e.g., DLN123456).')
                    .length(9, 'License Number must be 9 characters (e.g., DLN123456).'),
            });
            break;

        case 'organization':
            schema = schema.shape({
                name: nameValidation.label('Certifying Organization Name'),
                organizationLicenseNumber: Yup.string()
                    .required('License Number is required.')
                    .matches(/^OLN[0-9]{6}$/, 'License Number must be in the format OLN followed by 6 digits (e.g., OLN123456).')
                    .length(9, 'License Number must be 9 characters (e.g., OLN123456).'),
                address: Yup.string()
                    .required('Address is required.')
                    .min(5, 'Address must be at least 5 characters.')
                    .max(200, 'Address must not exceed 200 characters.'),
            });
            break;

        case 'corporatepartner':
            schema = schema.shape({
                name: nameValidation.label('Corporate Name'),
                corporatepartnerLicenseNumber: Yup.string()
                    .required('Corporate License Number is required.')
                    .matches(/^CLN[0-9]{6}$/, 'License Number must be in the format CLN followed by 6 digits (e.g., CLN123456).')
                    .length(9, 'License Number must be 9 characters (e.g., CLN123456).'),
                address: Yup.string()
                    .required('Address is required.')
                    .min(5, 'Address must be at least 5 characters.')
                    .max(200, 'Address must not exceed 200 characters.'),
            });
            break;

        default:
            break;
    }

    return schema;
};


const Signup = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [role, setRole] = useState('');
    const [corporateType, setCorporateType] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Get role and corporateType from URL on mount
    useEffect(() => {
        const roleFromUrl = searchParams.get('role');
        const corporateTypeFromUrl = searchParams.get('corporateType');
        
        if (roleFromUrl) {
            // If corporate employee, treat as user role
            if (corporateTypeFromUrl === 'corporate_employee') {
                setRole('user');
                setCorporateType('corporate_employee');
            } else {
                setRole(roleFromUrl);
                setCorporateType('');
            }
        }
    }, [searchParams]);

    // **React Hook Form Setup**
    // The schema resolver is tied to the 'role' state so it updates when the role changes.
    const validationSchema = buildSignupValidationSchema(role);

    const { register, handleSubmit, formState: { errors }, control, reset } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: getInitialValues(role),
        mode: 'onBlur', // Validate on blur for better UX
    });

    // Reset form when the role changes (critical for correct field display/validation)
    useEffect(() => {
        if (role) {
            reset(getInitialValues(role));
            setMessage(''); // Clear message on role change
        }
    }, [role, reset]);

    // --- MODIFIED: Submission Handler using React Hook Form's data ---
    // The data object already contains the serialized, validated form values.
    const onSubmit = async (data) => {
        if (!role) {
            setMessage('Error: Role not selected for signup.');
            return;
        }

        // Rename keys to match the desired API payload (e.g., 'organizationLicenseNumber' -> 'licenseNumber')
        const formData = { ...data };

        // Normalize license/ID keys before sending to API for consistency
        if (formData.organizationLicenseNumber) {
            formData.licenseNumber = formData.organizationLicenseNumber;
            delete formData.organizationLicenseNumber;
        }
        if (formData.corporatepartnerLicenseNumber) {
            formData.licenseNumber = formData.corporatepartnerLicenseNumber;
            delete formData.corporatepartnerLicenseNumber;
        }
        
        // Add corporate type information for corporate employees
        if (corporateType === 'corporate_employee') {
            formData.corporateType = 'employee';
        }
        
        // Add the role to the payload
        formData.role = role;
        
        const apiRoute = `/api/signup/${role}`; // Dynamically sets route: /api/signup/user, /api/signup/dietitian, etc.

        // 1. Show the initial validation/pre-check message
        setIsLoading(true);
        setMessage('Validating your details...');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        try {
            // Use axios.post to send data
            const response = await axios.post(apiRoute, formData);
            const responseData = response.data;

            // 2. Upon successful POST, the registration is complete.
            const redirectMessage = ['organization', 'corporatepartner', 'dietitian'].includes(role) 
                ? `Sign-up successful! Welcome! Redirecting to ${role} upload documents ...`
                : `Sign-up successful! Welcome! Redirecting to ${role} home page ...`;
            setMessage(redirectMessage);

            // Assuming your backend sends the JWT token in the response data (e.g., responseData.token)
            if (responseData.token) {
                // Handle token storage with role-specific key so multiple roles can be logged in simultaneously
                localStorage.setItem(`authToken_${responseData.role}`, responseData.token);
            }

            // Store roleId from response for document upload
            if (responseData.roleId) {
                localStorage.setItem('userId', responseData.roleId);
            }

            // Redirect to document upload for specific roles
            setTimeout(() => {
                setMessage('');
                navigate(roleRoutes[role]);
            }, 1500);

        } catch (error) {
            console.error('Sign-up Error:', error.response ? error.response.data : error.message);

            const errorMessage = error.response?.data?.message
                || error.message
                || `Signup failed for ${role}. Please try again.`;

            // 3. Show error message on failure
            setMessage(`Error: ${errorMessage}`);
            // Note: React Hook Form errors are managed by Yup/Resolver, 
            // but we can't easily set backend errors with this setup unless we manually set them 
            // using setValue/setError, which is complex for a general field. We rely on the message.

        } finally {
            setIsLoading(false);
        }
    };


    const handleLoginClick = () => {
        navigate(`/signin?role=${role}`, { state: { scrollToTop: true } });
    };

    const renderForm = () => {
        // NOTE: The color constants must be used inside the template literals using bracket notation 
        // in Tailwind CSS if they are defined as JavaScript variables (e.g., bg-[${primaryGreen}]).
        const commonInputClasses =
            `w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[${lightGreen}] transition-all duration-300`;
        const commonButtonClasses =
            `w-full bg-[${primaryGreen}] text-white font-semibold py-3 rounded-lg hover:bg-[#155345] transition-colors duration-300 shadow-md hover:shadow-lg disabled:opacity-50`;
        const errorClasses = 'text-red-500 text-xs mt-1';
        
        // Helper function to render a form group using React Hook Form's `register`
        // We use a custom fieldName that matches the keys in the Yup schema
        const renderInputGroup = (type, label, placeholder, fieldName, isRequired = true, minLength, maxLength, pattern) => (
            <div className="relative">
                <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                    id={fieldName}
                    type={type}
                    className={`${commonInputClasses} ${errors[fieldName] ? 'border-red-500' : ''}`}
                    placeholder={placeholder}
                    {...register(fieldName)} // **React Hook Form integration**
                    required={isRequired}
                    minLength={minLength}
                    maxLength={maxLength}
                    pattern={pattern}
                />
                {errors[fieldName] && <div className={errorClasses}>{errors[fieldName].message}</div>}
            </div>
        );


        // Enhanced Submit Button with Loading State
        const SubmitButton = () => (
            <button type="submit" className={commonButtonClasses} disabled={isLoading}>
                {isLoading ? (
                    <>
                        <i className="fas fa-spinner fa-spin mr-2"></i> Validating...
                    </>
                ) : (
                    'Get Started'
                )}
            </button>
        );

        const LoginLink = () => (
            <div className="lg:col-span-2 text-center mt-6">
                <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={handleLoginClick}
                        className={`text-[${primaryGreen}] font-medium hover:underline focus:outline-none`}
                    >
                        Login
                    </button>
                </p>
            </div>
        );

        switch (role) {
            // USER FORM
            case 'user':
                return (
                    <div className="mt-6 mb-3 w-full max-w-7xl mx-auto">
                        <form
                            id="userSignupForm"
                            onSubmit={handleSubmit(onSubmit)} // **React Hook Form handleSubmit**
                            className="needs-validation grid gap-3 sm:gap-4 lg:grid-cols-2"
                            noValidate
                        >
                            {renderInputGroup('text', 'Full Name', 'Enter your full name', 'name', true, 5, 50)}
                            {renderInputGroup('email', 'Email', 'Enter your email', 'email', true, 10, 50)}
                            {renderInputGroup('tel', 'Phone Number', 'Enter your phone number', 'phone', true, 10, 10, '[0-9]{10}')}
                            {renderInputGroup('password', 'Password', 'Create a password', 'password', true, 6, 20)}
                            {renderInputGroup('date', 'Date of Birth', '', 'dob', true)}

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <div className="flex items-center space-x-4">
                                    <Controller // **Controller for Radio Buttons**
                                        name="gender"
                                        control={control}
                                        render={({ field }) => (
                                            <>
                                                {['male', 'female', 'other'].map((val) => (
                                                    <div key={val} className="flex items-center">
                                                        <input
                                                            className={`h-4 w-4 text-[#1E6F5C] border-gray-300 rounded focus:ring-[#1E6F5C]`}
                                                            type="radio"
                                                            value={val}
                                                            checked={field.value === val} // Control checked state
                                                            onChange={(e) => field.onChange(e.target.value)} // Update RHF value
                                                        />
                                                        <label className="ml-2 block text-sm text-gray-900 capitalize">{val}</label>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    />
                                </div>
                                {errors.gender && <div className={errorClasses}>{errors.gender.message}</div>}
                            </div>

                            <div className="relative lg:col-span-2">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea 
                                    id="address" 
                                    className={`${commonInputClasses} ${errors.address ? 'border-red-500' : ''}`} 
                                    rows="3" 
                                    placeholder="Enter your address" 
                                    {...register('address')} // **React Hook Form integration**
                                ></textarea>
                                {errors.address && <div className={errorClasses}>{errors.address.message}</div>}
                            </div>

                            <div className="lg:col-span-2">
                                <SubmitButton />
                            </div>

                            <LoginLink />
                        </form>
                    </div>
                );

            // ADMIN FORM
            case 'admin':
                return (
                    <div className="mt-6 mb-3 w-full max-w-7xl mx-auto">
                        <form
                            id="adminSignupForm"
                            onSubmit={handleSubmit(onSubmit)}
                            className="needs-validation grid gap-3 sm:gap-4 lg:grid-cols-2"
                            noValidate
                        >
                            {renderInputGroup('text', 'Full Name', 'Enter your full name', 'name', true, 5, 50)}
                            {renderInputGroup('email', 'Email', 'Enter your email', 'email', true, 10, 50)}
                            {renderInputGroup('tel', 'Phone Number', 'Enter your phone number', 'phone', true, 10, 10, '[0-9]{10}')}
                            {renderInputGroup('password', 'Password', 'Create a password', 'password', true, 6, 20)}
                            {renderInputGroup('date', 'Date of Birth', '', 'dob', true)}

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <div className="flex items-center space-x-4">
                                    <Controller // **Controller for Radio Buttons**
                                        name="gender"
                                        control={control}
                                        render={({ field }) => (
                                            <>
                                                {['male', 'female', 'other'].map((val) => (
                                                    <div key={val} className="flex items-center">
                                                        <input
                                                            className={`h-4 w-4 text-[#1E6F5C] border-gray-300 rounded focus:ring-[#1E6F5C]`}
                                                            type="radio"
                                                            value={val}
                                                            checked={field.value === val}
                                                            onChange={(e) => field.onChange(e.target.value)}
                                                        />
                                                        <label className="ml-2 block text-sm text-gray-900 capitalize">{val}</label>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    />
                                </div>
                                {errors.gender && <div className={errorClasses}>{errors.gender.message}</div>}
                            </div>
                            
                            <div className="relative"></div> {/* Placeholder for grid alignment */}

                            <div className="relative lg:col-span-2">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea 
                                    id="address" 
                                    className={`${commonInputClasses} ${errors.address ? 'border-red-500' : ''}`} 
                                    rows="3" 
                                    placeholder="Enter your address" 
                                    {...register('address')}
                                ></textarea>
                                {errors.address && <div className={errorClasses}>{errors.address.message}</div>}
                            </div>

                            <div className="lg:col-span-2">
                                <SubmitButton />
                            </div>

                            <LoginLink />
                        </form>
                    </div>
                );

            // DIETITIAN FORM
            case 'dietitian':
                return (
                    <div className="mt-6 mb-3 w-full max-w-7xl mx-auto">
                        <form
                            id="dietitianSignupForm"
                            onSubmit={handleSubmit(onSubmit)}
                            className="needs-validation grid gap-3 sm:gap-4 lg:grid-cols-2"
                            noValidate
                        >
                            {renderInputGroup('text', 'Full Name', 'Enter your full name', 'name', true, 5, 50)}
                            {renderInputGroup('email', 'Email', 'Enter your email', 'email', true, 5, 50)}
                            {renderInputGroup('number', 'Age', 'Enter your age', 'age', true)}
                            {renderInputGroup('password', 'Password', 'Create a password', 'password', true, 6, 20)}
                            {renderInputGroup('tel', 'Phone Number', 'Enter your phone number', 'phone', true, 10, 10, '[0-9]{10}')}
                            {renderInputGroup('text', 'License Number', 'e.g., DLN123456', 'licenseNumber', true, 9, 9)}

                            <div className="lg:col-span-2">
                                <SubmitButton />
                            </div>

                            <LoginLink />
                        </form>
                    </div>
                );

            // ORGANIZATION FORM
            case 'organization':
                return (
                    <div className="mt-6 mb-3 w-full max-w-7xl mx-auto">
                        <form
                            id="organizationSignupForm"
                            onSubmit={handleSubmit(onSubmit)}
                            className="needs-validation grid gap-3 sm:gap-4 lg:grid-cols-2"
                            noValidate
                        >
                            {renderInputGroup('text', 'Certifying Organization Name', 'Enter organization name', 'name', true, 5, 50)}
                            {renderInputGroup('email', 'Email', 'Enter your email', 'email', true, 10, 50)}
                            {renderInputGroup('tel', 'Phone Number', 'Enter your phone number', 'phone', true, 10, 10, '[0-9]{10}')}
                            {renderInputGroup('password', 'Password', 'Create a password', 'password', true, 6, 20)}
                            {renderInputGroup('text', 'License Number', 'e.g., OLN123456', 'organizationLicenseNumber', true, 9, 9)}

                            <div className="relative"></div> {/* Placeholder for grid alignment */}

                            <div className="relative lg:col-span-2">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea 
                                    id="address" 
                                    className={`${commonInputClasses} ${errors.address ? 'border-red-500' : ''}`} 
                                    rows="3" 
                                    placeholder="Enter your address" 
                                    {...register('address')}
                                ></textarea>
                                {errors.address && <div className={errorClasses}>{errors.address.message}</div>}
                            </div>

                            <div className="lg:col-span-2">
                                <SubmitButton />
                            </div>

                            <LoginLink />
                        </form>
                    </div>
                );

            // CORPORATE PARTNER FORM
            case 'corporatepartner':
                return (
                    <div className="mt-6 mb-3 w-full max-w-7xl mx-auto">
                        <form
                            id="corporatepartnerSignupForm"
                            onSubmit={handleSubmit(onSubmit)}
                            className="needs-validation grid gap-3 sm:gap-4 lg:grid-cols-2"
                            noValidate
                        >
                            {renderInputGroup('text', 'Corporate Name', 'Enter corporate name', 'name', true, 5, 50)}
                            {renderInputGroup('email', 'Email', 'Enter your email', 'email', true, 10, 50)}
                            {renderInputGroup('tel', 'Phone Number', 'Enter your phone number', 'phone', true, 10, 10, '[0-9]{10}')}
                            {renderInputGroup('password', 'Password', 'Create a password', 'password', true, 6, 20)}
                            {renderInputGroup('text', 'Corporate License Number', 'e.g., CLN123456', 'corporatepartnerLicenseNumber', true, 9, 9)}

                            <div className="relative"></div> {/* Placeholder for grid alignment */}

                            <div className="relative lg:col-span-2">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea 
                                    id="address" 
                                    className={`${commonInputClasses} ${errors.address ? 'border-red-500' : ''}`} 
                                    rows="3" 
                                    placeholder="Enter your address" 
                                    {...register('address')}
                                ></textarea>
                                {errors.address && <div className={errorClasses}>{errors.address.message}</div>}
                            </div>

                            <div className="lg:col-span-2">
                                <SubmitButton />
                            </div>

                            <LoginLink />
                        </form>
                    </div>
                );

            default:
                return (
                    <div className="mt-6 mb-3 w-full max-w-7xl mx-auto">
                        <div className="text-center p-4 sm:p-5 flex flex-col items-center justify-center min-h-[150px]">
                            <h3 className="text-xl text-gray-700 font-semibold mb-4">
                                Please select a role to sign up.
                            </h3>
                            <button
                                onClick={() => navigate('/role')}
                                className="bg-[#28B463] hover:bg-[#1E8449] text-white font-bold py-2 px-4 rounded-md shadow-lg transition-colors"
                            >
                                Select a Role
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <section className="flex items-center justify-center bg-gray-100 p-2 sm:p-3 min-h-[650px]">
            <div className="w-full max-w-7xl p-4 sm:p-5 mx-auto rounded-3xl shadow-2xl bg-white flex flex-col items-center justify-center animate-fade-in relative">
                <button
                    onClick={() => navigate('/role')}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors z-10"
                    title="Back to Role Selection"
                >
                    <i className="fas fa-times text-xl"></i>
                </button>
                <h2 className="text-center text-3xl font-bold text-[#1E6F5C] mb-4">
                    SIGN UP AS A {corporateType === 'corporate_employee' ? 'CORPORATE EMPLOYEE' : (role.toUpperCase() || 'NEW MEMBER')}
                </h2>

                {/* Global Alert */}
                {message && (
                    <div
                        aria-live="polite"
                        className={`p-3 mb-5 text-center text-base font-medium rounded-lg shadow-sm animate-slide-in w-full ${
                            message.includes('successful')
                                ? 'text-green-800 bg-green-100 border border-green-300'
                                : message.includes('Validating')
                                ? 'text-blue-800 bg-blue-100 border border-blue-300' // Using blue for validation/loading
                                : 'text-red-800 bg-red-100 border border-red-300'
                        }`}
                        role="alert"
                    >
                        {message}
                    </div>
                )}

                {renderForm()}
            </div>
        </section>
    );
};

export default Signup;