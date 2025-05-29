"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./DesignPlanList.css"
import Sidebar from "./Sidebar"
import { FaEdit, FaTrash, FaEye } from "react-icons/fa"
import { supabase } from "../../supabaseClient"

function DesignPlanList() {
  const [designs, setDesigns] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [newDesignName, setNewDesignName] = useState("")
  const [designToDelete, setDesignToDelete] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // ✅ Fetch from Supabase on load
  useEffect(() => {
    const fetchTeacherDesigns = async () => {
      try {
        setLoading(true)
        // ✅ Get current user (teacher)
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          console.error("No authenticated user found.")
          return
        }

        const { data, error } = await supabase
          .from("design_plan")
          .select("id, plan_name, created_at, description, difficulty_level, budget, currency")
          .eq("teacher_id", user.id) // ✅ Filter by logged-in teacher
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching design plans:", error)
        } else {
          setDesigns(data)
        }
      } catch (err) {
        console.error("Unexpected error fetching designs:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTeacherDesigns()
  }, [])

  const openModal = () => setShowModal(true)
  const closeModal = () => {
    setNewDesignName("")
    setShowModal(false)
  }

  const openDeleteModal = (design) => {
    setDesignToDelete(design)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setDesignToDelete(null)
    setShowDeleteModal(false)
  }

  const handleCreateDesign = () => {
    if (newDesignName.trim() === "") {
      alert("Please enter a design name.")
      return
    }

    sessionStorage.setItem("new_design_name", newDesignName.toUpperCase())
    closeModal()
    navigate("/createdesign")
  }

  const handleDesignClick = (id) => {
    navigate(`/view-design/${id}`) // ✅ Navigate to view page instead of edit
  }

  const handleEditDesign = (e, id) => {
    e.stopPropagation() // Prevent row click
    navigate("/createdesign", { state: { challenge: designs.find((d) => d.id === id) } })
  }

  const handleDeleteDesign = async (e, id) => {
    e.stopPropagation() // Prevent row click
    const design = designs.find((d) => d.id === id)
    openDeleteModal(design)
  }

const confirmDelete = async () => {
  if (!designToDelete) return;

  try {
    setLoading(true);
    const planId = designToDelete.id;

    // 1. Find all cost_estimates for this plan
    const { data: estimates, error: fetchError } = await supabase
      .from("cost_estimates")
      .select("id")
      .eq("design_plan_id", planId);

    if (fetchError) throw fetchError;

    const estimateIds = estimates.map(e => e.id);

    // 2. Delete cost_estimate_items linked to those estimates
    if (estimateIds.length > 0) {
      const { error: itemsError } = await supabase
        .from("cost_estimate_items")
        .delete()
        .in("estimate_id", estimateIds);
      if (itemsError) throw itemsError;
    }

    // 3. Delete student_scores for this plan
    const { error: scoresError } = await supabase
      .from("student_scores")
      .delete()
      .eq("design_plan_id", planId);
    if (scoresError) throw scoresError;

    // 4. Delete cost_estimates
    const { error: estimateError } = await supabase
      .from("cost_estimates")
      .delete()
      .eq("design_plan_id", planId);
    if (estimateError) throw estimateError;

    // 5. Delete the design plan itself
    const { error: planError } = await supabase
      .from("design_plan")
      .delete()
      .eq("id", planId);
    if (planError) throw planError;

    alert("✅ Design plan deleted successfully!");
    setDesigns((prev) => prev.filter((d) => d.id !== planId));
    closeDeleteModal();
  } catch (err) {
    console.error("💥 Error deleting chain:", err);
    alert("Failed to delete. Check console for details.");
  } finally {
    setLoading(false);
  }
};





  return (
    <div className="createdesign-wrapper">
      <Sidebar />

      <div className="createdesign-content">
        <div className="createdesign-header">
          <div>
            <h1>DESIGN PLANS</h1>
            <p>View and manage your design plans</p>
          </div>
          <button className="createdesign-create-btn" onClick={openModal} disabled={loading}>
            CREATE DESIGN
          </button>
        </div>

        <div className="createdesign-table-container">
          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner">Loading...</div>
            </div>
          )}

          <table className="createdesign-table">
            <thead>
              <tr>
                <th>Design Name</th>
                <th>Description</th>
                <th>Difficulty</th>
                <th>Budget</th>
                <th>Date Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {designs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    {loading ? "Loading design plans..." : "No design plans yet."}
                  </td>
                </tr>
              ) : (
                designs.map((design, index) => (
                  <tr key={design.id} className="clickable-row" onClick={() => handleDesignClick(design.id)}>
                    <td>
                      <div className="design-name">
                        <span className="design-number">{index + 1}.</span>
                        <span className="design-title">{design.plan_name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="design-description">
                        {design.description
                          ? design.description.length > 60
                            ? design.description.substring(0, 60) + "..."
                            : design.description
                          : "No description"}
                      </div>
                    </td>
                    <td>
                      <span className={`difficulty-badge ${design.difficulty_level || "intermediate"}`}>
                        {design.difficulty_level || "Intermediate"}
                      </span>
                    </td>
                    <td>
                      <div className="budget-info">
                        {design.currency || "PHP"} {design.budget?.toLocaleString() || "0"}
                      </div>
                    </td>
                    <td>{new Date(design.created_at).toLocaleDateString()}</td>
                    <td className="createdesign-action-buttons">
                      <button
                        className="createdesign-action-btn view-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDesignClick(design.id)
                        }}
                        title="View Details"
                        disabled={loading}
                      >
                        <FaEye />
                      </button>
                      <button
                        className="createdesign-action-btn edit-btn"
                        onClick={(e) => handleEditDesign(e, design.id)}
                        title="Edit Design"
                        disabled={loading}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="createdesign-action-btn delete-btn"
                        onClick={(e) => handleDeleteDesign(e, design.id)}
                        title="Delete Design"
                        disabled={loading}
                      >
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

      {/* Create Design Modal */}
      {showModal && (
        <div className="createdesign-blur-background">
          <div className="createdesign-modal-card">
            <h2>Design Name</h2>
            <input
              type="text"
              placeholder="Enter Name..."
              value={newDesignName}
              onChange={(e) => setNewDesignName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateDesign()
                }
              }}
            />
            <div className="createdesign-modal-buttons">
              <button onClick={handleCreateDesign} className="createdesign-save-btn" disabled={loading}>
                CREATE DESIGN
              </button>
              <button onClick={closeModal} className="createdesign-cancel-btn">
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && designToDelete && (
        <div className="createdesign-blur-background">
          <div className="createdesign-modal-card delete-modal">
            <div className="delete-icon">⚠️</div>
            <h2>Delete Design Plan</h2>
            <p>
              Are you sure you want to delete <strong>"{designToDelete.plan_name}"</strong>?
            </p>
            <p className="delete-warning">This action cannot be undone.</p>
            <div className="createdesign-modal-buttons">
              <button onClick={confirmDelete} className="createdesign-delete-confirm-btn" disabled={loading}>
                {loading ? "Deleting..." : "DELETE"}
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

export default DesignPlanList
