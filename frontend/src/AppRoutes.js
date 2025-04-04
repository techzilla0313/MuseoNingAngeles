import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Art from './components/Art';
import Exhibits from './components/Exhibit';
import Contact from './components/Contact';
import Register from './components/Register';
import Admin from './components/Admin';
import Login from './components/Login';
import AllExhibits from './components/AllExhibits';
import Announcement from './components/Announcement'; // Import AnnouncementPage
import Footer from './components/Footer';

const AppRoutes = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && <Navbar />}
      <div className="flex-grow">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/all-exhibits" element={<AllExhibits />} />

          {/* Admin Route */}
          <Route path="/admin" element={<Admin />} />

          {/* Main Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/art" element={<Art />} />
          <Route path="/exhibits" element={<Exhibits />} />
          <Route path="/contact" element={<Contact />} />
          {/* Announcement Route */}
          <Route path="/announcements" element={<Announcement />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default AppRoutes;
