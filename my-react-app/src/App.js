import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ManageAppointments from './pages/ManageAppointments';
import Reports from './pages/Reports';
import Header from './pages/Header';

function AppWrapper() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="app-container">
      {isHome && <Header />}
      <Routes>
        <Route path="/manage" element={<ManageAppointments />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
