// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <div className="header-container">
      <h2 className="app-title">Patient Appointment Management System</h2>
      
      <nav className="app-nav">
        <Link to="/manage" className="nav-button">Manage Appointments</Link>
        <Link to="/reports" className="nav-button">View Reports</Link>
      </nav>
    </div>
  );
}

export default Header;
