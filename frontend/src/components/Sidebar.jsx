import React from 'react';
import logoImage from '../assets/smart-id-logo.png'; // 👈 1. IMPORT your logo

const Sidebar = ({ currentView, setCurrentView }) => {
  return (
    <div className="w-60 bg-green-300 p-5">
      <div className="flex items-center gap-3 mb-8">
        
        {/* 👇 2. REPLACE the old div with this img tag */}
        <img src={logoImage} alt="Smart ID Logo" className="w-10 h-10" />

        <div>
          <h2 className="text-gray-800 text-lg font-bold">Smart ID</h2>
          <p className="text-gray-700 text-sm">Admin Dashboard</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className={`w-full p-3 rounded-lg text-white font-medium transition-colors ${
            currentView === 'dashboard' ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setCurrentView('verification')}
          className={`w-full p-3 rounded-lg text-white font-medium transition-colors ${
            currentView === 'verification' ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          Verification
        </button>
        <button 
          onClick={() => setCurrentView('studentList')}
          className={`w-full p-3 rounded-lg text-white font-medium transition-colors ${
            currentView === 'studentList' ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          List of Students
        </button>
        <button 
          onClick={() => setCurrentView('register')}
          className={`w-full p-3 rounded-lg text-white font-medium transition-colors ${
            currentView === 'register' ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          Register Student
        </button>
      </div>
    </div>
  );
};

export default Sidebar;