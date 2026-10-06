import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ApiClient from "../../Helpers/ApiClient";

// Helper to get initial state from localStorage
const getUserFromStorage = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
};

const getTokenFromStorage = () => {
  try {
    const token = localStorage.getItem("accessToken");
    return token ? JSON.parse(token) : null;
  } catch (e) {
    return null;
  }
};

const initialState = {
  user: getUserFromStorage(),
  accessToken: getTokenFromStorage(),
  loading: false,
  error: null,
  isAuthenticated: !!getTokenFromStorage(),
  dashboardFlag: false, // simplified logic for now, will refine based on role
};

// Async Thunk for Login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await ApiClient.post("Users/Login", credentials);
      if (response.success === true) {
        const user = response.data.userDetails;
        if (
          user.role === 1 ||
          user.role === 2 ||
          user.role === 5 ||
          user.role === 21 ||
          user.role === 51
        ) {
          return response.data;
        } else {
          return rejectWithValue("Unauthorized: Access denied for this role.");
        }
      } else {
        return rejectWithValue(response.message || "Login failed");
      }
    } catch (error) {
      return rejectWithValue(error.message || "An error occurred during login");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.dashboardFlag = false;
      state.error = null;
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("busAccessToken");
      localStorage.removeItem("loginTime");
    },
    restoreAuth: (state) => {
      const user = getUserFromStorage();
      const token = getTokenFromStorage();
      if (user && token) {
        state.user = user;
        state.accessToken = token;
        state.isAuthenticated = true;
        // Logic from AuthProvider
        if (user.role === 1 || user.role === 2 || user.role === 5) {
          state.dashboardFlag = true;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.userDetails;
        state.accessToken = action.payload.tokenId;
        state.isAuthenticated = true;

        // Logic from AuthProvider
        const user = action.payload.userDetails;
        if (user.roleId === 1 || user.roleId === 2 || user.roleId === 5) {
          state.dashboardFlag = true;
        }

        // Persist to localStorage
        localStorage.setItem(
          "user",
          JSON.stringify(action.payload.userDetails),
        );
        localStorage.setItem(
          "accessToken",
          JSON.stringify(action.payload.tokenId),
        );
        localStorage.setItem("loginTime", JSON.stringify(Date.now()));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, restoreAuth } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAgent = (state) => {
  const user = state.auth.user;
  if (!user) return false;
  // roleId 20 = agent, roleId 2 = sub-admin, roleId 5 = branch
  return user.role === 20 || user.role === 2 || user.role === 5;
};
