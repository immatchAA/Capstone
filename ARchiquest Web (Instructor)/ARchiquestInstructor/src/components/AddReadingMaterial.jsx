import React, { useState } from 'react';
import Sidebar from './Sidebar';
import './AddReadingMaterial.css';
import { supabase } from '../../supabaseClient';

function AddReadingMaterial() {
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState([{ section_slug: '', content: '' }]);
  const [source, setSource] = useState('');

  const handleSectionChange = (index, field, value) => {
    const updatedSections = [...sections];
    updatedSections[index][field] = value;
    setSections(updatedSections);
  };

  const addSection = () => {
    setSections([...sections, { section_slug: '', content: '' }]);
  };

  const removeSection = (index) => {
    const updated = [...sections];
    updated.splice(index, 1);
    setSections(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 🔐 Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        alert('You must be logged in to submit a reading material.');
        return;
      }

      // 1. Insert into reading_materials
      const { data: materialData, error: materialError } = await supabase
        .from('reading_materials')
        .insert([{ title, user_id: user.id }])
        .select()
        .single();

      if (materialError) throw materialError;

      const materialId = materialData.id;

      // 2. Insert sections into reading_material_sections
      const sectionData = sections.map((section) => ({
        reading_material_id: materialId,
        section_slug: section.section_slug,
        content: section.content,
      }));

      const { error: sectionError } = await supabase
        .from('reading_material_sections')
        .insert(sectionData);

      if (sectionError) throw sectionError;

      alert('Reading material added successfully!');
      setTitle('');
      setSections([{ section_slug: '', content: '' }]);
      setSource('');
    } catch (error) {
      console.error('Submission failed:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="readingmaterial-wrapper">
      <Sidebar />
      <div className="readingmaterial-container">
        <div className="readingmaterial-header">
          <div>
            <h1>ADD READING MATERIAL</h1>
            <p>Add or Create Reading Materials here.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="readingmaterial-form">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <h3>Sections</h3>
          {sections.map((section, index) => (
            <div key={index} className="readingmaterial-section-card">
              <label>Section Slug</label>
              <input
                type="text"
                value={section.section_slug}
                onChange={(e) => handleSectionChange(index, 'section_slug', e.target.value)}
                required
              />

              <label>Content</label>
              <textarea
                value={section.content}
                onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                required
              />

              {sections.length > 1 && (
                <button type="button" onClick={() => removeSection(index)} className="remove-section-btn">
                  Remove Section
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addSection} className="add-section-btn">
            + Add Section
          </button>

          <label htmlFor="source">Source (optional)</label>
          <input
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. https://example.com"
          />

          <button type="submit" className="submit-btn">Add</button>
        </form>
      </div>
    </div>
  );
}

export default AddReadingMaterial;
