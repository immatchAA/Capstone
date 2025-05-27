"use client"

import { useState, useEffect } from "react"
import "./DesignDesign.css"
import { supabase } from "../../supabaseClient"
import Sidebar from "./Sidebar"
import { useNavigate, useLocation } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"

function DesignDesign() {
  // Design inputs state
  const [planName, setPlanName] = useState("")
  const [planDescription, setPlanDescription] = useState("")
  const [budget, setBudget] = useState(400000)
  const [currency, setCurrency] = useState("PHP")
  const [uploadedFile, setUploadedFile] = useState(null)
  const [floorArea, setFloorArea] = useState(100) // Add floor area for scoring calculations

  // Enhanced settings for educational features
  const [difficultyLevel, setDifficultyLevel] = useState("intermediate")
  const [learningObjectives, setLearningObjectives] = useState([])
  const [estimatedDuration, setEstimatedDuration] = useState(120) // minutes
  const [prerequisites, setPrerequisites] = useState("")

  // Selected materials for answer key - now stores objects with quantity and cost
  const [selectedMaterials, setSelectedMaterials] = useState([])

  // Preview settings state
  const [lighting, setLighting] = useState(false)
  const [physics, setPhysics] = useState(false)
  const [annotations, setAnnotations] = useState(false)
  const [measurements, setMeasurements] = useState(false)

  // Educational scoring settings
  const [enableScoring, setEnableScoring] = useState(true)
  const [scoringWeights, setScoringWeights] = useState({
    budgetManagement: 25,
    materialSelection: 25,
    costEfficiency: 25,
    sustainability: 15,
    technicalAccuracy: 10,
  })

  // User session state
  const [teacherId, setTeacherId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [materials, setMaterials] = useState([])
  const [showMaterialSelection, setShowMaterialSelection] = useState(false) // Declare showMaterialSelection
  const navigate = useNavigate()
  const location = useLocation()
  const selectedChallenge = location.state?.challenge || null

  // Get user session and load materials
  useEffect(() => {
    const getUserSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session && session.user) {
        console.log("✅ Supabase session user:", session.user)
        setTeacherId(session.user.id)
        await loadInstructorMaterials(session.user.id)
      } else {
        console.warn("⚠️ No active session found.")
        navigate("/login")
      }
    }

    if (selectedChallenge) {
      setPlanName(selectedChallenge.plan_name || "")
      setPlanDescription(selectedChallenge.description || "")
      setBudget(selectedChallenge.budget || 400000)
      setCurrency(selectedChallenge.currency || "PHP")
      setFloorArea(selectedChallenge.floor_area || 100)
      setDifficultyLevel(selectedChallenge.difficulty_level || "intermediate")
      setEstimatedDuration(selectedChallenge.estimated_duration || 120)
      setPrerequisites(selectedChallenge.prerequisites || "")

      if (selectedChallenge.learning_objectives) {
        setLearningObjectives(selectedChallenge.learning_objectives)
      }

      if (selectedChallenge?.selected_materials) {
        // Handle both old format (array of IDs) and new format (array of objects)
        const savedMaterials = selectedChallenge.selected_materials
        if (savedMaterials.length > 0) {
          if (typeof savedMaterials[0] === "string" || typeof savedMaterials[0] === "number") {
            // Old format - convert to new format
            setSelectedMaterials(
              savedMaterials.map((id) => ({
                materialId: id,
                quantity: 1,
                estimatedCost: 0,
                notes: "",
              })),
            )
          } else {
            // New format
            setSelectedMaterials(savedMaterials)
          }
        }
      }
    }
    getUserSession()
  }, [navigate, selectedChallenge])

  // Load instructor's materials for the design plan
  const loadInstructorMaterials = async (instructorId) => {
    try {
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .eq("teacher_id", instructorId)
        .order("material_name", { ascending: true })

      if (error) {
        console.error("Error loading materials:", error)
      } else {
        setMaterials(data || [])
      }
    } catch (err) {
      console.error("Exception loading materials:", err)
    }
  }

  // Handle learning objectives
  const addLearningObjective = () => {
    setLearningObjectives([...learningObjectives, ""])
  }

  const updateLearningObjective = (index, value) => {
    const updated = [...learningObjectives]
    updated[index] = value
    setLearningObjectives(updated)
  }

  const removeLearningObjective = (index) => {
    const updated = learningObjectives.filter((_, i) => i !== index)
    setLearningObjectives(updated)
  }

  // Handle material selection for answer key with quantity and cost
  const toggleMaterialSelection = (materialId) => {
    setSelectedMaterials((prev) => {
      const existingIndex = prev.findIndex((item) => item.materialId === materialId)

      if (existingIndex >= 0) {
        // Remove material if already selected
        return prev.filter((item) => item.materialId !== materialId)
      } else {
        // Add material with default quantity and cost
        const material = materials.find((m) => m.id === materialId)
        return [
          ...prev,
          {
            materialId: materialId,
            quantity: 1,
            estimatedCost: material?.price || 0,
            notes: "",
          },
        ]
      }
    })
  }

  const updateMaterialQuantity = (materialId, quantity) => {
    setSelectedMaterials((prev) =>
      prev.map((item) =>
        item.materialId === materialId ? { ...item, quantity: Math.max(0, Number(quantity) || 0) } : item,
      ),
    )
  }

  const updateMaterialCost = (materialId, cost) => {
    setSelectedMaterials((prev) =>
      prev.map((item) =>
        item.materialId === materialId ? { ...item, estimatedCost: Math.max(0, Number(cost) || 0) } : item,
      ),
    )
  }

  const updateMaterialNotes = (materialId, notes) => {
    setSelectedMaterials((prev) =>
      prev.map((item) => (item.materialId === materialId ? { ...item, notes: notes } : item)),
    )
  }

  const selectAllMaterialsInCategory = (category) => {
    const categoryMaterials = materials.filter((mat) => mat.category === category)

    setSelectedMaterials((prev) => {
      const newSelected = [...prev]
      categoryMaterials.forEach((material) => {
        const existingIndex = newSelected.findIndex((item) => item.materialId === material.id)
        if (existingIndex === -1) {
          newSelected.push({
            materialId: material.id,
            quantity: 1,
            estimatedCost: material.price || 0,
            notes: "",
          })
        }
      })
      return newSelected
    })
  }

  const deselectAllMaterialsInCategory = (category) => {
    const categoryMaterials = materials.filter((mat) => mat.category === category)
    const categoryIds = categoryMaterials.map((mat) => mat.id)

    setSelectedMaterials((prev) => prev.filter((item) => !categoryIds.includes(item.materialId)))
  }

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  // Enhanced publish function with educational features
  const handlePublishPlan = async () => {
    if (!planName || !planDescription || !budget || !currency) {
      alert("Please fill in all the fields before submitting.")
      return
    }

    if (!teacherId) {
      alert("Please log in first!")
      return
    }

    if (learningObjectives.filter((obj) => obj.trim()).length === 0) {
      alert("Please add at least one learning objective.")
      return
    }

    setLoading(true)

    let designFileUrl = selectedChallenge?.design_file_url || ""
    let filePath = selectedChallenge?.file_path || ""

    if (uploadedFile) {
      const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
      if (uploadedFile.size > MAX_FILE_SIZE) {
        alert("File size exceeds the 5MB limit.")
        setLoading(false)
        return
      }

      filePath = `designs/${teacherId}/${uuidv4()}_${uploadedFile.name}`

      const { error: uploadError } = await supabase.storage
        .from("upload")
        .upload(filePath, uploadedFile, { upsert: true })

      if (uploadError) {
        console.error("❌ Upload failed:", uploadError)
        alert("Upload failed: " + uploadError.message)
        setLoading(false)
        return
      }

      const {
        data: { publicUrl },
        error: urlError,
      } = await supabase.storage.from("upload").getPublicUrl(filePath)

      if (urlError) {
        console.error("❌ Failed to get public URL:", urlError)
        setLoading(false)
        return
      }

      designFileUrl = publicUrl
    }

    // Prepare enhanced design plan data
    const designPlanData = {
      plan_name: planName,
      description: planDescription,
      budget,
      currency,
      floor_area: floorArea,
      file_path: filePath,
      design_file_url: designFileUrl,
      difficulty_level: difficultyLevel,
      estimated_duration: estimatedDuration,
      prerequisites: prerequisites,
      learning_objectives: learningObjectives.filter((obj) => obj.trim()),
      scoring_enabled: enableScoring,
      scoring_weights: scoringWeights,
      preview_settings: {
        lighting,
        physics,
        annotations,
        measurements,
      },
      updated_at: new Date().toISOString(),
      selected_materials: selectedMaterials,
    }

    try {
      if (selectedChallenge) {
        // Update existing design plan
        const { error: updateError } = await supabase
          .from("design_plan")
          .update(designPlanData)
          .eq("id", selectedChallenge.id)

        if (updateError) {
          console.error("❌ Failed to update design plan:", updateError)
          alert("❌ Failed to update the design plan!")
          setLoading(false)
          return
        }

        alert("✅ Design plan updated successfully!")
      } else {
        // Create new design plan
        designPlanData.teacher_id = teacherId
        designPlanData.materials = []

        const { error: insertError } = await supabase.from("design_plan").insert([designPlanData])

        if (insertError) {
          console.error("❌ Failed to publish design plan:", insertError)
          alert("Failed to publish: " + insertError.message)
          setLoading(false)
          return
        }

        alert("✅ Design plan published successfully!")
      }

      setLoading(false)
      navigate("/dashboard")
    } catch (err) {
      console.error("Exception in handlePublishPlan:", err)
      alert("An unexpected error occurred")
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="combined-design-wrapper">
        {/* Enhanced Design Plan Details Section */}
        <div className="designdesign-card">
          <h2>Design Plan Details</h2>

          {/* Basic Information */}
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
              rows={4}
            />
          </div>

          <div className="designdesign-form-group">
            <label>Difficulty Level</label>
            <select value={difficultyLevel} onChange={(e) => setDifficultyLevel(e.target.value)}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          {/* Learning Objectives */}
          <div className="designdesign-form-group">
            <label>Learning Objectives</label>
            {learningObjectives.map((objective, index) => (
              <div key={index} className="learning-objective-item">
                <input
                  type="text"
                  placeholder={`Learning objective ${index + 1}...`}
                  value={objective}
                  onChange={(e) => updateLearningObjective(index, e.target.value)}
                />
                <button type="button" onClick={() => removeLearningObjective(index)} className="remove-objective-btn">
                  ✕
                </button>
              </div>
            ))}
            <button type="button" onClick={addLearningObjective} className="add-objective-btn">
              + Add Learning Objective
            </button>
          </div>

          {/* Budget and Floor Area */}
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

          {/* Scoring Settings */}
          <div className="designdesign-form-group">
            <label>
              <input type="checkbox" checked={enableScoring} onChange={(e) => setEnableScoring(e.target.checked)} />
              Enable Educational Scoring System
            </label>
          </div>

          {enableScoring && (
            <div className="scoring-weights-section">
              <h4>Scoring Weights</h4>
              <div className="scoring-weights-grid">
                <div className="weight-item">
                  <label>Budget Management ({scoringWeights.budgetManagement}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={scoringWeights.budgetManagement}
                    onChange={(e) =>
                      setScoringWeights({
                        ...scoringWeights,
                        budgetManagement: Number(e.target.value),
                      })
                    }
                  />
                  <p className="weight-description">
                    How closely the design adheres to the set budget without overspending or underspending.
                  </p>
                </div>
                <div className="weight-item">
                  <label>Material Selection ({scoringWeights.materialSelection}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={scoringWeights.materialSelection}
                    onChange={(e) =>
                      setScoringWeights({
                        ...scoringWeights,
                        materialSelection: Number(e.target.value),
                      })
                    }
                  />
                  <p className="weight-description">
                    Appropriateness and effectiveness of the chosen materials for the design's purpose.
                  </p>
                </div>
                <div className="weight-item">
                  <label>Cost Efficiency ({scoringWeights.costEfficiency}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={scoringWeights.costEfficiency}
                    onChange={(e) =>
                      setScoringWeights({
                        ...scoringWeights,
                        costEfficiency: Number(e.target.value),
                      })
                    }
                  />
                  <p className="weight-description">
                    Effective use of resources to minimize cost while maintaining quality and performance.
                  </p>
                </div>
                <div className="weight-item">
                  <label>Sustainability ({scoringWeights.sustainability}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={scoringWeights.sustainability}
                    onChange={(e) =>
                      setScoringWeights({
                        ...scoringWeights,
                        sustainability: Number(e.target.value),
                      })
                    }
                  />
                  <p className="weight-description">
                    Use of eco-friendly materials and sustainable practices in the design.
                  </p>
                </div>
                <div className="weight-item">
                  <label>Technical Accuracy ({scoringWeights.technicalAccuracy}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={scoringWeights.technicalAccuracy}
                    onChange={(e) =>
                      setScoringWeights({
                        ...scoringWeights,
                        technicalAccuracy: Number(e.target.value),
                      })
                    }
                  />
                  <p className="weight-description">
                    Accuracy of construction details and alignment with architectural standards.
                  </p>
                </div>
              </div>
              <div className="total-weight">Total: {Object.values(scoringWeights).reduce((a, b) => a + b, 0)}%</div>
            </div>
          )}

          {/* Material Answer Key Section */}
          <div className="designdesign-form-group">
            <div className="material-answer-key-header">
              <label>Material Answer Key</label>
              <p className="material-answer-key-description">
                Select the appropriate materials for this design plan. These will serve as the answer key for students.
              </p>
              <button
                type="button"
                className="toggle-material-selection-btn"
                onClick={() => setShowMaterialSelection(!showMaterialSelection)}
              >
                {showMaterialSelection ? "Hide Materials" : "Show Materials"} ({materials.length} available)
              </button>
            </div>

            {showMaterialSelection && (
              <div className="material-selection-container">
                {materials.length === 0 ? (
                  <div className="no-materials-message">
                    <p>No materials available. Add materials in the Virtual Store first.</p>
                    <button type="button" className="goto-store-btn" onClick={() => navigate("/virtualstore")}>
                      Go to Virtual Store
                    </button>
                  </div>
                ) : (
                  <div className="materials-by-category">
                    {Object.entries(
                      materials.reduce((acc, material) => {
                        if (!acc[material.category]) acc[material.category] = []
                        acc[material.category].push(material)
                        return acc
                      }, {}),
                    ).map(([category, categoryMaterials]) => (
                      <div key={category} className="material-category-section">
                        <div className="category-header">
                          <h4>{category}</h4>
                          <div className="category-actions">
                            <button
                              type="button"
                              className="select-all-btn"
                              onClick={() => selectAllMaterialsInCategory(category)}
                            >
                              Select All
                            </button>
                            <button
                              type="button"
                              className="deselect-all-btn"
                              onClick={() => deselectAllMaterialsInCategory(category)}
                            >
                              Deselect All
                            </button>
                          </div>
                        </div>
                        <div className="materials-grid">
                          {categoryMaterials.map((material) => {
                            const selectedMaterial = selectedMaterials.find((item) => item.materialId === material.id)
                            const isSelected = !!selectedMaterial

                            return (
                              <div key={material.id} className={`material-card ${isSelected ? "selected" : ""}`}>
                                <div className="material-checkbox">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleMaterialSelection(material.id)}
                                  />
                                </div>
                                <div className="material-info">
                                  <h5>{material.material_name}</h5>
                                  <p className="material-description">{material.description}</p>
                                  <div className="material-details">
                                    <span className="material-price">${material.price.toFixed(2)}</span>
                                    <span className="material-unit">{material.unit}</span>
                                  </div>

                                  {isSelected && (
                                    <div className="material-answer-key-inputs">
                                      <div className="answer-key-input-group">
                                        <label>Expected Quantity:</label>
                                        <input
                                          type="number"
                                          min="0"
                                          step="0.1"
                                          value={selectedMaterial.quantity}
                                          onChange={(e) => updateMaterialQuantity(material.id, e.target.value)}
                                          className="quantity-input"
                                          placeholder="Enter quantity"
                                        />
                                        <span className="unit-label">{material.unit}</span>
                                      </div>

                                      <div className="answer-key-input-group">
                                        <label>Expected Cost:</label>
                                        <input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={selectedMaterial.estimatedCost}
                                          onChange={(e) => updateMaterialCost(material.id, e.target.value)}
                                          className="cost-input"
                                          placeholder="Enter expected cost"
                                        />
                                      </div>

                                      <div className="answer-key-input-group">
                                        <label>Notes (Optional):</label>
                                        <textarea
                                          value={selectedMaterial.notes}
                                          onChange={(e) => updateMaterialNotes(material.id, e.target.value)}
                                          className="notes-input"
                                          placeholder="Add notes about this material selection..."
                                          rows="2"
                                        />
                                      </div>

                                      <div className="calculated-total">
                                        <strong>
                                          Total: $
                                          {(selectedMaterial.quantity * selectedMaterial.estimatedCost).toFixed(2)}
                                        </strong>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedMaterials.length > 0 && (
                  <div className="selected-materials-summary">
                    <h4>Answer Key Materials ({selectedMaterials.length})</h4>
                    <div className="answer-key-summary-table">
                      <div className="summary-table-header">
                        <span>Material</span>
                        <span>Quantity</span>
                        <span>Unit Cost</span>
                        <span>Total Cost</span>
                        <span>Actions</span>
                      </div>

                      {selectedMaterials.map((selectedMaterial) => {
                        const material = materials.find((m) => m.id === selectedMaterial.materialId)
                        if (!material) return null

                        return (
                          <div key={selectedMaterial.materialId} className="summary-table-row">
                            <div className="material-name-cell">
                              <span className="material-name">{material.material_name}</span>
                              {selectedMaterial.notes && (
                                <span className="material-notes">{selectedMaterial.notes}</span>
                              )}
                            </div>
                            <span className="quantity-cell">
                              {selectedMaterial.quantity} {material.unit}
                            </span>
                            <span className="cost-cell">${selectedMaterial.estimatedCost.toFixed(2)}</span>
                            <span className="total-cell">
                              ${(selectedMaterial.quantity * selectedMaterial.estimatedCost).toFixed(2)}
                            </span>
                            <button
                              type="button"
                              className="remove-selected-btn"
                              onClick={() => toggleMaterialSelection(selectedMaterial.materialId)}
                            >
                              ✕
                            </button>
                          </div>
                        )
                      })}

                      <div className="summary-table-footer">
                        <span className="total-label">Total Answer Key Cost:</span>
                        <span className="total-value">
                          $
                          {selectedMaterials
                            .reduce((sum, item) => sum + item.quantity * item.estimatedCost, 0)
                            .toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="answer-key-actions">
                      <button type="button" className="clear-all-btn" onClick={() => setSelectedMaterials([])}>
                        Clear All Materials
                      </button>

                      <button
                        type="button"
                        className="export-answer-key-btn"
                        onClick={() => {
                          const answerKeyData = {
                            planName: planName,
                            materials: selectedMaterials.map((item) => {
                              const material = materials.find((m) => m.id === item.materialId)
                              return {
                                ...item,
                                materialName: material?.material_name,
                                unit: material?.unit,
                              }
                            }),
                            totalCost: selectedMaterials.reduce(
                              (sum, item) => sum + item.quantity * item.estimatedCost,
                              0,
                            ),
                          }

                          console.log("Answer Key Data:", answerKeyData)
                          // Here you could implement export functionality
                          alert("Answer key data logged to console. Export functionality can be implemented here.")
                        }}
                      >
                        Export Answer Key
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* File Upload */}
          <div className="designdesign-upload-section">
            <label>Upload a Design</label>
            <div className="designdesign-drop-area" onDrop={handleDrop} onDragOver={handleDragOver}>
              {uploadedFile ? (
                <p>📄 {uploadedFile.name}</p>
              ) : (
                <>
                  <p>↑ Drop Files Here</p>
                  <input type="file" onChange={handleFileSelect} style={{ display: "none" }} id="fileInput" />
                  <label htmlFor="fileInput" style={{ color: "#176BB7", cursor: "pointer", fontSize: "0.9rem" }}>
                    or Click to Browse
                  </label>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Preview Section */}
        <div className="designpreview-wrapper">
          <h2>Preview Environment</h2>
          <p>Configure your AR design settings and educational features</p>
          <div className="designpreview-content">
            <div className="designpreview-left">
              <div className="designpreview-box">
                <div className="designpreview-eye">👁️</div>
                <p>AR Preview will appear here</p>
                <div className="preview-stats">
                  <div className="stat-item">
                    <span>
                      Budget: {currency} {budget.toLocaleString()}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span>Area: {floorArea} sq.m</span>
                  </div>
                  <div className="stat-item">
                    <span>Duration: {estimatedDuration} min</span>
                  </div>
                  <div className="stat-item">
                    <span>Level: {difficultyLevel}</span>
                  </div>
                </div>
                <button className="designpreview-launch-btn">LAUNCH IN PHONE</button>
              </div>
            </div>

            <div className="designpreview-right">
              <div className="designpreview-section">
                <h3>Viewing Options</h3>
                <div className="designpreview-options">
                  <button>3D View</button>
                  <button>Floor Plan</button>
                  <button>Materials List ({selectedMaterials.length} selected)</button>
                  <button>Cost Breakdown</button>
                  {enableScoring && <button>Scoring Rubric</button>}
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
                    {loading ? "Publishing..." : "Publish Plan"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DesignDesign
