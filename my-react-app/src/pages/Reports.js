// src/pages/Reports.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';


function Reports() {
  const [report, setReport] = useState({});
  const [doctor, setDoctor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8080/api/doctors/')
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error('Error fetching doctors:', err));
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `http://localhost:8080/api/report/?doctor=${doctor}&start_date=${startDate}&end_date=${endDate}`
      );
      setReport(response.data);
    } catch (err) {
      setError('Error fetching report. Please check the input and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Safely format the rates
  const formatRate = (rate) => {
    return rate !== undefined && rate !== null ? rate.toFixed(2) : '0.00';
  };

  return (
    
    <div>
      <Link to="/" className="home-button">← Go Home</Link>
      <h3>Add / Manage Appointments</h3>
      <h3>Enhanced Appointment Reports</h3>
      <select value={doctor} onChange={(e) => setDoctor(e.target.value)}>
        <option value="">Select Doctor</option>
        {doctors.map((doc) => (
          <option key={doc.id} value={doc.name}>{doc.name}</option>
        ))}
      </select>

      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      <button onClick={fetchReport} disabled={loading}>
        {loading ? 'Loading...' : 'Generate Report'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {Object.keys(report).length > 0 && (
        <div>
          <h4>Report Summary:</h4>
          <p>Total Appointments: {report.total_appointments || 0}</p>
          <p>Completed Appointments: {report.completed_appointments || 0}</p>
          <p>Cancelled Appointments: {report.cancelled_appointments || 0}</p>
          <p>Scheduled Appointments: {report.scheduled_appointments || 0}</p>
          <p>Completion Rate: {formatRate(report.completion_rate)}%</p>
          <p>Cancellation Rate: {formatRate(report.cancellation_rate)}%</p>
          <p>Most Frequent Doctor: {report.most_frequent_doctor || 'N/A'}</p>
          <p>Day with Most Appointments: {report.day_with_most_appointments || 'N/A'} ({report.num_appointments_on_peak_day || 0})</p>
        </div>
      )}
    </div>
  );
}

export default Reports;
