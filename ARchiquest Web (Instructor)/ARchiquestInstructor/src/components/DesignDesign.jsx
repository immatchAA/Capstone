import React, { useState } from 'react';
import './DesignDesign.css';

function DesignDesign() {
  const [budget, setBudget] = useState(400000);
  const [currency, setCurrency] = useState('PHP');
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  return (
    <div className="designdesign-card">
      <h2>Design Plan Details</h2>

      <div className="designdesign-switches">
        <label><input type="checkbox" /> Public</label>
        <label><input type="checkbox" /> Allow Edit</label>
      </div>

      <div className="designdesign-form-group">
        <label>Plan Name</label>
        <input type="text" placeholder="Enter plan name..." />
      </div>

      <div className="designdesign-form-group">
        <label>Plan Description</label>
        <textarea placeholder="Enter plan description..." />
      </div>

      <div className="designdesign-form-group designdesign-budget-group">
        <label>Budget Allocation</label>
        <div className="designdesign-budget-controls">
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="designdesign-budget-input"
          />
          <input
            type="range"
            min="0"
            max="1000000"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="designdesign-budget-slider"
          />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="designdesign-currency-dropdown"
          >
            <option>PHP</option>
            <option>USD</option>
            <option>EUR</option>
          </select>
        </div>
      </div>

      <div className="designdesign-upload-section">
        <label>Upload a Design</label>
        <div
          className="designdesign-drop-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {uploadedFile ? (
            <p>📄 {uploadedFile.name}</p>
          ) : (
            <>
              <p>↑ Drop Files Here</p>
              <input
                type="file"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="fileInput"
              />
              <label htmlFor="fileInput" style={{ color: '#176BB7', cursor: 'pointer', fontSize: '0.9rem' }}>
                or Click to Browse
              </label>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DesignDesign;
