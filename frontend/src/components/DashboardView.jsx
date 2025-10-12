import React, { useState, useEffect } from 'react';
import { findStudentByIdentifier, getAllStudents } from '../services/api';

const DashboardView = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'entry', 'exit'
  const [selectedDate, setSelectedDate] = useState(''); // NEW: State for the date filter

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
    setFilter('all'); // Reset type filter on new search
    setSelectedDate(''); // NEW: Reset date filter on new search
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

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();
  const formatTime = (dateString) => new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const TapTypeBadge = ({ type }) => {
    const colors = {
      entry: 'bg-green-100 text-green-800',
      exit: 'bg-red-100 text-red-800',
      journey: 'bg-blue-100 text-blue-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[type]}`}>
        {type.toUpperCase()}
      </span>
    );
  };

  // MODIFIED: Combined filtering logic for tap type and date
  const filteredTaps = searchResults?.data?.taps.filter(tap => {
    const typeMatch = filter === 'all' || tap.tap_type === filter;
    
    // Convert tap_time to YYYY-MM-DD for accurate comparison with date input value
    const tapDate = new Date(tap.tap_time).toISOString().split('T')[0];
    const dateMatch = !selectedDate || tapDate === selectedDate;

    return typeMatch && dateMatch;
  });
  
  return (
    <div>
      {/* Total Students Card */}
      <div className="bg-green-300 p-5 rounded-2xl mb-8 max-w-xs flex items-center gap-4 shadow-lg">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl">👥</div>
        <div>
          <h3 className="font-bold text-gray-800">Total Students</h3>
          <p className="text-gray-700 text-lg font-semibold">{totalStudents}</p>
        </div>
      </div>

      {/* Tap History Checker Card */}
      <div className="flex justify-center">
        <div className="bg-green-300 p-8 rounded-3xl w-full max-w-4xl shadow-xl">
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
                  {/* MODIFIED: Header now includes date filter */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{searchResults.data.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* NEW: Date filter input */}
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-gray-200 p-1 rounded-full text-sm border-none focus:ring-2 focus:ring-blue-500"
                      />
                       {selectedDate && <button onClick={() => setSelectedDate('')} className="text-xs text-blue-600 hover:underline">Clear</button>}
                      
                      {/* Filtering Buttons */}
                      <div className="flex space-x-1 bg-gray-200 p-1 rounded-full">
                        <button onClick={() => setFilter('all')} className={`px-3 py-1 text-sm rounded-full ${filter === 'all' ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-600'}`}>All</button>
                        <button onClick={() => setFilter('entry')} className={`px-3 py-1 text-sm rounded-full ${filter === 'entry' ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-600'}`}>Entry</button>
                        <button onClick={() => setFilter('exit')} className={`px-3 py-1 text-sm rounded-full ${filter === 'exit' ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-600'}`}>Exit</button>
                      </div>
                    </div>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto">
                    {filteredTaps && filteredTaps.length > 0 ? (
                      <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                          <tr>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Time</th>
                            <th scope="col" className="px-6 py-3">Type</th>
                            <th scope="col" className="px-6 py-3">Details</th>
                            <th scope="col" className="px-6 py-3 text-right">Fare</th>
                            <th scope="col" className="px-6 py-3 text-right">New Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTaps.map((tap, index) => (
                            <tr key={index} className="bg-white border-b hover:bg-gray-50">
                              <td className="px-6 py-4">{formatDate(tap.tap_time)}</td>
                              <td className="px-6 py-4">{formatTime(tap.tap_time)}</td>
                              <td className="px-6 py-4"><TapTypeBadge type={tap.tap_type} /></td>
                              <td className="px-6 py-4 font-medium text-gray-900">
                                {tap.tap_type === 'entry' && `Entered at ${tap.origin_station}`}
                                {(tap.tap_type === 'exit' || tap.tap_type === 'journey') && `${tap.origin_station} → ${tap.destination_station}`}
                              </td>
                              <td className="px-6 py-4 text-right">
                                {tap.fare_amount ? `₱${parseFloat(tap.fare_amount).toFixed(2)}` : '—'}
                                {tap.discount_applied && <div className="text-xs text-green-600">50% OFF</div>}
                              </td>
                              <td className="px-6 py-4 font-semibold text-right text-gray-800">
                                {tap.user_balance ? `₱${parseFloat(tap.user_balance).toFixed(2)}` : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-gray-500 p-4 text-center">No tap history found for this student or for the selected filters.</p>
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

