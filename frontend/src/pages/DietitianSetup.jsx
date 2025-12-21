import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import axios from 'axios';
import { useAuthContext } from '../hooks/useAuthContext';

const DietitianSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  
  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('authToken_dietitian');
        
        if (!token) {
          return;
        }

        // Decode JWT to get roleId (the actual dietitian document ID)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.roleId; // Use roleId instead of userId
        
        if (!userId) {
          console.error('No roleId found in token');
          return;
        }

        const response = await axios.get(`/api/dietitians/profile/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.data.success) {
          setUserProfile(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };

    fetchUserProfile();
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting }, control, reset } = useForm({
    defaultValues: {
      // Step 1 - Dietitian Details
      name: user?.name || '',
      email: user?.email || '',
      age: user?.age || '',
      phone: user?.phone || '',
      specializationDomain: '',
      specialization: '',
      experience: '',
      fees: '',
      languages: '',
      location: '',
      consultationMode: [],
      about: '',
      education: '',
      // Step 2 - Professional Details
      title: '',
      description: '',
      specialties: '',
      infoEducation: '',
      expertise: '',
      certifications: [{ name: '', year: '', issuer: '' }],
      awards: [{ name: '', year: '', description: '' }],
      publications: [{ title: '', year: '', link: '' }],
      infoLanguages: '',
      consultationTypes: [{ type: '', duration: '', fee: '' }],
      workingDays: '',
      workingHoursStart: '',
      workingHoursEnd: '',
      linkedin: '',
      twitter: '',
    },
    mode: 'onBlur'
  });

  // Update form with fetched user data and auth context data
  useEffect(() => {
    const formData = {
      name: user?.name || userProfile?.name || '',
      email: user?.email || userProfile?.email || '',
      phone: user?.phone || userProfile?.phone || '',
      age: user?.age || userProfile?.age || '',
      specializationDomain: userProfile?.specializationDomain || '',
      specialization: Array.isArray(userProfile?.specialization) ? userProfile.specialization.join(', ') : '',
      experience: userProfile?.experience || '',
      fees: userProfile?.fees || '',
      languages: Array.isArray(userProfile?.languages) ? userProfile.languages.join(', ') : '',
      location: userProfile?.location || '',
      about: userProfile?.about || '',
      education: Array.isArray(userProfile?.education) ? userProfile.education.join(', ') : '',
      title: userProfile?.title || '',
      description: userProfile?.description || '',
      specialties: Array.isArray(userProfile?.specialties) ? userProfile.specialties.join(', ') : '',
      expertise: Array.isArray(userProfile?.expertise) ? userProfile.expertise.join(', ') : '',
      certifications: userProfile?.certifications || [{ name: '', year: '', issuer: '' }],
      awards: userProfile?.awards || [{ name: '', year: '', description: '' }],
      publications: userProfile?.publications || [{ title: '', year: '', link: '' }],
      consultationTypes: userProfile?.consultationTypes || [{ type: '', duration: '', fee: '' }],
      workingDays: userProfile?.availability?.workingDays?.join(', ') || '',
      workingHoursStart: userProfile?.availability?.workingHours?.start || '',
      workingHoursEnd: userProfile?.availability?.workingHours?.end || '',
      linkedin: userProfile?.socialMedia?.linkedin || '',
      twitter: userProfile?.socialMedia?.twitter || '',
    };

    reset(formData);
  }, [user, userProfile, reset]);

  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({
    control,
    name: 'certifications'
  });

  const { fields: awardFields, append: appendAward, remove: removeAward } = useFieldArray({
    control,
    name: 'awards'
  });

  const { fields: pubFields, append: appendPub, remove: removePub } = useFieldArray({
    control,
    name: 'publications'
  });

  const { fields: consultTypeFields, append: appendConsultType, remove: removeConsultType } = useFieldArray({
    control,
    name: 'consultationTypes'
  });

  const onSubmit = async (data) => {
    if (currentStep === 1) {
      setCurrentStep(2);
      console.log('Step 1 Data:', data);
    } else {
      setIsLoading(true);
      setError('');

      try {
        // Get user ID from JWT token (roleId)
        const token = localStorage.getItem('authToken_dietitian');
        if (!token) {
          setError('Authentication token not found. Please sign in.');
          return;
        }

        // Decode JWT to get roleId
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.roleId;

        if (!userId) {
          setError('User ID not found in token. Please sign in again.');
          return;
        }

        // Validate required fields
        if (!data.name || !data.email || !data.phone || !data.age) {
          setError('Basic information (name, email, phone, age) is required');
          return;
        }

        // Process the data to match schema
        const processedData = {
          name: data.name.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
          age: parseInt(data.age),
          specialization: data.specialization ? data.specialization.split(',').map(s => s.trim()).filter(s => s) : [],
          experience: parseInt(data.experience),
          fees: parseInt(data.fees),
          languages: data.languages ? data.languages.split(',').map(s => s.trim()).filter(s => s) : [],
          location: data.location?.trim(),
          online: data.onlineConsultation || false,
          offline: data.offlineConsultation || false,
          education: data.education ? data.education.split(',').map(s => s.trim()).filter(s => s) : [],
          about: data.about?.trim(),
          title: data.title?.trim(),
          description: data.description?.trim(),
          specialties: data.specialties ? data.specialties.split(',').map(s => s.trim()).filter(s => s) : [],
          expertise: data.expertise ? data.expertise.split(',').map(s => s.trim()).filter(s => s) : [],
          certifications: data.certifications?.filter(cert => cert.name?.trim() && cert.year && cert.issuer?.trim()) || [],
          awards: data.awards?.filter(award => award.name?.trim() && award.year && award.description?.trim()) || [],
          publications: data.publications?.filter(pub => pub.title?.trim() && pub.year && pub.link?.trim()) || [],
          consultationTypes: data.consultationTypes?.filter(ct => ct.type?.trim() && ct.duration && ct.fee) || [],
          availability: {
            workingDays: data.workingDays ? data.workingDays.split(',').map(s => s.trim()).filter(s => s) : [],
            workingHours: {
              start: data.workingHoursStart?.trim(),
              end: data.workingHoursEnd?.trim()
            }
          },
          socialMedia: {
            linkedin: data.linkedin?.trim(),
            twitter: data.twitter?.trim()
          }
        };

        console.log('Submitting dietitian profile data:', processedData);

        // Send POST request to setup profile
        const response = await axios.post(`/api/dietitian-profile-setup/${userId}`, processedData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          // Success - redirect to dietitian dashboard instead of document upload
          alert('✅ Profile setup completed successfully! Welcome to your dashboard.');
          // Redirect to dietitian profile/dashboard
          navigate('/dietitian/profile');
        } else {
          setError(response.data.message || 'Profile update failed');
        }
      } catch (err) {
        console.error('Profile update error:', err);
        setError(err.response?.data?.message || 'An error occurred during profile setup');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-[#27AE60] mb-2">
            <i className="fas fa-user-md mr-3"></i>Dietitian Profile Setup
          </h1>
          <p className="text-gray-600">Step {currentStep} of 2 - Complete your professional profile</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex gap-4 mb-4">
            <div className={`flex-1 h-2 rounded ${currentStep >= 1 ? 'bg-[#27AE60]' : 'bg-gray-300'}`}></div>
            <div className={`flex-1 h-2 rounded ${currentStep >= 2 ? 'bg-[#27AE60]' : 'bg-gray-300'}`}></div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-xl p-12">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <i className="fas fa-exclamation-triangle mr-2"></i>{error}
            </div>
          )}
          {/* ========== STEP 1: DIETITIAN DETAILS ========== */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-8 pb-4 border-b-3 border-[#27AE60]">
                <i className="fas fa-id-card mr-3 text-[#27AE60]"></i>Dietitian Details
              </h2>

              {/* Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#27AE60] transition-all`}
                    placeholder="e.g., John Doe"
                  />
                  {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name.message}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email * 
                    <span className="text-xs text-gray-500 ml-2">(From signup - read only)</span>
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-100 cursor-not-allowed transition-all"
                    placeholder="e.g., john@example.com"
                    readOnly
                  />
                  {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email.message}</span>}
                </div>
              </div>

              {/* Age & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age * 
                    <span className="text-xs text-gray-500 ml-2">(From signup)</span>
                  </label>
                  <input
                    type="number"
                    {...register('age', { required: 'Age is required', min: { value: 18, message: 'Must be at least 18' } })}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${errors.age ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#27AE60] transition-all`}
                    placeholder="e.g., 30"
                  />
                  {errors.age && <span className="text-red-500 text-sm mt-1">{errors.age.message}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number * 
                    <span className="text-xs text-gray-500 ml-2">(From signup - read only)</span>
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-100 cursor-not-allowed transition-all"
                    placeholder="e.g., 9876543210"
                    readOnly
                  />
                  {errors.phone && <span className="text-red-500 text-sm mt-1">{errors.phone.message}</span>}
                </div>
              </div>

              {/* Specializations */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Specializations (comma-separated) *</label>
                <input
                  type="text"
                  {...register('specialization', { required: 'Specializations are required' })}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${errors.specialization ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#27AE60] transition-all`}
                  placeholder="e.g., Diabetes, Weight Loss"
                />
                {errors.specialization && <span className="text-red-500 text-sm mt-1">{errors.specialization.message}</span>}
              </div>

              {/* Experience & Fees */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Experience (years) *</label>
                  <input
                    type="number"
                    {...register('experience', { required: 'Experience is required', min: { value: 0, message: '0 or more' } })}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${errors.experience ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#27AE60] transition-all`}
                    placeholder="e.g., 5"
                    min="0"
                  />
                  {errors.experience && <span className="text-red-500 text-sm mt-1">{errors.experience.message}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Consultation Fees *</label>
                  <input
                    type="number"
                    {...register('fees', { required: 'Fees are required', min: { value: 0 } })}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${errors.fees ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#27AE60] transition-all`}
                    placeholder="e.g., 100"
                    min="0"
                  />
                  {errors.fees && <span className="text-red-500 text-sm mt-1">{errors.fees.message}</span>}
                </div>
              </div>

              {/* Languages & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Languages (comma-separated) *</label>
                  <input
                    type="text"
                    {...register('languages', { required: 'Languages are required' })}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${errors.languages ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#27AE60] transition-all`}
                    placeholder="e.g., English, Spanish"
                  />
                  {errors.languages && <span className="text-red-500 text-sm mt-1">{errors.languages.message}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                  <input
                    type="text"
                    {...register('location', { required: 'Location is required' })}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${errors.location ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#27AE60] transition-all`}
                    placeholder="e.g., New York"
                  />
                  {errors.location && <span className="text-red-500 text-sm mt-1">{errors.location.message}</span>}
                </div>
              </div>

              {/* Consultation Mode */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-4">Consultation Mode *</label>
                <div className="flex gap-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('onlineConsultation')} className="w-5 h-5 text-[#27AE60]" />
                    <span className="text-gray-700">Online</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('offlineConsultation')} className="w-5 h-5 text-[#27AE60]" />
                    <span className="text-gray-700">Offline</span>
                  </label>
                </div>
              </div>

              {/* Education */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Education (comma-separated) *</label>
                <input
                  type="text"
                  {...register('education', { required: 'Education is required' })}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${errors.education ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#27AE60] transition-all`}
                  placeholder="e.g., BS Nutrition, MS Dietetics"
                />
                {errors.education && <span className="text-red-500 text-sm mt-1">{errors.education.message}</span>}
              </div>

              {/* About */}
              <div className="mb-10">
                <label className="block text-sm font-semibold text-gray-700 mb-2">About You</label>
                <textarea
                  {...register('about')}
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-[#27AE60] transition-all"
                  placeholder="Brief description about yourself"
                />
              </div>

              {/* Step 1 Buttons */}
              <div className="flex gap-4 justify-end pt-6 border-t-2 border-gray-200">
                <button type="button" onClick={() => navigate(-1)} className="px-8 py-3 rounded-lg border-2 border-gray-400 text-gray-700 font-bold hover:bg-gray-100 transition-all">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-8 py-3 rounded-lg bg-[#27AE60] text-white font-bold hover:bg-[#1e8449] transition-all disabled:opacity-50">{isSubmitting ? 'Processing...' : 'Next'}</button>
              </div>
            </div>
          )}

          {/* ========== STEP 2: PROFESSIONAL DETAILS ========== */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-8 pb-4 border-b-3 border-[#27AE60]">
                <i className="fas fa-briefcase mr-3 text-[#27AE60]"></i>Professional Details
              </h2>

              {/* Title & Description */}
              <div className="grid grid-cols-1 gap-8 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Professional Title *</label>
                  <input type="text" {...register('title', { required: 'Title is required' })} className={`w-full px-4 py-3 rounded-lg border-2 ${errors.title ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#27AE60] transition-all`} placeholder="e.g., Registered Dietitian" />
                  {errors.title && <span className="text-red-500 text-sm mt-1">{errors.title.message}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Professional Description *</label>
                  <textarea {...register('description', { required: 'Description is required' })} rows="4" className={`w-full px-4 py-3 rounded-lg border-2 ${errors.description ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#27AE60] transition-all`} placeholder="Detailed professional background" />
                  {errors.description && <span className="text-red-500 text-sm mt-1">{errors.description.message}</span>}
                </div>
              </div>

              {/* Specialties & Education */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Specialties (comma-separated) *</label>
                  <input type="text" {...register('specialties', { required: 'Specialties are required' })} className={`w-full px-4 py-3 rounded-lg border-2 ${errors.specialties ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#27AE60] transition-all`} placeholder="e.g., Clinical Nutrition, Wellness" />
                  {errors.specialties && <span className="text-red-500 text-sm mt-1">{errors.specialties.message}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Education (comma-separated) *</label>
                  <input type="text" {...register('infoEducation', { required: 'Education is required' })} className={`w-full px-4 py-3 rounded-lg border-2 ${errors.infoEducation ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#27AE60] transition-all`} placeholder="e.g., PhD Nutrition, RD Certification" />
                  {errors.infoEducation && <span className="text-red-500 text-sm mt-1">{errors.infoEducation.message}</span>}
                </div>
              </div>

              {/* Expertise & Languages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Expertise (comma-separated) *</label>
                  <input type="text" {...register('expertise', { required: 'Expertise is required' })} className={`w-full px-4 py-3 rounded-lg border-2 ${errors.expertise ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#27AE60] transition-all`} placeholder="e.g., Meal Planning, Nutritional Counseling" />
                  {errors.expertise && <span className="text-red-500 text-sm mt-1">{errors.expertise.message}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Languages (comma-separated) *</label>
                  <input type="text" {...register('infoLanguages', { required: 'Languages are required' })} className={`w-full px-4 py-3 rounded-lg border-2 ${errors.infoLanguages ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#27AE60] transition-all`} placeholder="e.g., French, German" />
                  {errors.infoLanguages && <span className="text-red-500 text-sm mt-1">{errors.infoLanguages.message}</span>}
                </div>
              </div>

              {/* Certifications */}
              <div className="mb-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800"><i className="fas fa-certificate mr-2 text-blue-600"></i>Certifications</h3>
                  <button type="button" onClick={() => appendCert({ name: '', year: '', issuer: '' })} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ Add</button>
                </div>
                {certFields.map((field, i) => (
                  <div key={field.id} className="mb-4 p-4 bg-white rounded-lg border border-gray-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <input type="text" {...register(`certifications.${i}.name`)} placeholder="Certification Name" className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-[#27AE60]" />
                      <input type="number" {...register(`certifications.${i}.year`)} placeholder="Year" min="1900" max={new Date().getFullYear()} className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-[#27AE60]" />
                      <input type="text" {...register(`certifications.${i}.issuer`)} placeholder="Issuer" className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-[#27AE60]" />
                    </div>
                    {certFields.length > 1 && <button type="button" onClick={() => removeCert(i)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Remove</button>}
                  </div>
                ))}
              </div>

              {/* Awards */}
              <div className="mb-8 p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800"><i className="fas fa-star mr-2 text-purple-600"></i>Awards</h3>
                  <button type="button" onClick={() => appendAward({ name: '', year: '', description: '' })} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">+ Add</button>
                </div>
                {awardFields.map((field, i) => (
                  <div key={field.id} className="mb-4 p-4 bg-white rounded-lg border border-gray-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <input type="text" {...register(`awards.${i}.name`)} placeholder="Award Name" className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-[#27AE60]" />
                      <input type="number" {...register(`awards.${i}.year`)} placeholder="Year" min="1900" max={new Date().getFullYear()} className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-[#27AE60]" />
                      <input type="text" {...register(`awards.${i}.description`)} placeholder="Description" className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-[#27AE60]" />
                    </div>
                    {awardFields.length > 1 && <button type="button" onClick={() => removeAward(i)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Remove</button>}
                  </div>
                ))}
              </div>

              {/* Publications */}
              <div className="mb-8 p-6 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800"><i className="fas fa-book mr-2 text-green-600"></i>Publications</h3>
                  <button type="button" onClick={() => appendPub({ title: '', year: '', link: '' })} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">+ Add</button>
                </div>
                {pubFields.map((field, i) => (
                  <div key={field.id} className="mb-4 p-4 bg-white rounded-lg border border-gray-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <input type="text" {...register(`publications.${i}.title`)} placeholder="Publication Title" className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-[#27AE60]" />
                      <input type="number" {...register(`publications.${i}.year`)} placeholder="Year" min="1900" max={new Date().getFullYear()} className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-[#27AE60]" />
                      <input type="text" {...register(`publications.${i}.link`)} placeholder="Link/URL" className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-[#27AE60]" />
                    </div>
                    {pubFields.length > 1 && <button type="button" onClick={() => removePub(i)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Remove</button>}
                  </div>
                ))}
              </div>

              {/* Consultation Types */}
              <div className="mb-8 p-6 bg-orange-50 rounded-lg border-2 border-orange-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800"><i className="fas fa-comments mr-2 text-orange-600"></i>Consultation Types</h3>
                  <button type="button" onClick={() => appendConsultType({ type: '', duration: '', fee: '' })} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">+ Add</button>
                </div>
                {consultTypeFields.map((field, i) => (
                  <div key={field.id} className="mb-4 p-4 bg-white rounded-lg border border-gray-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <input type="text" {...register(`consultationTypes.${i}.type`)} placeholder="Type (e.g., Initial)" className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-[#27AE60]" />
                      <input type="number" {...register(`consultationTypes.${i}.duration`)} placeholder="Duration (min)" min="1" className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-[#27AE60]" />
                      <input type="number" {...register(`consultationTypes.${i}.fee`)} placeholder="Fee" min="0" className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-[#27AE60]" />
                    </div>
                    {consultTypeFields.length > 1 && <button type="button" onClick={() => removeConsultType(i)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Remove</button>}
                  </div>
                ))}
              </div>

              {/* Working Hours */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Working Days (comma-separated) *</label>
                  <input type="text" {...register('workingDays', { required: 'Working days are required' })} className={`w-full px-4 py-3 rounded-lg border-2 ${errors.workingDays ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#27AE60] transition-all`} placeholder="e.g., Monday, Tuesday" />
                  {errors.workingDays && <span className="text-red-500 text-sm mt-1">{errors.workingDays.message}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Working Hours Start (HH:MM) *</label>
                  <input type="text" {...register('workingHoursStart', { required: 'Start time is required', pattern: { value: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, message: 'Format: HH:MM' } })} className={`w-full px-4 py-3 rounded-lg border-2 ${errors.workingHoursStart ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#27AE60] transition-all`} placeholder="e.g., 09:00" />
                  {errors.workingHoursStart && <span className="text-red-500 text-sm mt-1">{errors.workingHoursStart.message}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Working Hours End (HH:MM) *</label>
                  <input type="text" {...register('workingHoursEnd', { required: 'End time is required', pattern: { value: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, message: 'Format: HH:MM' } })} className={`w-full px-4 py-3 rounded-lg border-2 ${errors.workingHoursEnd ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#27AE60] transition-all`} placeholder="e.g., 17:00" />
                  {errors.workingHoursEnd && <span className="text-red-500 text-sm mt-1">{errors.workingHoursEnd.message}</span>}
                </div>
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn URL</label>
                  <input type="text" {...register('linkedin')} className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-[#27AE60] transition-all" placeholder="https://linkedin.com/in/username" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Twitter URL</label>
                  <input type="text" {...register('twitter')} className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-[#27AE60] transition-all" placeholder="https://twitter.com/username" />
                </div>
              </div>

              {/* Step 2 Buttons */}
              <div className="flex gap-4 justify-end pt-6 border-t-2 border-gray-200">
                <button type="button" onClick={() => setCurrentStep(1)} className="px-8 py-3 rounded-lg border-2 border-gray-400 text-gray-700 font-bold hover:bg-gray-100 transition-all">Previous</button>
                <button type="submit" disabled={isSubmitting || isLoading} className="px-8 py-3 rounded-lg bg-[#27AE60] text-white font-bold hover:bg-[#1e8449] transition-all disabled:opacity-50 flex items-center gap-2"><i className="fas fa-save"></i>{isSubmitting || isLoading ? 'Submitting...' : 'Submit'}</button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default DietitianSetup;
