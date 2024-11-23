import React, { useState, useEffect } from "react";
import "./BudgetTracker.css";

function BudgetTracker() {
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem("transactions");
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (e) => {
    e.preventDefault();
    const newTransaction = { description, amount: parseFloat(amount) };
    setTransactions([...transactions, newTransaction]);
    setDescription("");
    setAmount("");
  };

  const deleteTransaction = (index) => {
    const updatedTransactions = transactions.filter((_, i) => i !== index);
    setTransactions(updatedTransactions);
  };

  const total = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="budget-tracker-container">
      <h2 className="budget-tracker-heading">Budget Tracker</h2>
      <form className="budget-tracker-form" onSubmit={addTransaction}>
        <div className="budget-tracker-field">
          <label className="budget-tracker-label">
            Description:
            <input
              className="budget-tracker-input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="budget-tracker-field">
          <label className="budget-tracker-label">
            Amount:
            <input
              className="budget-tracker-input"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </label>
        </div>
        <button className="budget-tracker-button" type="submit">
          Add Transaction
        </button>
      </form>
      <h3 className="budget-tracker-subheading">Transactions</h3>
      <ul className="budget-tracker-list">
        {transactions.map((item, index) => (
          <li className="budget-tracker-list-item" key={index}>
            {item.description}: £{item.amount.toFixed(2)}
            <button
              className="budget-tracker-delete-button"
              onClick={() => deleteTransaction(index)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <h3 className="budget-tracker-total">Total: £{total.toFixed(2)}</h3>
    </div>
  );
}

export default BudgetTracker;
