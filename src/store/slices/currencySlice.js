import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    activeCurrency: "₹",
    currencyRate: 1,
    currencySymbol: "₹"
};

const currencySlice = createSlice({
    name: 'currency',
    initialState,
    reducers: {
        setCurrency: (state, action) => {
            const { code, rate, symbol } = action.payload;
            state.activeCurrency = code;
            state.currencyRate = rate;
            state.currencySymbol = symbol || code;
        }
    }
});

export const { setCurrency } = currencySlice.actions;

// Selectors
export const selectActiveCurrency = (state) => state.currency.activeCurrency;
export const selectCurrencyRate = (state) => state.currency.currencyRate;
export const selectCurrencySymbol = (state) => state.currency.currencySymbol;

export default currencySlice.reducer;
