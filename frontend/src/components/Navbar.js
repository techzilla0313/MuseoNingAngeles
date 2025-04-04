import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import logo from "../images/logo.png";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // Mobile menu state
  const navigate = useNavigate();
  const location = useLocation();

  // Check for a valid token and determine user role
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setIsLoggedIn(true);
        setIsAdmin(decodedToken?.role === 'admin' || decodedToken?.role === 'super_admin');
      } catch (error) {
        console.error("Invalid token");
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
  }, []);

  // Redirect non-admin users if they try to access /admin
  useEffect(() => {
    if (location.pathname === "/admin" && (!isLoggedIn || !isAdmin)) {
      navigate("/");
    }
  }, [isLoggedIn, isAdmin, location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate('/');
    window.location.reload();
  };

  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  // Function for NavLink classes
  // The link will have a base style, and if it is active, a background is added.
  const navLinkClasses = ({ isActive }) =>
    `${isActive ? "bg-yellow-800 text-white" : "bg-white text-black"} p-2 rounded hover:bg-yellow-800 hover:text-white`;

  return (
    <nav className="bg-white p-4 sticky top-0 z-50 shadow-lg fixed w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" onClick={scrollToTop}>
          <img src={logo} alt="Museo ning Angeles Logo" className="h-10 cursor-pointer" />
        </NavLink>

        {/* Mobile menu toggle button */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-900 focus:outline-none">
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex space-x-4">
          <NavLink to="/" onClick={scrollToTop} className={navLinkClasses}>
            Home
          </NavLink>
          <NavLink to="/art" onClick={scrollToTop} className={navLinkClasses}>
            Art
          </NavLink>
          {/* <NavLink to="/exhibits" onClick={scrollToTop} className={navLinkClasses}>
            Exhibits
          </NavLink> */}
          <NavLink to="/announcements" onClick={scrollToTop} className={navLinkClasses}>
            Announcements
          </NavLink>
          {!isLoggedIn && (
            <NavLink to="/login" onClick={scrollToTop} className={navLinkClasses}>
              Login
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" onClick={scrollToTop} className={navLinkClasses}>
              Admin Panel
            </NavLink>
          )}
          {isLoggedIn && (
            <button onClick={handleLogout} className="text-white bg-yellow-800 hover:bg-yellow-900 p-2 rounded">
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu items */}
      {menuOpen && (
        <div className="md:hidden mt-4">
          <div className="flex flex-col space-y-2">
            <NavLink to="/" onClick={() => { scrollToTop(); setMenuOpen(false); }} className={navLinkClasses}>
              Home
            </NavLink>
            <NavLink to="/art" onClick={() => { scrollToTop(); setMenuOpen(false); }} className={navLinkClasses}>
              Art
            </NavLink>
            {/* <NavLink to="/exhibits" onClick={() => { scrollToTop(); setMenuOpen(false); }} className={navLinkClasses}>
              Exhibits
            </NavLink> */}
            <NavLink to="/announcements" onClick={() => { scrollToTop(); setMenuOpen(false); }} className={navLinkClasses}>
              Announcements
            </NavLink>
            {!isLoggedIn && (
              <NavLink to="/login" onClick={() => { scrollToTop(); setMenuOpen(false); }} className={navLinkClasses}>
                Login
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" onClick={() => { scrollToTop(); setMenuOpen(false); }} className={navLinkClasses}>
                Admin Panel
              </NavLink>
            )}
            {isLoggedIn && (
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-white bg-yellow-800 hover:bg-yellow-900 p-2 rounded">
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
