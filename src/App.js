import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home";
import ShiftPattern from "./components/ShiftPattern";
import BudgetTracker from "./components/BudgetTracker";
import FamilyNotes from "./components/FamilyNotes";
import CarMaintenance from "./components/CarMaintenance";
import ToDoList from "./components/ToDoList";
import "./App.css";

function App() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Router>
      <div className="app">
        {/* Sidebar Toggle Button */}
        <button className="toggle-btn" onClick={toggleSidebar}>
          <span className={`hamburger ${isOpen ? "open" : ""}`}></span>
        </button>

        {/* Sidebar */}
        <div className={`sidebar ${isOpen ? "open" : ""}`}>
          <ul>
            <li>
              <Link to="/" onClick={() => setIsOpen(false)}>
                🏠 Home
              </Link>
            </li>
            <li>
              <Link to="/shift-pattern" onClick={() => setIsOpen(false)}>
                🕒 Shift Pattern
              </Link>
            </li>
            <li>
              <Link to="/budget-tracker" onClick={() => setIsOpen(false)}>
                💰 Budget Tracker
              </Link>
            </li>
            <li>
              <Link to="/family-notes" onClick={() => setIsOpen(false)}>
                👨‍👩‍👦 Family Notes
              </Link>
            </li>
            <li>
              <Link to="/car-maintenance" onClick={() => setIsOpen(false)}>
                🚗 Car Maintenance
              </Link>
            </li>
            <li>
              <Link to="/to-do-list" onClick={() => setIsOpen(false)}>
                ✅ To-Do List
              </Link>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shift-pattern" element={<ShiftPattern />} />
            <Route path="/budget-tracker" element={<BudgetTracker />} />
            <Route path="/family-notes" element={<FamilyNotes />} />
            <Route path="/car-maintenance" element={<CarMaintenance />} />
            <Route path="/to-do-list" element={<ToDoList />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
