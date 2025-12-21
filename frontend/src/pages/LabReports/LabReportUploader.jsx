import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Heart, Leaf, TestTube, Factory, Activity, Upload, Scale, TrendingUp, Calendar, Droplet, Eye, CheckCircle, X } from 'lucide-react';
import AuthContext from '../../contexts/AuthContext';
import { useContext } from 'react';
import axios from 'axios';

// --- Icon components for the category buttons ---
const CategoryIcon = ({ icon, label, isActive, onClick }) => {
  const Icon = icon;
  return (
    <button
      onClick={onClick}
      className={`
      flex flex-col items-center justify-center p-4 m-2 w-36 h-36 md:w-40 md:h-40 text-center rounded-xl transition-all duration-300 transform shadow-lg
      ${isActive
        ? 'bg-emerald-600 text-white ring-4 ring-emerald-300 scale-[1.02] shadow-emerald-500/50'
        : 'bg-white text-gray-700 hover:bg-emerald-50 hover:shadow-xl border border-emerald-100'
      }
      `}
    >
      <Icon className={`w-12 h-12 mb-2 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
      <span className="text-sm font-semibold mt-1">{label}</span>
    </button>
  );
};

// --- Reusable Form Input Component (Now uses React Hook Form register) ---
const FormInput = ({ label, type = 'text', required = false, unit = '', onView, ...registerProps }) => {
  const isFile = type === 'file';
  const [filePreview, setFilePreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleViewFile = () => {
    const input = document.querySelector(`input[name="${registerProps.name}"]`);
    if (input && input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview({
          dataUrl: e.target.result,
          mime: file.type,
          name: file.name
        });
        setShowPreview(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setFilePreview(null);
  };

  return (
    <>
      <div className="flex flex-col space-y-1">
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>} {unit && <span className="text-gray-500">({unit})</span>}
        </label>
        {isFile ? (
          <div className="flex flex-col space-y-2">
            <input
              type="file"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200"
              required={required}
              {...registerProps}
            />
            {onView && (
              <button
                type="button"
                onClick={handleViewFile}
                className="text-sm text-emerald-600 hover:text-emerald-800 underline self-start"
              >
                Preview selected file
              </button>
            )}
          </div>
        ) : (
          <input
            type={type}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-150"
            required={required}
            {...registerProps}
          />
        )}
      </div>

      {/* File Preview Modal */}
      {showPreview && filePreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-full lg:max-w-6xl w-full mx-4 flex flex-col overflow-hidden border border-slate-200" style={{ height: '600px' }}>
            <div className="p-6 border-b border-slate-200 bg-linear-to-r from-slate-50 to-emerald-50 rounded-t-3xl flex justify-between items-center">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-100 rounded-xl mr-3">
                  <i className="fas fa-file-alt text-emerald-600"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  File Preview - {filePreview.name}
                </h3>
              </div>
              <button
                onClick={closePreview}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="grow p-6 overflow-y-auto bg-slate-50" style={{ height: 'calc(600px - 80px)' }}>
              {filePreview.mime?.startsWith('image/') ? (
                <div className="bg-white p-4 rounded-2xl shadow-sm h-full">
                  <img
                    src={filePreview.dataUrl}
                    alt="File Preview"
                    className="w-full h-full object-contain mx-auto rounded-xl"
                  />
                </div>
              ) : filePreview.mime === 'application/pdf' ? (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-full">
                  <iframe
                    src={filePreview.dataUrl}
                    title="File Preview"
                    className="w-full h-full border-none"
                    allow="fullscreen"
                  ></iframe>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-2xl shadow-sm h-full flex items-center justify-center">
                  <div className="text-center">
                    <i className="fas fa-file text-6xl text-slate-400 mb-4"></i>
                    <p className="text-slate-600 text-lg">Preview not available for this file type</p>
                    <p className="text-slate-500 text-sm mt-2">File: {filePreview.name}</p>
                    <p className="text-slate-500 text-sm">Type: {filePreview.mime}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};// --- The Main Application Component ---
const LabReportUploader = () => {
  // Initialize the form using React Hook Form
  const { register, handleSubmit, setValue } = useForm();
  const navigate = useNavigate();
  const { dietitianId } = useParams();
  const { user } = useContext(AuthContext);
 
  // === NEW STATE: Array to track active forms in order of selection ===
  const [activeFormsOrder, setActiveFormsOrder] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Populate form with user data on component mount
  useEffect(() => {
    if (user) {
      setValue('clientName', user.name || '');
      setValue('clientAge', user.age || '');
      setValue('clientPhone', user.phone || '');
      setValue('clientAddress', user.address || '');
    }
  }, [user, setValue]);

  // Clear notification on unmount
  useEffect(() => {
    return () => {
      setNotification(null);
    };
  }, []);

  // Display user information in console
  useEffect(() => {
    console.log('=== Lab Report Uploader ===');
    console.log('Client Name:', user?.name || 'Not available');
    console.log('Client ID:', user?.id || user?._id || 'Not available');
    console.log('Dietitian ID:', dietitianId || 'Not available');
    console.log('Client Details:', {
      name: user?.name,
      id: user?.id || user?._id,
      email: user?.email,
      role: user?.role
    });
    console.log('Dietitian Details:', {
      dietitianId: dietitianId
    });
  }, [user, dietitianId]);

  const categories = useMemo(() => [
    { id: 'Hormonal_Issues', label: 'Hormonal Issues', icon: TrendingUp, description: 'Enter specific metrics for endocrine and reproductive health.' },
    { id: 'Fitness_Metrics', label: 'Fitness & Body Metrics', icon: Scale, description: 'Key body composition and lifestyle data for weight goals.' },
    { id: 'General_Reports', label: 'General Checkup', icon: TestTube, description: 'Upload your primary health screening report and fill in key metrics.' },
    { id: 'Blood_Sugar_Focus', label: 'Blood & Sugar Focus', icon: Droplet, description: 'Detailed reports and values for glucose and lipids.' },
    { id: 'Thyroid', label: 'Thyroid', icon: Factory, description: 'Detailed thyroid panel results (TSH, Free T4, Antibodies) and related reports.' },
    { id: 'Cardiovascular', label: 'Heart & Cardiac', icon: Heart, description: 'Cardiovascular health, blood pressure, and ECG details.' },
  ], []);

  // === NEW LOGIC: Toggles a form and maintains the order array ===
  const toggleCategory = useCallback((categoryId) => {
    setActiveFormsOrder(prevOrder => {
      const index = prevOrder.indexOf(categoryId);
      if (index > -1) {
        // Form is active: Remove it
        const newOrder = [...prevOrder];
        newOrder.splice(index, 1);
        return newOrder;
      } else {
        // Form is inactive: Add it to the end and scroll to it
        const newOrder = [...prevOrder, categoryId];
        // Scroll to the form section after a short delay to allow rendering
        setTimeout(() => {
          const formSection = document.getElementById(`form-section-${categoryId}`);
          if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        return newOrder;
      }
    });
  }, []);


  // Submission handler function
  const onSubmit = async (data) => {
    console.log('Form data received:', data);
    console.log('Active forms order:', activeFormsOrder);

    if (activeFormsOrder.length === 0) {
      alert('Please select at least one category to submit.');
      return;
    }

    setSubmitting(true);
    try {
      // Create FormData for file uploads
      const formData = new FormData();

      // Add basic client information
      formData.append('clientName', data.clientName);
      formData.append('clientAge', data.clientAge);
      formData.append('clientPhone', data.clientPhone);
      formData.append('clientAddress', data.clientAddress);
      formData.append('submittedCategories', JSON.stringify(activeFormsOrder));
      
      // Add user ID from AuthContext
      // NOTE: Both userId and dietitianId are stored in the schema
      // Schema fields: userId (references User), dietitianId (references Dietitian)
      if (user?.id || user?._id) {
        formData.append('clientId', user.id || user._id); // Keep clientId for backward compatibility in request
        console.log('Using authenticated user ID:', user.id || user._id);
      } else {
        console.warn('No user ID available from AuthContext');
      }

      // Add dietitian ID from URL params
      if (dietitianId) {
        formData.append('dietitianId', dietitianId);
        console.log('Using dietitian ID from URL:', dietitianId);
      }

      console.log('Basic client info added to FormData');

      // Add category-specific data
      activeFormsOrder.forEach(category => {
        console.log(`Processing category: ${category}`);
        switch (category) {
          case 'Hormonal_Issues':
            if (data.testosteroneTotal) formData.append('testosteroneTotal', data.testosteroneTotal);
            if (data.dheaS) formData.append('dheaS', data.dheaS);
            if (data.cortisol) formData.append('cortisol', data.cortisol);
            if (data.vitaminD) formData.append('vitaminD', data.vitaminD);
            break;
          case 'Fitness_Metrics':
            if (data.heightCm) formData.append('heightCm', data.heightCm);
            if (data.currentWeight) formData.append('currentWeight', data.currentWeight);
            if (data.bodyFatPercentage) formData.append('bodyFatPercentage', data.bodyFatPercentage);
            if (data.activityLevel) formData.append('activityLevel', data.activityLevel);
            if (data.additionalInfo) formData.append('additionalInfo', data.additionalInfo);
            break;
          case 'General_Reports':
            if (data.dateOfReport) formData.append('dateOfReport', data.dateOfReport);
            if (data.bmiValue) formData.append('bmiValue', data.bmiValue);
            break;
          case 'Blood_Sugar_Focus':
            if (data.fastingGlucose) formData.append('fastingGlucose', data.fastingGlucose);
            if (data.hba1c) formData.append('hba1c', data.hba1c);
            if (data.cholesterolTotal) formData.append('cholesterolTotal', data.cholesterolTotal);
            if (data.triglycerides) formData.append('triglycerides', data.triglycerides);
            break;
          case 'Thyroid':
            if (data.tsh) formData.append('tsh', data.tsh);
            if (data.freeT4) formData.append('freeT4', data.freeT4);
            if (data.reverseT3) formData.append('reverseT3', data.reverseT3);
            if (data.thyroidAntibodies) formData.append('thyroidAntibodies', data.thyroidAntibodies);
            break;
          case 'Cardiovascular':
            if (data.systolicBP) formData.append('systolicBP', data.systolicBP);
            if (data.diastolicBP) formData.append('diastolicBP', data.diastolicBP);
            if (data.spO2) formData.append('spO2', data.spO2);
            if (data.restingHeartRate) formData.append('restingHeartRate', data.restingHeartRate);
            break;
        }
      });

      console.log('Category-specific data added to FormData');

      // Add files
      const fileFields = [
        'hormonalProfileReport', 'endocrineReport', 'generalHealthReport',
        'bloodTestReport', 'bloodSugarReport', 'diabetesReport',
        'thyroidReport', 'cardiacHealthReport', 'cardiovascularReport', 'ecgReport'
      ];

      fileFields.forEach(fieldName => {
        if (data[fieldName] && data[fieldName][0]) {
          console.log(`Adding file: ${fieldName}`, data[fieldName][0]);
          formData.append(fieldName, data[fieldName][0]);
        }
      });

      console.log('Files added to FormData');

      // Log FormData contents (for debugging)
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      // Submit to backend
      console.log('Submitting to backend...');
      
      // Get auth token from localStorage
      const role = user?.role || 'user'; // Default to 'user' if role not available
      const token = localStorage.getItem(`authToken_${role}`);
      
      const response = await axios.post('/api/lab-reports/lab/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : undefined
        }
      });

      console.log('Backend response:', response.data);

      if (response.data.success) {
        console.log('Lab report submitted successfully');
        
        // Show success notification
        setNotification({
          type: 'success',
          message: 'Your lab report has been submitted successfully!'
        });

        // Redirect to report history after a brief delay
        setTimeout(() => {
          navigate(`/user/lab-reports/${dietitianId}`);
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to submit lab report');
      }

    } catch (error) {
      console.error('Error submitting lab report:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit lab report. Please try again.';
      
      // Show error notification
      setNotification({
        type: 'error',
        message: errorMessage
      });

      // Hide error notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } finally {
      setSubmitting(false);
    }
  };

  // Function to handle simulated file viewing
  const handleViewFile = useCallback((filename) => {
    // This function is now handled within FormInput component
    console.log('File preview handled by FormInput component:', filename);
  }, []);
  // --- Centralized Form Rendering Function ---
  const renderFormContent = useCallback((categoryId) => {
    // Find the category metadata for title and description
    const categoryMeta = categories.find(c => c.id === categoryId);

    // Default structure for every form section
    const FormWrapper = ({ description, children }) => (
      <>
        <h2 className="text-2xl font-bold text-emerald-800 mb-2 flex items-center">
          <span className="mr-2">
            <categoryMeta.icon className='w-8 h-8' />
          </span>
          {categoryMeta.label} - Details
        </h2>
        <p className="text-gray-600 mb-6 border-b border-emerald-200 pb-4">{description}</p>
        {children}
      </>
    );

    switch (categoryId) {
     
      case 'Hormonal_Issues': 
        return (
          <FormWrapper {...categoryMeta}>
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Hormonal Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormInput label="Total Testosterone" type="number" unit="ng/dL" {...register('testosteroneTotal')} />
                <FormInput label="DHEA-S" type="number" unit="μg/dL" {...register('dheaS')} />
                <FormInput label="Cortisol (AM)" type="number" unit="nmol/L" {...register('cortisol')} />
                <FormInput label="Vitamin D" type="number" unit="ng/mL" {...register('vitaminD')} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <FormInput 
                  label="Upload Hormonal Profile Report" 
                  type="file" 
                  onView={handleViewFile} 
                  {...register('hormonalProfileReport')} 
                />
                <FormInput 
                  label="Upload General Endocrine Report" 
                  type="file" 
                  onView={handleViewFile} 
                  {...register('endocrineReport')} 
                />
              </div>
            </div>
          </FormWrapper>
        );      case 'Fitness_Metrics':
        return (
          <FormWrapper {...categoryMeta}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput label="Height" type="number" unit="cm" {...register('heightCm')} />
              <FormInput label="Current Weight" type="number" unit="kg" {...register('currentWeight')} />
              <FormInput label="Body Fat Percentage" type="number" unit="%" {...register('bodyFatPercentage')} />
             
              {/* Activity Level - using register props directly on select */}
              <div className="flex flex-col space-y-1">
                <label htmlFor="activityLevel" className="text-sm font-medium text-gray-700">Activity Level</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-150"
                  {...register('activityLevel')} 
                >
                  <option value="">Select Level</option>
                  <option value="sedentary">Sedentary (Little or no exercise)</option>
                  <option value="light">Lightly Active (1-3 days/week)</option>
                  <option value="moderate">Moderately Active (3-5 days/week)</option>
                  <option value="very">Very Active (6-7 days/week)</option>
                  <option value="extra">Extra Active (2x per day/training)</option>
                </select>
              </div>
             
              {/* Additional Info - using register props directly on textarea */}
              <div className="flex flex-col space-y-1 md:col-span-2">
                <label htmlFor="additionalInfo" className="text-sm font-medium text-gray-700">Additional Health Information (E.g., Allergies, Medications)</label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-150"
                  {...register('additionalInfo')}
                />
              </div>
            </div>
          </FormWrapper>
        );

      case 'General_Reports':
        return (
          <FormWrapper {...categoryMeta}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormInput label="Date of Latest Report" type="date" {...register('dateOfReport')} />
                <FormInput label="BMI Value" type="number" unit="kg/m²" {...register('bmiValue')} />
                <FormInput label="Weight at Time of Report" type="number" unit="kg" {...register('currentWeight')} />
                <FormInput label="Height at Time of Report" type="number" unit="cm" {...register('heightCm')} />
              </div>
              <FormInput
                label="Upload General Health Report (PDF/Image)"
                type="file"
                onView={handleViewFile} 
                {...register('generalHealthReport')}
              />
            </div>
          </FormWrapper>
        );

      case 'Blood_Sugar_Focus':
        return (
          <FormWrapper {...categoryMeta}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormInput label="Fasting Glucose" type="number" unit="mg/dL" {...register('fastingGlucose')} />
                <FormInput label="HbA1c" type="number" unit="\%" {...register('hba1c')} />
                <FormInput label="Total Cholesterol" type="number" unit="mg/dL" {...register('cholesterolTotal')} />
                <FormInput label="Triglycerides" type="number" unit="mg/dL" {...register('triglycerides')} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormInput 
                  label="Upload General Blood Test Report" 
                  type="file" 
                  onView={handleViewFile} 
                  {...register('bloodTestReport')} 
                />
                <FormInput 
                  label="Upload Blood Sugar Report (Fasting/PP)" 
                  type="file" 
                  onView={handleViewFile} 
                  {...register('bloodSugarReport')} 
                />
                <FormInput 
                  label="Upload Diabetes/HbA1c Report" 
                  type="file" 
                  onView={handleViewFile} 
                  {...register('diabetesReport')} 
                />
              </div>
            </div>
          </FormWrapper>
        );

      case 'Thyroid': 
        return (
          <FormWrapper {...categoryMeta}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormInput label="TSH" type="number" unit="mIU/L" {...register('tsh')} />
                <FormInput label="Free T4" type="number" unit="ng/dL" {...register('freeT4')} />
                <FormInput label="Reverse T3" type="number" unit="ng/dL" {...register('reverseT3')} />
                <FormInput label="Thyroid Antibodies (TPO/TgAb)" {...register('thyroidAntibodies')} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <FormInput 
                  label="Upload Full Thyroid Panel Report" 
                  type="file" 
                  onView={handleViewFile} 
                  {...register('thyroidReport')} 
                />
                <FormInput 
                  label="Upload General Health Report (PDF/Image)" 
                  type="file" 
                  onView={handleViewFile} 
                  {...register('generalHealthReport')} 
                />
              </div>
            </div>
          </FormWrapper>
        );

      case 'Cardiovascular':
        return (
          <FormWrapper {...categoryMeta}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormInput label="Systolic Blood Pressure" type="number" unit="mmHg" {...register('systolicBP')} />
                <FormInput label="Diastolic Blood Pressure" type="number" unit="mmHg" {...register('diastolicBP')} />
                <FormInput label="SpO₂ (Oxygen Saturation)" type="number" unit="\%" {...register('spO2')} />
                <FormInput label="Resting Heart Rate" type="number" unit="bpm" {...register('restingHeartRate')} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormInput 
                  label="Upload General Cardiac Health Report" 
                  type="file" 
                  onView={handleViewFile} 
                  {...register('cardiacHealthReport')} 
                />
                <FormInput 
                  label="Upload Cardiovascular Risk Assessment" 
                  type="file" 
                  onView={handleViewFile} 
                  {...register('cardiovascularReport')} 
                />
                <FormInput 
                  label="Upload ECG/ECHO Report" 
                  type="file" 
                  onView={handleViewFile} 
                  {...register('ecgReport')} 
                />
              </div>
            </div>
          </FormWrapper>
        );

      default:
        return <p className="text-gray-500">Form content missing for this category ID.</p>;
    }
  }, [register, handleViewFile, categories]); // Dependencies ensure form state updates correctly

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50 pt-0 pb-6 px-6">
      {/* Modern Success/Error Notification */}
      {notification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className={`bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 p-8 text-center border ${
            notification.type === 'success' ? 'border-emerald-200' : 'border-red-200'
          }`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              notification.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              ) : (
                <X className="w-12 h-12 text-red-600" />
              )}
            </div>
            <h3 className={`text-2xl font-bold mb-4 ${
              notification.type === 'success' ? 'text-gray-800' : 'text-red-800'
            }`}>
              {notification.type === 'success' ? 'Report Submitted Successfully!' : 'Submission Failed'}
            </h3>
            <p className={`mb-6 ${
              notification.type === 'success' ? 'text-gray-600' : 'text-red-600'
            }`}>
              {notification.message}
            </p>
            {notification.type === 'success' ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
                <span className="ml-3 text-emerald-600 font-medium">Redirecting to report history...</span>
              </div>
            ) : (
              <button
                onClick={() => setNotification(null)}
                className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Custom Message Box (Toggled to blue when "View" is clicked) */}
      <div id="messageBox" className="hidden fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-xl z-50 transition-opacity duration-300">
        <p id="messageText"></p>
      </div>

      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl border-2 border-emerald-200 overflow-hidden">
        <header className="bg-linear-to-r from-emerald-500 to-teal-600 text-white p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              Back
            </button>
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold mb-2">
                Lab Report Upload
              </h1>
              <p className="text-emerald-100 text-lg">
                Upload your health reports and metrics for analysis by your Dietitian.
              </p>
            </div>
            <button
              onClick={() => navigate(`/user/lab-reports/${dietitianId}`)}
              className="px-4 py-2 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              Report History
            </button>
          </div>
        </header>        {/* --- Category Buttons (Two Rows of Three) --- */}
        <section className="grid grid-cols-6 gap-4 mb-10 max-w-6xl mx-auto">
          {categories.map((cat) => (
            <CategoryIcon
              key={cat.id}
              icon={cat.icon}
              label={cat.label}
              // === UPDATED: Check if category is in the order array ===
              isActive={activeFormsOrder.includes(cat.id)}
              // === UPDATED: Use new toggle function ===
              onClick={() => toggleCategory(cat.id)}
            />
          ))}
        </section>
        
                {/* --- Client Information Section --- */}
        <div className="p-6 border border-emerald-200 rounded-xl bg-emerald-50/50 shadow-inner mb-8">
          <h2 className="text-2xl font-bold text-emerald-800 mb-2 flex items-center">
            <span className="mr-2">
              <User className='w-8 h-8' />
            </span>
            Client Information
          </h2>
          <p className="text-gray-600 mb-6 border-b border-emerald-200 pb-4">Please verify your personal details</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput 
              label="Full Name" 
              type="text" 
              required 
              {...register('clientName')} 
            />
            <FormInput 
              label="Age" 
              type="number" 
              required 
              {...register('clientAge')} 
            />
            <FormInput 
              label="Phone Number" 
              type="tel" 
              required 
              {...register('clientPhone')} 
            />
            <div className="md:col-span-2">
              <FormInput 
                label="Address" 
                type="text" 
                required 
                {...register('clientAddress')} 
              />
            </div>
          </div>
        </div>
        
        {/* --- Dynamic Form Section Container --- */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* === NEW DYNAMIC RENDERING === */}
          {activeFormsOrder.length > 0 ? (
            // Render forms in the order they were clicked
            activeFormsOrder.map(categoryId => (
              <div 
                key={categoryId} 
                id={`form-section-${categoryId}`}
                className="p-6 border border-emerald-200 rounded-xl bg-emerald-50/50 shadow-inner space-y-4"
              >
                {renderFormContent(categoryId)}
              </div>
            ))
          ) : (
            // Default message when no forms are active
            <div className="p-6 border border-gray-300 rounded-xl bg-gray-50 text-center text-gray-500 italic">
              Select one or more categories above to dynamically load the corresponding forms for submission.
            </div>
          )}
          
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={submitting || activeFormsOrder.length === 0}
                className="px-12 py-3 bg-emerald-700 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.01] flex items-center"
              >
                <Upload className="w-6 h-6 mr-2" />
                {submitting ? 'Submitting...' : 'Submit the Report'}
              </button>
            </div>
        </form>

        <footer className="mt-10 pt-6 border-t border-emerald-200 text-center text-sm text-gray-400">
          *Note: Your lab reports and uploaded files will be securely stored and reviewed by your dietitian.
        </footer>
      </div>
    </div>
  );
};

export default LabReportUploader;
