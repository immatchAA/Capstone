<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
=======
import React, { useState } from 'react';
>>>>>>> b0fd167e9f7e10701798e30150c21c1a8a13fca7
import Sidebar from './Sidebar';
import './AddReadingMaterial.css';
import { supabase } from '../../supabaseClient';

<<<<<<< HEAD
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

function AddReadingMaterial() {
  const location = useLocation();
  const navigate = useNavigate();
  const editMaterial = location.state?.material || null;

  const [title, setTitle] = useState('');
  const [sections, setSections] = useState([{ section_slug: '', content: '' }]);

  useEffect(() => {
    const loadMaterialData = async () => {
      if (!editMaterial?.id) return;
      setTitle(editMaterial.title || '');

      if (editMaterial.sections && editMaterial.sections.length > 0) {
        setSections(editMaterial.sections);
        return;
      }

      const { data: fetchedSections, error } = await supabase
        .from('reading_material_sections')
        .select('section_slug, content')
        .eq('reading_material_id', editMaterial.id);

      if (error) {
        console.error('Error fetching sections:', error.message);
        setSections([{ section_slug: '', content: '' }]);
      } else {
        setSections(
          Array.isArray(fetchedSections) && fetchedSections.length > 0
            ? fetchedSections
            : [{ section_slug: '', content: '' }]
        );
      }
    };

    loadMaterialData();
  }, [editMaterial]);

  const handleSectionChange = (index, field, value) => {
    const updated = [...sections];
    updated[index][field] = value;
    setSections(updated);
=======
function AddReadingMaterial() {
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState([{ section_slug: '', content: '' }]);
  const [source, setSource] = useState('');

  const handleSectionChange = (index, field, value) => {
    const updatedSections = [...sections];
    updatedSections[index][field] = value;
    setSections(updatedSections);
>>>>>>> b0fd167e9f7e10701798e30150c21c1a8a13fca7
  };

  const addSection = () => {
    setSections([...sections, { section_slug: '', content: '' }]);
  };

  const removeSection = (index) => {
    const updated = [...sections];
    updated.splice(index, 1);
    setSections(updated);
  };

<<<<<<< HEAD
  const handleCancel = () => {
    if (window.confirm('Discard changes and go back?')) {
      navigate('/reading-materials');
    }
  };

=======
>>>>>>> b0fd167e9f7e10701798e30150c21c1a8a13fca7
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
<<<<<<< HEAD
=======
      // 🔐 Get current user session
>>>>>>> b0fd167e9f7e10701798e30150c21c1a8a13fca7
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        alert('You must be logged in to submit a reading material.');
        return;
      }

<<<<<<< HEAD
      const slug = slugify(title);
      let materialId;

      if (editMaterial) {
        const { error: updateError } = await supabase
          .from('reading_materials')
          .update({ title, slug })
          .eq('id', editMaterial.id);

        if (updateError) throw updateError;
        materialId = editMaterial.id;

        await supabase
          .from('reading_material_sections')
          .delete()
          .eq('reading_material_id', materialId);
      } else {
        const { data: materialData, error: insertError } = await supabase
          .from('reading_materials')
          .insert([{ title, slug, user_id: user.id }])
          .select()
          .single();

        if (insertError) throw insertError;
        materialId = materialData.id;
      }

=======
      // 1. Insert into reading_materials
      const { data: materialData, error: materialError } = await supabase
        .from('reading_materials')
        .insert([{ title, user_id: user.id }])
        .select()
        .single();

      if (materialError) throw materialError;

      const materialId = materialData.id;

      // 2. Insert sections into reading_material_sections
>>>>>>> b0fd167e9f7e10701798e30150c21c1a8a13fca7
      const sectionData = sections.map((section) => ({
        reading_material_id: materialId,
        section_slug: section.section_slug,
        content: section.content,
      }));

      const { error: sectionError } = await supabase
        .from('reading_material_sections')
        .insert(sectionData);

      if (sectionError) throw sectionError;

<<<<<<< HEAD
      alert(editMaterial ? 'Reading material updated!' : 'Reading material added!');
      navigate('/reading-materials');
=======
      alert('Reading material added successfully!');
      setTitle('');
      setSections([{ section_slug: '', content: '' }]);
      setSource('');
>>>>>>> b0fd167e9f7e10701798e30150c21c1a8a13fca7
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
<<<<<<< HEAD
            <h1>{editMaterial ? 'EDIT' : 'ADD'} READING MATERIAL</h1>
            <p>{editMaterial ? 'Edit existing material' : 'Add or Create Reading Materials here.'}</p>
=======
            <h1>ADD READING MATERIAL</h1>
            <p>Add or Create Reading Materials here.</p>
>>>>>>> b0fd167e9f7e10701798e30150c21c1a8a13fca7
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
<<<<<<< HEAD
                <div className="button-right-wrapper">
                <button
                  type="button"
                  onClick={() => removeSection(index)}
                  className="remove-section-btn"
                >
                  Remove Section
                </button> </div>
=======
                <button type="button" onClick={() => removeSection(index)} className="remove-section-btn">
                  Remove Section
                </button>
>>>>>>> b0fd167e9f7e10701798e30150c21c1a8a13fca7
              )}
            </div>
          ))}

          <button type="button" onClick={addSection} className="add-section-btn">
            + Add Section
          </button>
<<<<<<< HEAD
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="equal-btn submit-btn">
              {editMaterial ? 'Update' : 'Add'}
            </button>
            <button type="button" className="equal-btn remove-section-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
=======

          <label htmlFor="source">Source (optional)</label>
          <input
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. https://example.com"
          />

          <button type="submit" className="submit-btn">Add</button>
>>>>>>> b0fd167e9f7e10701798e30150c21c1a8a13fca7
        </form>
      </div>
    </div>
  );
}

export default AddReadingMaterial;
