import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';  // Import Router
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>  {/* Wrap your App component with BrowserRouter */}
      <App />
    </Router>
  </StrictMode>,
);
