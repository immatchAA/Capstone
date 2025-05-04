import React, { useState } from 'react';
import './DesignMaterials.css';
import { FaPlus } from 'react-icons/fa';

function DesignMaterials() {
  const [materials] = useState([
    { id: 1, name: 'Concrete Mix', price: 120, category: 'Construction' },
    { id: 2, name: 'Rebar Steel Rod', price: 25, category: 'Structural' },
    { id: 3, name: 'Lumber Wood Plank', price: 45, category: 'Construction' },
    { id: 4, name: 'Red Bricks', price: 0.75, category: 'Construction' },
    { id: 5, name: 'Glass Panel', price: 200, category: 'Design' },
    { id: 6, name: 'PVC Pipes', price: 15, category: 'Plumbing' },
    { id: 7, name: 'Granite Tile', price: 80, category: 'Interior Design' },
    { id: 8, name: 'Ceramic Tiles', price: 25, category: 'Interior Design' },
    { id: 9, name: 'Roofing Sheets', price: 95, category: 'Exterior' },
    { id: 10, name: 'Paint - White Latex', price: 30, category: 'Finishing' },
    { id: 11, name: 'Asphalt Paving', price: 250, category: 'Roadworks' },
    { id: 12, name: 'Copper Wire Roll', price: 90, category: 'Electrical' },
    { id: 13, name: 'Drywall Sheets', price: 35, category: 'Interior Design' },
    { id: 14, name: 'Aluminum Windows', price: 400, category: 'Exterior' },
    { id: 15, name: 'Wooden Doors', price: 250, category: 'Furniture' },
    { id: 16, name: 'Cement Bag (50kg)', price: 10, category: 'Construction' },
    { id: 17, name: 'Sewer Pipes', price: 50, category: 'Plumbing' },
    { id: 18, name: 'LED Ceiling Lights', price: 60, category: 'Interior Design' },
    { id: 19, name: 'Marble Countertop', price: 700, category: 'Interior Design' },
    { id: 20, name: 'Shingles - Asphalt', price: 110, category: 'Exterior' },
    { id: 21, name: 'Vinyl Flooring', price: 35, category: 'Interior Design' },
    { id: 22, name: 'Insulation Foam Board', price: 45, category: 'Construction' },
    { id: 23, name: 'Garden Stones', price: 15, category: 'Exterior' },
    { id: 24, name: 'Plastic Water Tank', price: 300, category: 'Plumbing' },
    { id: 25, name: 'Electric Water Heater', price: 500, category: 'Plumbing' },
    { id: 26, name: 'Nails (5kg box)', price: 8, category: 'Construction' },
    { id: 27, name: 'Screws (Steel)', price: 12, category: 'Construction' },
    { id: 28, name: 'Hardwood Flooring', price: 85, category: 'Interior Design' },
    { id: 29, name: 'Sliding Glass Doors', price: 900, category: 'Exterior' },
    { id: 30, name: 'Paint Brushes (Set)', price: 15, category: 'Finishing' },
    { id: 31, name: 'Wall Paint - Blue', price: 25, category: 'Finishing' },
    { id: 32, name: 'Roof Trusses', price: 150, category: 'Construction' },
    { id: 33, name: 'Concrete Blocks', price: 1.5, category: 'Construction' },
    { id: 34, name: 'Steel Beams', price: 200, category: 'Structural' },
    { id: 35, name: 'Wooden Beams', price: 120, category: 'Structural' },
    { id: 36, name: 'Electrical Outlets', price: 10, category: 'Electrical' },
    { id: 37, name: 'Circuit Breaker Box', price: 150, category: 'Electrical' },
    { id: 38, name: 'Water Pipes (PVC)', price: 20, category: 'Plumbing' },
    { id: 39, name: 'Siding Panels', price: 40, category: 'Exterior' },
    { id: 40, name: 'Roofing Nails', price: 5, category: 'Exterior' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  const addMaterial = (material) => {
    const exists = selectedMaterials.find((m) => m.id === material.id);
    if (exists) {
      setSelectedMaterials(
        selectedMaterials.map((m) =>
          m.id === material.id ? { ...m, quantity: m.quantity + 1 } : m
        )
      );
    } else {
      setSelectedMaterials([...selectedMaterials, { ...material, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (id, value) => {
    setSelectedMaterials((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, quantity: parseInt(value) || 1 } : m
      )
    );
  };

  const calculateTotal = () => {
    return selectedMaterials.reduce((sum, m) => sum + m.price * m.quantity, 0);
  };

  const generateOverview = () => {
    return selectedMaterials.map((m) => `${m.name} x${m.quantity}`).join('\n');
  };

  const filteredMaterials = materials.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'All' || m.category === selectedCategory)
  );

  return (
    <div className="designmaterials-wrapper">
      <h2>Material Selection</h2>
      <p>Choose your virtual building materials for AR activities</p>

      {/* Search + Filter */}
      <div className="designmaterials-filters">
        <input
          type="text"
          placeholder="Search for materials"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Construction">Construction</option>
          <option value="Structural">Structural</option>
          <option value="Interior Design">Interior Design</option>
          <option value="Exterior">Exterior</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Electrical">Electrical</option>
          <option value="Finishing">Finishing</option>
          <option value="Roadworks">Roadworks</option>
        </select>
      </div>

      {/* MATERIALS SCROLL */}
      <div className="designmaterials-scroll">
        <div className="designmaterials-grid">
          {filteredMaterials.map((material) => (
            <div key={material.id} className="designmaterials-card">
              <div className="designmaterials-image">🏗️</div>
              <div className="designmaterials-details">
                <strong>{material.name}</strong>
                <p>${material.price} per unit</p>
              </div>
              <button onClick={() => addMaterial(material)}>
                <FaPlus />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SELECTED MATERIALS */}
      <h2>Selected Materials</h2>
      <div className="designmaterials-selection">
        <div className="designmaterials-selected">
          {selectedMaterials.length > 0 ? (
            selectedMaterials.map((m) => (
              <div key={m.id} className="designmaterials-selected-item">
                <div>
                  <strong>{m.name}</strong>
                  <p>${m.price} per unit</p>
                </div>
                <div className="designmaterials-quantity">
                  <input
                    type="number"
                    value={m.quantity}
                    min="1"
                    onChange={(e) => handleQuantityChange(m.id, e.target.value)}
                  />
                  <p>${(m.price * m.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#aaa' }}>No materials selected yet.</p>
          )}
        </div>

        <div className="designmaterials-overview">
          <h3>Materials Overview</h3>
          <textarea value={generateOverview()} readOnly />

          <div className="designmaterials-total">
            <strong>Total Cost</strong>
            <input type="text" value={`$${calculateTotal().toFixed(2)}`} readOnly />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DesignMaterials;
