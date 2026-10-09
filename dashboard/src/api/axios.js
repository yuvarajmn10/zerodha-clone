import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3002",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`; //  MUST
  }

  return req;
});

// missing/expired token -> send the user back to login
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = `${
        process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000"
      }/login`;
    }
    return Promise.reject(err);
  },
);

export default API;
