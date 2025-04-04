import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter for routing
import AppRoutes from './AppRoutes'; // Import AppRoutes component

const App = () => {
  return (
    <Router>
      <AppRoutes /> {/* This renders all your routes and components */}
    </Router>
  );
};

export default App;