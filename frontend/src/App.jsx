import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import RegisterView from './components/RegisterView';
import StudentListView from './components/StudentListView';
import VerificationView from './components/VerificationView';
import FareSimulatorView from './components/FareSimulatorView'; 
import AddBalanceView from './components/AddBalanceView'; // 👈 1. IMPORT THE NEW VIEW

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'register':
        return <RegisterView />;
      case 'studentList':
        return <StudentListView />;
      case 'verification':
        return <VerificationView />;
      case 'fareSimulator':
        return <FareSimulatorView />;
      case 'addBalance': // 👈 2. ADD THIS CASE
        return <AddBalanceView />;
      default:
        return <DashboardView />;
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
}

export default App;