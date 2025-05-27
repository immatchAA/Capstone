import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Createdesignplan.css'; // ✅ Reuse existing style
import Sidebar from './Sidebar';
import { supabase } from '../../supabaseClient';

function DesignPlanDetails() {
  const { id } = useParams();
  const [design, setDesign] = useState(null);

  useEffect(() => {
    const fetchDesign = async () => {
      const { data, error } = await supabase
        .from('design_plan')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching design plan:', error);
      } else {
        setDesign(data);
      }
    };

    fetchDesign();
  }, [id]);

  if (!design) {
    return (
      <div className="createdesign-wrapper">
        <Sidebar />
        <div className="createdesign-content">
          <p>Loading design details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="createdesign-wrapper">
      <Sidebar />

      <div className="createdesign-content">
        <div className="createdesign-header">
          <div>
            <h1>DESIGN PLAN DETAILS</h1>
            <p>View details of your design plan</p>
          </div>
        </div>

        <div className="createdesign-table-container">
          <table className="createdesign-table">
            <tbody>
              <tr>
                <th>Design Name</th>
                <td>{design.plan_name}</td>
              </tr>
              <tr>
                <th>Date Created</th>
                <td>{new Date(design.created_at).toLocaleDateString()}</td>
              </tr>
              {design.description && (
                <tr>
                  <th>Description</th>
                  <td>{design.description}</td>
                </tr>
              )}
              {design.budget && (
                <tr>
                  <th>Budget</th>
                  <td>{design.budget} {design.currency || ''}</td>
                </tr>
              )}
              {design.design_file_url && (
                <tr>
                  <th>Uploaded File</th>
                  <td>
                    <a href={design.design_file_url} target="_blank" rel="noopener noreferrer">
                      View Design File
                    </a>
                  </td>
                </tr>
              )}
              {/* Add more fields here if needed */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DesignPlanDetails;
