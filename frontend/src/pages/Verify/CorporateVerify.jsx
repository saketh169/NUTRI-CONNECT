import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Inject Font Awesome for icons used in the application
function loadFontAwesome() {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
  document.head.appendChild(link)
}
// Run the script injection once when the component is defined
loadFontAwesome()

// --- Configuration and Data (Corporate Partners) ---
const FIELD_MAP = {
  businessLicense: {
    name: 'Business License',
    ext: 'pdf',
    icon: 'fas fa-id-card-alt',
    isImage: false
  },
  taxIdDocument: {
    name: 'Tax ID Document',
    ext: 'pdf',
    icon: 'fas fa-file-invoice-dollar',
    isImage: false
  },
  incorporationCertificate: {
    name: 'Incorporation Certificate',
    ext: 'pdf',
    icon: 'fas fa-landmark',
    isImage: false
  },
  authorizedRepId: {
    name: 'Authorized Rep ID',
    ext: 'pdf',
    icon: 'fas fa-user-tie',
    isImage: false
  },
  bankAccountProof: {
    name: 'Bank Account Proof',
    ext: 'pdf',
    icon: 'fas fa-university',
    isImage: false
  },
  financialAudit: {
    name: 'Annual Financial Audit',
    ext: 'pdf',
    icon: 'fas fa-chart-line',
    isImage: false,
    optional: true
  },
  codeOfConduct: {
    name: 'Code of Conduct',
    ext: 'pdf',
    icon: 'fas fa-gavel',
    isImage: false,
    optional: true
  },
  finalReport: {
    name: 'Final Verification Report',
    ext: 'pdf',
    icon: 'fas fa-file-alt',
    isImage: false
  }
}

const STATUS_ICONS = {
  'Not Received': 'hourglass-half',
  Received: 'hourglass-half',
  Verified: 'check-circle',
  Rejected: 'times-circle',
  Pending: 'hourglass-half',
  'Not Uploaded': 'minus-circle',
  'No Documents': 'minus-circle'
}

// --- Mock Data Setup (Corporate Partners) ---
const mockCorporateData = [
  {
    _id: 'c101',
    name: 'NutriCorp Global Inc.',
    verificationStatus: {
      businessLicense: 'Received',
      taxIdDocument: 'Pending',
      incorporationCertificate: 'Verified',
      authorizedRepId: 'Rejected',
      bankAccountProof: 'Received',
      financialAudit: 'Not Uploaded',
      codeOfConduct: 'Received',
      finalReport: 'Received' // Admin uploaded report, awaiting final action
    },
    fileData: {
      // Mock PDF base64 (placeholders)
      businessLicense: { base64: 'base64_data_biz', mime: 'application/pdf' },
      codeOfConduct: { base64: 'base64_data_code', mime: 'application/pdf' },
      // Mock PNG/Image base64 for authorized rep ID for viewer testing
      authorizedRepId: {
        base64:
          'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDSTEQxGEGAhifBpB9/1gFAAAAAElEQVQI12P4//8/w38GIAXDSTEQxGEGAhifBpB9/1gFAAAAAElEQVRIx2NgoD/AxMDGgIT/BwMXAwpOAAU/A14ABf8Ghh0wAB8AAhMB/1gFAAAAAElFTkSuQmCC', // A tiny square PNG
        mime: 'image/png'
      },
      finalReport: { base64: 'base64_data_final', mime: 'application/pdf' }
    }
  },
  {
    _id: 'c102',
    name: 'Wellness Partners Ltd.',
    verificationStatus: {
      businessLicense: 'Verified',
      taxIdDocument: 'Verified',
      incorporationCertificate: 'Verified',
      authorizedRepId: 'Verified',
      bankAccountProof: 'Verified',
      financialAudit: 'Verified',
      codeOfConduct: 'Verified',
      finalReport: 'Verified'
    }
  },
  {
    _id: 'c103',
    name: 'GreenLife Solutions',
    verificationStatus: {
      businessLicense: 'Not Uploaded',
      taxIdDocument: 'Not Uploaded',
      incorporationCertificate: 'Not Uploaded',
      authorizedRepId: 'Not Uploaded',
      bankAccountProof: 'Not Uploaded',
      financialAudit: 'Not Uploaded',
      codeOfConduct: 'Not Uploaded',
      finalReport: 'Not Received'
    }
  }
]

