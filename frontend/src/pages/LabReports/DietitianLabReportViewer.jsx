import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import { Heart, Activity, Pill, FileText, Eye, Download, Zap, User } from 'lucide-react';
import axios from 'axios';

const DietitianLabReportViewer = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  // State for reports
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Get client info from location state (similar to chat page)
  const clientInfo = location.state?.clientInfo;

  // Set page title
  useEffect(() => {
    const title = clientId && clientInfo ? `${clientInfo.name}'s Lab Reports` : 'Client Lab Reports';
    document.title = title;
  }, [clientId, clientInfo]);

  // Display dietitian and client information in console
  useEffect(() => {
    console.log('=== Dietitian Lab Report Viewer ===');
    console.log('Dietitian Name:', user?.name || 'Not available');
    console.log('Client ID:', clientId || 'Not available');
    console.log('Client Name:', clientInfo?.name || 'Not available');
    console.log('Consultation Details:', {
      dietitian: user?.name,
      client: clientInfo?.name,
      clientId: clientId
    });
  }, [user, clientId, clientInfo]);

  // Fetch lab reports for the specific client
  useEffect(() => {
    const fetchLabReports = async () => {
      if (!clientId) {
        setLoading(false);
        return;
      }

      if (!user?.id && !user?._id) {
        setError('Dietitian not authenticated');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const dietitianId = user.id || user._id;
        
        // Get auth token
        const role = user?.role || 'dietitian';
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
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLabReports();
  }, [clientId, user]);

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
      case 'hormonalIssues':
        return <Pill className="w-5 h-5 text-emerald-600" />;
      case 'fitnessMetrics':
        return <Activity className="w-5 h-5 text-emerald-600" />;
      case 'generalReports':
        return <FileText className="w-5 h-5 text-emerald-600" />;
      case 'bloodSugarFocus':
        return <Heart className="w-5 h-5 text-emerald-600" />;
      case 'thyroid':
        return <Pill className="w-5 h-5 text-emerald-600" />;
      case 'cardiovascular':
        return <Heart className="w-5 h-5 text-emerald-600" />;
      default:
        return <FileText className="w-5 h-5 text-emerald-600" />;
    }
  };

  const formatCategoryName = (category) => {
    switch (category) {
      case 'hormonalIssues':
        return 'Hormonal Issues';
      case 'fitnessMetrics':
        return 'Fitness & Body Metrics';
      case 'generalReports':
        return 'General Checkup';
      case 'bloodSugarFocus':
        return 'Blood & Sugar Focus';
      case 'thyroid':
        return 'Thyroid';
      case 'cardiovascular':
        return 'Heart & Cardiac';
      default:
        return category;
    }
  };

  const renderCategoryCard = (category, report) => {
    // Map category names to schema field names
    const categoryFieldMap = {
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
            <div className="grow p-4 overflow-y-auto bg-slate-50" style={{ height: 'calc(600px - 80px)' }}>
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
        <header className="bg-linear-to-r from-emerald-500 to-teal-600 text-white p-4">
          <div className="relative flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800"
            >
              Back
            </button>
            <h1 className="absolute left-1/2 transform -translate-x-1/2 text-4xl font-bold">
              {clientId && clientInfo ? `${clientInfo.name}'s Lab Reports` : 'Client Lab Reports'}
            </h1>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-emerald-700">Loading client lab reports...</p>
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
            <p className="text-teal-900 text-lg font-bold">
              {clientId && clientInfo 
                ? `No lab reports found from ${clientInfo.name}.`
                : 'No lab reports found from your clients.'
              }
            </p>
            <p className="text-emerald-600 mt-2">
              {clientId && clientInfo 
                ? `${clientInfo.name} hasn't submitted any reports yet.`
                : 'New reports will appear here as clients submit them.'
              }
            </p>
          </div>
        ) : (
          <div className="flex gap-6 p-6">
            {/* Left Sidebar - Narrow */}
            <div className="w-80 bg-white shadow-xl h-[calc(100vh-300px)] overflow-y-auto p-4 border-r-2 border-emerald-200 rounded-tr-2xl rounded-br-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-file-medical text-white text-lg"></i>
                </div>
                <h3 className="text-lg font-bold text-teal-900">
                  {clientId && clientInfo 
                    ? `${clientInfo.name}'s Reports (${reports.length})`
                    : `Client Submissions (${reports.length})`
                  }
                </h3>
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
                      <div className={`font-bold text-sm ${selectedReport?._id === report._id ? 'text-white' : 'text-teal-900'}`}>
                        {report.clientName}
                      </div>
                      <div className={`text-xs ${selectedReport?._id === report._id ? 'text-emerald-100' : 'text-gray-600'}`}>
                        Submitted: {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Main Panel */}
            <div className="flex-1 bg-transparent p-4 overflow-y-auto">
              {selectedReport ? (
                <>
                  {/* Report Header */}
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-emerald-800 mb-2">
                      {selectedReport.clientName}'s Lab Report
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

                  {/* Client Information */}
                  <div className="mb-8 p-6 bg-emerald-50 rounded-lg border border-emerald-200">
                    <h3 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Client Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Name:</span>
                        <span className="ml-2 text-gray-800">{selectedReport.clientName}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Age:</span>
                        <span className="ml-2 text-gray-800">{selectedReport.clientAge} years</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Phone:</span>
                        <span className="ml-2 text-gray-800">{selectedReport.clientPhone}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-sm font-medium text-gray-600">Address:</span>
                        <span className="ml-2 text-gray-800">{selectedReport.clientAddress}</span>
                      </div>
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

                  {/* Removed: All Uploaded Documents section — category-specific file lists are shown above */}

                  {/* Dietitian Notes & Feedback Section */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">
                      Dietitian Notes & Feedback
                    </h3>
                    {selectedReport.notes ? (
                      <div className="text-blue-700">
                        <p>{selectedReport.notes}</p>
                      </div>
                    ) : (
                      <div className="text-blue-600">
                        <p className="italic">No feedback provided yet.</p>
                      </div>
                    )}
                  </div>
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

export default DietitianLabReportViewer;
