import React, { useState } from 'react';
import './DesignPreview.css';

function DesignPreview() {
  const [lighting, setLighting] = useState(false);
  const [physics, setPhysics] = useState(false);
  const [annotations, setAnnotations] = useState(false);
  const [measurements, setMeasurements] = useState(false);

  return (
    <div className="designpreview-wrapper">
      <h2>Preview Environment</h2>
      <p>View your AR design before publishing</p>

      <div className="designpreview-content">
        {/* Left Side (Preview Area) */}
        <div className="designpreview-left">
          <div className="designpreview-box">
            <div className="designpreview-eye">👁️</div>
            <p>AR Preview will appear here</p>
            <button className="designpreview-launch-btn">LAUNCH IN PHONE</button>
          </div>
        </div>

        {/* Right Side (Settings) */}
        <div className="designpreview-right">
          <div className="designpreview-section">
            <h3>Viewing Options</h3>
            <div className="designpreview-options">
              <button>3D View</button>
              <button>Floor Plan</button>
              <button>Materials List</button>
              <button>Cost Breakdown</button>
            </div>
          </div>

          <div className="designpreview-section">
            <h3>Simulation Settings</h3>
            <div className="designpreview-toggles">
              <div className="designpreview-toggle">
                <label className="switch">
                  <input type="checkbox" checked={lighting} onChange={() => setLighting(!lighting)} />
                  <span className="slider"></span>
                </label>
                <span>Lighting Effects</span>
              </div>

              <div className="designpreview-toggle">
                <label className="switch">
                  <input type="checkbox" checked={physics} onChange={() => setPhysics(!physics)} />
                  <span className="slider"></span>
                </label>
                <span>Physics Simulation</span>
              </div>

              <div className="designpreview-toggle">
                <label className="switch">
                  <input type="checkbox" checked={annotations} onChange={() => setAnnotations(!annotations)} />
                  <span className="slider"></span>
                </label>
                <span>Show Annotations</span>
              </div>

              <div className="designpreview-toggle">
                <label className="switch">
                  <input type="checkbox" checked={measurements} onChange={() => setMeasurements(!measurements)} />
                  <span className="slider"></span>
                </label>
                <span>Show Measurements</span>
              </div>
            </div>
          </div>

          <div className="designpreview-section">
            <h3>Save</h3>
            <div className="designpreview-save-buttons">
              <button className="save-draft">💾 Save Draft</button>
              <button className="publish-plan">Publish Plan</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DesignPreview;
