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
    // Validate the form data
    if (!planName || !planDescription || !budget || !currency) {
      alert("Please fill in all the fields before submitting.");
      return;
    }

    // Ensure teacherId is set before proceeding
    if (!teacherId) {
      alert("Please log in first!");
      return;
    }

    setLoading(true); // Start loading state

    let designFileUrl = ''; // Initialize designFileUrl

    // Check if file is uploaded
    if (uploadedFile) {
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (uploadedFile.size > MAX_FILE_SIZE) {
        alert("File size exceeds the 5MB limit.");
        setLoading(false);
        return;
      }

      // Step 2: Upload the file to Supabase storage if it's selected
      const filePath = `designs/${teacherId}/${uuidv4()}_${uploadedFile.name}`; // Use teacherId and uuidv4 to create unique path

      // 1. Upload with overwrite allowed (upsert)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('upload')  // Make sure the bucket name is correct
        .upload(filePath, uploadedFile, { upsert: true });

      if (uploadError) {
        console.error("❌ Upload failed:", uploadError);
        alert("Upload failed: " + uploadError.message);
        setLoading(false);
        return;
      }

      // 2. Generate signed URL (optional, if you need the URL of the uploaded file)
      const { signedURL, error: urlError } = await supabase
        .storage
        .from('upload')
        .getPublicUrl(filePath);

      if (urlError) {
        console.error("❌ Failed to generate file URL:", urlError);
        setLoading(false);
        return;
      }

      designFileUrl = signedURL; // Assign URL to the variable
    }

    // Step 3: Save plan in DB (whether the file is uploaded or not)
    const { error: insertError } = await supabase
      .from('design_plan')
      .insert([{
        teacher_id: teacherId,
        plan_name: planName,
        description: planDescription,
        budget,
        currency,
        design_file_url: designFileUrl || '',  // Use the file URL if it's uploaded, or an empty string
        materials: [], // Initialize materials as an empty array (you can populate this later)
      }]);

    if (insertError) {
      alert('❌ Failed to publish the design plan!');
      console.error(insertError);
      setLoading(false);
      return;
    }

    setLoading(false);
    alert('✅ Design plan published successfully!');
    //navigate('/'); Redirect after publishing (optional)
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
