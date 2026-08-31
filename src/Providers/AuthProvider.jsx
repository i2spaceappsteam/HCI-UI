import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";

// Simplified AuthProvider (or rename to AuthGuard/AuthInitializer)
// It mainly handles the auto-logout logic now, as state is in Redux
export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // Logic from original file regarding loginTime check could be moved to slice or kept here as an effect
  // For now, let's keep the auto-logout effect here
  const LOGOUT_TIME = 40 * 60 * 1000; // 20 minutes in ms (1,200,000 ms)

  useEffect(() => {
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime || !isAuthenticated) return;

    const timeElapsed = Date.now() - parseInt(loginTime);
    const remainingTime = LOGOUT_TIME - timeElapsed;

    if (remainingTime <= 0) {
      dispatch(logout());
      return;
    }

    const timer = setTimeout(() => {
      dispatch(logout());
    }, remainingTime);

    return () => clearTimeout(timer);
  }, [isAuthenticated, dispatch]);

  return <>{children}</>;
}
