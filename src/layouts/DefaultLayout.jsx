import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import token from "@/lib/utilities";
import IconComponent from "@/components/ui/Icon";

const DefaultLayout = ({ children }) => {
  const isLoggedIn = token.isAuthenticated();
  const user = token.getUserData();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    token.removeAuthToken();
    token.removeUserData();
    setDropdownOpen(false);
    navigate("/"); // redirect to dashboard after logout
  };

  return (
    <div className="font-poppins min-h-screen flex flex-col bg-gray-50">
      {/* =======================
          NAVBAR
      ======================== */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* LEFT SECTION — LOGO + TITLE + NAV */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="SLMCS Logo" className="w-10 h-10 object-contain" />

              <Link to="/" className="text-xl font-semibold">
                SLMCS {!isLoggedIn && <span className="text-accent">Flood Relief</span>} Donations
              </Link>
            </div>

            {/* LOGGED-IN NAVIGATION */}
            {isLoggedIn && (
              <nav className="flex items-center gap-6 text-sm mt-2 sm:mt-0">
                <NavLink
                  to="/"
                  className={({ isActive }) => (isActive ? "text-accent font-semibold" : "hover:text-accent")}
                >
                  Dashboard
                </NavLink>

                {/* <NavLink
                  to="/member/donations"
                  className={({ isActive }) => (isActive ? "text-accent font-semibold" : "hover:text-accent")}
                >
                  Donations
                </NavLink> */}

                <NavLink
                  to="/member/donation/new"
                  className={({ isActive }) => (isActive ? "text-accent font-semibold" : "hover:text-accent")}
                >
                  New Donation
                </NavLink>
                <NavLink
                  to="/member/upload"
                  className={({ isActive }) => (isActive ? "text-accent font-semibold" : "hover:text-accent")}
                >
                  Upload
                </NavLink>
              </nav>
            )}
          </div>

          {/* RIGHT SECTION — ONLY SHOW IF LOGGED IN */}
          <div className="relative" ref={dropdownRef}>
            {isLoggedIn && (
              <>
                <button
                  className="flex items-center gap-2 text-sm text-gray-600 font-medium hover:text-accent transition"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                >
                  <IconComponent icon="mdi:account-circle" width="22" className="text-accent" />
                  <span>{user?.full_name}</span>
                  <IconComponent icon={dropdownOpen ? "mdi:chevron-up" : "mdi:chevron-down"} width="18" />
                </button>

                {/* DROPDOWN MENU */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white shadow-md border border-gray-200 rounded-md py-2 z-20">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <IconComponent icon="mdi:logout" width="18" />
                      Logout
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">{children}</main>

      {/* FOOTER */}
      <footer className="py-4 text-center text-sm text-gray-500 border-t border-gray-200">
        Developed for SLMCS Foundation Youth Wing by{" "}
        <a
          href="https://zafarm3n.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent font-semibold hover:underline"
        >
          zafar.m3n
        </a>
      </footer>
    </div>
  );
};

export default DefaultLayout;
