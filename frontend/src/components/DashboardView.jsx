import React, { useState, useEffect } from 'react';
import { findStudentByIdentifier } from '../services/api';
import { getAllStudents } from '../services/api';

const DashboardView = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    const loadStudentCount = async () => {
      try {
        const response = await getAllStudents();
        setTotalStudents(response.data.length);
      } catch (error) {
        console.error('Failed to load student count:', error);
      }
    };
    loadStudentCount();
  }, []);

  const searchStudent = async () => {
    if (!searchValue.trim()) {
      setSearchResults({ error: 'Please enter a Student ID or RFID' });
      return;
    }
    setSearchResults({ loading: true });
    try {
      const response = await findStudentByIdentifier(searchValue);
      setSearchResults({ data: response.data });
    } catch (error) {
      if (error.response?.status === 404) {
        setSearchResults({ error: 'Student not found' });
      } else {
        setSearchResults({ error: 'Error searching for student' });
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchStudent();
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  return (
    <div>
      <div className="bg-green-300 p-5 rounded-2xl mb-8 max-w-xs flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl">👥</div>
        <div>
          <h3 className="font-bold text-gray-800">Total Students</h3>
          <p className="text-gray-700 text-lg">{totalStudents}</p>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="bg-green-300 p-8 rounded-3xl w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Tap History Checker</h2>
          <p className="text-gray-600 mb-5">Search for a student to view their recent tap history</p>
          
          <div className="flex gap-3 mb-5">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter Student ID or RFID"
              className="flex-1 p-3 rounded-full border-none text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={searchStudent}
              className="px-6 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors"
            >
              Search
            </button>
          </div>

          {searchResults && (
            <div>
              {searchResults.loading && <p className="text-gray-700">Searching...</p>}
              {searchResults.error && (
                <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg">
                  ❌ {searchResults.error}
                </div>
              )}
              {searchResults.data && (
                <div className="bg-white p-5 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{searchResults.data.name}</h3>
                  <p className="font-semibold text-gray-700 mb-3">Recent Tap History:</p>
                  <div className="max-h-72 overflow-y-auto">
                    {searchResults.data.taps && searchResults.data.taps.length > 0 ? (
                      searchResults.data.taps.map((tap, index) => (
                        <div key={index} className="p-4 border-b border-gray-200 last:border-b-0">
                          <div className="flex justify-between items-center mb-2">
                            <span className={`font-bold text-lg ${tap.tap_type === 'journey' ? 'text-blue-600' : 'text-gray-500'}`}>
                              JOURNEY
                            </span>
                            <span className="text-gray-500 text-xs">{formatDate(tap.tap_time)}</span>
                          </div>
                          {/* 👇 This is the new, detailed display for each journey */}
                          {tap.tap_type === 'journey' && (
                            <div className="text-sm space-y-2 pl-2">
                              <p className="font-semibold text-gray-800">{tap.origin_station} → {tap.destination_station}</p>
                              <div className="flex justify-between items-center text-gray-600">
                                <span>Previous Balance:</span>
                                <span className="font-mono">₱{(parseFloat(tap.user_balance) + parseFloat(tap.fare_amount)).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between items-center text-red-500">
                                <span>Amount Paid:</span>
                                <span className="font-mono">- ₱{parseFloat(tap.fare_amount).toFixed(2)} {tap.discount_applied && <span className="text-green-600 text-xs">(50% OFF)</span>}</span>
                              </div>
                              <hr className="my-1"/>
                              <div className="flex justify-between items-center font-bold text-gray-800">
                                <span>New Balance:</span>
                                <span className="font-mono">₱{parseFloat(tap.user_balance).toFixed(2)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No tap history found.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
