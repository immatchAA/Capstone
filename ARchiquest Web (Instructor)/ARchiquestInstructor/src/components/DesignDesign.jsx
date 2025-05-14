import React, { useState, useEffect } from 'react';
import './DesignDesign.css';
import { supabase } from '../../supabaseClient'; 
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';


function DesignDesign() {
  // Design inputs state
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [budget, setBudget] = useState(400000);
  const [currency, setCurrency] = useState('PHP');
  const [uploadedFile, setUploadedFile] = useState(null);

  // Preview settings state
  const [lighting, setLighting] = useState(false);
  const [physics, setPhysics] = useState(false);
  const [annotations, setAnnotations] = useState(false);
  const [measurements, setMeasurements] = useState(false);

  // User session state
  const [teacherId, setTeacherId] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get user session
  useEffect(() => {
    const getUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        console.log("✅ Supabase session user:", session.user);
        setTeacherId(session.user.id);
      } else {
        console.warn("⚠️ No active session found.");
        navigate('/login'); // Redirect to login if no active session
      }
    };

    getUserSession();
  }, [navigate]);

  // Handle file drop
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

  // Function to handle the Publish Plan button click
const handlePublishPlan = async () => {
  if (!planName || !planDescription || !budget || !currency) {
    alert("Please fill in all the fields before submitting.");
    return;
  }

  if (!teacherId) {
    alert("Please log in first!");
    return;
  }

  setLoading(true);

  let designFileUrl = '';
  let filePath = ''; // ✅ Declare filePath outside to store it for DB

  if (uploadedFile) {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (uploadedFile.size > MAX_FILE_SIZE) {
      alert("File size exceeds the 5MB limit.");
      setLoading(false);
      return;
    }

    // ✅ Step 1: Build unique file path
    const filePath = `designs/${teacherId}/${uuidv4()}_${uploadedFile.name}`;
    


    // ✅ Step 2: Upload to Supabase
    const { error: uploadError } = await supabase.storage
      .from('upload')
      .upload(filePath, uploadedFile, { upsert: true });

    if (uploadError) {
      console.error("❌ Upload failed:", uploadError);
      alert("Upload failed: " + uploadError.message);
      setLoading(false);
      return;
    }

    // ✅ Step 3: Get public URL (for optional direct file preview)
    const { data: { publicUrl }, error: urlError } = await supabase
      .storage
      .from('upload')
      .getPublicUrl(filePath);

    if (urlError) {
      console.error("❌ Failed to get public URL:", urlError);
      setLoading(false);
      return;
    }

    designFileUrl = publicUrl; // ✅ This is optional and not required by the mobile app
  }

  // ✅ Step 4: Save record in design_plan with file_path
  const { error: insertError } = await supabase
    .from('design_plan')
    .insert([{
      teacher_id: teacherId,
      plan_name: planName,
      description: planDescription,
      budget,
      currency,
      file_path: filePath,               // ✅ Important for mobile app
      design_file_url: designFileUrl,    // Optional for web display
      materials: [],
    }]);

  if (insertError) {
    console.error('❌ Failed to publish design plan:', insertError);
    alert('❌ Failed to publish the design plan!');
    setLoading(false);
    return;
  }

  setLoading(false);
  alert('✅ Design plan published successfully!');
  // navigate('/'); // Optional: redirect after success
};


  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="combined-design-wrapper">
        {/* Design Plan Details Section */}
        <div className="designdesign-card">
          <h2>Design Plan Details</h2>
          <div className="designdesign-switches">
            <label><input type="checkbox" /> Public</label>
            <label><input type="checkbox" /> Allow Edit</label>
          </div>
          <div className="designdesign-form-group">
            <label>Plan Name</label>
            <input
              type="text"
              placeholder="Enter plan name..."
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
            />
          </div>
          <div className="designdesign-form-group">
            <label>Plan Description</label>
            <textarea
              placeholder="Enter plan description..."
              value={planDescription}
              onChange={(e) => setPlanDescription(e.target.value)}
            />
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

        {/* Design Preview Section */}
        <div className="designpreview-wrapper">
          <h2>Preview Environment</h2>
          <p>View your AR design before publishing</p>
          <div className="designpreview-content">
            <div className="designpreview-left">
              <div className="designpreview-box">
                <div className="designpreview-eye">👁️</div>
                <p>AR Preview will appear here</p>
                <button className="designpreview-launch-btn">LAUNCH IN PHONE</button>
              </div>
            </div>

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
                  <button className="publish-plan" onClick={handlePublishPlan}>
                    {loading ? 'Uploading...' : 'Publish Plan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DesignDesign;
