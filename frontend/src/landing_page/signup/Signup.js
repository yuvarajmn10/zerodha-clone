import axios from "axios";
import { useState } from "react";

function Signup() {
  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleSignup = async () => {
    try {
      await axios.post(
        "https://zerodha-backend-j6zw.onrender.com/api/auth/signup",
        data,
      );
      alert("Signup successful");

      // redirect to login
      window.location.href = "/login";
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <input
        placeholder="Username"
        onChange={(e) => setData({ ...data, username: e.target.value })}
      />
      <input
        placeholder="Email"
        onChange={(e) => setData({ ...data, email: e.target.value })}
      />
      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setData({ ...data, password: e.target.value })}
      />
      <button onClick={handleSignup}>Signup</button>
    </>
  );
}

export default Signup;
