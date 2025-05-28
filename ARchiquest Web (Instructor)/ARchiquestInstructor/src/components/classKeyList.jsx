import React, { useEffect, useState } from "react";
import './classKeyList.css';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

function ClassKeyList() {
  const navigate = useNavigate(); 
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

  const fetchStudents = async (teacherId) => {
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('id, class_key')
      .eq('teacher_id', teacherId);

    if (classesError) {
      console.error("❌ Error fetching classes:", classesError);
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
      if (studentIds.length === 0) {
        // Still add the class even if no students
        fullList.push({
          classKey: cls.class_key,
          students: []
        });
        continue;
      }

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

const handleStudentClick = (student) => {
  // Navigate to general student progress detail page
  navigate(`/studentProgressDetail/${student.id}`);
};

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="student-progress-container">
        <div className="header-section">
          <h1>STUDENT PROGRESS</h1>
          <p className="subtitle">View your students progress</p>
        </div>

        <div className="joined-students-section">
          <h3>Your Class Keys</h3>
          {studentsByClass.length === 0 ? (
            <p className="no-students">No classes found.</p>
          ) : (
            studentsByClass.map((cls, index) => (
              <div key={index} className="class-progress-group">
                <div className="class-progress-header" onClick={() => toggleDropdown(cls.classKey)}>
                  <span className="class-key-label">Class Key: {cls.classKey}</span>
                  <span className="dropdown-arrow">{visibleClassKeys[cls.classKey] ? '▲' : '▼'}</span>
                </div>

                {visibleClassKeys[cls.classKey] && (
                  <div className="students-list">
                    {cls.students.length === 0 ? (
                      <div className="no-students-message">
                        No students have joined this class yet.
                      </div>
                    ) : (
                      cls.students.map((student, i) => (
                        <div 
                          key={i} 
                          className="student-item"
                          onClick={() => handleStudentClick(student)}
                        >
                          <div className="student-info">
                            <span className="student-name">
                              {student.first_name} {student.last_name}
                            </span>
                            <span className="student-details">
                              {student.role || "Student"} • Joined {new Date(student.joined_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="student-arrow">→</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ClassKeyList;