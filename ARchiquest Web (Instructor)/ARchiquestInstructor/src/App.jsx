import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import VirtualStore from './components/Virtualstore';
import Createdesignplan from './components/Createdesignplan';
import ClassKey from './components/ClassKey';
import AccountE from './components/AccountE';
import DesignDesign from './components/DesignDesign';
import AddReadingMaterial from './components/AddReadingMaterial';
import ReadingMaterials from './components/ReadingMaterials';

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
      <Route path="/accountE" element={<AccountE />} /> {/* Account page */}
      <Route path="/reading-materials" element={<ReadingMaterials />} />
      <Route path="/add-reading-material" element={<AddReadingMaterial />} />
      {/* Add more routes as needed */}
      {/* You can add other routes here later */}
    </Routes>
  );
}

export default App;