import React from "react";
import { Route, Routes, NavLink } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Text from "./pages/Text.jsx";
import "./App.css";

const App = () => {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" />
          <div>
            <div className="brand-title">Transcribe Pipeline</div>
            <div className="brand-subtitle">Queue-based audio transcription</div>
          </div>
        </div>
        <nav className="nav">
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>New Job</NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>Dashboard</NavLink>
        </nav>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/text" element={<Text />} />
        </Routes>
      </main>

      <footer className="footer">
        <span>Designed for async workflows and reliable processing.</span>
      </footer>
    </div>
  );
};

export default App;
