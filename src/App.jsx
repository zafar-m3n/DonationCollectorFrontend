// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import CollectPage from "@/pages/collect/CollectPage";
import TodayPage from "@/pages/today/TodayPage";

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Default route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Main pages */}
          <Route path="/collect" element={<CollectPage />} />
          <Route path="/dashboard" element={<TodayPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/collect" replace />} />
        </Routes>
      </Router>

      <ToastContainer
        position="top-right"
        autoClose={100}
        hideProgressBar={true}
        closeOnClick={true}
        draggable={false}
        pauseOnHover={true}
      />
    </>
  );
}

export default App;
