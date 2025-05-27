import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Createdesignplan.css';
import Sidebar from './Sidebar';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { supabase } from '../../supabaseClient';

function Createdesignplan() {
  const [designs, setDesigns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newDesignName, setNewDesignName] = useState('');
  const navigate = useNavigate();

  // ✅ Fetch from Supabase on load
  useEffect(() => {
    const fetchDesigns = async () => {
      const { data, error } = await supabase
        .from('design_plan')
        .select('id, plan_name, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching design plans:', error);
      } else {
        setDesigns(data);
      }
    };

    fetchDesigns();
  }, []);

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

    sessionStorage.setItem('new_design_name', newDesignName.toUpperCase());
    closeModal();
    navigate('/createdesign');
  };

  const handleDesignClick = (id) => {
    navigate(`/createdesign/${id}`); // ✅ Navigates to the correct dynamic route
 
  };

  const handleEditDesign = (id) => {
    alert('Edit functionality coming soon for design ID: ' + id);
  };

  const handleDeleteDesign = async (id) => {
    if (window.confirm('Are you sure you want to delete this design plan?')) {
      const { error } = await supabase.from('design_plan').delete().eq('id', id);
      if (error) {
        console.error('Failed to delete:', error);
      } else {
        setDesigns(designs.filter((d) => d.id !== id));
      }
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
              {designs.length === 0 ? (
                <tr>
                  <td colSpan="3">No design plans yet.</td>
                </tr>
              ) : (
                designs.map((design, index) => (
                  <tr key={design.id} className="clickable-row">
                    <td onClick={() => handleDesignClick(design.id)}>
                      {index + 1}. {design.plan_name}
                    </td>
                    <td onClick={() => handleDesignClick(design.id)}>
                      {new Date(design.created_at).toLocaleDateString()}
                    </td>
                    <td className="createdesign-action-buttons">
                      <button className="createdesign-action-btn" onClick={() => handleEditDesign(design.id)}>
                        <FaEdit />
                      </button>
                      <button className="createdesign-action-btn delete-btn" onClick={() => handleDeleteDesign(design.id)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
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
