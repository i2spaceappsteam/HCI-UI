// ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const { user, accessToken } = useSelector((state) => state.auth);
console.log("user",user,accessToken)
  if (!user || !accessToken) {
    // Not logged in → redirect to login
    return window.location.href = "/";
  }

  return children;
};

export default ProtectedRoute;
