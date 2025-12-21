import { configureStore } from '@reduxjs/toolkit';
import adminSlice from './slices/adminSlice';
import analyticsSlice from './slices/analyticsSlice';
import blogSlice from './slices/blogSlice';
import paymentSlice from './slices/paymentSlice';
import bookingSlice from './slices/bookingSlice';

export const store = configureStore({
  reducer: {
    admin: adminSlice,
    analytics: analyticsSlice,
    blog: blogSlice,
    payment: paymentSlice,
    booking: bookingSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});