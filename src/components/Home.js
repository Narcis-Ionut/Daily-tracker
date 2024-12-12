import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <h2 className="home-title">Classified Ops Dashboard</h2>
        <p className="home-subtitle">All your tools, encrypted and secured</p>
      </header>
      <section className="home-features">
        <Link to="/notes" className="home-feature-card">
          <h3 className="feature-title">Notes</h3>
          <p className="feature-description">
            Securely store sensitive intel and family memories.
          </p>
        </Link>
        <Link to="/model-service" className="home-feature-card">
          <h3 className="feature-title">Model Changes</h3>
          <p className="feature-description">
            Track and update your model records with military precision.
          </p>
        </Link>
        <Link to="/to-do-list" className="home-feature-card">
          <h3 className="feature-title">To-Do List</h3>
          <p className="feature-description">
            Prioritize tasks and maintain operational efficiency.
          </p>
        </Link>
        <Link to="/local-chat" className="home-feature-card">
          <h3 className="feature-title">Local Chat</h3>
          <p className="feature-description">
            Engage with your on-site chatbot for secure intel exchange.
          </p>
        </Link>
        <Link to="/model-training" className="home-feature-card">
          <h3 className="feature-title">Model Training</h3>
          <p className="feature-description">
            Enhance your models with secure training protocols.
          </p>
        </Link>
      </section>
    </div>
  );
}

export default Home;
