// views/StudentListView.js

import React, { useState, useEffect } from 'react';
import { getAllStudents, updateStudentByRfid } from '../services/api';

const getStatusColor = (status) => {
  switch (status) {
    case 'Validated': return 'bg-green-100 text-green-800';
    case 'Pending': return 'bg-yellow-100 text-yellow-800';
    case 'Annual Discount Expired': return 'bg-red-100 text-red-800';
    case 'Card Expired': return 'bg-red-100 text-red-800 font-bold';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const StudentListView = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // 👇 ADDED: State for the edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [updateMessage, setUpdateMessage] = useState('');

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

  useEffect(() => {
    loadStudents();
  }, []);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };
  
  // 👇 ADDED: Functions for handling the edit modal
  const handleEditClick = (student) => {
    setStudentToEdit(student);
    setIsEditModalOpen(true);
    setUpdateMessage(''); // Clear previous messages
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setStudentToEdit(null);
  };

  const handleEditFormChange = (e) => {
    setStudentToEdit({ ...studentToEdit, [e.target.name]: e.target.value });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!studentToEdit) return;
    try {
      await updateStudentByRfid(studentToEdit.rfid, studentToEdit);
      setUpdateMessage('✅ Student details updated successfully!');
      loadStudents(); // Refresh the list with new data
      setTimeout(() => {
        closeEditModal();
      }, 1500); // Close modal after a short delay
    } catch (error) {
      console.error('Error updating student:', error);
      setUpdateMessage(`❌ Error: ${error.response?.data?.error || 'Update failed.'}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <>
      <div className="bg-green-300 p-8 rounded-3xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">All Registered Students</h2>
        <p className="text-gray-600 mb-5">View and manage details for each registered student.</p>
        
        <div className="bg-white p-5 rounded-xl max-h-[75vh] overflow-y-auto">
          {loading ? ( <p>Loading...</p> ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <div key={student.rfid} className="p-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-800">{student.name}</div>
                      <div className="text-sm text-gray-600">ID: {student.student_id} | {student.school}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.effective_status)}`}>
                        {student.effective_status}
                      </span>
                      <button onClick={() => handleViewDetails(student)} className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600">
                        View Details
                      </button>
                        {/* 👇 ADDED: Edit button */}
                        <button onClick={() => handleEditClick(student)} className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600">
                          Edit
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Details Modal - MODIFIED */}
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
              {/* 👇 ADDED */}
              <div className="flex justify-between"><strong className="text-gray-700">Address:</strong> {selectedStudent.address || 'N/A'}</div>
              <div className="flex justify-between"><strong className="text-gray-700">Contact #:</strong> {selectedStudent.contact_number || 'N/A'}</div>
              <div className="flex justify-between"><strong className="text-gray-700">Current Balance:</strong> ₱{selectedStudent.balance}</div>
              <div className="flex justify-between items-center"><strong className="text-gray-700">Status:</strong> 
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedStudent.effective_status)}`}>
                  {selectedStudent.effective_status}
                </span>
              </div>
              <hr className="my-2"/>
              <div className="flex justify-between"><strong className="text-gray-700">Annual Renewal:</strong> {formatDate(selectedStudent.annual_renewal_date)}</div>
              <div className="flex justify-between"><strong className="text-gray-700">Card Expiry:</strong> {formatDate(selectedStudent.card_expiry_date)}</div>
            </div>
            <button onClick={closeModal} className="mt-6 w-full p-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700">
              Close
            </button>
          </div>
        </div>
      )}

      {/* 👇 ADDED: The Entire Edit Modal */}
      {isEditModalOpen && studentToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Edit Student Details</h2>
            <form onSubmit={handleUpdateSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" name="name" value={studentToEdit.name} onChange={handleEditFormChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" name="email" value={studentToEdit.email} onChange={handleEditFormChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Student ID</label>
                <input type="text" name="student_id" value={studentToEdit.student_id} onChange={handleEditFormChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">School</label>
                <input type="text" name="school" value={studentToEdit.school} onChange={handleEditFormChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Program</label>
                <input type="text" name="program" value={studentToEdit.program} onChange={handleEditFormChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input type="text" name="address" value={studentToEdit.address || ''} onChange={handleEditFormChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input type="text" name="contact_number" value={studentToEdit.contact_number || ''} onChange={handleEditFormChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
              </div>
            </form>

            {updateMessage && (
              <div className={`mt-4 p-3 rounded-md text-sm ${updateMessage.startsWith('❌') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {updateMessage}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 mt-2 border-t">
              <button type="button" onClick={closeEditModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                Cancel
              </button>
              <button type="button" onClick={handleUpdateSubmit} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentListView;