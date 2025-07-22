// frontend/src/api/axios.js
import axios from 'axios';

export default axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // send cookies
});
