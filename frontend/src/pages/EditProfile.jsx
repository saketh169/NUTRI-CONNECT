import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useProfile } from '../contexts/ProfileContext';

// Yup validation schema builder based on role fields
const getValidationSchema = (fields) => {
  const schemaShape = {};
  
  if (fields.includes('name')) {
    schemaShape.name = yup.string().min(5, 'Name must be at least 5 characters').required('Name is required');
  }
  
  if (fields.includes('phone')) {
    schemaShape.phone = yup
      .string()
      .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits')
      .required('Phone number is required');
  }
  
  if (fields.includes('dob')) {
    schemaShape.dob = yup.string().required('Date of birth is required');
  }
  
  if (fields.includes('gender')) {
    schemaShape.gender = yup.string().required('Gender is required');
  }
  
  if (fields.includes('address')) {
    schemaShape.address = yup.string().min(5, 'Address must be at least 5 characters').required('Address is required');
  }
  
  if (fields.includes('age')) {
    schemaShape.age = yup
      .number()
      .typeError('Age must be a number')
      .min(18, 'Age must be at least 18')
      .max(100, 'Age must be less than 100')
      .required('Age is required');
  }
  
  return yup.object().shape(schemaShape);
};

const EditProfile = () => {
  const navigate = useNavigate();
  const {
    originalData,
    isLoading,
    isFetching,
    message,
    config,
    fetchProfileData,
    updateProfile,
    resetProfileData,
    initializeRole
  } = useProfile();

  // Initialize role and config
  useEffect(() => {
    initializeRole();
  }, [initializeRole]);

  // React Hook Form with Yup validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch
  } = useForm({
    resolver: config ? yupResolver(getValidationSchema(config.fields)) : undefined,
    mode: 'onBlur'
  });

  // Watch DOB field to calculate age
  const dobValue = watch('dob');
  const [calculatedAge, setCalculatedAge] = useState(null);

  // Calculate age from DOB
  useEffect(() => {
    if (dobValue) {
      const birthDate = new Date(dobValue);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      setCalculatedAge(age);
    } else {
      setCalculatedAge(null);
    }
  }, [dobValue]);
  
  // Fetch user details on component mount
  useEffect(() => {
    const loadProfile = async () => {
      const data = await fetchProfileData();
      if (data) {
        // Set form values
        Object.keys(data).forEach(key => {
          setValue(key, data[key]);
        });
      }
    };
    
    loadProfile();
  }, [fetchProfileData, setValue]);

  const onSubmit = async (data) => {
    await updateProfile(data);
  };

  const handleReset = () => {
    reset(originalData);
    resetProfileData();
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-emerald-600 mb-4"></i>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-emerald-600 mb-4"></i>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="w-[70%] mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-emerald-600">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(config.dashboardPath)}
              className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition mb-4"
            >
              <i className="fas fa-arrow-left"></i>
              <span>Back to Dashboard</span>
            </button>
            <h2 className="text-3xl font-bold text-teal-900">Edit Profile</h2>
            <p className="text-gray-600 mt-2">Update your {config.roleLabel.toLowerCase()} information</p>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`p-4 mb-6 rounded-lg ${
                message.includes('Error') || message.includes('Failed')
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : message.includes('No changes')
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  : 'bg-green-100 text-green-800 border border-green-300'
              }`}
            >
              {message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Full Name */}
              {config.fields.includes('name') && (
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register('name')}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-emerald-600`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
              )}

              {/* Email (Read-only) */}
              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Phone */}
              {config.fields.includes('phone') && (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    {...register('phone')}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-emerald-600`}
                    placeholder="10-digit phone number"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
              )}

              {/* Date of Birth (User only) */}
              {config.fields.includes('dob') && (
                <div>
                  <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    id="dob"
                    {...register('dob')}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.dob ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-emerald-600`}
                  />
                  {calculatedAge !== null && (
                    <p className="text-emerald-600 text-sm mt-1 font-medium">
                      <i className="fas fa-calendar-check mr-1"></i>
                      Age: {calculatedAge} years
                    </p>
                  )}
                  {errors.dob && (
                    <p className="text-red-500 text-sm mt-1">{errors.dob.message}</p>
                  )}
                </div>
              )}

              {/* Age (Dietitian only) */}
              {config.fields.includes('age') && (
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    id="age"
                    {...register('age')}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.age ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-emerald-600`}
                    placeholder="Enter your age"
                  />
                  {errors.age && (
                    <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>
                  )}
                </div>
              )}

              {/* Gender (User only) */}
              {config.fields.includes('gender') && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="male"
                        {...register('gender')}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-600"
                      />
                      <span className="text-gray-700">Male</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="female"
                        {...register('gender')}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-600"
                      />
                      <span className="text-gray-700">Female</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="other"
                        {...register('gender')}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-600"
                      />
                      <span className="text-gray-700">Other</span>
                    </label>
                  </div>
                  {errors.gender && (
                    <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
                  )}
                </div>
              )}

              {/* Address */}
              {config.fields.includes('address') && (
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    id="address"
                    rows="3"
                    {...register('address')}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none`}
                    placeholder="Enter your complete address"
                  ></textarea>
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Updating Profile...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition"
              >
                <i className="fas fa-undo mr-2"></i>
                Reset
              </button>
              <button
                type="button"
                onClick={() => navigate(config.dashboardPath)}
                className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-sm font-semibold text-green-900 mb-2">
              <i className="fas fa-info-circle mr-2"></i>
              Profile Update Information
            </h3>
            <ul className="text-xs text-green-800 space-y-1 list-disc list-inside">
              <li>Your email address cannot be changed</li>
              <li>All fields marked with * are required</li>
              <li>Changes will be saved immediately after submission</li>
              <li>Click "Reset" to restore original values</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
