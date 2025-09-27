import React, { useState, useEffect } from 'react';
import { getAllStudents } from '../services/api';

// Helper function for status colors
const getStatusColor = (status) => {
  switch (status) {
    case 'Validated': return 'bg-green-100 text-green-800';
    case 'Pending': return 'bg-yellow-100 text-yellow-800';
    case 'Annual Discount Expired': return 'bg-red-100 text-red-800';
    case 'Card Expired': return 'bg-red-100 text-red-800 font-bold';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const StudentListView = () => { // REMOVED: setCurrentView prop is no longer needed
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ADDED: State for managing the details modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      try {
        const response = await getAllStudents();
        setStudents(response.data);
      } catch (error) {
        console.error('Error loading students:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, []);

  // ADDED: Function to open the modal with student data
  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  // ADDED: Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };
  
  // Helper to format dates nicely
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <> {/* Added React Fragment to wrap component and modal */}
      <div className="bg-green-300 p-8 rounded-3xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">All Registered Students</h2>
        <p className="text-gray-600 mb-5">View details for each registered student.</p>
        
        <div className="bg-white p-5 rounded-xl max-h-[75vh] overflow-y-auto">
          {loading ? (
            <p className="text-gray-500">Loading students...</p>
          ) : students.length === 0 ? (
            <p className="text-gray-500">No students registered yet.</p>
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <div 
                  key={student.rfid}
                  className="p-4 border-b border-gray-200 last:border-b-0" 
                  // REMOVED: onClick handler from the main div
                >
                  <div className="flex justify-between items-center">
                    {/* Left side student info */}
                    <div>
                      <div className="font-semibold text-gray-800">{student.name}</div>
                      <div className="text-sm text-gray-600">
                        ID: {student.student_id} | {student.school}
                      </div>
                    </div>

                    {/* Right side with status and new button */}
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.effective_status)}`}>
                        {student.effective_status}
                      </span>
                      {/* ADDED: View Details button */}
                      <button 
                        onClick={() => handleViewDetails(student)}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
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
              <div className="flex justify-between"><strong className="text-gray-700">Current Balance:</strong> ₱{selectedStudent.balance}</div>
              <div className="flex justify-between items-center"><strong className="text-gray-700">Status:</strong> 
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedStudent.effective_status)}`}>
                  {selectedStudent.effective_status}
                </span>
              </div>
              <hr className="my-2"/>
              <div className="flex justify-between"><strong className="text-gray-700">Annual Renewal Date:</strong> {formatDate(selectedStudent.annual_renewal_date)}</div>
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

export default StudentListView;