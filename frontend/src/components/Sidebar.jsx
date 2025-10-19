import React from 'react';
import logoImage from '../assets/smart-id-logo.png';

const Sidebar = ({ currentView, setCurrentView }) => {
  const views = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'verification', label: 'Verification' },
    { id: 'studentList', label: 'List of Students' },
    { id: 'register', label: 'Register Student' },
    { id: 'fareSimulator', label: 'Fare Simulator' },
    { id: 'addBalance', label: 'Add Balance' }, // 👈 ADD THIS LINE
  ];

  return (
    <div className="w-60 bg-green-300 p-5">
      <div className="flex items-center gap-3 mb-8">
        <img src={logoImage} alt="Smart ID Logo" className="w-10 h-10" />
        <div>
          <h2 className="text-gray-800 text-lg font-bold">Smart ID</h2>
          <p className="text-gray-700 text-sm">Admin Dashboard</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {views.map(view => (
          <button
            key={view.id}
            onClick={() => setCurrentView(view.id)}
            className={`w-full p-3 rounded-lg text-left text-white font-medium transition-colors ${
              currentView === view.id ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;