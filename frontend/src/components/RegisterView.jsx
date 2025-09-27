// views/RegisterView.js

import React, { useState } from 'react';
import { registerStudent } from '../services/api';

const RegisterView = () => {
  const [formData, setFormData] = useState({
    student_id: '', name: '', email: '', school: '', program: '', rfid: '', balance: '',
    address: '', contact_number: '' // 👈 ADDED
  });
  const [registerMessage, setRegisterMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterMessage('');
    try {
      await registerStudent(formData);
      setRegisterMessage('success');
      setFormData({ 
        student_id: '', name: '', email: '', school: '', program: '', rfid: '', balance: '', 
        address: '', contact_number: '' // 👈 ADDED reset
      });
    } catch (error) {
      setRegisterMessage(error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="bg-green-300 p-8 rounded-3xl max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-5">Register New Student</h2>
      <form onSubmit={handleRegisterSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-800 font-bold mb-2">Student ID</label>
          <input type="text" name="student_id" value={formData.student_id} onChange={handleInputChange} required className="w-full p-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-gray-800 font-bold mb-2">Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full p-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-gray-800 font-bold mb-2">Email Address</label>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full p-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-gray-800 font-bold mb-2">School</label>
          <input type="text" name="school" value={formData.school} onChange={handleInputChange} required className="w-full p-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-gray-800 font-bold mb-2">Course / Department</label>
          <input type="text" name="program" value={formData.program} onChange={handleInputChange} required className="w-full p-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        {/* 👇 ADDED these two fields */}
        <div>
          <label className="block text-gray-800 font-bold mb-2">Address</label>
          <input type="text" name="address" value={formData.address} onChange={handleInputChange} required className="w-full p-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-gray-800 font-bold mb-2">Contact Number</label>
          <input type="text" name="contact_number" value={formData.contact_number} onChange={handleInputChange} required className="w-full p-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-gray-800 font-bold mb-2">RFID</label>
          <input type="text" name="rfid" value={formData.rfid} onChange={handleInputChange} required className="w-full p-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-gray-800 font-bold mb-2">Initial Balance</label>
          <input type="number" name="balance" value={formData.balance} onChange={handleInputChange} step="0.01" min="0" className="w-full p-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit" className="w-full p-4 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors mt-5">
          Register Student
        </button>
      </form>
      {registerMessage && (
        <div className={`mt-5 p-4 rounded-lg ${registerMessage === 'success' ? 'bg-green-100 border-green-300 text-green-700' : 'bg-red-100 border-red-300 text-red-700'}`}>
          {registerMessage === 'success' ? '✅ Student registered successfully!' : `❌ ${registerMessage}`}
        </div>
      )}
    </div>
  );
};

export default RegisterView;