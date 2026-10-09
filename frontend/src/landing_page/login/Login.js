import axios from "axios";
import { useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3002";
const DASHBOARD_URL =
  process.env.REACT_APP_DASHBOARD_URL || "http://localhost:3001";

function Login() {
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/api/auth/login`,
        data,
      );

      // store token
      console.log("LOGIN RESPONSE:", res.data);
      localStorage.setItem("token", res.data.token);
      console.log("TOKEN SAVED:", localStorage.getItem("token"));

      // redirect to dashboard
      window.location.href = `${DASHBOARD_URL}?token=${res.data.token}`;
    } catch (err) {
      console.log(err);
      alert(`Login failed: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <>
      <input
        placeholder="Email"
        onChange={(e) => setData({ ...data, email: e.target.value })}
      />
      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setData({ ...data, password: e.target.value })}
      />
      <button onClick={handleLogin}>Login</button>
    </>
  );
}

export default Login;
