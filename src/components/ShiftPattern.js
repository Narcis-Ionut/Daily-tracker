import React, { useState, useEffect, useCallback } from "react";
import "./ShiftPattern.css";

function ShiftPattern() {
  const [shifts, setShifts] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const generateMonthlyShifts = useCallback(
    (start) => {
      const monthShifts = [];
      const date = new Date(start);
      let working = true; // Tracks whether it's a "Work Day" or "Off Day."
      let workCount = 0; // Counts consecutive working days.

      // Adjust date to the first day of the current month
      date.setFullYear(currentYear, currentMonth, 1);

      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

      for (let i = 1; i <= daysInMonth; i++) {
        const shiftDate = new Date(currentYear, currentMonth, i);

        // Check if we need to switch between "Work" and "Off"
        if (working && workCount === 4) {
          working = false;
          workCount = 0;
        } else if (!working && workCount === 4) {
          working = true;
          workCount = 0;
        }

        // Add the current shift
        monthShifts.push({
          date: shiftDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
          isWorking: working,
          label: working ? "Work Day" : "Off Day",
        });

        workCount++;
      }

      setShifts(monthShifts);
    },
    [currentMonth, currentYear]
  );

  useEffect(() => {
    if (startDate) {
      generateMonthlyShifts(new Date(startDate));
    }
  }, [startDate, currentMonth, currentYear, generateMonthlyShifts]);

  const changeMonth = (direction) => {
    if (direction === "next") {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((prev) => prev + 1);
      } else {
        setCurrentMonth((prev) => prev + 1);
      }
    } else {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((prev) => prev - 1);
      } else {
        setCurrentMonth((prev) => prev - 1);
      }
    }
  };

  return (
    <div className="shift-pattern-container">
      <h2 className="shift-pattern-heading">Shift Pattern</h2>
      <form className="shift-pattern-form">
        <div className="shift-pattern-field">
          <label className="shift-pattern-label">
            First Work Day:
            <input
              className="shift-pattern-input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </label>
        </div>
      </form>

      <div className="shift-pattern-navigation">
        <button
          className="shift-pattern-nav-button"
          onClick={() => changeMonth("prev")}
        >
          Previous Month
        </button>
        <span className="shift-pattern-current-month">
          {new Date(currentYear, currentMonth).toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button
          className="shift-pattern-nav-button"
          onClick={() => changeMonth("next")}
        >
          Next Month
        </button>
      </div>

      <div className="shift-calendar">
        {shifts.map((shift, index) => (
          <div
            className={`shift-calendar-item ${
              shift.isWorking ? "shift-on" : "shift-off"
            }`}
            key={index}
          >
            <div className="shift-date">{shift.date}</div>
            <div className="shift-label">{shift.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShiftPattern;
