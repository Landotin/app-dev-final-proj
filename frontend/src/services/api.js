import axios from 'axios';

const api = axios.create({
  baseURL: 'https://smartid-o12y.onrender.com/api',
});

// Student-related API calls
export const getAllStudents = () => api.get('/students');
export const findStudentByIdentifier = (identifier) => api.get(`/students/${identifier}`);
export const registerStudent = (studentData) => api.post('/students', studentData);
export const validateStudentByRfid = (rfid) => api.patch(`/students/${rfid}/validate`);
export const updateStudentByRfid = (rfid, studentData) => api.put(`/students/${rfid}`, studentData);
export const addBalanceToStudent = (rfid, amount) => api.post(`/students/${rfid}/add-balance`, { amount });
export const resetUserJourney = (rfid, penaltyAmount, notes) => api.post('/taps/reset-journey', { rfid, penaltyAmount, notes });
export const deductFareForStudent = (data) => api.post('/students/fare/deduct', data);
