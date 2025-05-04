import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ ADD THIS
import './Createdesignplan.css';
import Sidebar from './Sidebar';
import { FaEdit, FaTrash } from 'react-icons/fa'; 

function Createdesignplan() {
  const [designs, setDesigns] = useState([
    { name: 'DESIGN EXAMPLE', date: '04 - 27 - 2025' },
    { name: 'DESIGN EXAMPLE 2', date: '04 - 27 - 2025' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newDesignName, setNewDesignName] = useState('');
  const navigate = useNavigate(); // ✅

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setNewDesignName('');
    setShowModal(false);
  };

  const handleCreateDesign = () => {
    if (newDesignName.trim() === '') {
      alert('Please enter a design name.');
      return;
    }
    const today = new Date();
    const formattedDate = `${String(today.getMonth() + 1).padStart(2, '0')} - ${String(today.getDate()).padStart(2, '0')} - ${today.getFullYear()}`;
    const newDesign = { name: newDesignName.toUpperCase(), date: formattedDate };
    
    setDesigns([...designs, newDesign]);
    closeModal();

    // ✅ After creating, auto-redirect to CreateWork
    navigate('/creatework');
  };

  const handleDesignClick = (designName) => {
    console.log(`Clicked on design: ${designName}`);
    // For now just console log; future we can redirect if needed
  };

  const handleEditDesign = (index) => {
    const newName = prompt('Enter new design name:', designs[index].name);
    if (newName && newName.trim() !== '') {
      const updatedDesigns = [...designs];
      updatedDesigns[index].name = newName.toUpperCase();
      setDesigns(updatedDesigns);
    }
  };

  const handleDeleteDesign = (index) => {
    if (window.confirm('Are you sure you want to delete this design?')) {
      const updatedDesigns = designs.filter((_, i) => i !== index);
      setDesigns(updatedDesigns);
    }
  };

  return (
    <div className="createdesign-wrapper">
      <Sidebar />

      <div className="createdesign-content">
        <div className="createdesign-header">
          <div>
            <h1>CREATE DESIGN PLAN</h1>
            <p>Create your design plan</p>
          </div>
          <button className="createdesign-create-btn" onClick={openModal}>
            CREATE DESIGN
          </button>
        </div>

        <div className="createdesign-table-container">
          <table className="createdesign-table">
            <thead>
              <tr>
                <th>Design Name</th>
                <th>Date Created</th>
                <th>Actions</th> 
              </tr>
            </thead>
            <tbody>
              {designs.map((design, index) => (
                <tr key={index} className="clickable-row">
                  <td onClick={() => handleDesignClick(design.name)}>
                    {index + 1}. {design.name}
                  </td>
                  <td onClick={() => handleDesignClick(design.name)}>
                    {design.date}
                  </td>
                  <td className="createdesign-action-buttons">
                    <button className="createdesign-action-btn" onClick={() => handleEditDesign(index)}>
                      <FaEdit />
                    </button>
                    <button className="createdesign-action-btn delete-btn" onClick={() => handleDeleteDesign(index)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="createdesign-blur-background">
          <div className="createdesign-modal-card">
            <h2>Design Name</h2>
            <input
              type="text"
              placeholder="Enter Name..."
              value={newDesignName}
              onChange={(e) => setNewDesignName(e.target.value)}
            />
            <div className="createdesign-modal-buttons">
              <button onClick={handleCreateDesign} className="createdesign-save-btn">CREATE DESIGN</button>
              <button onClick={closeModal} className="createdesign-cancel-btn">CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Createdesignplan;
