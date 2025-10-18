import React, { useState } from 'react';
import { findStudentByIdentifier, addBalanceToStudent } from '../services/api';

const AddBalanceView = () => {
  const [searchValue, setSearchValue] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchMessage, setSearchMessage] = useState({ type: '', text: '' });

  const [amount, setAmount] = useState('');
  const [addBalanceMessage, setAddBalanceMessage] = useState({ type: '', text: '' });

  // 1. Search for the student
  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setSearchMessage({ type: 'error', text: 'Please enter a Student ID or RFID' });
      setStudentData(null);
      return;
    }
    setIsLoading(true);
    setStudentData(null); // Clear previous student data
    setAddBalanceMessage({ type: '', text: '' }); // Clear old add balance messages
    try {
      const response = await findStudentByIdentifier(searchValue);
      setStudentData(response.data);
      setSearchMessage({ type: 'success', text: 'Student found.' });
    } catch (error) {
      setSearchMessage({ type: 'error', text: error.response?.data?.error || 'Error searching' });
    }
    setIsLoading(false);
  };

  // 2. Add balance to the found student
  const handleAddBalance = async () => {
    const loadAmount = parseFloat(amount);
    if (!loadAmount || loadAmount <= 0) {
      setAddBalanceMessage({ type: 'error', text: 'Please enter a valid amount.' });
      return;
    }
    try {
      // Make the API call
      const response = await addBalanceToStudent(studentData.rfid, loadAmount);

      // Update the message
      setAddBalanceMessage({ type: 'success', text: `Successfully added ₱${loadAmount.toFixed(2)}!` });

      // Manually update the displayed balance right away
      setStudentData(prevData => ({
        ...prevData,
        balance: response.data.newBalance // Assuming your API returns the new balance
      }));

      setAmount(''); // Clear amount input

    } catch (error) {
      // Set the error message
      setAddBalanceMessage({ type: 'error', text: error.response?.data?.error || 'Failed to add balance.' });
    }
  };

  return (
    // Reusing styles from DashboardView
    <div className="flex justify-center">
      <div className="bg-green-300 p-8 rounded-3xl w-full max-w-4xl shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Add Balance</h2>
        <p className="text-gray-600 mb-5">Search for a student to add balance to their account.</p>

        {/* --- Search Bar --- */}
        <div className="flex gap-3 mb-5">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter Student ID or RFID"
            className="flex-1 p-3 rounded-full border-none text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading} // Disable button while searching
            className="px-6 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* --- Search Message Area --- */}
        {searchMessage.text && (
          <p className={`text-center font-bold ${searchMessage.type === 'error' ? 'text-red-700' : 'text-green-700'}`}>
            {searchMessage.text}
          </p>
        )}

        {/* --- Add Balance Form (appears after student is found) --- */}
        {studentData && (
          <div className="bg-white p-6 rounded-xl mt-5">
            <h3 className="text-2xl font-bold text-gray-800">{studentData.name}</h3>
            <p className="text-gray-600 mb-2">Student ID: {studentData.student_id}</p>
            <p className="text-2xl font-bold text-blue-600 mb-4">
              Current Balance: ₱{parseFloat(studentData.balance).toFixed(2)}
            </p>

            <hr className="my-4" />

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to add"
                className="flex-1 p-3 rounded-full border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleAddBalance}
                className="px-6 py-3 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition-colors"
              >
                Confirm & Add ₱{parseFloat(amount) || '0.00'}
              </button>
            </div>

            {/* --- Add Balance Message Area --- */}
            {addBalanceMessage.text && (
              <p className={`text-center font-bold mt-4 ${addBalanceMessage.type === 'error' ? 'text-red-700' : 'text-green-700'}`}>
                {addBalanceMessage.text}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddBalanceView;