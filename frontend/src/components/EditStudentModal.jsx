import React, { useState, useEffect } from 'react';

const EditStudentModal = ({ student, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...student });

  useEffect(() => {
    // If the student prop changes, update the form data
    setFormData({ ...student });
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Edit Student Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Add form fields for each editable piece of data */}
          <div>
            <label className="block text-gray-700 font-bold mb-1">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-1">Student ID</label>
            <input type="text" name="student_id" value={formData.student_id} onChange={handleChange} className="w-full p-2 border rounded-md" />
          </div>
           <div>
            <label className="block text-gray-700 font-bold mb-1">Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-2 border rounded-md" />
          </div>
           <div>
            <label className="block text-gray-700 font-bold mb-1">Contact Number</label>
            <input type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} className="w-full p-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-1">Balance</label>
            <input type="number" name="balance" value={formData.balance} onChange={handleChange} step="0.01" className="w-full p-2 border rounded-md" />
          </div>
          
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;