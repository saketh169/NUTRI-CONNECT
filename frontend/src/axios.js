import axios from 'axios';

// Set backend API URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

export default axios;
