import { useEffect } from "react";

const Logout = () => {
  useEffect(() => {
    // remove token
    localStorage.removeItem("token");

    // redirect to login
    window.location.href = "http://localhost:3000/login";
  }, []);

  return <h2>Logging out...</h2>;
};

export default Logout;