// Define Custom Color Variables for Tailwind (Modern Palette)
const PRIMARY_ACCENT = '#10B981' // Emerald-500
const PRIMARY_HEADER = '#059669' // Emerald-600
const PRIMARY_DARK = '#047857' // Emerald-700
const SECONDARY_ACCENT = '#3B82F6' // Blue-500
const ACCENT_LIGHT = '#ECFDF5' // Emerald-50
const ACCENT_MEDIUM = '#D1FAE5' // Emerald-100


// --- Main React Component (Renamed to App) ---
const App = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([])
  const [expandedRow, setExpandedRow] = useState(null)
  const [notification, setNotification] = useState(null)
  const [fileViewer, setFileViewer] = useState({ active: false, file: null })

  // --- State Handlers ---

  const handleNotify = (
    message,
    type = 'info',
    duration = 5000
  ) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), duration)
  }

  const closeFileViewer = () => setFileViewer({ active: false, file: null })
  const toggleDocumentDetails = rowId =>
    setExpandedRow(expandedRow === rowId ? null : rowId)

  // --- Mock API/Action Handlers ---

  const fetchPartners = useCallback(async () => {
    try {
      const response = await axios.get('/api/verify/corporate', {
        withCredentials: true
      });
      
      const data = response.data;
      setPartners(data.map((p, index) => ({ ...p, rowId: index + 1 })));
    } catch (error) {
      console.error('Error fetching corporate partners:', error);
      handleNotify('Failed to load corporate partners. Please try again.', 'error');
      // Fallback to mock data for development
      setPartners(
        mockCorporateData.map((p, index) => ({ ...p, rowId: index + 1 }))
      );
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const verifyDocument = async (partnerId, field) => {
    try {
      await axios.post(`/api/verify/corporate/${partnerId}/approve`, { field }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      handleNotify(`Document ${FIELD_MAP[field].name} verified.`, 'success');
      fetchPartners(); // Refresh data
    } catch (error) {
      console.error('Error approving document:', error);
      handleNotify('Failed to approve document', 'error');
    }
  };

  const rejectDocument = async (partnerId, field) => {
    try {
      await axios.post(`/api/verify/corporate/${partnerId}/disapprove`, { field }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      handleNotify(`Document ${FIELD_MAP[field].name} rejected.`, 'error');
      fetchPartners(); // Refresh data
    } catch (error) {
      console.error('Error rejecting document:', error);
      handleNotify('Failed to reject document', 'error');
    }
  };

  const finalVerify = async (partnerId) => {
    try {
      await axios.post(`/api/verify/corporate/${partnerId}/final-approve`, {}, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      handleNotify('Corporate Partner has been finally approved!', 'success');
      fetchPartners(); // Refresh data
      setExpandedRow(null); // Close the expanded row
      setTimeout(() => {
        const element = document.getElementById(`corporate-row-${partnerId}`);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (error) {
      console.error('Error finalizing approval:', error);
      handleNotify('Failed to finalize approval', 'error');
    }
  };

  const finalReject = async (partnerId) => {
    try {
      await axios.post(`/api/verify/corporate/${partnerId}/final-disapprove`, {}, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      handleNotify('Corporate Partner has been finally rejected.', 'error');
      fetchPartners(); // Refresh data
      setExpandedRow(null); // Close the expanded row
      setTimeout(() => {
        const element = document.getElementById(`corporate-row-${partnerId}`);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (error) {
      console.error('Error finalizing rejection:', error);
      handleNotify('Failed to finalize rejection', 'error');
    }
  };

  const handleFileUpload = async (partnerId, file) => {
    if (!file) return handleNotify('Please select a file to upload.', 'warning');

    const formData = new FormData();
    formData.append('finalReport', file);

    try {
      await axios.post(`/api/verify/corporate/${partnerId}/upload-report`, formData, {
        withCredentials: true,
      });
      handleNotify('Verification report uploaded successfully.', 'success');
      fetchPartners(); // Refresh data
    } catch (error) {
      console.error('Error uploading report:', error);
      handleNotify('Failed to upload verification report', 'error');
    }
  };

  const viewFile = async (partnerId, field) => {
    try {
      const response = await axios.get(`/api/verify/corporate/files/${partnerId}/${field}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      const data = response.data;
      const dataUrl = `data:${data.file.mime};base64,${data.file.base64}`;
      setFileViewer({ active: true, file: { dataUrl, mime: data.file.mime } });
    } catch (error) {
      console.error('Error fetching file:', error);
      handleNotify('File is not uploaded or data is missing.', 'warning');
    }
  };

  const downloadFile = async (partnerId, field, fileName, fileExt) => {
    try {
      const response = await axios.get(`/api/verify/corporate/files/${partnerId}/${field}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      const data = response.data;
      const dataUrl = `data:${data.file.mime};base64,${data.file.base64}`;
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${fileName}.${fileExt}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      handleNotify(`Starting download for ${fileName}.`, 'info');
    } catch (error) {
      console.error('Error fetching file:', error);
      handleNotify('File is not uploaded or data is missing.', 'warning');
    }
  };

  // --- JSX Rendering Functions ---

  return (
    <div className='min-h-screen bg-linear-to-br from-slate-50 via-emerald-50 to-teal-50 pb-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-7xl mx-auto'>
        {/* Header with Back Button and Title */}
        <div className='flex items-center justify-between mb-6 pt-2 px-4' style={{ minHeight: '60px', maxHeight: '100px' }}>
          <button
            onClick={() => navigate('/organization/profile')}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 shadow-md hover:shadow-lg font-medium"
          >
            <i className="fas fa-chevron-left mr-2"></i> Back
          </button>

          <div className='flex-1 text-center'>
            <div className='inline-flex items-center justify-center gap-3'>
              <div className='inline-flex items-center justify-center w-10 h-10 bg-linear-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg'>
                <i className='fas fa-building text-lg text-white'></i>
              </div>
              <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight'>
                Corporate Verification
              </h1>
            </div>
            <p className='text-sm text-slate-600 mt-2 leading-tight max-w-lg mx-auto'>
              Streamlined document verification system for corporate partners
            </p>
          </div>

          <div className='w-20'></div> {/* Spacer for balance */}
        </div>

        {/* Modern Notification */}
        {notification && (
          <div
            className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-xl border-l-4 backdrop-blur-sm animate-in slide-in-from-right-4 duration-500 w-full max-w-md ${
              notification.type === 'success'
                ? 'bg-emerald-50/95 border-emerald-400 text-emerald-800 shadow-emerald-100'
                : notification.type === 'error'
                ? 'bg-red-50/95 border-red-400 text-red-800 shadow-red-100'
                : 'bg-blue-50/95 border-blue-400 text-blue-800 shadow-blue-100'
            }`}
          >
            <div className='flex items-start justify-between'>
              <div className='flex items-start'>
                <div className={`p-2 rounded-xl mr-3 ${
                  notification.type === 'success'
                    ? 'bg-emerald-100'
                    : notification.type === 'error'
                    ? 'bg-red-100'
                    : 'bg-blue-100'
                }`}>
                  <i
                    className={`text-lg ${
                      notification.type === 'success'
                        ? 'fa-check-circle text-emerald-600'
                        : notification.type === 'error'
                        ? 'fa-exclamation-triangle text-red-600'
                        : 'fa-info-circle text-blue-600'
                    }`}
                  ></i>
                </div>
                <div>
                  <p className='font-semibold text-sm'>{notification.message}</p>
                </div>
              </div>
              <button
                onClick={() => setNotification(null)}
                className='text-slate-400 hover:text-slate-600 transition-colors ml-4 p-1 hover:bg-slate-100 rounded-lg'
              >
                <i className='fas fa-times text-sm'></i>
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Modal Removed - Using Direct API Calls */}

        {/* Modern File Viewer */}
        {fileViewer.active && (
          <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300' style={{ paddingTop: '2vh' }}>
            <div className='bg-white rounded-3xl shadow-2xl max-w-full lg:max-w-6xl w-full mx-4 flex flex-col overflow-hidden border border-slate-200' style={{ height: '600px' }}>
              <div className='p-6 border-b border-slate-200 bg-linear-to-r from-slate-50 to-emerald-50 rounded-t-3xl flex justify-between items-center'>
                <div className='flex items-center'>
                  <div className='p-2 bg-emerald-100 rounded-xl mr-3'>
                    <i className='fas fa-file-alt text-emerald-600'></i>
                  </div>
                  <h3 className='text-xl font-bold text-slate-800'>
                    Document Viewer
                  </h3>
                </div>
                <button
                  onClick={closeFileViewer}
                  className='p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200'
                >
                  <i className='fas fa-times text-xl'></i>
                </button>
              </div>
              <div className='grow p-6 overflow-y-auto bg-slate-50' style={{ height: 'calc(600px - 80px)' }}>
                {fileViewer.file?.mime?.startsWith('image/') ? (
                  <div className='bg-white p-4 rounded-2xl shadow-sm h-full'>
                    <img
                      src={fileViewer.file.dataUrl}
                      alt='Document View'
                      className='w-full h-full object-contain mx-auto rounded-xl'
                    />
                  </div>
                ) : (
                  <div className='bg-white rounded-2xl shadow-sm overflow-hidden h-full'>
                    <iframe
                      src={fileViewer.file?.dataUrl}
                      title='Document Viewer'
                      className='w-full h-full border-none'
                      allow='fullscreen'
                    ></iframe>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modern Table */}
        <div className='bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden'>
          <table className='min-w-full divide-y divide-slate-200'>
            {/* Modern Header */}
            <thead className='bg-linear-to-r from-emerald-600 to-teal-600'>
              <tr>
                <th className='py-4 px-8 text-left text-sm font-bold uppercase tracking-wider text-white'>
                  <div className='flex items-center'>
                    <i className='fas fa-building mr-3 opacity-90'></i>
                    Corporate Partner
                  </div>
                </th>
                <th className='py-4 px-8 text-left text-sm font-bold uppercase tracking-wider text-white'>
                  <div className='flex items-center'>
                    <i className='fas fa-chart-line mr-3 opacity-90'></i>
                    Verification Status
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 bg-white'>
              {partners.length === 0 ? (
                <tr>
                  <td colSpan='2' className='py-16 text-center'>
                    <div className='flex flex-col items-center justify-center'>
                      <div className='inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-4'>
                        <i className='fas fa-building text-3xl text-slate-400'></i>
                      </div>
                      <h3 className='text-xl font-semibold text-slate-700 mb-2'>No Corporate Partners Found</h3>
                      <p className='text-slate-500'>There are currently no corporate partners to verify.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                partners.map(p => {
                const status = p.verificationStatus || {};
                const documentFields = [
                    'businessLicense', 'taxIdDocument', 'incorporationCertificate',
                    'authorizedRepId', 'bankAccountProof', 'financialAudit', 'codeOfConduct'
                ];
                const documentStatuses = documentFields.map(field => status[field] || 'Not Uploaded');
                
                // Determine overall status based on document upload status
                let overallStatus = 'No Documents';
                if (documentStatuses.some(s => s === 'Pending')) {
                    overallStatus = 'Pending';
                } else if (documentStatuses.some(s => s === 'Rejected')) {
                    overallStatus = 'Rejected';
                } else if (documentStatuses.some(s => s === 'Verified')) {
                    overallStatus = 'Verified';
                } else if (documentStatuses.some(s => s === 'Received')) {
                    overallStatus = 'Received';
                }
                
                const documentUploadStatus = p.documentUploadStatus || 'pending'
                const displayStatus = documentUploadStatus === 'verified' ? 'Verified' : overallStatus;
                const statusColor =
                  documentUploadStatus === 'verified'
                    ? 'text-emerald-600'
                    : overallStatus === 'Rejected'
                    ? 'text-red-600'
                    : 'text-amber-600'

                return (
                  <React.Fragment key={p._id}>
                    <tr
                      id={`corporate-row-${p._id}`}
                      className='hover:bg-emerald-100/70 cursor-pointer transition-all duration-300 group border-b border-emerald-100'
                      onClick={() => toggleDocumentDetails(p.rowId)}
                    >
                      <td className='py-3 px-8'>
                        <div className='flex items-center'>
                          <div className='p-3 bg-emerald-100 rounded-xl mr-4 group-hover:bg-emerald-200 transition-colors duration-200'>
                            <i className='fas fa-building text-emerald-600 text-lg'></i>
                          </div>
                          <div>
                            <div className='font-bold text-slate-800 text-lg'>{p.name}</div>
                            <div className='text-sm text-slate-500'>Corporate Partner</div>
                          </div>
                        </div>
                      </td>
                      <td className='py-3 px-8'>
                        <div className='flex items-center'>
                          <div className={`p-2 rounded-xl mr-3 ${
                            documentUploadStatus === 'verified'
                              ? 'bg-emerald-100'
                              : overallStatus === 'Rejected'
                              ? 'bg-red-100'
                              : 'bg-amber-100'
                          }`}>
                            <i
                              className={`fas fa-${STATUS_ICONS[overallStatus]} ${
                                documentUploadStatus === 'verified'
                                  ? 'text-emerald-600'
                                  : overallStatus === 'Rejected'
                                  ? 'text-red-600'
                                  : 'text-amber-600'
                              }`}
                            ></i>
                          </div>
                          <span className={`font-bold text-lg ${statusColor}`}>
                            {displayStatus}
                          </span>
                          <i className='fas fa-chevron-down text-slate-400 ml-auto group-hover:text-emerald-500 transition-colors duration-200'></i>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === p.rowId && (
                      <tr>
                        <td colSpan='2' className='p-0'>
                          <div className='bg-linear-to-r from-slate-50 to-emerald-50/30 p-8 border-t border-slate-200'>
                            <div className='max-w-6xl mx-auto'>
                              <div className='flex items-center mb-8'>
                                <div className='p-3 bg-emerald-100 rounded-2xl mr-4'>
                                  <i className='fas fa-folder-open text-emerald-600 text-xl'></i>
                                </div>
                                <div>
                                  <h3 className='text-xl font-bold text-slate-800'>
                                    Document Verification
                                  </h3>
                                  <p className='text-slate-600'>Review and verify documents for {p.name}</p>
                                </div>
                              </div>

                              <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8'>
                                {Object.keys(FIELD_MAP).map(field => {
                                  const status =
                                    p.verificationStatus[field] ||
                                    (field === 'finalReport'
                                      ? 'Not Received'
                                      : 'Not Uploaded')
                                  const fileExists = [
                                    'Received',
                                    'Pending',
                                    'Verified',
                                    'Rejected'
                                  ].includes(status)
                                  const fieldInfo = FIELD_MAP[field]
                                  const isOptional = fieldInfo.optional

                                  return (
                                    <div
                                      key={field}
                                      className='bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-200'
                                    >
                                      <div className='flex items-start justify-between mb-4'>
                                        <div className='flex items-center'>
                                          <div className={`p-3 rounded-xl mr-4 ${
                                            status === 'Verified'
                                              ? 'bg-emerald-100'
                                              : status === 'Rejected'
                                              ? 'bg-red-100'
                                              : status === 'Received' || status === 'Pending'
                                              ? 'bg-amber-100'
                                              : 'bg-slate-100'
                                          }`}>
                                            <i
                                              className={`${fieldInfo.icon} text-lg ${
                                                status === 'Verified'
                                                  ? 'text-emerald-600'
                                                  : status === 'Rejected'
                                                  ? 'text-red-600'
                                                  : status === 'Received' || status === 'Pending'
                                                  ? 'text-amber-600'
                                                  : 'text-slate-500'
                                              }`}
                                            ></i>
                                          </div>
                                          <div>
                                            <h4 className='font-bold text-slate-800 text-lg'>
                                              {fieldInfo.name}
                                            </h4>
                                            {isOptional && (
                                              <span className='text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-lg'>
                                                Optional
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <div className='flex items-center justify-between'>
                                        <span
                                          className={`px-4 py-2 rounded-xl text-sm font-bold ${
                                            status === 'Verified'
                                              ? 'bg-emerald-100 text-emerald-800'
                                              : status === 'Rejected'
                                              ? 'bg-red-100 text-red-800'
                                              : status === 'Received' || status === 'Pending'
                                              ? 'bg-amber-100 text-amber-800'
                                              : 'bg-slate-100 text-slate-800'
                                          }`}
                                        >
                                          {status}
                                        </span>

                                        {fileExists && (
                                          <div className='flex gap-2'>
                                            <button
                                              className='p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all duration-200'
                                              onClick={e => {
                                                e.preventDefault()
                                                viewFile(p._id, field)
                                              }}
                                              title='View Document'
                                            >
                                              <i className='fas fa-eye'></i>
                                            </button>
                                            <button
                                              className='p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all duration-200'
                                              onClick={e => {
                                                e.preventDefault()
                                                downloadFile(
                                                  p._id,
                                                  field,
                                                  fieldInfo.name,
                                                  fieldInfo.ext
                                                )
                                              }}
                                              title='Download Document'
                                            >
                                              <i className='fas fa-download'></i>
                                            </button>
                                          </div>
                                        )}
                                      </div>

                                      {status === 'Pending' && field !== 'finalReport' && (
                                        <div className='flex gap-3 mt-4'>
                                          <button
                                            className='flex-1 bg-linear-to-r from-emerald-500 to-teal-600 text-white py-2 px-4 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-sm hover:shadow-md font-semibold'
                                            onClick={() =>
                                              verifyDocument(p._id, field)
                                            }
                                          >
                                            <i className='fas fa-check mr-2'></i> Verify
                                          </button>
                                          <button
                                            className='flex-1 bg-linear-to-r from-red-500 to-rose-600 text-white py-2 px-4 rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-200 shadow-sm hover:shadow-md font-semibold'
                                            onClick={() =>
                                              rejectDocument(p._id, field)
                                            }
                                          >
                                            <i className='fas fa-times mr-2'></i> Reject
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>

                            {/* Modern Upload Report */}
                            <div className='bg-white p-6 rounded-2xl shadow-lg border border-slate-200'>
                              <div className='flex items-center mb-4'>
                                <div className='p-3 bg-emerald-100 rounded-xl mr-4'>
                                  <i className='fas fa-upload text-emerald-600 text-lg'></i>
                                </div>
                                <div>
                                  <h4 className='text-xl font-bold text-slate-800'>
                                    Upload Final Verification Report
                                  </h4>
                                  <p className='text-slate-600 text-sm'>PDF files only</p>
                                </div>
                              </div>
                              <p className='text-slate-600 mb-6 leading-relaxed'>
                                Upload a detailed report before final approval or rejection of this corporate partner.
                              </p>
                              <div className='relative'>
                                <input
                                  type='file'
                                  accept='.pdf'
                                  onChange={e =>
                                    handleFileUpload(p._id, e.target.files[0])
                                  }
                                  className='w-full p-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100'
                                />
                                <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                                  <div className='text-center'>
                                    <i className='fas fa-cloud-upload-alt text-3xl text-slate-400 mb-2'></i>
                                    <p className='text-slate-500 text-sm'>Drop PDF here or click to browse</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                              <div className='flex flex-col sm:flex-row gap-4 mb-6'>
                                <button
                                  className={`flex-1 bg-linear-to-r from-emerald-500 to-teal-600 text-white py-4 px-6 rounded-2xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:bg-emerald-600`}
                                  onClick={() => finalVerify(p._id)}
                                  disabled={
                                    ![
                                      'Received',
                                      'Verified',
                                      'Rejected'
                                    ].includes(p.verificationStatus.finalReport)
                                  }
                                >
                                  <i className='fas fa-check-circle mr-2'></i>{' '}
                                  Final Approve
                                </button>
                                <button
                                  className='flex-1 bg-linear-to-r from-red-500 to-rose-600 text-white py-4 px-6 rounded-2xl font-bold hover:from-red-600 hover:to-rose-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                  onClick={() => finalReject(p._id)}
                                  disabled={
                                    ![
                                      'Received',
                                      'Verified',
                                      'Rejected'
                                    ].includes(p.verificationStatus.finalReport)
                                  }
                                >
                                  <i className='fas fa-times-circle mr-2'></i>{' '}
                                  Final Reject
                                </button>
                              </div>

                              {/* Full border separator */}
                              <div className='border-t-2 border-emerald-200 pt-6 hover:border-emerald-300 transition-colors duration-300'></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              }))}
            </tbody>
          </table>
        </div>

        {/* Modern Footer */}
        <div className='mt-16 text-center'>
          <div className='inline-flex items-center justify-center w-12 h-12 bg-linear-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4'>
            <i className='fas fa-question-circle text-white text-lg'></i>
          </div>
          <p className='text-slate-600 mb-2'>Need help with verification?</p>
          <p className='text-sm text-slate-500'>
            Contact our support team at{' '}
            <a
              href='mailto:support@corporateverify.com'
              className='text-emerald-600 hover:text-emerald-700 font-semibold transition-colors duration-200 inline-flex items-center'
            >
              <i className='fas fa-envelope mr-2'></i>
              support@corporateverify.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default App