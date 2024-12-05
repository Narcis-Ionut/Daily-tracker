import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <p className="home-subtitle">All your tools in one place</p>
      </header>
      <section className="home-features">
        <Link to="/notes" className="home-feature-card">
          <h3 className="feature-title">Notes</h3>
          <p className="feature-description">
            Keep important notes and memories organized for your family.
          </p>
        </Link>
        <Link to="/model-service" className="home-feature-card">
          <h3 className="feature-title">Model Changes</h3>
          <p className="feature-description">
            Stay on top of your model records with ease.
          </p>
        </Link>
        <Link to="/to-do-list" className="home-feature-card">
          <h3 className="feature-title">To-Do List</h3>
          <p className="feature-description">
            Organize your tasks and stay productive throughout the day.
          </p>
        </Link>
        <Link to="/local-chat" className="home-feature-card">
          <h3 className="feature-title">Local Chat</h3>
          <p className="feature-description">
            Interact with your locally hosted chatbot and manage conversations
            effortlessly.
          </p>
        </Link>
        <Link to="/model-training" className="home-feature-card">
          <h3 className="feature-title">Model training</h3>
          <p className="feature-description">Training your model</p>
        </Link>
      </section>
    </div>
  );
}

export default Home;
