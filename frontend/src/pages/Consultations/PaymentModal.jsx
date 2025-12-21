import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuthContext } from "../../hooks/useAuthContext";
import SubscriptionAlert from '../../middleware/SubscriptionAlert';
import {
  createBooking,
  selectSubscriptionAlertData,
  selectShowSubscriptionAlert,
  clearSubscriptionAlert
} from "../../redux/slices/bookingSlice";

const PaymentNotificationModal = ({
  isOpen,
  onClose,
  onSubmit,
  paymentDetails
}) => {
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuthContext();
  
  // Redux state
  const reduxSubscriptionAlertData = useSelector(selectSubscriptionAlertData);
  const reduxShowSubscriptionAlert = useSelector(selectShowSubscriptionAlert);
  
  // Payment form states
  const [email, setEmail] = useState("");
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    validThrough: "",
    cvv: "",
    cardName: ""
  });
  const [selectedBank, setSelectedBank] = useState("");
  const [netbankingCredentials, setNetbankingCredentials] = useState({
    username: "",
    password: ""
  });
  const [netbankingVerified, setNetbankingVerified] = useState(false);
  const [isVerifyingNetbanking, setIsVerifyingNetbanking] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [selectedUpiApp, setSelectedUpiApp] = useState("");
  const [upiVerified, setUpiVerified] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Auto-fill email when user is available or modal opens
  useEffect(() => {
    if (user?.email && isOpen) {
      setEmail(user.email);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  // Card number formatting - accepts 16 digits in spaced format (1111 1111 1111 1111)
  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '').replace(/\D/g, ''); // Remove spaces and non-digits
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned; // Format every 4 digits
    return formatted.substr(0, 19); // 16 digits + 3 spaces = 19 chars max
  };

  // Validate card number - simple validation: all digits and exactly 16 digits
  const validateCardNumber = (number) => {
    const cleaned = number.replace(/\s/g, ''); // Remove spaces
    // Check if all characters are digits and length is exactly 16
    return /^\d{16}$/.test(cleaned);
  };

  // Validate expiry date - format: YYYY-MM (from month input)
  const validateExpiry = (value) => {
    if (!value) return false;

    const [year, month] = value.split('-');
    if (!month || !year) return false;

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (monthNum < 1 || monthNum > 12) return false;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (yearNum < currentYear) return false;
    if (yearNum === currentYear && monthNum < currentMonth) return false;

    return true;
  };

  // Validate UPI ID
  const validateUpiId = (id) => {
    const upiRegex = /^\d{10}@[\w.-]+$/;
    return upiRegex.test(id);
  };

  const handleVerifyUpi = () => {
    if (!upiId) {
      alert('Please enter UPI ID');
      return;
    }
    if (!validateUpiId(upiId)) {
      alert('Invalid UPI ID format. Use 10-digit mobile number. Example: 9876543210@paytm');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setUpiVerified(true);
      setIsProcessing(false);
      alert(`UPI ID ${upiId} verified successfully!`);
    }, 1500);
  };

  const handleVerifyNetbanking = () => {
    const errors = {};
    if (!selectedBank) {
      errors.bank = "Please select a bank first";
    }
    if (!netbankingCredentials.username || netbankingCredentials.username.length < 3) {
      errors.netbankingUsername = "Username must be at least 3 characters";
    }
    if (!netbankingCredentials.password || netbankingCredentials.password.length < 6) {
      errors.netbankingPassword = "Password must be at least 6 characters";
    }
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setIsVerifyingNetbanking(true);
    setValidationErrors({});
    setTimeout(() => {
      setNetbankingVerified(true);
      setIsVerifyingNetbanking(false);
      alert(`${selectedBank} credentials verified successfully!`);
    }, 2000);
  };

  const handleFormSubmit = async () => {
    const errors = {};

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    // Validate based on selected payment method
    if (selectedMethod === 'card') {
      if (!cardDetails.cardNumber) {
        errors.cardNumber = "Card number is required";
      } else if (!validateCardNumber(cardDetails.cardNumber)) {
        errors.cardNumber = "Card number must be 16 digits (e.g., 1111 1111 1111 1111)";
      }

      if (!cardDetails.validThrough) {
        errors.validThrough = "Expiry date is required";
      } else if (!validateExpiry(cardDetails.validThrough)) {
        errors.validThrough = "Card has expired or invalid date";
      }

      if (!cardDetails.cvv) {
        errors.cvv = "CVV is required";
      } else if (cardDetails.cvv.length < 3) {
        errors.cvv = "CVV must be 3 or 4 digits";
      }

      if (!cardDetails.cardName) {
        errors.cardName = "Cardholder name is required";
      } else if (cardDetails.cardName.trim().length < 3) {
        errors.cardName = "Name must be at least 3 characters";
      }

    } else if (selectedMethod === 'netbanking') {
      if (!selectedBank) {
        errors.bank = "Please select a bank";
      }
      if (!netbankingCredentials.username || netbankingCredentials.username.length < 3) {
        errors.netbankingUsername = "Username must be at least 3 characters";
      }
      if (!netbankingCredentials.password || netbankingCredentials.password.length < 6) {
        errors.netbankingPassword = "Password must be at least 6 characters";
      }

    } else if (selectedMethod === 'upi') {
      if (!upiId && !selectedUpiApp) {
        errors.upi = "Please enter UPI ID or select a UPI app";
      } else if (upiId && !validateUpiId(upiId)) {
        errors.upi = "Invalid UPI ID format. Use format: 9876543210@paytm";
      } else if (!upiVerified) {
        errors.upi = "Please verify your UPI ID before proceeding";
      }
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors).join('\n');
      alert(`Please fix the following errors:\n\n${errorMessages}`);
      return;
    }

    setIsProcessing(true);
    try {
      // Get userId from localStorage (primary source)
      const userIdFromStorage = localStorage.getItem('userId');

      // Generate payment ID
      const paymentId = "PAY_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

      // Prepare booking data - ENSURE ALL REQUIRED FIELDS ARE PRESENT
      const bookingData = {
        userId: paymentDetails?.userId || userIdFromStorage || user?.id,
        username: paymentDetails?.userName || user?.name,
        email: email,
        userPhone: paymentDetails?.userPhone || user?.phone || '',
        userAddress: paymentDetails?.userAddress || user?.address || '',
        dietitianId: paymentDetails?.dietitianId,
        dietitianName: paymentDetails?.dietitianName,
        dietitianEmail: paymentDetails?.dietitianEmail,
        dietitianPhone: paymentDetails?.dietitianPhone || '',
        dietitianSpecialization: paymentDetails?.dietitianSpecialization || '',
        date: paymentDetails?.date,
        time: paymentDetails?.time,
        consultationType: paymentDetails?.consultationType || paymentDetails?.type,
        amount: paymentDetails?.amount,
        paymentMethod: selectedMethod,
        paymentId: paymentId,
      };

      // Validate all required fields before sending
      const requiredFields = [
        'userId', 'username', 'email', 'dietitianId', 'dietitianName', 
        'dietitianEmail', 'date', 'time', 'consultationType', 'amount', 
        'paymentMethod', 'paymentId'
      ];
      
      const missingFields = requiredFields.filter(field => !bookingData[field]);
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        alert(`Missing required information: ${missingFields.join(', ')}. Please close and try booking again.`);
        setIsProcessing(false);
        return;
      }

      // Create booking using Redux thunk
      const result = await dispatch(createBooking(bookingData)).unwrap();

      if (result) {
        // Call parent onSubmit for UI updates
        if (onSubmit) {
          onSubmit({ 
            email, 
            paymentMethod: selectedMethod, 
            amount: paymentDetails?.amount, 
            transactionId: paymentId,
            bookingId: result._id
          });
        }

        // Close modal
        onClose();

        // Reset form
        setEmail("");
        setSelectedMethod(null);
        setCardDetails({ cardNumber: "", validThrough: "", cvv: "", cardName: "" });
        setSelectedBank("");
        setNetbankingCredentials({ username: "", password: "" });
        setNetbankingVerified(false);
        setUpiId("");
        setSelectedUpiApp("");
        setUpiVerified(false);
        setValidationErrors({});
      }

    } catch (error) {
      console.error("Payment/Booking error:", error);
      
      // Check if it's a subscription limit error (handled via Redux state)
      if (!reduxShowSubscriptionAlert) {
        const errorMessage = typeof error === 'string' ? error : (error?.message || "Booking failed. Please try again.");
        alert(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentMethods = {
    card: {
      title: "Credit/Debit Card",
      content: (
        <div className="p-4 bg-gray-50 rounded-md">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2F4F4F' }}>
                Card Number *
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:outline-none ${validationErrors.cardNumber ? 'border-red-500' : ''}`}
                style={{ borderColor: validationErrors.cardNumber ? '#ef4444' : '#27AE60' }}
                value={cardDetails.cardNumber}
                onChange={(e) => {
                  // Only allow digits and spaces
                  const input = e.target.value.replace(/[^\d\s]/g, '');
                  const formatted = formatCardNumber(input);
                  setCardDetails({ ...cardDetails, cardNumber: formatted });
                  if (validationErrors.cardNumber) {
                    setValidationErrors({ ...validationErrors, cardNumber: null });
                  }
                }}
                maxLength="19"
                inputMode="numeric"
              />
              {validationErrors.cardNumber && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.cardNumber}</p>
              )}
              <div className="flex gap-2 mt-2">
                <img src="https://img.icons8.com/color/24/visa.png" alt="Visa" />
                <img src="https://img.icons8.com/color/24/mastercard.png" alt="Mastercard" />
                <img src="https://img.icons8.com/color/24/rupay.png" alt="RuPay" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#2F4F4F' }}>
                  Valid Through *
                </label>
                <input
                  type="month"
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:outline-none ${validationErrors.validThrough ? 'border-red-500' : ''}`}
                  style={{ borderColor: validationErrors.validThrough ? '#ef4444' : '#27AE60' }}
                  value={cardDetails.validThrough}
                  onChange={(e) => {
                    setCardDetails({ ...cardDetails, validThrough: e.target.value });
                    if (validationErrors.validThrough) {
                      setValidationErrors({ ...validationErrors, validThrough: null });
                    }
                  }}
                />
                {validationErrors.validThrough && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.validThrough}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#2F4F4F' }}>
                  CVV *
                </label>
                <input
                  type="password"
                  placeholder="•••"
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:outline-none ${validationErrors.cvv ? 'border-red-500' : ''}`}
                  style={{ borderColor: validationErrors.cvv ? '#ef4444' : '#27AE60' }}
                  value={cardDetails.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setCardDetails({ ...cardDetails, cvv: value });
                    if (validationErrors.cvv) {
                      setValidationErrors({ ...validationErrors, cvv: null });
                    }
                  }}
                  maxLength="4"
                />
                {validationErrors.cvv && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.cvv}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2F4F4F' }}>
                Name on Card *
              </label>
              <input
                type="text"
                placeholder="Enter name as on card"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:outline-none ${validationErrors.cardName ? 'border-red-500' : ''}`}
                style={{ borderColor: validationErrors.cardName ? '#ef4444' : '#27AE60' }}
                value={cardDetails.cardName}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                  setCardDetails({ ...cardDetails, cardName: value.toUpperCase() });
                  if (validationErrors.cardName) {
                    setValidationErrors({ ...validationErrors, cardName: null });
                  }
                }}
              />
              {validationErrors.cardName && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.cardName}</p>
              )}
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-blue-700">Your card information is secure and encrypted</p>
            </div>
          </div>
        </div>
      ),
    },
    netbanking: {
      title: "Net Banking",
      content: (
        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-sm mb-3" style={{ color: '#2F4F4F' }}>Select your bank to proceed with net banking payment</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: "SBI", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/SBI-logo.svg/200px-SBI-logo.svg.png" },
              { name: "HDFC", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/HDFC_Bank_Logo.svg/200px-HDFC_Bank_Logo.svg.png" },
              { name: "ICICI", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/ICICI_Bank_Logo.svg/200px-ICICI_Bank_Logo.svg.png" }
            ].map((bank) => (
              <button
                key={bank.name}
                type="button"
                className={`p-3 border-2 rounded-lg transition-all flex flex-col items-center justify-center gap-2 ${selectedBank === bank.name ? 'bg-white shadow-md scale-105' : 'hover:bg-white hover:shadow-sm'}`}
                style={{
                  borderColor: selectedBank === bank.name ? '#27AE60' : '#d1d5db'
                }}
                onClick={() => {
                  setSelectedBank(bank.name);
                  if (validationErrors.bank) {
                    setValidationErrors({ ...validationErrors, bank: null });
                  }
                }}
              >
                <img
                  src={bank.logo}
                  alt={bank.name}
                  className="h-8 w-auto object-contain"
                />
                <span
                  className="text-sm font-medium"
                  style={{
                    color: selectedBank === bank.name ? '#27AE60' : '#2F4F4F'
                  }}
                >
                  {bank.name}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2" style={{ color: '#2F4F4F' }}>Or select another bank</label>
            <select
              className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:outline-none ${validationErrors.bank ? 'border-red-500' : ''}`}
              style={{ borderColor: validationErrors.bank ? '#ef4444' : '#27AE60', color: '#2F4F4F' }}
              value={selectedBank}
              onChange={(e) => {
                setSelectedBank(e.target.value);
                if (validationErrors.bank) {
                  setValidationErrors({ ...validationErrors, bank: null });
                }
              }}
            >
              <option value="">Select Other Bank</option>
              <option value="Axis Bank">Axis Bank</option>
              <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
              <option value="Yes Bank">Yes Bank</option>
              <option value="Bank of Baroda">Bank of Baroda</option>
              <option value="Punjab National Bank">Punjab National Bank</option>
            </select>
            {validationErrors.bank && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.bank}</p>
            )}
          </div>
          {selectedBank && (
            <>
              <div className="mt-4 p-3 bg-green-50 rounded-md">
                <p className="text-sm" style={{ color: '#27AE60' }}>
                  ✓ Selected Bank: <span className="font-semibold">{selectedBank}</span>
                </p>
                <p className="text-xs text-gray-600 mt-1">Enter your {selectedBank} net banking credentials</p>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2F4F4F' }}>
                    Username / User ID
                  </label>
                  <input
                    type="text"
                    className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:outline-none ${validationErrors.netbankingUsername ? 'border-red-500' : ''}`}
                    style={{
                      borderColor: validationErrors.netbankingUsername ? '#ef4444' : '#27AE60',
                      color: '#2F4F4F'
                    }}
                    placeholder="Enter your username"
                    value={netbankingCredentials.username}
                    onChange={(e) => {
                      setNetbankingCredentials({
                        ...netbankingCredentials,
                        username: e.target.value
                      });
                      setNetbankingVerified(false);
                      if (validationErrors.netbankingUsername) {
                        setValidationErrors({ ...validationErrors, netbankingUsername: null });
                      }
                    }}
                  />
                  {validationErrors.netbankingUsername && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.netbankingUsername}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2F4F4F' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:outline-none ${validationErrors.netbankingPassword ? 'border-red-500' : ''}`}
                    style={{
                      borderColor: validationErrors.netbankingPassword ? '#ef4444' : '#27AE60',
                      color: '#2F4F4F'
                    }}
                    placeholder="Enter your password"
                    value={netbankingCredentials.password}
                    onChange={(e) => {
                      setNetbankingCredentials({
                        ...netbankingCredentials,
                        password: e.target.value
                      });
                      setNetbankingVerified(false);
                      if (validationErrors.netbankingPassword) {
                        setValidationErrors({ ...validationErrors, netbankingPassword: null });
                      }
                    }}
                  />
                  {validationErrors.netbankingPassword && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.netbankingPassword}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleVerifyNetbanking}
                  disabled={isVerifyingNetbanking || netbankingVerified}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${netbankingVerified
                    ? 'bg-green-500 text-white cursor-default'
                    : isVerifyingNetbanking
                      ? 'bg-gray-400 text-white cursor-wait'
                      : 'text-white hover:opacity-90'
                    }`}
                  style={{
                    backgroundColor: netbankingVerified ? '#27AE60' : isVerifyingNetbanking ? '#9ca3af' : '#27AE60'
                  }}
                >
                  {isVerifyingNetbanking ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : netbankingVerified ? (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    'Verify Credentials'
                  )}
                </button>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-xs text-blue-800">
                    🔒 Your credentials are encrypted and secure. We never store your banking password.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      ),
    },
    upi: {
      title: "UPI",
      content: (
        <div className="p-4 bg-gray-50 rounded-md">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: '#2F4F4F' }}>
                Select your UPI app to proceed with payment
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  name: "Google Pay",
                  logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png",
                  brandColor: "#4285F4"
                },
                {
                  name: "PhonePe",
                  textColor: "#5F259F",
                  brandColor: "#5F259F"
                },
                {
                  name: "Paytm",
                  logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/512px-Paytm_Logo_%28standalone%29.svg.png",
                  brandColor: "#00BAF2"
                },
                {
                  name: "BHIM",
                  textColor: "#ED1C24",
                  brandColor: "#ED1C24"
                }
              ].map((app) => (
                <button
                  key={app.name}
                  type="button"
                  className={`p-4 rounded-lg transition-all text-center border-2 ${selectedUpiApp === app.name
                    ? 'ring-4 ring-offset-2 scale-105 shadow-lg border-green-500'
                    : 'hover:scale-105 hover:shadow-md border-gray-200'
                    }`}
                  style={{
                    backgroundColor: "#FFFFFF",
                    ringColor: selectedUpiApp === app.name ? '#27AE60' : 'transparent'
                  }}
                  onClick={() => {
                    setSelectedUpiApp(app.name);
                    setUpiId('');
                    setUpiVerified(false);
                    if (validationErrors.upi) {
                      setValidationErrors({ ...validationErrors, upi: null });
                    }
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-16">
                    {(app.logo) ? (
                      <img
                        src={app.logo}
                        alt={app.name}
                        className="max-h-12 max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <p className="text-lg font-bold" style={{ color: app.textColor }}>
                          {app.name}
                        </p>
                        {app.name === "BHIM" && (
                          <p className="text-xs mt-1" style={{ color: app.textColor }}>UPI</p>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {selectedUpiApp && (
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-md">
                  <p className="text-sm" style={{ color: '#5F259F' }}>
                    ✓ Selected: <span className="font-semibold">{selectedUpiApp}</span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2F4F4F' }}>
                    Enter your {selectedUpiApp} UPI ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`9876543210@${selectedUpiApp.toLowerCase().replace(' ', '')}`}
                      className={`flex-1 p-3 border-2 rounded-lg focus:ring-2 focus:outline-none ${validationErrors.upi ? 'border-red-500' : ''}`}
                      style={{ borderColor: validationErrors.upi ? '#ef4444' : '#27AE60', color: '#2F4F4F' }}
                      value={upiId}
                      onChange={(e) => {
                        setUpiId(e.target.value.toLowerCase());
                        setUpiVerified(false);
                        if (validationErrors.upi) {
                          setValidationErrors({ ...validationErrors, upi: null });
                        }
                      }}
                      disabled={isProcessing}
                    />
                    <button
                      type="button"
                      className={`px-6 text-white rounded-lg transition-all font-medium ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ backgroundColor: upiVerified ? '#27AE60' : '#27AE60' }}
                      onMouseEnter={(e) => !isProcessing && !upiVerified && (e.target.style.backgroundColor = '#1A4A40')}
                      onMouseLeave={(e) => !isProcessing && !upiVerified && (e.target.style.backgroundColor = '#27AE60')}
                      onClick={handleVerifyUpi}
                      disabled={isProcessing || upiVerified}
                    >
                      {isProcessing ? 'Verifying...' : upiVerified ? '✓ Verified' : 'Verify'}
                    </button>
                  </div>
                  {validationErrors.upi && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.upi}</p>
                  )}
                  {upiVerified && (
                    <p className="text-xs mt-1" style={{ color: '#27AE60' }}>✓ UPI ID verified successfully</p>
                  )}
                  <p className="text-xs text-gray-600 mt-1">
                    Enter 10-digit mobile number linked to {selectedUpiApp}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    },
  };

  return (
    <>
      {/* Payment Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
        {/* Glassmorphism Blur Background */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300"
          onClick={onClose}
        ></div>

        {/* Modal Card with Glassmorphism Effect */}
        <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 border border-white/20">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold" style={{ color: '#1A4A40' }}>
              Complete Payment
            </h2>
            <button
              onClick={onClose}
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-2xl font-light rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Booking Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide" style={{ color: '#1A4A40' }}>
              Booking Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Amount:</span>
                <span className="font-bold text-lg" style={{ color: '#27AE60' }}>
                  ₹{paymentDetails?.amount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Dietitian:</span>
                <span className="font-medium text-gray-800 text-sm">
                  {paymentDetails?.dietitianName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Date:</span>
                <span className="font-medium text-gray-800 text-sm">
                  {paymentDetails?.date}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Time:</span>
                <span className="font-medium text-gray-800 text-sm">
                  {paymentDetails?.time}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Type:</span>
                <span className="font-medium text-gray-800 text-sm">
                  {paymentDetails?.type}
                </span>
              </div>
            </div>
          </div>

          {/* Email Field */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">Email Address *</label>
            <p className="text-xs text-gray-500 mb-2">
              Booking confirmation will be sent to this email
            </p>
            <input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validationErrors.email) {
                  setValidationErrors({ ...validationErrors, email: null });
                }
              }}
              readOnly={!!user?.email}
              className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 text-gray-700 font-medium placeholder-gray-400 ${user?.email ? 'bg-gray-100 cursor-not-allowed' : ''} ${validationErrors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {user?.email && (
              <p className="text-xs text-emerald-600 mt-1">
                ✓ Email auto-filled from your account
              </p>
            )}
            {validationErrors.email && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
            )}
          </div>

          {/* Payment Method Selection */}
          <h3 className="text-xl font-bold mb-4" style={{ color: '#1A4A40' }}>Payment Method</h3>
          <div className="bg-gray-50 rounded-md p-4 mb-6 text-lg font-semibold" style={{ color: '#2F4F4F' }}>
            Amount to be Paid: ₹{paymentDetails?.amount || "---"}
          </div>
          
          <div className="space-y-4 mb-6">
            {Object.entries(paymentMethods).map(([key, method]) => (
              <div key={key} className="border rounded-lg overflow-hidden">
                <div
                  className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedMethod === key ? "bg-gray-50" : ""}`}
                  onClick={() => setSelectedMethod(selectedMethod === key ? null : key)}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedMethod === key}
                    onChange={() => setSelectedMethod(key)}
                    className="h-4 w-4 focus:ring-2"
                    style={{ accentColor: '#27AE60' }}
                  />
                  <label className="ml-3 font-medium" style={{ color: '#2F4F4F' }}>{method.title}</label>
                </div>
                {selectedMethod === key && method.content}
              </div>
            ))}
          </div>

          {/* Security Notice */}
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-xs text-emerald-700 flex items-center gap-2">
              <span className="text-emerald-600">🔒</span>
              Your payment information is secure and encrypted
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleFormSubmit}
              disabled={isProcessing || !selectedMethod || (selectedMethod === 'upi' && !upiVerified)}
              className={`flex-1 px-4 py-3 rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${(!selectedMethod || (selectedMethod === 'upi' && !upiVerified)) ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'text-white'}`}
              style={selectedMethod && !(selectedMethod === 'upi' && !upiVerified) ? { backgroundColor: '#27AE60' } : {}}
              onMouseEnter={(e) => selectedMethod && !(selectedMethod === 'upi' && !upiVerified) && !isProcessing && (e.target.style.backgroundColor = '#1A4A40')}
              onMouseLeave={(e) => selectedMethod && !(selectedMethod === 'upi' && !upiVerified) && !isProcessing && (e.target.style.backgroundColor = '#27AE60')}
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Processing...
                </>
              ) : (
                "Confirm Payment"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Alert Modal */}
      {reduxShowSubscriptionAlert && reduxSubscriptionAlertData && (
        <SubscriptionAlert
          message={reduxSubscriptionAlertData.message}
          planType={reduxSubscriptionAlertData.planType}
          limitType={reduxSubscriptionAlertData.limitType}
          currentCount={reduxSubscriptionAlertData.currentCount}
          limit={reduxSubscriptionAlertData.limit}
          onClose={() => {
            dispatch(clearSubscriptionAlert());
            onClose(); // Also close the payment modal
          }}
        />
      )}
    </>
  );
};

export default PaymentNotificationModal;
