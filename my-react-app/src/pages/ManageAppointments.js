// src/pages/ManageAppointments.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';


function ManageAppointments() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [newAppointment, setNewAppointment] = useState({ patient_name: '', doctor_name: '', date: '', status: 'Scheduled' });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch patients, doctors, and appointments on page load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientResponse = await axios.get('http://localhost:8080/api/patients/');
        setPatients(patientResponse.data);

        const doctorResponse = await axios.get('http://localhost:8080/api/doctors/');
        setDoctors(doctorResponse.data);

        const appointmentResponse = await axios.get('http://localhost:8080/api/appointments/');
        setAppointments(appointmentResponse.data);
      } catch (err) {
        setError('Failed to fetch data from the server. Please try again.');
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []); // Ensure it runs only once when the component mounts

  // Reset form after submission or edit
  const resetForm = () => {
    setNewAppointment({ patient_name: '', doctor_name: '', date: '', status: 'Scheduled' });
    setEditMode(false);
    setEditId(null);
  };

  // Handle form submission for adding or updating appointments
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newAppointment.date) {
      setError('Please select a valid date.');
      return;
    }

    try {
      if (editMode) {
        const response = await axios.put(`http://localhost:8080/api/appointments/${editId}/`, newAppointment);
        setAppointments(appointments.map((appt) => (appt.id === editId ? response.data : appt)));
        setMessage('Appointment updated successfully');
      } else {
        const response = await axios.post('http://localhost:8080/api/appointments/', newAppointment);
        setAppointments([...appointments, response.data]);
        setMessage('Appointment added successfully');
      }
      resetForm();
    } catch (err) {
      setError('Failed to add/update appointment.');
      console.error('Error:', err.response?.data);
    }
  };

  // Handle deleting an appointment
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await axios.delete(`http://localhost:8080/api/appointments/${id}/`);
        setAppointments(appointments.filter((appt) => appt.id !== id));
        setMessage('Appointment deleted successfully');
      } catch (err) {
        setError('Failed to delete appointment.');
        console.error('Error:', err);
      }
    }
  };

  // Handle canceling an appointment
  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await axios.post(`http://localhost:8080/api/appointments/${id}/cancel/`);
        setAppointments(appointments.map((appt) =>
          appt.id === id ? { ...appt, status: 'Cancelled' } : appt
        ));
        setMessage('Appointment canceled successfully');
      } catch (err) {
        setError('Failed to cancel appointment.');
        console.error('Error:', err);
      }
    }
  };

  // Handle editing an appointment
  const handleEdit = (appointment) => {
    setEditMode(true);
    setEditId(appointment.id);
    setNewAppointment({
      patient_name: appointment.patient_name,
      doctor_name: appointment.doctor_name,
      date: appointment.date,
      status: appointment.status
    });
  };

  return (
    
    <div>
      <Link to="/" className="home-button">← Go Home</Link>
      <h3>Add / Manage Appointments</h3>
      <h3>{editMode ? 'Edit Appointment' : 'Add Appointment'}</h3>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <select
          value={newAppointment.patient_name}
          onChange={(e) => setNewAppointment({ ...newAppointment, patient_name: e.target.value })}
        >
          <option>Select Patient</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.name}>{patient.name}</option>
          ))}
        </select>

        <select
          value={newAppointment.doctor_name}
          onChange={(e) => setNewAppointment({ ...newAppointment, doctor_name: e.target.value })}
        >
          <option>Select Doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.name}>{doctor.name}</option>
          ))}
        </select>

        <input
          type="date"
          value={newAppointment.date}
          onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
        />
        <button type="submit">{editMode ? 'Update' : 'Add'} Appointment</button>
        {editMode && <button onClick={resetForm}>Cancel Edit</button>}
      </form>

      <h4>Appointments:</h4>
<table style={{ width: '100%', borderCollapse: 'collapse' }}>
  <thead>
    <tr>
      <th style={{ border: '1px solid #ccc', padding: '8px' }}>Patient</th>
      <th style={{ border: '1px solid #ccc', padding: '8px' }}>Doctor</th>
      <th style={{ border: '1px solid #ccc', padding: '8px' }}>Date</th>
      <th style={{ border: '1px solid #ccc', padding: '8px' }}>Status</th>
      <th style={{ border: '1px solid #ccc', padding: '8px' }}>Actions</th>
    </tr>
  </thead>
  <tbody>
  {[...appointments]
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .map((appointment) => (
      <tr key={appointment.id}>
        <td style={{ border: '1px solid #ccc', padding: '8px' }}>{appointment.patient_name}</td>
        <td style={{ border: '1px solid #ccc', padding: '8px' }}>{appointment.doctor_name}</td>
        <td style={{ border: '1px solid #ccc', padding: '8px' }}>{appointment.date}</td>
        <td style={{ border: '1px solid #ccc', padding: '8px' }}>{appointment.status}</td>
        <td style={{ border: '1px solid #ccc', padding: '8px' }}>
          {appointment.status !== 'Cancelled' && (
            <>
              <button onClick={() => handleEdit(appointment)}>Edit</button>{' '}
              <button onClick={() => handleCancel(appointment.id)}>Cancel</button>{' '}
            </>
          )}
          <button onClick={() => handleDelete(appointment.id)}>Delete</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

    </div>
  );
}

export default ManageAppointments;
