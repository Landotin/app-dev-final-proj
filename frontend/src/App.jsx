// src/App.jsx

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import StudentListView from './components/StudentListView';
import RegisterView from './components/RegisterView';
import VerificationView from './components/VerificationView'; // 👈 ADDED: Import new component

const App = () => {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'studentList': return <StudentListView setCurrentView={setCurrentView} />;
      case 'register': return <RegisterView />;
      case 'verification': return <VerificationView />; // 👈 ADDED: Render new component
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-300 to-blue-500 flex">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 p-5">
        {renderView()}
      </main>
    </div>
  );
};

export default App;