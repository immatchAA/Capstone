import React, { useState } from 'react';
import './VirtualStore.css';
import Sidebar from './Sidebar';
import { FaEdit, FaTrash } from 'react-icons/fa';

function VirtualStore() {
  const [materials, setMaterials] = useState([
    { name: 'Lumber', description: 'Wooden boards used in construction', price: 2.00, useCase: 'Construction' },
    { name: 'Cement', description: 'Binding material for structures', price: 5.00, useCase: 'Concreting' },
    { name: 'Bricks', description: 'Blocks used for building walls', price: 0.50, useCase: 'Construction' },
    { name: 'Glass Panels', description: 'Transparent panels for windows', price: 10.00, useCase: 'Design' },
    { name: 'Tiles', description: 'Surface covering materials', price: 3.00, useCase: 'Interior Design' },
    { name: 'Steel Rods', description: 'Reinforcement bars for concrete', price: 7.50, useCase: 'Structural' },
    { name: 'Paint', description: 'Color coating for surfaces', price: 4.00, useCase: 'Finishing' },
    { name: 'Plywood', description: 'Engineered wood sheets', price: 6.00, useCase: 'Furniture' },
    { name: 'Roofing Sheets', description: 'Sheets for roofing', price: 12.00, useCase: 'Exterior' },
    { name: 'PVC Pipes', description: 'Plastic pipes for plumbing', price: 1.50, useCase: 'Plumbing' },
    { name: 'Gravel', description: 'Aggregate for concrete mixes', price: 2.50, useCase: 'Concreting' },
    { name: 'Sand', description: 'Fine aggregate for construction', price: 1.00, useCase: 'Concreting' },
    { name: 'Wood Planks', description: 'For flooring and walls', price: 8.00, useCase: 'Carpentry' },
    { name: 'Asphalt', description: 'Material for paving roads', price: 15.00, useCase: 'Roadworks' },
    { name: 'Marble Tiles', description: 'Luxury stone tiles for flooring', price: 20.00, useCase: 'Interior Design' },
    { name: 'Granite Countertops', description: 'Stone kitchen countertops', price: 45.00, useCase: 'Interior Design' },
    { name: 'Wallpapers', description: 'Decorative paper for walls', price: 5.00, useCase: 'Interior Design' },
    { name: 'Drywall Sheets', description: 'Panels for wall construction', price: 8.00, useCase: 'Construction' },
    { name: 'Rebar Mesh', description: 'Mesh reinforcement for concrete', price: 9.00, useCase: 'Structural' },
    { name: 'Vinyl Flooring', description: 'Durable synthetic flooring', price: 6.00, useCase: 'Interior Design' },
    { name: 'Hardwood Flooring', description: 'Natural wood flooring', price: 18.00, useCase: 'Furniture' },
    { name: 'Ceramic Sink', description: 'Bathroom or kitchen sink', price: 50.00, useCase: 'Plumbing' },
    { name: 'Insulation Foam', description: 'Thermal insulation for walls', price: 7.00, useCase: 'Construction' },
    { name: 'Shingles', description: 'Roof covering materials', price: 10.00, useCase: 'Exterior' },
    { name: 'Copper Pipes', description: 'Durable pipes for plumbing', price: 6.00, useCase: 'Plumbing' },
    { name: 'LED Light Fixtures', description: 'Energy-efficient lighting', price: 15.00, useCase: 'Interior Design' },
    { name: 'Concrete Blocks', description: 'Building units for walls', price: 2.50, useCase: 'Construction' },
    { name: 'Doors', description: 'Wooden doors for rooms', price: 30.00, useCase: 'Furniture' },
    { name: 'Windows', description: 'Glass window frames', price: 40.00, useCase: 'Exterior' },
    { name: 'Sewer Pipes', description: 'Large drainage pipes', price: 8.00, useCase: 'Plumbing' },
    { name: 'Garden Stones', description: 'Decorative stones for landscaping', price: 3.50, useCase: 'Exterior' },
    { name: 'Aluminum Sheets', description: 'Lightweight construction sheets', price: 9.00, useCase: 'Exterior' },
    { name: 'Steel Beams', description: 'Structural support beams', price: 25.00, useCase: 'Structural' },
    { name: 'Concrete Mix', description: 'Ready-to-use concrete', price: 12.00, useCase: 'Concreting' },
    { name: 'Paint Brushes', description: 'Tools for applying paint', price: 2.00, useCase: 'Finishing' },
    { name: 'Nails', description: 'Fasteners for construction', price: 0.10, useCase: 'Construction' },
    { name: 'Screws', description: 'Metal fasteners for assembly', price: 0.15, useCase: 'Construction' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    description: '',
    price: '',
    useCase: '',
  });

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleCategoryChange = (e) => setSelectedCategory(e.target.value);
  const handlePriceChange = (e) => setSelectedPrice(e.target.value);

  const openAddModal = () => {
    setNewMaterial({ name: '', description: '', price: '', useCase: '' });
    setShowAddModal(true);
  };

  const closeAddModal = () => setShowAddModal(false);

  const handleNewMaterialChange = (e) => {
    const { name, value } = e.target;
    setNewMaterial({ ...newMaterial, [name]: value });
  };

  const handleAddMaterial = () => {
    if (!newMaterial.name || !newMaterial.description || !newMaterial.price || !newMaterial.useCase) {
      alert('Please fill in all fields.');
      return;
    }
    const newEntry = {
      name: newMaterial.name,
      description: newMaterial.description,
      price: parseFloat(newMaterial.price),
      useCase: newMaterial.useCase,
    };
    setMaterials([...materials, newEntry]);
    closeAddModal();
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || material.useCase === selectedCategory;
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
          <input
            type="text"
            placeholder="Search for materials"
            className="virtualstore-searchbar"
            value={searchTerm}
            onChange={handleSearchChange}
          />

          <select
            className="virtualstore-dropdown"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option>All Categories</option>
            <option>Construction</option>
            <option>Interior Design</option>
            <option>Exterior</option>
            <option>Structural</option>
            <option>Furniture</option>
            <option>Plumbing</option>
            <option>Roadworks</option>
          </select>

          <select
            className="virtualstore-dropdown"
            value={selectedPrice}
            onChange={handlePriceChange}
          >
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
                <th>Popularity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map((material, index) => (
                <tr key={index}>
                  <td>🧱 {material.name}</td>
                  <td>{material.description}</td>
                  <td>${material.price.toFixed(2)}</td>
                  <td>{material.useCase}</td>
                  <td>
                    <div className="virtualstore-popularity-bar">
                      <div className="virtualstore-popularity-fill" style={{ width: `${Math.random() * 100}%` }}></div>
                    </div>
                  </td>
                  <td>
                    <button className="virtualstore-action-btn">
                      <FaEdit />
                    </button>
                    <button className="virtualstore-action-btn delete-btn">
                      <FaTrash />
                    </button>
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
              <input
                type="text"
                name="name"
                placeholder="Material Name"
                value={newMaterial.name}
                onChange={handleNewMaterialChange}
              />
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={newMaterial.description}
                onChange={handleNewMaterialChange}
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={newMaterial.price}
                onChange={handleNewMaterialChange}
              />
              <input
                type="text"
                name="useCase"
                placeholder="Use Case"
                value={newMaterial.useCase}
                onChange={handleNewMaterialChange}
              />

              <div className="virtualstore-modal-buttons">
                <button onClick={handleAddMaterial} className="virtualstore-save-btn">Save</button>
                <button onClick={closeAddModal} className="virtualstore-cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VirtualStore;
