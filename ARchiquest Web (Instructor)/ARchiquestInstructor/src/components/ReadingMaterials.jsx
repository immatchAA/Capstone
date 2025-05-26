import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import Sidebar from './Sidebar';
import './ReadingMaterials.css';

function ReadingMaterials() {
  const [materials, setMaterials] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaterials = async () => {
      const { data: materialsData, error: materialsError } = await supabase
        .from('reading_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (materialsError) {
        console.error('Error fetching materials:', materialsError);
        return;
      }

      const promises = materialsData.map(async (material) => {
        const { data: sections, error } = await supabase
          .from('reading_materials_sections')
          .select('section_slug, content')
          .eq('material_id', material.id);

        if (error) {
          console.error(`Error fetching sections for material ${material.id}:`, error);
        }

        return {
          ...material,
          sections: sections || [],
        };
      });

      const materialsWithSections = await Promise.all(promises);
      setMaterials(materialsWithSections);
    };

    fetchMaterials();
  }, []);

  const handleAddClick = () => {
    navigate('/add-reading-material');
  };

  return (
    <div className="readingmaterial-wrapper">
      <Sidebar />
      <div className="readingmaterial-container">
        <div className="readingmaterial-header">
          <div>
            <h1>READING MATERIALS</h1>
            <p>Browse all available reading materials.</p>
          </div>
          <button className="add-section-btn" onClick={handleAddClick}>
            + Add Reading Material
          </button>
        </div>

        {materials.map((material) => (
          <div key={material.id} className="readingmaterial-section-card">
            <h2>{material.title}</h2>
            <p style={{ fontSize: '0.85rem', color: '#888' }}>
              Created on: {new Date(material.created_at).toLocaleDateString()}
            </p>

            {material.sections.map((section, index) => (
              <div key={index} style={{ marginTop: '1rem' }}>
                <h4 style={{ color: '#176BB7', marginBottom: '0.3rem' }}>{section.section_slug}</h4>
                <p style={{ whiteSpace: 'pre-line' }}>{section.content}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReadingMaterials;
