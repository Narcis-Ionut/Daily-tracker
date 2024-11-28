import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">Narcis Gusa</h1>
        <p className="home-subtitle">All your tools in one place</p>
        <button className="home-cta-button">Explore Features</button>
      </header>
      <section className="home-features">
        <Link to="/budget-tracker" className="home-feature-card">
          <h3 className="feature-title">Budget Tracker</h3>
          <p className="feature-description">
            Manage your finances effectively and track your spending in one
            place.
          </p>
        </Link>
        <Link to="/family-notes" className="home-feature-card">
          <h3 className="feature-title">Family Notes</h3>
          <p className="feature-description">
            Keep important notes and memories organized for your family.
          </p>
        </Link>
        <Link to="/car-maintenance" className="home-feature-card">
          <h3 className="feature-title">Car Maintenance</h3>
          <p className="feature-description">
            Stay on top of your car's maintenance records with ease.
          </p>
        </Link>
        <Link to="/to-do-list" className="home-feature-card">
          <h3 className="feature-title">To-Do List</h3>
          <p className="feature-description">
            Organize your tasks and stay productive throughout the day.
          </p>
        </Link>
        <Link to="/shift-pattern" className="home-feature-card">
          <h3 className="feature-title">Shift Pattern</h3>
          <p className="feature-description">
            Track your shifts and plan your work schedule efficiently.
          </p>
        </Link>
        <Link to="/local-chat" className="home-feature-card">
          <h3 className="feature-title">Local Chat</h3>
          <p className="feature-description">
            Interact with your locally hosted chatbot and manage conversations
            effortlessly.
          </p>
        </Link>
      </section>
    </div>
  );
}

export default Home;
