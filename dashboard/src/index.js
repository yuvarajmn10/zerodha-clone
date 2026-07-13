import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import Home from "./components/Home";

// STEP 1: extract token from URL
const params = new URLSearchParams(window.location.search);
const token = params.get("token");

console.log("URL TOKEN:", token); //  debug

//  STEP 2: store token
if (token) {
  localStorage.setItem("token", token);
  console.log("TOKEN STORED:", localStorage.getItem("token"));

  // STEP 3: clean URL (IMPORTANT)
  window.history.replaceState({}, document.title, "/");
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
