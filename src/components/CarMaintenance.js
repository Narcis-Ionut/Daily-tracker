import React, { useState, useEffect } from "react";
import "./CarMaintenance.css";

function CarMaintenance() {
  const [records, setRecords] = useState(() => {
    const savedRecords = localStorage.getItem("carRecords");
    return savedRecords ? JSON.parse(savedRecords) : [];
  });

  const [date, setDate] = useState("");
  const [details, setDetails] = useState("");
  const [cost, setCost] = useState("");

  useEffect(() => {
    localStorage.setItem("carRecords", JSON.stringify(records));
  }, [records]);

  const addRecord = (e) => {
    e.preventDefault();
    const newRecord = { date, details, cost: parseFloat(cost) };
    setRecords([...records, newRecord]);
    setDate("");
    setDetails("");
    setCost("");
  };

  const deleteRecord = (index) => {
    const updatedRecords = records.filter((_, i) => i !== index);
    setRecords(updatedRecords);
  };

  return (
    <div className="car-maintenance-container">
      <h2 className="car-maintenance-heading">Car Maintenance</h2>
      <form className="car-maintenance-form" onSubmit={addRecord}>
        <div className="car-maintenance-field">
          <label className="car-maintenance-label">
            Date:
            <input
              className="car-maintenance-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="car-maintenance-field">
          <label className="car-maintenance-label">
            Details:
            <input
              className="car-maintenance-input"
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="car-maintenance-field">
          <label className="car-maintenance-label">
            Cost:
            <input
              className="car-maintenance-input"
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
            />
          </label>
        </div>
        <button className="car-maintenance-button" type="submit">
          Add Record
        </button>
      </form>
      <h3 className="car-maintenance-subheading">Maintenance Records</h3>
      <ul className="car-maintenance-list">
        {records.map((record, index) => (
          <li className="car-maintenance-list-item" key={index}>
            <span className="record-date">{record.date}</span>
            <div className="record-details">{record.details}</div>
            <div className="record-cost">${record.cost.toFixed(2)}</div>
            <button
              className="car-maintenance-delete-button"
              onClick={() => deleteRecord(index)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CarMaintenance;
