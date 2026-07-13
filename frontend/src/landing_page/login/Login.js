import axios from "axios";
import { useState } from "react";

function Login() {
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "https://zerodha-backend-j6zw.onrender.com/api/auth/login",
        data,
      );

      // store token
      console.log("LOGIN RESPONSE:", res.data);
      localStorage.setItem("token", res.data.token);
      console.log("TOKEN SAVED:", localStorage.getItem("token"));

      // redirect to dashboard
      window.location.href = `https://zerodha-clone-dashboard-fmx09ofy2-gurukiran615s-projects.vercel.app?token=${res.data.token}`;
    } catch (err) {
      console.log(err);
      alert("Login failed");
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
