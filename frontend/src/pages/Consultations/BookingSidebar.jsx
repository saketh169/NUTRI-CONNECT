import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuthContext } from "../../hooks/useAuthContext";
import SubscriptionAlert from '../../middleware/SubscriptionAlert';
import {
  fetchBookedSlots,
  fetchUserBookedSlots,
  checkBookingLimits,
  selectBookedSlots,
  selectUserBookedSlots,
  selectCurrentUserBookedTimesWithDietitian,
  selectSubscriptionAlertData,
  selectShowSubscriptionAlert,
  selectIsLoadingSlots,
  clearSubscriptionAlert,
  clearBookedSlots
} from "../../redux/slices/bookingSlice";

const BookingSidebar = ({
  isOpen,
  onClose,
  onProceedToPayment,
  dietitianId,
  dietitian,
}) => {
  const dispatch = useDispatch();
  const { user } = useAuthContext();

  const [selectedDate, setSelectedDate] = useState(
    () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  );
  const [selectedTime, setSelectedTime] = useState("");
  const [consultationType, setConsultationType] = useState("Online");
  const [availableSlots, setAvailableSlots] = useState({
    morning: [],
    afternoon: [],
    evening: [],
  });

  // Redux state - these are flat arrays from Redux store
  const bookedSlots = useSelector(selectBookedSlots);
  const userBookedSlots = useSelector(selectUserBookedSlots);
  const currentUserBookedTimesWithDietitian = useSelector(selectCurrentUserBookedTimesWithDietitian);
  const subscriptionAlertData = useSelector(selectSubscriptionAlertData);
  const showSubscriptionAlert = useSelector(selectShowSubscriptionAlert);
  const isLoading = useSelector(selectIsLoadingSlots);

  // Local state for message
  const [message, setMessage] = useState("");

  // Clear slots and log info when sidebar opens or dietitian changes
  useEffect(() => {
    if (isOpen && dietitianId) {
      // Clear previous data when opening for a new dietitian
      dispatch(clearBookedSlots());
      console.log("Current User ID from auth context:", user?.id || user?._id);
      console.log("Selected Dietitian ID:", dietitianId);
      
      // Refresh slots when sidebar opens
      if (selectedDate) {
        const userId = user?.id || user?._id || localStorage.getItem("userId") || '';
        dispatch(fetchBookedSlots({ dietitianId, date: selectedDate, userId }));
        dispatch(fetchUserBookedSlots({ userId, date: selectedDate }));
      }
    }
  }, [isOpen, dietitianId, dispatch, user, selectedDate]);

  // Fetch all user bookings using Redux
  useEffect(() => {
    const userId = user?.id || user?._id || localStorage.getItem("userId");
    if (!userId || !selectedDate || !isOpen) return;

    dispatch(fetchUserBookedSlots({ userId, date: selectedDate }));
  }, [user, isOpen, selectedDate, dispatch]);

  // Fetch dietitian's booked slots using Redux
  const fetchDietitianBookedSlots = useCallback(
    (date) => {
      if (!dietitianId || !date) return;

      const userId = user?.id || user?._id || localStorage.getItem("userId") || '';
      dispatch(fetchBookedSlots({ dietitianId, date, userId }));
    },
    [dietitianId, user, dispatch]
  );

  // Removed old fetchUserBookedSlots callback - now using Redux

  // Load available slots and booked slots
  useEffect(() => {
    if (!selectedDate || !dietitianId) return;

    console.log("Selected date on calendar:", selectedDate);

    const loadSlots = () => {
      setMessage("");
      setAvailableSlots({ morning: [], afternoon: [], evening: [] });

      try {
        const now = new Date();
        const isToday =
          new Date(selectedDate).toDateString() === now.toDateString();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        // Get available slots
        const allSlots = [
          "09:00",
          "09:30",
          "10:00",
          "10:30",
          "11:00",
          "11:30",
          "12:00",
          "12:30",
          "13:00",
          "13:30",
          "14:00",
          "14:30",
          "15:00",
          "15:30",
          "16:00",
          "16:30",
          "17:00",
          "17:30",
          "18:00",
          "18:30",
          "19:00",
          "19:30",
          "20:00",
        ].filter((slot) => {
          if (!isToday) return true;
          const [hour, minute] = slot.split(":").map(Number);
          return hour * 60 + minute > currentTime;
        });

        // Categorize slots
        const categorizedSlots = {
          morning: allSlots.filter((s) => {
            const [hour] = s.split(":").map(Number);
            return hour < 12;
          }),
          afternoon: allSlots.filter((s) => {
            const [hour] = s.split(":").map(Number);
            return hour >= 12 && hour < 17;
          }),
          evening: allSlots.filter((s) => {
            const [hour] = s.split(":").map(Number);
            return hour >= 17;
          }),
        };

        setAvailableSlots(categorizedSlots);

        // Auto-select the first available time slot
        const firstAvailableSlot = 
          categorizedSlots.morning[0] || 
          categorizedSlots.afternoon[0] || 
          categorizedSlots.evening[0];
        
        if (firstAvailableSlot) {
          setSelectedTime(firstAvailableSlot);
        } else {
          setSelectedTime(""); // No slots available
        }

        // Fetch dietitian booked slots using Redux
        fetchDietitianBookedSlots(selectedDate);
      } catch (error) {
        console.error("Error loading slots:", error);
        setMessage("Error loading slots");
      }
    };

    loadSlots();
  }, [selectedDate, dietitianId, fetchDietitianBookedSlots]);

  // NEW: Helper function to check if user has conflict at this time with ANOTHER dietitian
  const getUserConflictAt = (time) => {
    // userBookedSlots contains all user's bookings on the selected date
    // We need to filter out bookings with the current dietitian and find conflicts with others
    const conflict = userBookedSlots.find((slot) => 
      slot.time === time && slot.dietitianId !== dietitianId
    );
    return conflict;
  };

  // Helper function to check if a slot is unavailable
  const isSlotUnavailable = (time) => {
    return (
      currentUserBookedTimesWithDietitian.includes(time) ||
      bookedSlots.includes(time) ||
      getUserConflictAt(time)
    );
  };

  // Update selected time when booked slots are loaded - ensure we don't select an unavailable slot
  useEffect(() => {
    if (selectedTime && isSlotUnavailable(selectedTime)) {
      // Current selection is unavailable, find first available slot
      const allSlots = [
        ...availableSlots.morning,
        ...availableSlots.afternoon,
        ...availableSlots.evening
      ];
      const firstAvailable = allSlots.find(slot => !isSlotUnavailable(slot));
      setSelectedTime(firstAvailable || "");
    }
  }, [bookedSlots, currentUserBookedTimesWithDietitian, userBookedSlots]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      setMessage("Please select a date and time slot.");
      return;
    }

    // Check for user's conflicting appointment
    const conflict = getUserConflictAt(selectedTime);
    if (conflict) {
      setMessage(
        `You already have an appointment with ${conflict.dietitianName} at ${selectedTime}. Please select a different time.`
      );
      return;
    }

    // Check subscription limits using Redux
    try {
      const userId = localStorage.getItem("userId") || user?.id;
      
      const result = await dispatch(checkBookingLimits({
        userId,
        date: selectedDate,
        time: selectedTime,
        dietitianId
      })).unwrap();

      if (!result.success && result.limitReached) {
        // Subscription alert will be shown via Redux state
        return;
      }
    } catch (error) {
      console.error('Error checking subscription limits:', error);
      // If API fails, allow user to proceed (fail-safe)
    }

    // Get userId from localStorage
    const userId = localStorage.getItem("userId");

    // Prepare data object
    const dataToSend = {
      date: selectedDate,
      time: selectedTime,
      type: consultationType,
      consultationType,
      amount: dietitian?.consultationFee || dietitian?.fees || 500,
      userId: userId || user?.id || "",
      userName: user?.name || "",
      userEmail: user?.email || "",
      userPhone: user?.phone || "",
      userAddress: user?.address || "",
      dietitianId: dietitianId || dietitian?._id || "",
      dietitianName: dietitian?.name || "",
      dietitianEmail: dietitian?.email || "",
      dietitianPhone: dietitian?.phone || "",
      dietitianSpecialization:
        dietitian?.specialties?.[0] || dietitian?.specialization || "",
    };

    console.log("Data being sent to payment:", dataToSend);
    onProceedToPayment(dataToSend);
  };

  const todayStr = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 21);
  const maxDateStr = (() => {
    const year = maxDate.getFullYear();
    const month = String(maxDate.getMonth() + 1).padStart(2, '0');
    const day = String(maxDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  // Helper function to render time slot button
  const renderTimeSlot = (time) => {
    const isBookedByCurrentUser = currentUserBookedTimesWithDietitian.includes(time);
    const isBookedByOthers = bookedSlots.includes(time);
    const userConflict = getUserConflictAt(time);
    const isSelected = selectedTime === time;

    let buttonClass =
      "px-4 py-2 rounded-lg transition font-medium text-center relative border-2 ";
    let isDisabled = false;
    let label = null;

        if (isBookedByCurrentUser) {
          // Slot booked by current user with this dietitian
          buttonClass +=
            "bg-red-100 text-red-700 cursor-not-allowed opacity-80 border-red-300";
          isDisabled = true;
          label = (
            <span className="block text-[10px] mt-1 font-bold uppercase">
              Booked
            </span>
          );
        } else if (userConflict) {
          // User has appointment with another dietitian at this time -> show specific dietitian
          buttonClass +=
            "bg-yellow-100 text-yellow-700 cursor-not-allowed opacity-80 border-yellow-300";
          isDisabled = true;
          label = (
            <span className="block text-[9px] mt-1 font-bold uppercase">
              {`Booked ${userConflict.dietitianName}`}
            </span>
          );
        } else if (isBookedByOthers) {
          // Slot booked by another user with this dietitian or blocked -> generic Busy
          buttonClass +=
            "bg-orange-100 text-orange-700 cursor-not-allowed opacity-80 border-orange-300";
          isDisabled = true;
          label = (
            <span className="block text-[9px] mt-1 font-bold uppercase">
              Busy
            </span>
          );
        } else if (isSelected) {
      buttonClass += "bg-emerald-600 text-white shadow-md border-emerald-600";
    } else {
      buttonClass +=
        "bg-gray-100 text-gray-800 hover:bg-gray-200 border-transparent";
    }

    return (
      <button
        key={time}
        type="button"
        onClick={() => !isDisabled && setSelectedTime(time)}
        disabled={isDisabled}
        className={buttonClass}
        title={
          isBookedByCurrentUser
            ? "This slot is booked by you with this dietitian"
            : isBookedByOthers
            ? "This slot is booked by another user"
            : userConflict
            ? `You have an appointment with ${userConflict.dietitianName} at this time`
            : "Click to select this slot"
        }
      >
        {time}
        {(isBookedByCurrentUser || isBookedByOthers || userConflict) && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span
              className={`block w-full h-0.5 ${
                isBookedByCurrentUser ? "bg-red-700" : isBookedByOthers ? "bg-orange-700" : "bg-yellow-700"
              }`}
            ></span>
          </span>
        )}
        {label}
      </button>
    );
  };

  return (
    <div
      className={`fixed top-16 right-0 w-[33%] max-h-[calc(100vh-4rem)] bg-white shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-6 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <button
            onClick={onClose}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-xl font-light rounded-full w-8 h-8 flex items-center justify-center transition-colors mr-3"
            aria-label="Collapse sidebar"
          >
            ›
          </button>
          <h2 className="text-2xl font-bold text-dark-accent flex-1 text-center">
            Book Appointment
          </h2>
          <button
            onClick={onClose}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-2xl font-light rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Consultation Type */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-gray-700">
              Consultation Type
            </label>
            <div className="flex gap-3">
              {["Online", "In-person"].map((type) => (
                <button
                  key={type}
                  onClick={() => setConsultationType(type)}
                  className={`flex-1 px-4 py-2 rounded-lg transition font-medium ${
                    consultationType === type
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={todayStr}
              max={maxDateStr}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          {/* Legend */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold mb-2 text-gray-700">Legend:</p>
              <div className="grid grid-cols-3 gap-1 text-xs">
              <span className="flex items-center">
                <span className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded mr-2"></span>
                Available
              </span>
              <span className="flex items-center">
                <span className="w-4 h-4 bg-emerald-600 rounded mr-2"></span>
                Selected
              </span>
              <span className="flex items-center">
                <span className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded mr-2"></span>
                Booked
              </span>
              <span className="flex items-center">
                <span className="w-4 h-4 bg-orange-100 border-2 border-orange-300 rounded mr-2"></span>
                Busy
              </span>
                <span className="flex items-center">
                <span className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded mr-2"></span>
                  Unavailable
              </span>
            </div>
          </div>

          {/* Time Slots */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-gray-700">
              Available Time Slots
              {isLoading && (
                <span className="text-xs text-gray-500 ml-2">(Loading...)</span>
              )}
            </label>

            {availableSlots.morning.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">
                  Morning
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.morning.map(renderTimeSlot)}
                </div>
              </div>
            )}

            {availableSlots.afternoon.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">
                  Afternoon
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.afternoon.map(renderTimeSlot)}
                </div>
              </div>
            )}

            {availableSlots.evening.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">
                  Evening
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.evening.map(renderTimeSlot)}
                </div>
              </div>
            )}

            {availableSlots.morning.length === 0 &&
              availableSlots.afternoon.length === 0 &&
              availableSlots.evening.length === 0 && (
                <p className="text-gray-600 text-sm">No slots available</p>
              )}
          </div>

          {/* Message */}
          {message && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {message}
            </div>
          )}

          {/* Selected Time Display */}
          {selectedTime && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium">
              Selected time: {selectedTime}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedTime}
          >
            Proceed to Payment
          </button>
        </div>
      </div>

      {/* Subscription Alert Modal */}
      {showSubscriptionAlert && subscriptionAlertData && (
        <SubscriptionAlert
          message={subscriptionAlertData.message}
          planType={subscriptionAlertData.planType}
          limitType={subscriptionAlertData.limitType}
          currentCount={subscriptionAlertData.currentCount}
          limit={subscriptionAlertData.limit}
          onClose={() => dispatch(clearSubscriptionAlert())}
        />
      )}
    </div>
  );
};

export default BookingSidebar;
