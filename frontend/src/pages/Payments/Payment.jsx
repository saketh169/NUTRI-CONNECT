import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useAuth } from "../../hooks/useAuth";
import {
  checkActiveSubscription,
  initializePayment,
  processPayment,
  selectActiveSubscription,
  selectCurrentPayment,
  selectPaymentStatus,
  selectIsProcessingPayment,
  selectError,
  resetPaymentStatus,
  clearError,
  setPaymentStatus
} from "../../redux/slices/paymentSlice";

const Payment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan");
  const billing = searchParams.get("billing");
  const amount = searchParams.get("amount");
  const { token, isAuthenticated } = useAuth('user');
  
  // Redux state
  const activeSubscription = useSelector(selectActiveSubscription);
  const currentPayment = useSelector(selectCurrentPayment);
  const reduxPaymentStatus = useSelector(selectPaymentStatus);
  const isProcessingPayment = useSelector(selectIsProcessingPayment);
  const reduxError = useSelector(selectError);
  
  // Local UI state
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [localPaymentStatus, setLocalPaymentStatus] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Check authentication and subscription status
  useEffect(() => {
    if (!isAuthenticated) {
      alert('Please login to continue with payment');
      navigate('/role');
    } else {
      dispatch(checkActiveSubscription());
    }
  }, [isAuthenticated, token, navigate, dispatch]);
  
  // Handle Redux payment status changes
  useEffect(() => {
    if (reduxPaymentStatus === 'success' && currentPayment?.transactionId) {
      setLocalPaymentStatus('success');
      setTimeout(() => {
        setShowModal(false);
        dispatch(resetPaymentStatus());
        navigate(`/user/payment-success?transactionId=${currentPayment.transactionId}`);
      }, 2000);
    } else if (reduxPaymentStatus === 'failed') {
      setLocalPaymentStatus('failed');
      if (reduxError) {
        alert(reduxError);
        dispatch(clearError());
      }
    } else if (reduxPaymentStatus === 'processing') {
      setLocalPaymentStatus('processing');
    }
  }, [reduxPaymentStatus, currentPayment, navigate, dispatch, reduxError]);

  // Payment form states
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
  const [emiBank, setEmiBank] = useState("");
  const [emiTenure, setEmiTenure] = useState(null);
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

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

  // Validate UPI ID - Only 10 digit mobile number before @
  const validateUpiId = (id) => {
    const upiRegex = /^\d{10}@[\w.-]+$/;
    return upiRegex.test(id);
  };

  const handleProceed = async () => {
    const errors = {};

    // First check subscription status using Redux
    try {
      const result = await dispatch(checkActiveSubscription()).unwrap();
      if (result.hasActiveSubscription) {
        setShowSubscriptionModal(true);
        return;
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
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
      // Removed strict verification requirement - optional verification for UX
    } else if (selectedMethod === 'upi') {
      if (!upiId && !selectedUpiApp) {
        errors.upi = "Please enter UPI ID or select a UPI app";
      } else if (upiId && !validateUpiId(upiId)) {
        errors.upi = "Invalid UPI ID format. Use format: 9876543210@paytm";
      } else if (!upiVerified) {
        errors.upi = "Please verify your UPI ID before proceeding";
      }

    } else if (selectedMethod === 'emi') {
      if (!emiBank) {
        errors.emiBank = "Please select a bank";
      }
      if (!emiTenure) {
        errors.emiTenure = "Please select EMI tenure";
      }
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      setShowModal(true);
    } else {
      // Show specific error messages
      const errorMessages = Object.values(errors).join('\n');
      alert(`Please fix the following errors:\n\n${errorMessages}`);
      console.log('Validation errors:', errors);
    }
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

    setIsVerifyingUpi(true);
    // Simulate verification
    setTimeout(() => {
      setUpiVerified(true);
      setIsVerifyingUpi(false);
      alert(`UPI ID ${upiId} verified successfully!`);
    }, 1500);
  };

  const handleVerifyNetbanking = () => {
    // Clear previous errors
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

    // Simulate bank verification
    setTimeout(() => {
      setNetbankingVerified(true);
      setIsVerifyingNetbanking(false);
      alert(`${selectedBank} credentials verified successfully!`);
    }, 2000);
  };

  const handleConfirmPayment = async () => {
    dispatch(setPaymentStatus('processing'));

    try {
      // Validate token before making API call
      if (!token) {
        alert('Authentication token not found. Please login again.');
        navigate('/role');
        return;
      }

      // First, check if user has an active subscription using Redux
      const subResult = await dispatch(checkActiveSubscription()).unwrap();
      if (subResult.hasActiveSubscription) {
        setShowSubscriptionModal(true);
        dispatch(setPaymentStatus(null));
        return;
      }

      // Initialize payment using Redux thunk
      const paymentDetails = {
        cardLast4: selectedMethod === 'card' ? cardDetails.cardNumber.replace(/\s/g, '').slice(-4) : undefined,
        cardType: selectedMethod === 'card' ? 'Credit/Debit' : undefined,
        bankName: selectedMethod === 'netbanking' ? selectedBank : undefined,
        upiId: selectedMethod === 'upi' ? upiId : undefined,
        upiApp: selectedMethod === 'upi' ? selectedUpiApp : undefined,
        emiBank: selectedMethod === 'emi' ? emiBank : undefined,
        emiTenure: selectedMethod === 'emi' ? emiTenure : undefined
      };

      const initResult = await dispatch(initializePayment({
        planType: plan,
        billingCycle: billing,
        amount: parseFloat(amount),
        paymentMethod: selectedMethod,
        paymentDetails
      })).unwrap();

      if (initResult?.id) {
        // Process the payment using Redux thunk
        await dispatch(processPayment({ paymentId: initResult.id })).unwrap();
      }
    } catch (error) {
      console.error('Payment error:', error);
      
      // Handle specific error cases
      if (error === 'Not authenticated' || error?.includes?.('token')) {
        alert('Authentication failed. Please login again.');
        navigate('/role');
      } else {
        alert(error || 'Payment failed. Please try again.');
      }
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
                className={`w-full p-2 border rounded-md focus:ring-2 focus:outline-none ${validationErrors.cardNumber ? 'border-red-500' : ''
                  }`}
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
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:outline-none ${validationErrors.validThrough ? 'border-red-500' : ''
                    }`}
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
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:outline-none ${validationErrors.cvv ? 'border-red-500' : ''
                    }`}
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
                className={`w-full p-2 border rounded-md focus:ring-2 focus:outline-none ${validationErrors.cardName ? 'border-red-500' : ''
                  }`}
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
                className={`p-3 border-2 rounded-lg transition-all flex flex-col items-center justify-center gap-2 ${selectedBank === bank.name ? 'bg-white shadow-md scale-105' : 'hover:bg-white hover:shadow-sm'
                  }`}
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
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
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
              className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:outline-none ${validationErrors.bank ? 'border-red-500' : ''
                }`}
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
              <option value="Union Bank">Union Bank</option>
              <option value="Canara Bank">Canara Bank</option>
              <option value="Bank of India">Bank of India</option>
            </select>
            {validationErrors.bank && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.bank}</p>
            )}
          </div>
          {selectedBank && (
            <div className="mt-4 p-3 bg-green-50 rounded-md">
              <p className="text-sm" style={{ color: '#27AE60' }}>
                ✓ Selected Bank: <span className="font-semibold">{selectedBank}</span>
              </p>
              <p className="text-xs text-gray-600 mt-1">Enter your {selectedBank} net banking credentials</p>
            </div>
          )}

          {selectedBank && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#2F4F4F' }}>
                  Username / User ID
                </label>
                <input
                  type="text"
                  className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:outline-none ${validationErrors.netbankingUsername ? 'border-red-500' : ''
                    }`}
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
                  className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:outline-none ${validationErrors.netbankingPassword ? 'border-red-500' : ''
                    }`}
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

              {validationErrors.netbankingVerify && (
                <p className="text-xs text-red-500 text-center">{validationErrors.netbankingVerify}</p>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-xs text-blue-800">
                  🔒 Your credentials are encrypted and secure. We never store your banking password.
                </p>
              </div>
            </div>
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
                  bgColor: "#FFFFFF",
                  textColor: "#4285F4",
                  brandColor: "#4285F4"
                },
                {
                  name: "PhonePe",
                  logo: "https://i.pinimg.com/736x/88/ff/f3/88fff330d69dcd30c90efbfa6410376d.jpg",
                  bgColor: "#FFFFFF",
                  textColor: "#5F259F",
                  brandColor: "#5F259F"
                },
                {
                  name: "Paytm",
                  logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/512px-Paytm_Logo_%28standalone%29.svg.png",
                  bgColor: "#FFFFFF",
                  textColor: "#00BAF2",
                  brandColor: "#00BAF2"
                },
                {
                  name: "BHIM",
                  logo: "https://brandlogos.net/wp-content/uploads/2022/04/bhim-logo-brandlogos.net_.png",
                  bgColor: "#FFFFFF",
                  textColor: "#ED1C24",
                  brandColor: "#ED1C24"
                }
              ].map((app) => (
                <button
                  key={app.name}
                  className={`p-4 rounded-lg transition-all text-center border-2 ${selectedUpiApp === app.name
                    ? 'ring-4 ring-offset-2 scale-105 shadow-lg border-green-500'
                    : 'hover:scale-105 hover:shadow-md border-gray-200'
                    }`}
                  style={{
                    backgroundColor: app.name === "PhonePe" || app.name === "BHIM" ? app.bgColor : "#FFFFFF",
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
                    {(app.name === "Google Pay" || app.name === "Paytm") ? (
                      <>
                        <img
                          src={app.logo}
                          alt={app.name}
                          className="max-h-12 max-w-full object-contain"
                        />
                      </>
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
                      className={`flex-1 p-3 border-2 rounded-lg focus:ring-2 focus:outline-none ${validationErrors.upi ? 'border-red-500' : ''
                        }`}
                      style={{ borderColor: validationErrors.upi ? '#ef4444' : '#27AE60', color: '#2F4F4F' }}
                      value={upiId}
                      onChange={(e) => {
                        setUpiId(e.target.value.toLowerCase());
                        setUpiVerified(false);
                        if (validationErrors.upi) {
                          setValidationErrors({ ...validationErrors, upi: null });
                        }
                      }}
                      disabled={isVerifyingUpi}
                    />
                    <button
                      className={`px-6 text-white rounded-lg transition-all font-medium ${isVerifyingUpi ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      style={{ backgroundColor: upiVerified ? '#27AE60' : '#27AE60' }}
                      onMouseEnter={(e) => !isVerifyingUpi && !upiVerified && (e.target.style.backgroundColor = '#1A4A40')}
                      onMouseLeave={(e) => !isVerifyingUpi && !upiVerified && (e.target.style.backgroundColor = '#27AE60')}
                      onClick={handleVerifyUpi}
                      disabled={isVerifyingUpi || upiVerified}
                    >
                      {isVerifyingUpi ? 'Verifying...' : upiVerified ? '✓ Verified' : 'Verify'}
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
    emi: {
      title: "EMI",
      content: (
        <div className="p-4 bg-gray-50 rounded-md">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2F4F4F' }}>
                Select Your Bank *
              </label>
              <select
                className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:outline-none ${validationErrors.emiBank ? 'border-red-500' : ''
                  }`}
                style={{ borderColor: validationErrors.emiBank ? '#ef4444' : '#27AE60', color: '#2F4F4F' }}
                value={emiBank}
                onChange={(e) => {
                  setEmiBank(e.target.value);
                  if (validationErrors.emiBank) {
                    setValidationErrors({ ...validationErrors, emiBank: null });
                  }
                }}
              >
                <option value="">Select Bank for EMI</option>
                <option value="HDFC Bank">HDFC Bank - 12-18% Interest</option>
                <option value="ICICI Bank">ICICI Bank - 13-19% Interest</option>
                <option value="Axis Bank">Axis Bank - 14-20% Interest</option>
                <option value="SBI">SBI - 11-17% Interest</option>
                <option value="Kotak Bank">Kotak Bank - 13-19% Interest</option>
              </select>
              {validationErrors.emiBank && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.emiBank}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2F4F4F' }}>
                Select EMI Tenure *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[3, 6, 12].map((months) => {
                  // const monthlyAmount = Math.round(amount / months); // Removed unused variable
                  const interest = months === 3 ? 12 : months === 6 ? 14 : 16;
                  const totalInterest = Math.round((amount * interest * months) / (12 * 100));
                  const totalAmount = parseInt(amount) + totalInterest;
                  const emiAmount = Math.round(totalAmount / months);

                  return (
                    <button
                      key={months}
                      className={`p-4 border-2 rounded-lg transition-all ${emiTenure === months ? 'bg-white shadow-lg scale-105' : 'hover:bg-white hover:shadow-md'
                        }`}
                      style={{
                        borderColor: emiTenure === months ? '#27AE60' : '#d1d5db'
                      }}
                      onClick={() => {
                        setEmiTenure(months);
                        if (validationErrors.emiTenure) {
                          setValidationErrors({ ...validationErrors, emiTenure: null });
                        }
                      }}
                    >
                      <div className="font-bold text-lg" style={{ color: '#1A4A40' }}>{months} Months</div>
                      <div className="text-sm font-semibold mt-1" style={{ color: '#27AE60' }}>
                        ₹{emiAmount}/month
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Interest: ~{interest}% p.a.
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Total: ₹{totalAmount}
                      </div>
                    </button>
                  );
                })}
              </div>
              {validationErrors.emiTenure && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.emiTenure}</p>
              )}
            </div>
            {emiBank && emiTenure && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900">EMI Summary</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Bank: {emiBank} | Tenure: {emiTenure} months
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      You will be redirected to {emiBank} for EMI approval
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="relative mb-8">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-0 top-0 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          style={{ backgroundColor: '#27AE60' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#1A4A40'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#27AE60'}
        >
          <i className="fas fa-chevron-left"></i>
          Back
        </button>
      </div>

      <div className="w-[70%] mx-auto bg-white rounded-lg shadow-lg p-8" style={{ borderTop: '4px solid #27AE60', borderBottom: '4px solid #27AE60' }}>
        <h3 className="text-2xl font-bold mb-6" style={{ color: '#1A4A40' }}>Payment Method</h3>
        <div className="bg-gray-50 rounded-md p-4 mb-6 text-lg font-semibold" style={{ color: '#2F4F4F' }}>
          Amount to be Paid: ₹{amount || "---"}
        </div>

        <div className="space-y-4">
          {Object.entries(paymentMethods).map(([key, method]) => (
            <div key={key} className="border rounded-lg overflow-hidden">
              <div
                className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedMethod === key ? "bg-gray-50" : ""
                  }`}
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
                <label className="ml-3" style={{ color: '#2F4F4F' }}>{method.title}</label>
              </div>
              {selectedMethod === key && method.content}
            </div>
          ))}
        </div>

        <button
          onClick={handleProceed}
          className={`w-full mt-8 py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${selectedMethod && !(selectedMethod === 'upi' && !upiVerified)
            ? "text-white"
            : "bg-gray-300 cursor-not-allowed text-gray-500"
            }`}
          style={selectedMethod && !(selectedMethod === 'upi' && !upiVerified) ? { backgroundColor: '#27AE60' } : {}}
          onMouseEnter={(e) => selectedMethod && !(selectedMethod === 'upi' && !upiVerified) && (e.target.style.backgroundColor = '#1A4A40')}
          onMouseLeave={(e) => selectedMethod && !(selectedMethod === 'upi' && !upiVerified) && (e.target.style.backgroundColor = '#27AE60')}
          disabled={!selectedMethod || (selectedMethod === 'upi' && !upiVerified)}
        >
          Proceed to Payment
        </button>
      </div>

      {/* Confirm Payment Page */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
          <Header />
          <div className="min-h-screen pt-4 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="relative mb-8">
              <button
                onClick={() => setShowModal(false)}
                className="absolute left-4 top-8 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                style={{ backgroundColor: '#27AE60' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1A4A40'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#27AE60'}
              >
                <i className="fas fa-chevron-left"></i>
                Back
              </button>
            </div>
            <div className="w-[70%] mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8 text-center" style={{ borderTop: '4px solid #27AE60', borderBottom: '4px solid #27AE60' }}>
                {(localPaymentStatus === "processing" || isProcessingPayment) ? (
                  <div>
                    <div className="mb-4">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto" style={{ borderColor: '#27AE60' }}></div>
                    </div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A4A40' }}>Processing Payment...</h2>
                    <p style={{ color: '#2F4F4F' }}>Please wait while we process your payment</p>
                    <p className="text-sm text-gray-500 mt-2">Do not close this window</p>
                  </div>
                ) : localPaymentStatus === "success" ? (
                  <div>
                    <div className="mb-4">
                      <svg className="mx-auto h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#27AE60' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold mb-3" style={{ color: '#27AE60' }}>Payment Successful!</h2>
                    <p className="text-lg mb-2" style={{ color: '#2F4F4F' }}>Your payment of ₹{amount} has been processed successfully.</p>
                    <p className="text-sm text-gray-600">Transaction ID: {currentPayment?.transactionId || `TXN${Date.now()}`}</p>
                    <p className="text-sm text-gray-500 mt-2">Redirecting to confirmation page...</p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A4A40' }}>Confirm Your Payment</h2>
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                        <p className="text-lg font-semibold" style={{ color: '#1A4A40' }}>
                          {paymentMethods[selectedMethod]?.title}
                        </p>
                      </div>
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-600 mb-1">Plan Details</p>
                        <p className="text-base font-medium" style={{ color: '#2F4F4F' }}>
                          {plan?.toUpperCase()} Plan ({billing})
                        </p>
                      </div>
                      <div className="border-t pt-4 mt-4">
                        <p className="text-sm text-gray-600 mb-2">Amount to Pay</p>
                        <p className="text-5xl font-bold" style={{ color: '#27AE60' }}>₹{amount}</p>
                      </div>

                      {/* Show method-specific details */}
                      {selectedMethod === 'card' && cardDetails.cardNumber && (
                        <div className="mt-4 pt-4 border-t text-left">
                          <p className="text-xs text-gray-600">Card ending in ****{cardDetails.cardNumber.slice(-4)}</p>
                        </div>
                      )}
                      {selectedMethod === 'netbanking' && selectedBank && (
                        <div className="mt-4 pt-4 border-t text-left">
                          <p className="text-xs text-gray-600">Bank: {selectedBank}</p>
                        </div>
                      )}
                      {selectedMethod === 'upi' && (upiId || selectedUpiApp) && (
                        <div className="mt-4 pt-4 border-t text-left">
                          <p className="text-xs text-gray-600">
                            {upiId ? `UPI ID: ${upiId}` : `App: ${selectedUpiApp}`}
                          </p>
                        </div>
                      )}
                      {selectedMethod === 'emi' && emiBank && emiTenure && (
                        <div className="mt-4 pt-4 border-t text-left">
                          <p className="text-xs text-gray-600">EMI: {emiBank} - {emiTenure} months</p>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={handleConfirmPayment}
                        disabled={isProcessingPayment}
                        className={`text-white py-3 px-10 rounded-lg transition-all font-semibold text-lg ${isProcessingPayment ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        style={{ backgroundColor: '#27AE60' }}
                        onMouseEnter={(e) => !isProcessingPayment && (e.target.style.backgroundColor = '#1A4A40')}
                        onMouseLeave={(e) => !isProcessingPayment && (e.target.style.backgroundColor = '#27AE60')}
                      >
                        {isProcessingPayment ? 'Processing...' : 'Confirm & Pay'}
                      </button>
                      <button
                        onClick={() => setShowModal(false)}
                        disabled={isProcessingPayment}
                        className={`bg-gray-200 hover:bg-gray-300 py-3 px-10 rounded-lg font-semibold text-lg ${isProcessingPayment ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        style={{ color: '#2F4F4F' }}
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-6">
                      🔒 Your payment information is secure and encrypted
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          <Footer />
        </div>
      )}

      {/* Active Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-linear-to-br from-black/60 via-gray-900/50 to-black/60 backdrop-blur-md">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="bg-yellow-50 px-6 py-4 rounded-t-lg border-b border-yellow-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-yellow-800">Active Subscription Detected</h3>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="text-yellow-600 hover:text-yellow-800 text-xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="px-6 py-6 text-center">
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-gray-700 mb-2">
                You currently have an active subscription:
              </p>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                {activeSubscription?.planType} Plan
              </p>
              <p className="text-gray-600 mb-6">
                Valid until: <span className="font-medium">{activeSubscription ? new Date(activeSubscription.subscriptionEndDate).toLocaleDateString() : ''}</span>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                To purchase a new subscription, please wait until your current subscription expires.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowSubscriptionModal(false);
                    navigate('/user/subscription');
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  View Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
