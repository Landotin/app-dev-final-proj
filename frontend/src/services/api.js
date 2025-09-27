import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
});

// Student-related API calls
export const getAllStudents = () => api.get('/students');
export const findStudentByIdentifier = (identifier) => api.get(`/students/${identifier}`);
export const registerStudent = (studentData) => api.post('/students', studentData);
export const validateStudentByRfid = (rfid) => api.patch(`/students/${rfid}/validate`);
export const updateStudentByRfid = (rfid, studentData) => api.put(`/students/${rfid}`, studentData);

export const deductFareForStudent = (data) => api.post('/students/fare/deduct', data);