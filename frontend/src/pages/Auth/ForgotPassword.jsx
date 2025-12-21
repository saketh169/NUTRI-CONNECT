import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// --- Color constants for UI consistency ---
const primaryGreen = '#1E6F5C';
const lightGreen = '#6a994e';

// --- Global UI constants ---
const commonLinkClasses = 'text-[#1E6F5C] hover:text-[#155345] font-medium transition-colors duration-300';

// --- Validation Schemas ---
const emailValidationSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email address.')
        .required('Email is required.')
        .min(5, 'Email must be at least 5 characters.')
        .max(50, 'Email must not exceed 50 characters.'),
});

const resetValidationSchema = Yup.object().shape({
    otp: Yup.string()
        .required('OTP is required.')
        .length(6, 'OTP must be 6 digits.')
        .matches(/^[0-9]+$/, 'OTP must contain only numbers.'),
    newPassword: Yup.string()
        .required('Enter your password.')
        .min(6, 'Password must be at least 6 characters.')
        .max(20, 'Password must not exceed 20 characters.'),
    confirmPassword: Yup.string()
        .required('Confirm password is required.')
        .oneOf([Yup.ref('newPassword')], 'Passwords do not match.'),
});

// --- Initial Form Values ---
const emailInitialValues = {
    email: '',
};

const resetInitialValues = {
    otp: '',
    newPassword: '',
    confirmPassword: '',
};

