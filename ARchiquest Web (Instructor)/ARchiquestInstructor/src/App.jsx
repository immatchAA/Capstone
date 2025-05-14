import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register'; // <-- ADD THIS import
import Dashboard from './components/Dashboard';
import VirtualStore from './components/Virtualstore';
import Createdesignplan from './components/Createdesignplan';
import ClassKey from './components/ClassKey';
import DesignDesign from './components/DesignDesign';

function App() {
  return (
    <Routes>
      {/* Define Routes */}
      <Route path="/" element={<Home />} /> {/* Home page */}
      <Route path="/login" element={<Login />} /> {/* Login page */}
      <Route path="/register" element={<Register />} /> {/* Register page */}
      <Route path="/dashboard" element={<Dashboard />} /> {/* Dashboard page */}
      <Route path="/Virtualstore" element={<VirtualStore />} /> {/* Virtual Store page */}
      <Route path="/Createdesignplan" element={<Createdesignplan />} /> {/* Create Design Plan page */}
      <Route path="/createdesign" element={<DesignDesign />} /> {/* Create Work page */}
      <Route path="/classkey" element={<ClassKey />} />
      {/* Add more routes as needed */}
      {/* You can add other routes here later */}
    </Routes>
  );
}

export default App;