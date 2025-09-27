import React, { useState, useEffect } from 'react';
import { getAllStudents, validateStudentByRfid } from '../services/api';

// ADDED: Helper functions from the other component
const getStatusColor = (status) => {
  switch (status) {
    case 'Validated': return 'bg-green-100 text-green-800';
    case 'Pending': return 'bg-yellow-100 text-yellow-800';
    case 'Annual Discount Expired': return 'bg-red-100 text-red-800';
    case 'Card Expired': return 'bg-red-100 text-red-800 font-bold';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};

const VerificationView = () => {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // ADDED: State for managing the details modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const loadPendingStudents = async () => {
    setLoading(true);
    try {
      const response = await getAllStudents();
      setPendingStudents(response.data.filter(s => s.status === 'pending'));
    } catch (error) {
      console.error('Error loading students:', error);
      setMessage('Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingStudents();
  }, []);

  const handleValidate = async (rfid) => {
    try {
      await validateStudentByRfid(rfid);
      setMessage(`Successfully validated student ${rfid}.`);
      loadPendingStudents(); // Refresh the list
    } catch (error) {
      console.error('Validation failed:', error);
      setMessage('Validation failed.');
    }
  };

  // ADDED: Functions to handle the modal
  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  return (
    <>
      <div className="bg-green-300 p-8 rounded-3xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Student Verification</h2>
        <p className="text-gray-600 mb-5">Review and validate new student registrations.</p>
        
        {message && <p className="mb-4 text-center font-semibold">{message}</p>}

        <div className="bg-white p-5 rounded-xl max-h-[75vh] overflow-y-auto">
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : pendingStudents.length === 0 ? (
            <p className="text-gray-500">No pending students found.</p>
          ) : (
            <div className="space-y-3">
              {pendingStudents.map((student) => (
                <div key={student.rfid} className="p-4 border rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-800">{student.name}</div>
                    <div className="text-sm text-gray-600">ID: {student.student_id} | {student.email}</div>
                  </div>
                  {/* MODIFIED: Wrapped buttons in a div */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleViewDetails(student)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleValidate(student.rfid)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors text-sm"
                    >
                      Validate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ADDED: The Details Modal */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-1">{selectedStudent.name}</h2>
            <p className="text-sm text-gray-600 mb-4">{selectedStudent.email}</p>
            
            <div className="space-y-3">
              <div className="flex justify-between"><strong className="text-gray-700">Student ID:</strong> {selectedStudent.student_id}</div>
              <div className="flex justify-between"><strong className="text-gray-700">RFID:</strong> {selectedStudent.rfid}</div>
              <div className="flex justify-between"><strong className="text-gray-700">School:</strong> {selectedStudent.school}</div>
              <div className="flex justify-between"><strong className="text-gray-700">Program:</strong> {selectedStudent.program}</div>
              <div className="flex justify-between"><strong className="text-gray-700">Initial Balance:</strong> ₱{selectedStudent.balance}</div>
              <div className="flex justify-between items-center"><strong className="text-gray-700">Status:</strong> 
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedStudent.effective_status)}`}>
                  {selectedStudent.effective_status}
                </span>
              </div>
              <hr className="my-2"/>
              <div className="flex justify-between"><strong className="text-gray-700">Card Expiry Date:</strong> {formatDate(selectedStudent.card_expiry_date)}</div>
            </div>

            <button
              onClick={closeModal}
              className="mt-6 w-full p-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default VerificationView;