// --- Main Component ---
const ForgotPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState('');
    const [currentStep, setCurrentStep] = useState('email'); // 'email' or 'reset'
    const [userEmail, setUserEmail] = useState('');
    const [userRole, setUserRole] = useState('');
    const [corporateType, setCorporateType] = useState('');

    // Get role and corporateType from URL on mount
    useEffect(() => {
        const roleFromUrl = searchParams.get('role') || 'user';
        const corporateTypeFromUrl = searchParams.get('corporateType');
        
        if (corporateTypeFromUrl === 'corporate_employee') {
            setUserRole('user');
            setCorporateType('corporate_employee');
        } else {
            setUserRole(roleFromUrl);
            setCorporateType('');
        }
    }, [searchParams]);

    // Email submission handler
    const handleEmailSubmit = async (values, { setSubmitting, setErrors }) => {
        setSubmitting(true);
        setMessage('Sending OTP to your email...');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        try {
            await axios.post(`/api/forgot-password/${userRole}`, {
                email: values.email,
            });

            setMessage('OTP sent successfully! Please check your email.');
            setUserEmail(values.email);
            setCurrentStep('reset');

            // Clear message after showing success
            setTimeout(() => {
                setMessage('');
            }, 2000);

        } catch (error) {
            console.error('Forgot Password Error:', error.response ? error.response.data : error.message);

            const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
            setMessage(`Error: ${errorMessage}`);

            const backendErrors = error.response?.data?.errors;
            if (backendErrors) {
                setErrors(backendErrors);
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Reset password submission handler
    const handleResetSubmit = async (values, { setSubmitting, setErrors }) => {
        setSubmitting(true);
        setMessage('Resetting your password...');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        try {
            await axios.post(`/api/reset-password/${userRole}`, {
                email: userEmail,
                otp: values.otp,
                newPassword: values.newPassword,
            });

            setMessage('Password reset successfully! Redirecting to sign in...');

            // Redirect to sign in after a delay
            setTimeout(() => {
                navigate(`/signin?role=${userRole}${corporateType === 'corporate_employee' ? '&corporateType=corporate_employee' : ''}`);
            }, 2000);

        } catch (error) {
            console.error('Reset Password Error:', error.response ? error.response.data : error.message);

            const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
            setMessage(`Error: ${errorMessage}`);

            const backendErrors = error.response?.data?.errors;
            if (backendErrors) {
                setErrors(backendErrors);
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Render Email Form
    const renderEmailForm = () => {
        const commonInputClasses = `w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[${lightGreen}] transition-all duration-300`;
        const errorClasses = 'text-red-500 text-xs mt-1';

        return (
            <>
                {/* Email */}
                <div className="relative">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                    </label>
                    <Field
                        id="email"
                        name="email"
                        type="email"
                        className={`${commonInputClasses} h-11`}
                        placeholder="Enter your registered email address"
                        required
                    />
                    <ErrorMessage name="email" component="div" className={errorClasses} />
                </div>

                <div className="text-sm text-gray-600 mt-2">
                    <p>Enter your registered email address and we'll send you an OTP to reset your password.</p>
                </div>
            </>
        );
    };

    // Render Reset Form
    const renderResetForm = () => {
        const commonInputClasses = `w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[${lightGreen}] transition-all duration-300`;
        const errorClasses = 'text-red-500 text-xs mt-1';

        return (
            <>
                {/* Email Display */}
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-600">
                        <i className="fas fa-envelope mr-2"></i>
                        OTP sent to: <span className="font-medium text-gray-800">{userEmail}</span>
                    </p>
                </div>

                {/* OTP */}
                <div className="relative">
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                        OTP Code
                    </label>
                    <Field
                        id="otp"
                        name="otp"
                        type="text"
                        className={`${commonInputClasses} h-11 text-center text-lg tracking-widest`}
                        placeholder="000000"
                        maxLength="6"
                        required
                    />
                    <ErrorMessage name="otp" component="div" className={errorClasses} />
                </div>

                {/* New Password */}
                <div className="relative">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                    </label>
                    <Field
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        className={`${commonInputClasses} h-11`}
                        placeholder="Enter your new password"
                        required
                    />
                    <ErrorMessage name="newPassword" component="div" className={errorClasses} />
                </div>

                {/* Confirm Password */}
                <div className="relative">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                    </label>
                    <Field
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        className={`${commonInputClasses} h-11`}
                        placeholder="Confirm your new password"
                        required
                    />
                    <ErrorMessage name="confirmPassword" component="div" className={errorClasses} />
                </div>

                <div className="text-sm text-gray-600 mt-2">
                    <p>Password must be at least 6 characters long.</p>
                </div>
            </>
        );
    };

    return (
        <section className="flex items-center justify-center bg-gray-100 p-4 min-h-[600px]">
            <div className="w-full max-w-[40%] p-8 mx-auto rounded-3xl shadow-2xl bg-white animate-fade-in relative">
                <button
                    onClick={() => navigate(`/signin?role=${userRole}${corporateType === 'corporate_employee' ? '&corporateType=corporate_employee' : ''}`)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
                    title="Back to Sign In"
                >
                    <i className="fas fa-times text-xl"></i>
                </button>

                <div className="text-center mb-6">
                    <i className={`fas ${currentStep === 'email' ? 'fa-key' : 'fa-lock'} text-4xl text-[#1E6F5C] mb-4`}></i>
                    <h2 className="text-3xl font-bold text-[#1E6F5C]">
                        {currentStep === 'email' ? 'Forgot Password' : 'Reset Password'}
                    </h2>
                    <p className="text-gray-600 mt-2">
                        {currentStep === 'email' 
                            ? `Reset your password for ${corporateType === 'corporate_employee' ? 'Corporate Employee' : userRole.charAt(0).toUpperCase() + userRole.slice(1)} account` 
                            : 'Enter the OTP sent to your email'
                        }
                    </p>
                </div>

                {/* Global Alert */}
                {message && (
                    <div
                        aria-live="polite"
                        className={`p-3 mb-5 text-center text-base font-medium rounded-lg shadow-sm animate-slide-in w-full ${
                            message.includes('successfully') || message.includes('sent') || message.includes('Redirecting')
                                ? 'text-green-800 bg-green-100 border border-green-300'
                                : message.includes('Sending') || message.includes('Resetting')
                                    ? 'text-blue-800 bg-blue-100 border border-blue-300'
                                    : 'text-red-800 bg-red-100 border border-red-300'
                        }`}
                        role="alert"
                    >
                        {message}
                    </div>
                )}

                {currentStep === 'email' ? (
                    <Formik
                        initialValues={emailInitialValues}
                        validationSchema={emailValidationSchema}
                        onSubmit={handleEmailSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form className="space-y-4" noValidate>
                                {renderEmailForm()}

                                {/* Submit Button with Loading State */}
                                <button
                                    type="submit"
                                    className={`w-full bg-[${primaryGreen}] text-white font-semibold py-3 rounded-lg hover:bg-[#155345] transition-colors duration-300 shadow-md hover:shadow-lg disabled:opacity-50`}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin mr-2"></i> Sending OTP...
                                        </>
                                    ) : (
                                        'Send OTP'
                                    )}
                                </button>

                                <div className="text-center mt-4">
                                    <p className="text-sm">
                                        Remember your password?{' '}
                                        <Link to="/signin" className={commonLinkClasses}>
                                            Back to Sign In
                                        </Link>
                                    </p>
                                </div>
                            </Form>
                        )}
                    </Formik>
                ) : (
                    <Formik
                        initialValues={resetInitialValues}
                        validationSchema={resetValidationSchema}
                        onSubmit={handleResetSubmit}
                    >
                        {({ isSubmitting, errors, submitCount }) => (
                            <Form className="space-y-4" noValidate>
                                {/* Validation error message */}
                                {submitCount > 0 && Object.keys(errors).length > 0 && !message && (
                                    <div
                                        aria-live="polite"
                                        className="p-3 mb-5 text-center text-base font-medium rounded-lg shadow-sm w-full text-red-800 bg-red-100 border border-red-300"
                                        role="alert"
                                    >
                                        Please fill all the fields
                                    </div>
                                )}

                                {renderResetForm()}

                                {/* Submit Button with Loading State */}
                                <button
                                    type="submit"
                                    className={`w-full bg-[${primaryGreen}] text-white font-semibold py-3 rounded-lg hover:bg-[#155345] transition-colors duration-300 shadow-md hover:shadow-lg disabled:opacity-50`}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin mr-2"></i> Resetting Password...
                                        </>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>

                                <div className="text-center mt-4 space-y-2">
                                    <p className="text-sm">
                                        Didn't receive OTP?{' '}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCurrentStep('email');
                                            }}
                                            className={commonLinkClasses}
                                        >
                                            Send Again
                                        </button>
                                    </p>
                                    <p className="text-sm">
                                        <Link to={`/signin?role=${userRole}${corporateType === 'corporate_employee' ? '&corporateType=corporate_employee' : ''}`} className={commonLinkClasses}>
                                            Back to Sign In
                                        </Link>
                                    </p>
                                </div>
                            </Form>
                        )}
                    </Formik>
                )}
            </div>
        </section>
    );
};

export default ForgotPassword;