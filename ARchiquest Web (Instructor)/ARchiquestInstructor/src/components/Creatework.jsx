import React, { useEffect, useState, useRef } from 'react';
import './CreateWork.css';
import Sidebar from './Sidebar';
import DesignDesign from './DesignDesign';
import DesignMaterials from './DesignMaterials';
import DesignPreview from './DesignPreview';

function CreateWork() {
  const [activeTab, setActiveTab] = useState('design');

  const designRef = useRef(null);
  const materialsRef = useRef(null);
  const previewRef = useRef(null);

  const designTabRef = useRef(null);
  const materialsTabRef = useRef(null);
  const previewTabRef = useRef(null);

  const [underlineLeft, setUnderlineLeft] = useState('0px');
  const [underlineWidth, setUnderlineWidth] = useState('90px');

  useEffect(() => {
    const handleScroll = () => {
      const designTop = designRef.current.getBoundingClientRect().top;
      const materialsTop = materialsRef.current.getBoundingClientRect().top;
      const previewTop = previewRef.current.getBoundingClientRect().top;

      if (previewTop <= 200) {
        setActiveTab('preview');
      } else if (materialsTop <= 200) {
        setActiveTab('materials');
      } else if (designTop <= 200) {
        setActiveTab('design');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateUnderline = () => {
      let tabRef = designTabRef;

      if (activeTab === 'materials') {
        tabRef = materialsTabRef;
      } else if (activeTab === 'preview') {
        tabRef = previewTabRef;
      }

      if (tabRef.current) {
        const rect = tabRef.current.getBoundingClientRect();
        const parentRect = tabRef.current.parentElement.getBoundingClientRect();
        setUnderlineLeft(`${rect.left - parentRect.left}px`);
        setUnderlineWidth(`${rect.width}px`);
      }
    };

    updateUnderline();
    window.addEventListener('resize', updateUnderline);
    return () => window.removeEventListener('resize', updateUnderline);
  }, [activeTab]);

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="creatework-wrapper">
      <Sidebar />
      <div className="creatework-content">
        <header className="creatework-header sticky-header">
          <h1>CREATE DESIGN PLAN</h1>
          <p>Create your design plan</p>

          <nav className="creatework-tabs">
            <div ref={designTabRef}>
              <button
                className={activeTab === 'design' ? 'active' : ''}
                onClick={() => scrollToSection(designRef)}
              >
                DESIGN
              </button>
            </div>
            <div ref={materialsTabRef}>
              <button
                className={activeTab === 'materials' ? 'active' : ''}
                onClick={() => scrollToSection(materialsRef)}
              >
                MATERIALS
              </button>
            </div>
            <div ref={previewTabRef}>
              <button
                className={activeTab === 'preview' ? 'active' : ''}
                onClick={() => scrollToSection(previewRef)}
              >
                PREVIEW
              </button>
            </div>

            {/* Dynamic underline */}
            <div
              className="tab-underline"
              style={{
                width: underlineWidth,
                left: underlineLeft,
              }}
            ></div>
          </nav>
        </header>

        {/* DESIGN SECTION */}
        <section ref={designRef} className="creatework-section">
          <div className="creatework-card">
            <DesignDesign />
          </div>
        </section>

        {/* MATERIALS SECTION */}
        <section ref={materialsRef} className="creatework-section">
          <div className="creatework-card">
            <DesignMaterials />
          </div>
        </section>

        {/* PREVIEW SECTION */}
        <section ref={previewRef} className="creatework-section">
          <div className="creatework-card">
            <DesignPreview />
          </div>
        </section>
      </div>
    </div>
  );
}

export default CreateWork;
