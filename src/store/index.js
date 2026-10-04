import { configureStore } from '@reduxjs/toolkit';
import flightReducer from './slices/flightSlice';
import authReducer from './slices/authSlice';
import currencyReducer from './slices/currencySlice';
import hotelReducer from './slices/hotelSlice';

const store = configureStore({
    reducer: {
        flight: flightReducer,
        auth: authReducer,
        currency: currencyReducer,
        hotel: hotelReducer
    }
});

export default store;
