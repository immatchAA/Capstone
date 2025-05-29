"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import "./ViewDesignPlan.css"
import { supabase } from "../../supabaseClient"
import Sidebar from "./Sidebar"

function ViewDesignPlan() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Design plan data state
  const [designPlan, setDesignPlan] = useState(null)
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchDesignPlan = async () => {
      try {
        setLoading(true)

        // Fetch the design plan
        const { data: planData, error: planError } = await supabase
          .from("design_plan")
          .select("*")
          .eq("id", id)
          .single()

        if (planError) {
          console.error("Error fetching design plan:", planError)
          setError("Failed to load design plan")
          return
        }

        setDesignPlan(planData)

        // Fetch materials if there are selected materials
        if (planData.selected_materials && planData.selected_materials.length > 0) {
          const materialIds = planData.selected_materials.map((item) =>
            typeof item === "object" ? item.materialId : item,
          )

          const { data: materialsData, error: materialsError } = await supabase
            .from("materials")
            .select("*")
            .in("id", materialIds)

          if (materialsError) {
            console.error("Error fetching materials:", materialsError)
          } else {
            setMaterials(materialsData || [])
          }
        }
      } catch (err) {
        console.error("Exception fetching design plan:", err)
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchDesignPlan()
    }
  }, [id])

  const handleEdit = () => {
    navigate("/createdesign", { state: { challenge: designPlan } })
  }

  const handleBack = () => {
    navigate("/designplanlist")
  }

  const handleDelete = () => {
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
  }

  const confirmDelete = async () => {
    try {
      setDeleting(true)
      const { error } = await supabase.from("design_plan").delete().eq("id", id)

      if (error) {
        console.error("Failed to delete:", error)
        alert("Failed to delete design plan. Please try again.")
      } else {
        alert("Design plan deleted successfully!")
        navigate("/designplanlist")
      }
    } catch (err) {
      console.error("Error deleting design:", err)
      alert("An error occurred while deleting the design plan.")
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="view-design-content">
          <div className="loading-message">Loading design plan...</div>
        </div>
      </div>
    )
  }

  if (error || !designPlan) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="view-design-content">
          <div className="error-message">
            <h2>Error</h2>
            <p>{error || "Design plan not found"}</p>
            <button onClick={handleBack} className="back-btn">
              Back to Design Plans
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Calculate total cost of selected materials
  const totalMaterialCost =
    designPlan.selected_materials?.reduce((sum, item) => {
      if (typeof item === "object" && item.quantity && item.estimatedCost) {
        return sum + item.quantity * item.estimatedCost
      }
      return sum
    }, 0) || 0

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="combined-design-wrapper">
        {/* Design Plan Details Section */}
        <div className="view-design-card">
          <div className="view-design-header">
            <div className="header-content">
              <h2>Design Plan Details</h2>
              <div className="header-actions">
                <button onClick={handleBack} className="back-btn">
                  ← Back to List
                </button>
                <button onClick={handleEdit} className="edit-btn">
                  ✏️ Edit Plan
                </button>
                <button onClick={handleDelete} className="delete-btn">
                  🗑️ Delete Plan
                </button>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="view-section">
            <h3>Basic Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Plan Name</label>
                <div className="info-value">{designPlan.plan_name}</div>
              </div>
              <div className="info-item">
                <label>Description</label>
                <div className="info-value description">{designPlan.description}</div>
              </div>
              <div className="info-item">
                <label>Difficulty Level</label>
                <div className="info-value difficulty-badge">
                  <span className={`difficulty ${designPlan.difficulty_level}`}>{designPlan.difficulty_level}</span>
                </div>
              </div>
              <div className="info-item">
                <label>Estimated Duration</label>
                <div className="info-value">{designPlan.estimated_duration} minutes</div>
              </div>
            </div>
          </div>

          {/* Learning Objectives */}
          {designPlan.learning_objectives && designPlan.learning_objectives.length > 0 && (
            <div className="view-section">
              <h3>Learning Objectives</h3>
              <div className="objectives-list">
                {designPlan.learning_objectives.map((objective, index) => (
                  <div key={index} className="objective-item">
                    <span className="objective-number">{index + 1}</span>
                    <span className="objective-text">{objective}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prerequisites */}
          {designPlan.prerequisites && (
            <div className="view-section">
              <h3>Prerequisites</h3>
              <div className="info-value">{designPlan.prerequisites}</div>
            </div>
          )}

          {/* Budget Information */}
          <div className="view-section">
            <h3>Budget Information</h3>
            <div className="budget-info">
              <div className="budget-item">
                <label>Budget Allocation</label>
                <div className="budget-value">
                  {designPlan.currency} {designPlan.budget?.toLocaleString()}
                </div>
              </div>
              <div className="budget-item">
                <label>Floor Area</label>
                <div className="budget-value">{designPlan.floor_area} sq.m</div>
              </div>
              <div className="budget-item">
                <label>Cost per sq.m</label>
                <div className="budget-value">
                  {designPlan.currency} {(designPlan.budget / designPlan.floor_area).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Scoring Settings */}
          {designPlan.scoring_enabled && (
            <div className="view-section">
              <h3>Scoring Configuration</h3>
              <div className="scoring-info">
                <div className="scoring-status">
                  <span className="status-badge enabled">Scoring Enabled</span>
                </div>
                {designPlan.scoring_weights && (
                  <div className="scoring-weights">
                    <h4>Scoring Weights</h4>
                    <div className="weights-grid">
                      <div className="weight-item">
                        <span className="weight-label">Budget Management</span>
                        <span className="weight-value">{designPlan.scoring_weights.budgetManagement}%</span>
                      </div>
                      <div className="weight-item">
                        <span className="weight-label">Material Selection</span>
                        <span className="weight-value">{designPlan.scoring_weights.materialSelection}%</span>
                      </div>
                      <div className="weight-item">
                        <span className="weight-label">Cost Efficiency</span>
                        <span className="weight-value">{designPlan.scoring_weights.costEfficiency}%</span>
                      </div>
                      <div className="weight-item">
                        <span className="weight-label">Sustainability</span>
                        <span className="weight-value">{designPlan.scoring_weights.sustainability}%</span>
                      </div>
                      <div className="weight-item">
                        <span className="weight-label">Technical Accuracy</span>
                        <span className="weight-value">{designPlan.scoring_weights.technicalAccuracy}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Material Answer Key */}
          {designPlan.selected_materials && designPlan.selected_materials.length > 0 && (
            <div className="view-section">
              <h3>Material Answer Key ({designPlan.selected_materials.length} materials)</h3>
              <div className="materials-summary">
                <div className="materials-table">
                  <div className="table-header">
                    <span>Material</span>
                    <span>Quantity</span>
                    <span>Unit Cost</span>
                    <span>Total Cost</span>
                    <span>Notes</span>
                  </div>
                  {designPlan.selected_materials.map((selectedMaterial, index) => {
                    const material = materials.find(
                      (m) =>
                        m.id ===
                        (typeof selectedMaterial === "object" ? selectedMaterial.materialId : selectedMaterial),
                    )

                    if (!material) return null

                    const quantity = typeof selectedMaterial === "object" ? selectedMaterial.quantity : 1
                    const cost = typeof selectedMaterial === "object" ? selectedMaterial.estimatedCost : material.price
                    const notes = typeof selectedMaterial === "object" ? selectedMaterial.notes : ""

                    return (
                      <div key={index} className="table-row">
                        <div className="material-info">
                          <div className="material-name">{material.material_name}</div>
                          <div className="material-category">{material.category}</div>
                        </div>
                        <span className="quantity">
                          {quantity} {material.unit}
                        </span>
                        <span className="cost">${cost?.toFixed(2)}</span>
                        <span className="total">${(quantity * cost).toFixed(2)}</span>
                        <span className="notes">{notes || "-"}</span>
                      </div>
                    )
                  })}
                  <div className="table-footer">
                    <span className="total-label">Total Material Cost:</span>
                    <span className="total-value">${totalMaterialCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Design File */}
          {designPlan.design_file_url && (
            <div className="view-section">
              <h3>Design File</h3>
              <div className="file-info">
                <div className="file-preview">
                  <div className="file-icon">📄</div>
                  <div className="file-details">
                    <div className="file-name">Design File</div>
                    <a
                      href={designPlan.design_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="file-link"
                    >
                      View File
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Creation Info */}
          <div className="view-section">
            <h3>Creation Information</h3>
            <div className="creation-info">
              <div className="info-item">
                <label>Created</label>
                <div className="info-value">
                  {new Date(designPlan.created_at).toLocaleDateString()} at{" "}
                  {new Date(designPlan.created_at).toLocaleTimeString()}
                </div>
              </div>
              {designPlan.updated_at && designPlan.updated_at !== designPlan.created_at && (
                <div className="info-item">
                  <label>Last Updated</label>
                  <div className="info-value">
                    {new Date(designPlan.updated_at).toLocaleDateString()} at{" "}
                    {new Date(designPlan.updated_at).toLocaleTimeString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="view-preview-wrapper">
          <h2>Preview Environment</h2>
          <p>AR design settings and educational features</p>
          <div className="view-preview-content">
            <div className="preview-box">
              <div className="preview-eye">👁️</div>
              <p>AR Preview</p>
              <div className="preview-stats">
                <div className="stat-item">
                  <span>
                    Budget: {designPlan.currency} {designPlan.budget?.toLocaleString()}
                  </span>
                </div>
                <div className="stat-item">
                  <span>Area: {designPlan.floor_area} sq.m</span>
                </div>
                <div className="stat-item">
                  <span>Duration: {designPlan.estimated_duration} min</span>
                </div>
                <div className="stat-item">
                  <span>Level: {designPlan.difficulty_level}</span>
                </div>
              </div>
              <button className="launch-btn">LAUNCH IN PHONE</button>
            </div>

            {/* Preview Settings */}
            {designPlan.preview_settings && (
              <div className="preview-settings">
                <h3>Simulation Settings</h3>
                <div className="settings-list">
                  <div className={`setting-item ${designPlan.preview_settings.lighting ? "enabled" : "disabled"}`}>
                    <span className="setting-icon">{designPlan.preview_settings.lighting ? "✅" : "❌"}</span>
                    <span>Lighting Effects</span>
                  </div>
                  <div className={`setting-item ${designPlan.preview_settings.physics ? "enabled" : "disabled"}`}>
                    <span className="setting-icon">{designPlan.preview_settings.physics ? "✅" : "❌"}</span>
                    <span>Physics Simulation</span>
                  </div>
                  <div className={`setting-item ${designPlan.preview_settings.annotations ? "enabled" : "disabled"}`}>
                    <span className="setting-icon">{designPlan.preview_settings.annotations ? "✅" : "❌"}</span>
                    <span>Show Annotations</span>
                  </div>
                  <div className={`setting-item ${designPlan.preview_settings.measurements ? "enabled" : "disabled"}`}>
                    <span className="setting-icon">{designPlan.preview_settings.measurements ? "✅" : "❌"}</span>
                    <span>Show Measurements</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="createdesign-blur-background">
          <div className="createdesign-modal-card delete-modal">
            <div className="delete-icon">⚠️</div>
            <h2>Delete Design Plan</h2>
            <p>
              Are you sure you want to delete <strong>"{designPlan.plan_name}"</strong>?
            </p>
            <p className="delete-warning">This action cannot be undone and will remove all associated data.</p>
            <div className="createdesign-modal-buttons">
              <button onClick={confirmDelete} className="createdesign-delete-confirm-btn" disabled={deleting}>
                {deleting ? "Deleting..." : "DELETE"}
              </button>
              <button onClick={closeDeleteModal} className="createdesign-cancel-btn">
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewDesignPlan
