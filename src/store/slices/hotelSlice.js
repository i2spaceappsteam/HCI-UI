import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const getSessionData = (key, fallback = {}) => {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

const initialState = {
  searchhotelobj: {},
  shortedHotelModalVisible: false,
  shortedHotelCount: 0,
  hotelCheckOutData: getSessionData('HOTEL_CHECKOUT_DATA', {}),
  selectedHotelInfo: getSessionData('SELECTED_HOTEL_INFO', {}),
  sessiontimeout: false,
  status: 'idle',
};

// Dummy async thunk since the original implementation is missing
export const getsessiontimeout = createAsyncThunk(
  'hotel/getsessiontimeout',
  async () => {
    return false;
  }
);

const hotelSlice = createSlice({
  name: 'hotel',
  initialState,
  reducers: {
    setSearchHotelObj(state, action) {
      state.searchhotelobj = action.payload;
    },
    setShortedHotelModalVisible(state, action) {
      state.shortedHotelModalVisible = action.payload;
    },
    setShortedHotelListCount(state, action) {
      state.shortedHotelCount = action.payload;
    },
    setHotelCheckOutData(state, action) {
      state.hotelCheckOutData = action.payload || {};
      try {
        sessionStorage.setItem('HOTEL_CHECKOUT_DATA', JSON.stringify(action.payload || {}));
      } catch (e) {}
    },
    setSelectedHotelInfo(state, action) {
      state.selectedHotelInfo = action.payload || {};
      try {
        sessionStorage.setItem('SELECTED_HOTEL_INFO', JSON.stringify(action.payload || {}));
      } catch (e) {}
    },
    setSessionTimeout(state, action) {
      state.sessiontimeout = action.payload;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getsessiontimeout.fulfilled, (state, action) => {
      // In case session times out logic gets implemented
    });
  },
});

export const {
  setSearchHotelObj,
  setShortedHotelModalVisible,
  setShortedHotelListCount,
  setHotelCheckOutData,
  setSelectedHotelInfo,
  setSessionTimeout,
  setStatus,
} = hotelSlice.actions;

export default hotelSlice.reducer;
