import React from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import Login from "./components/Login";
import { useSelector } from "react-redux";
import UserNavigation from "./components/UserNavigation";
import NotFound from "./components/NotFound";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { user } = useSelector((state) => state.auth);
  console.log("user", user);

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      {user ? (
        // Show UserNavigation if user is authenticated
        <UserNavigation />
      ) : (
        // Show Login if user is null
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
    </BrowserRouter>
  );
};

export default App;
