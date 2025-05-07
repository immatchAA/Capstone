import React, {useEffect, useState} from "react";
import './ClassKey.css';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

function ClassKey() {
  const navigate = useNavigate(); 
  const [classKey, setClassKey] = useState('');
  const [success, setSuccess] = useState(false);
  const [teacherId, setTeacherId] = useState('');

  useEffect(() => {
    const getUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        console.log("✅ Supabase session user:", session.user);
        setTeacherId(session.user.id);
      } else {
        console.warn("⚠️ No active session found.");
        navigate('/login'); 
      }
    };

    getUserSession();
  }, []);
  
  const generateClassKey = async () => {
    const generatedKey = Math.random().toString(36).substring(2, 10).toUpperCase();
    setClassKey(generatedKey);
    setSuccess(false);
  
    if (!teacherId) {
      alert("❌ No teacher ID found. Please login again.");
      return;
    }
  
    const { error, data } = await supabase.from('classes').insert([
      {
        class_key: generatedKey,
        teacher_id: teacherId,
      },
    ]);
  
    console.log("📤 Class key insert on generate:", { error, data });
  
    if (error) {
      alert("❌ Error saving class key: " + error.message);
      return;
    }
  
    alert("✅ Class key generated and saved!");
    setSuccess(true);
  };
  
    
  
    return (
      <div className="class-key-setup-container">
        <h2>Set Up Your Class</h2>
        <div className="card">
          <p className="label">Class Key:</p>
          <div className="key-display">{classKey || 'No key generated yet'}</div>
          <button className="generate-btn" onClick={generateClassKey}>Generate Class Key</button>
        
    
        </div>
      </div>
    );
  }
  
  export default ClassKey;
  