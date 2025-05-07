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
  const [newMaterial, setNewMaterial] = useState({
    material_name: '',
    description: '',
    price: '',
    unit: '',
  });
  const [teacherId, setTeacherId] = useState('');


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

  // 📦 Fetch materials from DB
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
    setNewMaterial({ material_name: '', description: '', price: '', unit: '' });
    setShowAddModal(true);
  };
  const closeAddModal = () => setShowAddModal(false);

  const handleNewMaterialChange = (e) => {
    const { name, value } = e.target;
    setNewMaterial({ ...newMaterial, [name]: value });
  };

  const handleAddMaterial = async () => {
    const { material_name, description, price, unit } = newMaterial;

    if (!material_name || !description || !price || !unit) {
      alert('⚠️ Please fill in all fields.');
      return;
    }

    const { error } = await supabase.from('materials').insert([
      {
        material_name,
        description,
        price: parseFloat(price),
        unit,
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

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.material_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All Categories' || material.unit === selectedCategory;

    const matchesPrice =
      selectedPrice === 'All' ||
      (selectedPrice === 'Below $5' && material.price < 5) ||
      (selectedPrice === '$5 - $10' && material.price >= 5 && material.price <= 10) ||
      (selectedPrice === 'Above $10' && material.price > 10);

    return matchesSearch && matchesCategory && matchesPrice;
  });

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
          <button onClick={openAddModal}>Add Material</button>
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
              {filteredMaterials.map((material) => (
                <tr key={material.id}>
                  <td>🧱 {material.material_name}</td>
                  <td>{material.description}</td>
                  <td>${material.price.toFixed(2)}</td>
                  <td>{material.unit}</td>
                  <td>
                    <button className="virtualstore-action-btn"><FaEdit /></button>
                    <button className="virtualstore-action-btn delete-btn"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAddModal && (
          <div className="virtualstore-blur-background">
            <div className="virtualstore-modal-card">
              <h2>Add New Material</h2>
              <input type="text" name="material_name" placeholder="Material Name" value={newMaterial.material_name} onChange={handleNewMaterialChange} />
              <input type="text" name="description" placeholder="Description" value={newMaterial.description} onChange={handleNewMaterialChange} />
              <input type="number" name="price" placeholder="Price" value={newMaterial.price} onChange={handleNewMaterialChange} />
              <input type="text" name="unit" placeholder="Use Case" value={newMaterial.unit} onChange={handleNewMaterialChange} />
              <div className="virtualstore-modal-buttons">
                <button onClick={handleAddMaterial}>Save</button>
                <button onClick={closeAddModal}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VirtualStore;
