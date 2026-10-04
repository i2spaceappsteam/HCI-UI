import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  searchhotelobj: {},
  shortedHotelModalVisible: false,
  shortedHotelCount: 0,
  hotelCheckOutData: {},
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
      state.hotelCheckOutData = action.payload;
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
  setSessionTimeout,
  setStatus,
} = hotelSlice.actions;

export default hotelSlice.reducer;
