import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Utensils, Heart, Activity, Pill, FileText, Eye, Download, Zap } from 'lucide-react';
import AuthContext from '../../contexts/AuthContext';
import { useContext } from 'react';
import axios from 'axios';

const ClientLabReportViewer = () => {
  const { dietitianId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // State for lab reports data
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Display user and dietitian information in console
  useEffect(() => {
    console.log('=== Client Lab Report Viewer ===');
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

  // Fetch lab reports when component mounts
  useEffect(() => {
    const fetchLabReports = async () => {
      if (!user?.id && !user?._id) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      if (!dietitianId) {
        setError('Dietitian ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const clientId = user.id || user._id;
        
        // Get auth token
        const role = user?.role || 'user';
        const token = localStorage.getItem(`authToken_${role}`);
        
        const response = await axios.get(
          `/api/lab-reports/client/${clientId}/dietitian/${dietitianId}`,
          {
            headers: {
              'Authorization': token ? `Bearer ${token}` : undefined
            }
          }
        );

        if (response.data.success) {
          setReports(response.data.data || []);
        } else {
          throw new Error(response.data.message || 'Failed to fetch lab reports');
        }
      } catch (error) {
        console.error('Error fetching lab reports:', error);
        setError(error.response?.data?.message || error.message || 'Failed to fetch lab reports');
      } finally {
        setLoading(false);
      }
    };

    fetchLabReports();
  }, [user, dietitianId]);
  
  // Remove the static data - now using API data
  const [selectedReport, setSelectedReport] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Update selectedReport when reports change
  useEffect(() => {
    if (reports.length > 0 && !selectedReport) {
      setSelectedReport(reports[0]);
    }
  }, [reports, selectedReport]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'reviewed':
        return <FileText className="w-4 h-4 text-green-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'meals':
        return <Utensils className="w-5 h-5 text-emerald-600" />;
      case 'healthMetrics':
        return <Heart className="w-5 h-5 text-emerald-600" />;
      case 'activity':
        return <Activity className="w-5 h-5 text-emerald-600" />;
      case 'supplements':
        return <Pill className="w-5 h-5 text-emerald-600" />;
      default:
        return <FileText className="w-5 h-5 text-emerald-600" />;
    }
  };

  const formatCategoryName = (category) => {
    switch (category) {
      case 'meals':
        return 'Meals';
      case 'healthMetrics':
        return 'Health Metrics';
      case 'activity':
        return 'Activity';
      case 'supplements':
        return 'Supplements';
      default:
        return category;
    }
  };

  const renderCategoryCard = (category, report) => {
    // Map category names to schema field names
    const categoryFieldMap = {
      'meals': null, // No meals field in schema
      'healthMetrics': null, // No healthMetrics field in schema
      'activity': 'fitnessMetrics', // Activity data is in fitnessMetrics
      'supplements': null, // No supplements field in schema
      'hormonalIssues': 'hormonalIssues',
      'fitnessMetrics': 'fitnessMetrics',
      'generalReports': 'generalReports',
      'bloodSugarFocus': 'bloodSugarFocus',
      'thyroid': 'thyroid',
      'cardiovascular': 'cardiovascular'
    };

    const schemaField = categoryFieldMap[category];
    const categoryData = schemaField ? report[schemaField] : null;
    
    // Get files for this category
    const categoryFiles = report.uploadedFiles?.filter(file => {
      // Map file field names to categories
      const fileCategoryMap = {
        'hormonalProfileReport': 'hormonalIssues',
        'endocrineReport': 'hormonalIssues',
        'generalHealthReport': 'generalReports',
        'bloodTestReport': 'bloodSugarFocus',
        'bloodSugarReport': 'bloodSugarFocus',
        'diabetesReport': 'bloodSugarFocus',
        'thyroidReport': 'thyroid',
        'cardiacHealthReport': 'cardiovascular',
        'cardiovascularReport': 'cardiovascular',
        'ecgReport': 'cardiovascular'
      };
      return fileCategoryMap[file.fieldName] === schemaField;
    }) || [];

    if (!categoryData && categoryFiles.length === 0) return null;

    return (
      <div key={category} className="bg-white rounded-lg border border-emerald-100 p-6 md:p-8 shadow-md hover:shadow-lg transition-shadow">
        <div className="flex items-center mb-4">
          {getCategoryIcon(category)}
          <h3 className="text-lg font-semibold text-gray-800 ml-3 capitalize">
            {formatCategoryName(category)}
          </h3>
        </div>

        {categoryData && (
          <div className="space-y-2 mb-4">
            {Object.entries(categoryData).map(([key, value]) => {
              if (value === null || value === undefined || value === '') return null;
              
              // Format the key for display
              let displayKey = key.replace(/([A-Z])/g, ' $1').trim();
              displayKey = displayKey.charAt(0).toUpperCase() + displayKey.slice(1);
              
              // Format the value
              let displayValue = value;
              if (typeof value === 'number') {
                // Add units for known metrics
                if (key.includes('weight') || key.includes('Weight')) displayValue = `${value} kg`;
                else if (key.includes('height') || key.includes('Height')) displayValue = `${value} cm`;
                else if (key.includes('bmi') || key.includes('BMI')) displayValue = `${value} kg/m²`;
                else if (key.includes('glucose') || key.includes('Glucose')) displayValue = `${value} mg/dL`;
                else if (key.includes('cholesterol') || key.includes('Cholesterol')) displayValue = `${value} mg/dL`;
                else if (key.includes('triglycerides') || key.includes('Triglycerides')) displayValue = `${value} mg/dL`;
                else if (key.includes('tsh') || key.includes('TSH')) displayValue = `${value} mIU/L`;
                else if (key.includes('freeT4') || key.includes('FreeT4')) displayValue = `${value} ng/dL`;
                else if (key.includes('reverseT3') || key.includes('ReverseT3')) displayValue = `${value} ng/dL`;
                else if (key.includes('bp') || key.includes('BP')) displayValue = `${value} mmHg`;
                else if (key.includes('spO2') || key.includes('SpO2')) displayValue = `${value}%`;
                else if (key.includes('heartRate') || key.includes('HeartRate')) displayValue = `${value} bpm`;
                else if (key.includes('testosterone') || key.includes('Testosterone')) displayValue = `${value} ng/dL`;
                else if (key.includes('dhea') || key.includes('DHEA')) displayValue = `${value} μg/dL`;
                else if (key.includes('cortisol') || key.includes('Cortisol')) displayValue = `${value} nmol/L`;
                else if (key.includes('vitaminD') || key.includes('VitaminD')) displayValue = `${value} ng/mL`;
                else if (key.includes('hba1c') || key.includes('HbA1c')) displayValue = `${value}%`;
                else if (key.includes('age') || key.includes('Age')) displayValue = `${value} years`;
                else displayValue = value.toString();
              } else if (value instanceof Date) {
                displayValue = value.toLocaleDateString();
              } else {
                displayValue = value.toString();
              }
              
              return (
                <div key={key} className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-600">
                    {displayKey}:
                  </span>
                  <span className="text-base font-semibold text-gray-800">{displayValue}</span>
                </div>
              );
            })}
          </div>
        )}

        {categoryFiles.length > 0 && (
          <div className="border-t border-emerald-50 pt-4 ">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h4>
            <div className="space-y-2">
                {categoryFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-emerald-50 rounded p-3">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-emerald-600 mr-3" />
                    <span className="text-base font-semibold text-gray-700">{file.originalName}</span>
                    <span className="text-sm text-gray-500 ml-3">({file.mimetype})</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => openFilePreview(file)}
                      className="text-emerald-600 hover:text-emerald-800 p-3 rounded-lg hover:bg-emerald-50"
                      title="View File"
                    >
                      <Eye className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => downloadFile(file)}
                      className="text-emerald-600 hover:text-emerald-800 p-3 rounded-lg hover:bg-emerald-50"
                      title="Download File"
                    >
                      <Download className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ---- File preview / download helpers ----
  const openFilePreview = (file) => {
    try {
      if (!file || !file.data) return;
      const raw = file.data.data ? file.data.data : file.data;
      const uint8 = new Uint8Array(raw);
      const blob = new Blob([uint8], { type: file.mimetype });
      const url = URL.createObjectURL(blob);
      setPreviewFile({ url, name: file.originalName, mimetype: file.mimetype });
      setShowPreview(true);
    } catch (err) {
      console.error('Failed to open file preview', err);
      alert('Unable to preview this file. Try downloading it instead.');
    }
  };

  const closePreview = () => {
    if (previewFile?.url) URL.revokeObjectURL(previewFile.url);
    setShowPreview(false);
    setPreviewFile(null);
  };

  const downloadFile = (file) => {
    try {
      if (!file || !file.data) return;
      const raw = file.data.data ? file.data.data : file.data;
      const uint8 = new Uint8Array(raw);
      const blob = new Blob([uint8], { type: file.mimetype });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName || file.filename || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download file', err);
      alert('Unable to download file.');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50 pt-0 pb-6 px-6">
      {/* File Preview Modal (for stored uploaded files) */}
      {showPreview && previewFile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-full lg:max-w-6xl w-full mx-4 flex flex-col overflow-hidden border border-slate-200" style={{ height: '600px' }}>
            <div className="p-4 border-b border-slate-200 bg-linear-to-r from-slate-50 to-emerald-50 rounded-t-3xl flex justify-between items-center">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-100 rounded-xl mr-3">
                  <i className="fas fa-file-alt text-emerald-600"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800">File Preview - {previewFile.name}</h3>
              </div>
              <button onClick={closePreview} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="grow  overflow-y-auto bg-slate-50" style={{ height: 'calc(600px - 80px)' }}>
              {previewFile.mimetype?.startsWith('image/') ? (
                <div className="bg-white p-4 rounded-2xl shadow-sm h-full">
                  <img src={previewFile.url} alt="File Preview" className="w-full h-full object-contain mx-auto rounded-xl" />
                </div>
              ) : previewFile.mimetype === 'application/pdf' ? (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-full">
                  <iframe src={previewFile.url} title="File Preview" className="w-full h-full border-none" allow="fullscreen"></iframe>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-2xl shadow-sm h-full flex items-center justify-center">
                  <div className="text-center">
                    <i className="fas fa-file text-6xl text-slate-400 mb-4"></i>
                    <p className="text-slate-600 text-lg">Preview not available for this file type</p>
                    <p className="text-slate-500 text-sm mt-2">File: {previewFile.name}</p>
                    <p className="text-slate-500 text-sm">Type: {previewFile.mimetype}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl border-2 border-emerald-200 overflow-hidden">
        <header className="flex items-center justify-center bg-linear-to-r from-emerald-500 to-teal-600 text-white p-4 relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
          >
            Back
          </button>
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">
              My Lab Reports
            </h1>
            <p className="text-emerald-100 text-lg">
              View and manage your submitted lab reports
            </p>
          </div>

        </header>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-emerald-700">Loading lab reports...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <p className="text-red-700 text-lg font-bold">Error loading lab reports</p>
            <p className="text-red-600 mt-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-lg font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
            <p className="text-teal-900 text-lg font-bold">No lab reports found.</p>
            <p className="text-emerald-600 mt-2">Submit your first lab report to get started.</p>
            <button
              onClick={() => navigate(`/user/submit-lab-report/${dietitianId}`)}
              className="mt-4 px-6 py-2 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 shadow-lg font-semibold"
            >
              Submit New Report
            </button>
          </div>
        ) : (
          <div className="flex gap-6 p-6">
            {/* Left Sidebar - List of submissions */}
            <div className="w-80 bg-white shadow-xl h-[calc(100vh-300px)] overflow-y-auto p-4 border-r-2 border-emerald-200 rounded-tr-2xl rounded-br-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-file-medical text-white text-lg"></i>
                </div>
                <h3 className="text-lg font-bold text-teal-900">My Submissions ({reports.length})</h3>
              </div>
              <div className="border-t-2 border-emerald-200 mb-4"></div>
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report._id}
                    onClick={() => setSelectedReport(report)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 flex items-center gap-3 transform hover:scale-105 ${
                      selectedReport?._id === report._id
                        ? 'active shadow-lg border-emerald-300'
                        : 'hover:shadow-md border-gray-200'
                    }`}
                    style={{
                      color: selectedReport?._id === report._id ? 'white' : '#0F766E',
                      backgroundColor: selectedReport?._id === report._id ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'white',
                      borderLeft: selectedReport?._id === report._id ? `4px solid #34D399` : '2px solid #E5E7EB',
                      background: selectedReport?._id === report._id ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'white',
                    }}
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-lg">
                      {getStatusIcon(report.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold text-sm ${selectedReport?._id === report._id ? 'text-white' : 'text-teal-900'}`}>                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Main Panel - Broad view of selected report */}
            <div className="flex-1 bg-transparent p-4 overflow-y-auto">
              {selectedReport ? (
                <>
                  {/* Report Header */}
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-emerald-800 mb-2">
                      Lab Report
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-emerald-600">
                      <span>Submitted: {new Date(selectedReport.createdAt).toLocaleDateString()}</span>
                      <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                        selectedReport.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedReport.status === 'reviewed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusIcon(selectedReport.status)}
                        {selectedReport.status || 'Submitted'}
                      </span>
                    </div>
                  </div>

                  {/* Category Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {renderCategoryCard('hormonalIssues', selectedReport)}
                    {renderCategoryCard('fitnessMetrics', selectedReport)}
                    {renderCategoryCard('generalReports', selectedReport)}
                    {renderCategoryCard('bloodSugarFocus', selectedReport)}
                    {renderCategoryCard('thyroid', selectedReport)}
                    {renderCategoryCard('cardiovascular', selectedReport)}
                  </div>

                  {/* Dietitian Feedback Section */}
                  {selectedReport.notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-800 mb-4">
                        Dietitian Feedback
                      </h3>
                      <div className="text-blue-700">
                        <p>{selectedReport.notes}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <FileText className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
                  <p className="text-emerald-700">Select a report from the sidebar to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientLabReportViewer;