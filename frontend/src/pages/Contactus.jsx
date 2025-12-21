import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { useAuthContext } from '../hooks/useAuthContext';

// --- Validation Schema using Yup ---
const contactSchema = Yup.object().shape({
  name: Yup.string()
    .required('Full Name is required.')
    .min(3, 'Name must be at least 3 characters.'),
  email: Yup.string()
    .matches(
      /^[a-zA-Z][a-zA-Z0-9._]{2,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Invalid email address.'
    )
    .required('Email Address is required.'),
  role: Yup.string()
    .required('Please select your role.'),
  query: Yup.string()
    .required('A message is required.')
    .min(10, 'Message must be at least 10 characters.'),
});

const ContactPage = () => {
  const [submittedData, setSubmittedData] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const { user, role, isAuthenticated } = useAuthContext();

  // --- React Hook Form Setup ---
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      role: '',
      query: '',
    },
  });

  // Autofill form fields if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Set name if available
      if (user.name) {
        setValue('name', user.name);
      }
      // Set email if available
      if (user.email) {
        setValue('email', user.email);
      }
      // Set role if available - map to contact form role values
      if (role) {
        const roleMap = {
          'user': 'User',
          'dietitian': 'Dietitian',
          'organization': 'Certifying Organization',
          'corporatepartner': 'Corporate Partner'
        };
        setValue('role', roleMap[role] || '');
      }
    }
  }, [isAuthenticated, user, role, setValue]);

  // --- Submission Handler ---
  const onSubmit = async (data) => {
    setSubmitError(null);
    try {
      const response = await axios.post('/api/contact/submit', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        // Set submitted data for display
        setSubmittedData(data);

        // Reset the form after successful submission
        reset();

        // Scroll to the submitted message section
        setTimeout(() => {
          const submittedSection = document.getElementById('submitted-message');
          if (submittedSection) {
            submittedSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      } else {
        setSubmitError(response.data.message || 'Failed to submit query');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitError(
        error.response?.data?.message ||
        'Failed to submit your query. Please try again later.'
      );
    }
  };

  // Helper for input classes with error styling
  const getInputClasses = (fieldName) => 
    `w-full p-3 rounded-lg border transition-all ${
      errors[fieldName]
        ? 'border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:ring-2 focus:ring-[#28B463] focus:border-transparent'
    }`;
    
  const errorClasses = 'text-red-500 text-sm mt-1';

  return (
    <main className='flex-1 py-5 px-4 md:px-8 bg-gray-50'>
      <div className='max-w-6xl mx-auto text-center'>
        <h1 className='text-4xl font-bold text-[#1E6F5C] mb-4'>Get In Touch</h1>
        <p className='text-lg text-gray-700 max-w-2xl mx-auto mb-12'>
          We'd love to hear from you. Send us a message, and we'll get back to
          you as soon as possible.
        </p>
      </div>

      <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 items-start'>
        {/* Contact Form */}
        <div className='bg-white p-8 rounded-2xl shadow-lg border-t-4 border-[#28B463]'>
          <h2 className='text-2xl font-bold text-[#2C3E50] mb-6 text-center'>
            Send Us a Message
          </h2>
          {/* RHF handleSubmit wrapper */}
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div>
              <input
                type='text'
                name='name'
                placeholder='Full Name'
                // RHF registration
                {...register('name')} 
                className={getInputClasses('name')}
              />
              {errors.name && <p className={errorClasses}>{errors.name.message}</p>}
            </div>
            
            <div>
              <input
                type='email'
                name='email'
                placeholder='Email Address'
                // RHF registration
                {...register('email')}
                className={getInputClasses('email')}
              />
              {errors.email && <p className={errorClasses}>{errors.email.message}</p>}
            </div>
            
            <div>
              <select
                name='role'
                // RHF registration
                {...register('role')}
                // Adjust text color dynamically based on RHF error
                className={`${getInputClasses('role')} ${
                  errors.role ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                <option value='' disabled>
                  Select Your Role
                </option>
                <option value='User'>User</option>
                <option value='Dietitian'>Dietitian</option>
                <option value='Certifying Organization'>
                  Certifying Organization
                </option>
                <option value='Corporate Partner'>Corporate Partner</option>
              </select>
              {errors.role && <p className={errorClasses}>{errors.role.message}</p>}
            </div>
            
            <div>
              <textarea
                name='query'
                placeholder='Your Message'
                rows='5'
                // RHF registration
                {...register('query')}
                className={getInputClasses('query')}
              ></textarea>
              {errors.query && <p className={errorClasses}>{errors.query.message}</p>}
            </div>
            
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full bg-[#28B463] text-white py-3 rounded-full font-semibold hover:bg-[#1E6F5C] transition-all duration-300 disabled:opacity-50'
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          {/* Error Message */}
          {submitError && (
            <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <div className='flex items-center'>
                <i className='fas fa-exclamation-triangle text-red-500 mr-2'></i>
                <p className='text-red-700 font-medium'>Error</p>
              </div>
              <p className='text-red-600 mt-1'>{submitError}</p>
            </div>
          )}
        </div>
        {/* Contact Details Box */}
        <div className='bg-white p-8 rounded-2xl shadow-lg border-t-4 border-[#28B463] flex flex-col justify-between'>
          <div>
            <h2 className='text-2xl font-bold text-[#2C3E50] mb-6 text-center'>
              Contact Information
            </h2>
            <p className='text-gray-700 text-center mb-8'>
              Feel free to reach out to us directly via our contact details
              below.
            </p>
            <div className='space-y-4 text-left text-gray-700'>
              <div className='flex items-center'>
                <i className='fas fa-envelope mr-3 text-[#28B463] text-2xl'></i>
                <span className='text-lg'>nutriconnect6@gmail.com</span>
              </div>
              <div className='flex items-center'>
                <i className='fas fa-phone mr-3 text-[#28B463] text-2xl'></i>
                <span className='text-lg'>+91 70757 83143</span>
              </div>
              <div className='flex items-center'>
                <i className='fas fa-map-marker-alt mr-3 text-[#28B463] text-2xl'></i>
                <span className='text-lg'>
                  45 Wellness Avenue, Greenfield, CA 93927
                </span>
              </div>
            </div>
          </div>

          <div className='mt-8 text-center'>
            <h3 className='text-lg font-semibold text-[#1E6F5C] mb-4'>
              Follow Us
            </h3>
            <div className='flex justify-center gap-4'>
              <a
                target='_blank'
                href='https://www.facebook.com/profile.php?id=61572485733709'
                className='w-12 h-12 flex items-center justify-center text-[#28B463] bg-white rounded-full hover:bg-[#28B463] hover:text-white border border-[#28B463] hover:border-transparent transition-all duration-300'
              >
                <i className='fab fa-facebook-f text-xl'></i>
              </a>
              <a
                target='_blank'
                href='https://www.instagram.com/nutriconnect2025'
                className='w-12 h-12 flex items-center justify-center text-[#28B463] bg-white rounded-full hover:bg-[#28B463] hover:text-white border border-[#28B463] hover:border-transparent transition-all duration-300'
              >
                <i className='fab fa-instagram text-xl'></i>
              </a>
              <a
                target='_blank'
                href='https://x.com/NutriC21?t=ngy3BuReV6VcrXl3WXrCvg&s=09'
                className='w-12 h-12 flex items-center justify-center text-[#28B463] bg-white rounded-full hover:bg-[#28B463] hover:text-white border border-[#28B463] hover:border-transparent transition-all duration-300'
              >
                <i className='fab fa-twitter text-xl'></i>
              </a>
              <a
                target='_blank'
                href='https://www.linkedin.com/in/nutri-connect-a0b77434'
                className='w-12 h-12 flex items-center justify-center text-[#28B463] bg-white rounded-full hover:bg-[#28B463] hover:text-white border border-[#28B463] hover:border-transparent transition-all duration-300'
              >
                <i className='fab fa-linkedin-in text-xl'></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Submitted Message Box - Full Width */}
      {submittedData && (
        <div id="submitted-message" className='max-w-6xl mx-auto mt-12 bg-white p-8 rounded-2xl shadow-lg border-t-4 border-[#28B463]'>
          <h2 className='text-2xl font-bold text-[#2C3E50] mb-6 text-center'>
            Your Message Has Been Sent! 🎉
          </h2>
          <div className='space-y-4 text-left text-gray-700'>
            <p className='border-b border-gray-200 pb-2'>
              <span className='font-semibold text-[#1E6F5C]'>Name:</span>{' '}
              {submittedData.name}
            </p>
            <p className='border-b border-gray-200 pb-2'>
              <span className='font-semibold text-[#1E6F5C]'>Email:</span>{' '}
              {submittedData.email}
            </p>
            <p className='border-b border-gray-200 pb-2'>
              <span className='font-semibold text-[#1E6F5C]'>Role:</span>{' '}
              {submittedData.role}
            </p>
            <p>
              <span className='font-semibold text-[#1E6F5C]'>Message:</span>{' '}
              {submittedData.query}
            </p>
          </div>
          <p className='mt-6 text-center text-gray-600'>We appreciate you reaching out and will respond soon!</p>
        </div>
      )}

      {/* Map Section */}
      <div className='max-w-6xl mx-auto mt-16 rounded-2xl overflow-hidden shadow-lg border-4 border-[#28B463] text-center'>
        <h2 className='text-4xl font-bold text-[#1E6F5C] pt-8 mb-4'>
          Our Location
        </h2>
        <iframe
          src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3878.674466059435!2d80.0240734745556!3d13.55555050180794!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4d773f1e0f8721%3A0xadb0842ffc2719e4!2sIndian%20Institute%20of%20Information%20Technology%2C%20Sri%20City%2C%20Chittoor!5e0!3m2!1sen!2sin!4v1760941438387!5m2!1sen!2sin'
          width='100%'
          height='450'
          allowFullScreen=''
          loading='lazy'
          referrerPolicy='no-referrer-when-downgrade'
          className='rounded-b-2xl'
        ></iframe>
      </div>
    </main>
  );
};

// Wrap the component with AuthProvider
const ContactPageWithAuth = () => {
  const location = useLocation();
  
  // Determine current role from path
  const getCurrentRole = () => {
    const path = location.pathname;
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/organization')) return 'organization';
    if (path.startsWith('/corporatepartner')) return 'corporatepartner';
    if (path.startsWith('/dietitian')) return 'dietitian';
    if (path.startsWith('/user')) return 'user';
    return null;
  };

  const currentRole = getCurrentRole();

  return (
    <AuthProvider currentRole={currentRole}>
      <ContactPage />
    </AuthProvider>
  );
};

export default ContactPageWithAuth;