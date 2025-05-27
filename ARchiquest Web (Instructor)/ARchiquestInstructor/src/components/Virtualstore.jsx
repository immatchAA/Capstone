import React, { useEffect, useState } from 'react';
import './VirtualStore.css';
import Sidebar from './Sidebar';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { supabase } from '../../supabaseClient';

function VirtualStore() {
  const [materials, setMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [teacherId, setTeacherId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [newMaterial, setNewMaterial] = useState({
    material_name: '',
    description: '',
    price: '',
    unit: '',
    category: '',
  });

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setTeacherId(session.user.id);
      } else {
        console.warn("No session found");
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    if (teacherId) {
      fetchMaterials(teacherId);
    }
  }, [teacherId]);

  const fetchMaterials = async (teacher_id) => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('teacher_id', teacher_id);

    if (error) {
      console.error('❌ Failed to fetch materials:', error.message);
    } else {
      setMaterials(data);
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleCategoryChange = (e) => setSelectedCategory(e.target.value);
  const handlePriceChange = (e) => setSelectedPrice(e.target.value);

  const openAddModal = () => {
    setNewMaterial({
      material_name: '',
      description: '',
      price: '',
      unit: '',
      category: '',
    });
    setIsEditing(false);
    setEditingId(null);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleNewMaterialChange = (e) => {
    const { name, value } = e.target;
    setNewMaterial({ ...newMaterial, [name]: value });
  };

  const handleAddMaterial = async () => {
    const { material_name, description, price, unit, category } = newMaterial;

    if (!material_name || !description || !price || !unit || !category) {
      alert('⚠️ Please fill in all fields.');
      return;
    }

    const { error } = await supabase.from('materials').insert([
      {
        material_name,
        description,
        price: parseFloat(price),
        unit,
        category,
        teacher_id: teacherId,
      }
    ]);

    if (error) {
      console.error('❌ Error inserting material:', error.message);
      alert('❌ Failed to save material.');
    } else {
      alert('✅ Material saved!');
      closeAddModal();
      fetchMaterials(teacherId);
    }
  };

  const handleEditClick = (material) => {
    setNewMaterial({
      material_name: material.material_name,
      description: material.description,
      price: material.price,
      unit: material.unit,
      category: material.category,
    });
    setEditingId(material.id);
    console.log("Editing ID:", editingId);
    setIsEditing(true);
    setShowAddModal(true);
  };

  const handleUpdateMaterial = async () => {
    const { material_name, description, price, unit, category } = newMaterial;

    const { error } = await supabase
      .from('materials')
      .update({
        material_name,
        description,
        price: parseFloat(price),
        unit,
        category
      })
      .eq('id', editingId);

    if (error) {
      console.error('❌ Error updating material:', error.message);
      alert('❌ Failed to update material.');
    } else {
      alert('✅ Material updated!');
      console.log("Editing material with ID:", material.id);
      setMaterials((prevMaterials) =>
      prevMaterials.map((mat) =>
        mat.id === editingId
          ? {
              ...mat,
              material_name,
              description,
              price: parseFloat(price),
              unit,
              category,
            }
          : mat
      )
    );
    closeAddModal();

      
    }
  };

const handleDeleteMaterial = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this material?");
  if (!confirmDelete) return;

  console.log("Trying to delete material with ID:", id);

  const { error } = await supabase
    .from('materials')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('❌ Error deleting material:', error.message);
    alert('❌ Error deleting material.');
  } else {
    alert('🗑️ Material deleted!');
    setMaterials((prev) => prev.filter((mat) => mat.id !== id));
  }
};



  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.material_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All Categories' || material.category === selectedCategory;

    const matchesPrice =
      selectedPrice === 'All' ||
      (selectedPrice === 'Below $5' && material.price < 5) ||
      (selectedPrice === '$5 - $10' && material.price >= 5 && material.price <= 10) ||
      (selectedPrice === 'Above $10' && material.price > 10);

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const groupedMaterials = filteredMaterials.reduce((acc, mat) => {
    if (!acc[mat.category]) acc[mat.category] = [];
    acc[mat.category].push(mat);
    return acc;
  }, {});

  return (
    <div className="virtualstore-wrapper">
      <Sidebar />
      <div className="virtualstore-content">
        <header className="virtualstore-header">
          <h1>Virtual Store</h1>
          <p>Explore and manage your materials!</p>
        </header>

        <div className="virtualstore-controls">
          <input type="text" placeholder="Search for materials" value={searchTerm} onChange={handleSearchChange} />
          <select value={selectedCategory} onChange={handleCategoryChange}>
            <option>All Categories</option>
            <option>Construction</option>
            <option>Interior Design</option>
            <option>Exterior</option>
            <option>Structural</option>
            <option>Furniture</option>
            <option>Plumbing</option>
            <option>Roadworks</option>
          </select>
          <select value={selectedPrice} onChange={handlePriceChange}>
            <option>All</option>
            <option>Below $5</option>
            <option>$5 - $10</option>
            <option>Above $10</option>
          </select>
          <button className="virtualstore-add-btn" onClick={openAddModal}>Add Material</button>
        </div>

        <div className="virtualstore-table-container">
          <table className="virtualstore-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Unit Price</th>
                <th>Use Case</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedMaterials).map(([category, materialsInCategory]) => (
                <React.Fragment key={category}>
                  <tr>
                    <td colSpan="5" style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>{category}</td>
                  </tr>
                  {materialsInCategory.map((material) => (
                    <tr key={material.id}>
                      <td>🧱 {material.material_name}</td>
                      <td>{material.description}</td>
                      <td>${material.price.toFixed(2)}</td>
                      <td>{material.unit}</td>
                      <td>
                        <button className="virtualstore-action-btn" onClick={() => handleEditClick(material)}><FaEdit /></button>
                        <button className="virtualstore-action-btn delete-btn" onClick={() => handleDeleteMaterial(material.id)}><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {showAddModal && (
          <div className="virtualstore-blur-background">
            <div className="virtualstore-modal-card">
              <h2>{isEditing ? "Edit Material" : "Add New Material"}</h2>
              <input type="text" name="material_name" placeholder="Material Name" value={newMaterial.material_name} onChange={handleNewMaterialChange} />
              <input type="text" name="description" placeholder="Description" value={newMaterial.description} onChange={handleNewMaterialChange} />
              <input type="number" name="price" placeholder="Price" value={newMaterial.price} onChange={handleNewMaterialChange} />
              <input type="text" name="unit" placeholder="Use Case" value={newMaterial.unit} onChange={handleNewMaterialChange} />
              <select name="category" value={newMaterial.category} onChange={handleNewMaterialChange}>
                <option value="">Select Category</option>
                <option value="Construction">Construction</option>
                <option value="Interior Design">Interior Design</option>
                <option value="Exterior">Exterior</option>
                <option value="Structural">Structural</option>
                <option value="Furniture">Furniture</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Roadworks">Roadworks</option>
              </select>
              <div className="virtualstore-modal-buttons">
                <button className="virtualstore-save-btn" onClick={isEditing ? handleUpdateMaterial : handleAddMaterial}>
                  {isEditing ? "Update" : "Save"}
                </button>
                <button className="virtualstore-cancel-btn" onClick={closeAddModal}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VirtualStore;
