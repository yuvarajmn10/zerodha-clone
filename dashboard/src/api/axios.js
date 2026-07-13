import axios from "axios";

const API = axios.create({
  baseURL: "https://zerodha-backend-j6zw.onrender.com",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  console.log("SENDING TOKEN:", token); // debug

  if (token) {
    req.headers.Authorization = `Bearer ${token}`; //  MUST
  }

  return req;
});

export default API;
