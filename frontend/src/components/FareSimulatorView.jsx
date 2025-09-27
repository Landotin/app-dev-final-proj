import React, { useState } from 'react';
import { deductFareForStudent } from '../services/api';

// 👇 UPDATED: Now contains all 25 stations from the complete fare matrix.
const stationList = [
  "Dr. Santos", "Ninoy Aquino Avenue", "Asia World", "PITX", "Redemptorist",
  "Baclaran", "EDSA", "Libertad", "Gil Puyat", "Vito Cruz", "Quirino",
  "Pedro Gil", "UN Avenue", "Central", "Carriedo", "D. Jose", "Bambang",
  "Tayuman", "Blumentritt", "Abad Santos", "R. Papa", "5th Avenue", "Monumento",
  "Balintawak", "Fernando Poe Jr."
];

const FareSimulatorView = () => {
  const [rfid, setRfid] = useState('');
  const [origin, setOrigin] = useState(stationList[0]);
  const [destination, setDestination] = useState(stationList[1]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDeductFare = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const response = await deductFareForStudent({ rfid, origin, destination });
      setResult({ type: 'success', data: response.data });
    } catch (error) {
      setResult({ type: 'error', message: error.response?.data?.error || 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-green-300 p-8 rounded-3xl w-full max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-3">Fare Deduction Simulator</h2>
      <p className="text-gray-600 mb-6">Simulate a train journey and see the student discount in action.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Form */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <form onSubmit={handleDeductFare} className="space-y-5">
            <div>
              <label className="block text-gray-800 font-bold mb-2">Student RFID or ID</label>
              <input
                type="text"
                value={rfid}
                onChange={(e) => setRfid(e.target.value)}
                placeholder="Enter Student RFID or ID"
                required
                className="w-full p-3 rounded-lg border-gray-300 border focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-800 font-bold mb-2">Origin Station</label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full p-3 rounded-lg border-gray-300 border focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {stationList.map(station => <option key={station} value={station}>{station}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-800 font-bold mb-2">Destination Station</label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full p-3 rounded-lg border-gray-300 border focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {stationList.map(station => <option key={station} value={station}>{station}</option>)}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full p-4 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Deduct Fare'}
            </button>
          </form>
        </div>

        {/* Right Side: Results */}
        <div className="bg-white p-6 rounded-2xl shadow-md flex items-center justify-center">
          {!result && <p className="text-gray-500">Results will be displayed here.</p>}
          {result?.type === 'error' && (
            <div className="text-center">
              <p className="text-5xl mb-3">❌</p>
              <p className="text-red-600 font-bold text-lg">{result.message}</p>
            </div>
          )}
          {result?.type === 'success' && (
            <div className="text-left w-full space-y-3">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-3">Transaction Complete</h3>
              <div className="flex justify-between"><strong className="text-gray-600">Student:</strong> {result.data.studentName}</div>
              <div className="flex justify-between"><strong className="text-gray-600">Standard Fare:</strong> ₱{result.data.standardFare.toFixed(2)}</div>
              {result.data.discountApplied && (
                <div className="flex justify-between text-green-600">
                  <strong className="text-green-700">Discount Applied:</strong> -50%
                </div>
              )}
              <div className="flex justify-between font-bold text-lg"><strong className="text-gray-800">Amount Paid:</strong> ₱{result.data.finalFare.toFixed(2)}</div>
              <hr />
              <div className="flex justify-between"><strong className="text-gray-600">Previous Balance:</strong> ₱{Number(result.data.previousBalance).toFixed(2)}</div>
              <div className="flex justify-between font-bold text-2xl text-blue-600"><strong className="text-gray-800">New Balance:</strong> ₱{Number(result.data.newBalance).toFixed(2)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FareSimulatorView;

