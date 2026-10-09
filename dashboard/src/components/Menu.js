import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";

import { Logout as LogoutIcon } from "@mui/icons-material";

import { useAccount } from "../hooks/useAccount";

const LINKS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/orders", label: "Orders" },
  { to: "/holdings", label: "Holdings" },
  { to: "/positions", label: "Positions" },
  { to: "/funds", label: "Funds" },
  { to: "/apps", label: "Apps" },
];

// "Yuvaraj M N" -> "YM"
const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

const Menu = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [account] = useAccount();
  const displayName = account?.username || account?.email || "";
  const profileRef = useRef(null);

  // close the dropdown when clicking anywhere else
  useEffect(() => {
    if (!isProfileDropdownOpen) return;
    const handleClick = (e) => {
      if (!profileRef.current?.contains(e.target)) setIsProfileDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isProfileDropdownOpen]);

  return (
    <div className="tb-menu">
      <img src="logo.png" alt="logo" className="tb-logo" />

      <nav className="tb-links">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `tb-link${isActive ? " active" : ""}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="tb-profile" ref={profileRef}>
        <button
          className="tb-profile-button"
          onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
        >
          <span className="tb-avatar">{initials(displayName) || "?"}</span>
          <span className="tb-username">{displayName}</span>
        </button>

        {isProfileDropdownOpen && (
          <div className="tb-dropdown">
            <div className="tb-dropdown-head">
              <p className="tb-dropdown-name">{account?.username}</p>
              <p className="tb-dropdown-email">{account?.email}</p>
            </div>
            <Link
              to="/funds"
              className="tb-dropdown-item"
              onClick={() => setIsProfileDropdownOpen(false)}
            >
              Funds
            </Link>
            <Link to="/logout" className="tb-dropdown-item tb-logout">
              <LogoutIcon fontSize="small" /> Logout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
