import React, { useEffect, useState } from "react";
import './ClassKey.css';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

function ClassKey() {
  const navigate = useNavigate(); 
  const [classKey, setClassKey] = useState('');
  const [success, setSuccess] = useState(false);
  const [teacherId, setTeacherId] = useState('');
  const [studentsByClass, setStudentsByClass] = useState([]);
  const [visibleClassKeys, setVisibleClassKeys] = useState({});

  useEffect(() => {
    const getUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        setTeacherId(session.user.id);
        fetchStudents(session.user.id);
      } else {
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

    const { error, data } = await supabase.from('class_keys').insert([
      {
        class_key: generatedKey,
        teacher_id: teacherId,
      },
    ]);

    if (error) {
      alert("❌ Error saving class key: " + error.message);
      return;
    }

    alert("✅ Class key generated and saved!");
    setSuccess(true);
    fetchStudents(teacherId);
  };

  const fetchStudents = async (teacherId) => {
    const { data: classes, error: classesError } = await supabase
      .from('class_keys')
      .select('id, class_key')
      .eq('teacher_id', teacherId);

    if (classesError) {
      console.error("❌ Error fetching class keys:", classesError);
      return;
    }

    const fullList = [];

    for (const cls of classes) {
      const { data: joinedStudents, error: joinError } = await supabase
        .from('class_students')
        .select('student_id, joined_at')
        .eq('class_id', cls.id);

      if (joinError) {
        console.error("❌ Error fetching student joins:", joinError);
        continue;
      }

      const studentIds = joinedStudents.map(j => j.student_id);
      if (studentIds.length === 0) continue;

      const { data: studentProfiles, error: userError } = await supabase
        .from('users')
        .select('id, first_name, last_name, role') 
        .in('id', studentIds);

      if (userError) {
        console.error("❌ Error fetching student profiles:", userError);
        continue;
      }

      const studentsWithJoinDate = joinedStudents.map((joined) => {
        const studentInfo = studentProfiles.find(s => s.id === joined.student_id);
        return {
          ...studentInfo,
          joined_at: joined.joined_at
        };
      });

      fullList.push({
        classKey: cls.class_key,
        students: studentsWithJoinDate
      });
    }

    setStudentsByClass(fullList);
  };

  const toggleDropdown = (key) => {
    setVisibleClassKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="class-key-setup-container">
        <h2>Set Up Your Class</h2>
        <div className="card">
          <p className="label">Class Key:</p>
          <div className="key-display">{classKey || 'No key generated yet'}</div>
          <button className="generate-btn" onClick={generateClassKey}>Generate Class Key</button>
        </div>

        <div className="joined-students-section">
          <h3>Joined Students</h3>
          {studentsByClass.length === 0 ? (
            <p>No students have joined any class yet.</p>
          ) : (
            studentsByClass.map((cls, index) => (
              <div key={index} className="class-table-group">
                <div className="class-header" onClick={() => toggleDropdown(cls.classKey)}>
                  <h4>Class Key: {cls.classKey}</h4>
                  <span className="dropdown-icon">{visibleClassKeys[cls.classKey] ? '▲' : '▼'}</span>
                </div>

                {visibleClassKeys[cls.classKey] && (
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Joined Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cls.students.map((student, i) => (
                        <tr key={i}>
                          <td>{student.first_name} {student.last_name}</td>
                          <td>{student.role || "Student"}</td>
                          <td>{new Date(student.joined_at).toLocaleString()}</td>
                          <td>
                            <button className="edit-btn">Edit</button>
                            <button className="delete-btn">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ClassKey;
