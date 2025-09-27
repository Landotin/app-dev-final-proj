import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

const apiClient = axios.create({
  baseURL: API_BASE,
});

export const getAllStudents = () => {
  return apiClient.get('/students');
};

export const getStudentByRfid = (rfid) => {
  return apiClient.get(`/students/${rfid}`);
};

export const registerStudent = (studentData) => {
  return apiClient.post('/students', studentData);
};

// 👇 ADDED: New function for validation
export const validateStudentByRfid = (rfid) => {
  return apiClient.patch(`/students/${rfid}/validate`);
};

export const updateStudentByRfid = (rfid, studentData) => {
  return apiClient.put(`/students/${rfid}`, studentData);
};