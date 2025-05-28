import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import VirtualStore from './components/Virtualstore';
import Createdesignplan from './components/Createdesignplan';
import ClassKey from './components/ClassKey';
import ClassKeyList from './components/classKeyList';
import AccountE from './components/AccountE';
import DesignDesign from './components/DesignDesign';

import StudentProgressDetail from './components/studentProgressDetail'; // Newly added import

import AddReadingMaterial from './components/AddReadingMaterial';
import ReadingMaterials from './components/ReadingMaterials';

import DesignPlanDetails from './components/DesignPlanDetails';
function App() {
  return (
    <Routes>
      {/* Define Routes */}
      <Route path="/" element={<LandingPage />} /> {/* Home page */}
      <Route path="/login" element={<Login />} /> {/* Login page */}
      <Route path="/register" element={<Register />} /> {/* Register page */}
      <Route path="/dashboard" element={<Dashboard />} /> {/* Dashboard page */}
      <Route path="/Virtualstore" element={<VirtualStore />} /> {/* Virtual Store page */}
      <Route path="/Createdesignplan" element={<Createdesignplan />} /> {/* Create Design Plan page */}
      <Route path="/createdesign" element={<DesignDesign />} /> {/* Create Work page */}
      <Route path="/classkey" element={<ClassKey />} /> {/* Class Key Setup page */}
      <Route path="/student-progress" element={<ClassKeyList />} /> {/* Student Progress page */}
      <Route path="/studentProgressDetail/:studentId" element={<StudentProgressDetail />} /> {/* Student Progress Detail page */}
      <Route path="/accountE" element={<AccountE />} /> {/* Account page */}
      <Route path="/reading-materials" element={<ReadingMaterials />} />
      <Route path="/add-reading-material" element={<AddReadingMaterial />} />

      
      <Route path="/createdesign/:id" element={<DesignPlanDetails />} />
      {/* Add more routes as needed */}
      {/* You can add other routes here later */}
    </Routes>
  );
}

export default App;
