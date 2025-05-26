import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GradeStudent.css';

const GradeStudent = () => {
  // Fetch real modules from the backend
  const [modules, setModules] = useState([]);
  const [moduleStats, setModuleStats] = useState({}); // { [moduleId]: { marked, unmarked, total } }
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState('');
  const [updateMsg, setUpdateMsg] = useState('');
  const [editGrades, setEditGrades] = useState({}); // {submissionId: {score, feedback}}

  useEffect(() => {
    const fetchModules = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get('http://localhost:8000/api/modules/instructor/modules/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        const modulesData = response.data || [];
        setModules(modulesData);
        if (modulesData.length > 0) {
          setSelectedModule(modulesData[0]);
        }
        // Fetch stats for each module
        const stats = {};
        await Promise.all(modulesData.map(async (module) => {
          try {
            const submissionsRes = await axios.get(`http://localhost:8000/api/modules/${module.id}/assignments/`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
              }
            });
            let marked = 0, unmarked = 0, total = 0;
            const assignments = submissionsRes.data || [];
            for (const assignment of assignments) {
              if (assignment.submissions && Array.isArray(assignment.submissions)) {
                total += assignment.submissions.length;
                marked += assignment.submissions.filter(s => s.score !== null && s.score !== undefined).length;
                unmarked += assignment.submissions.filter(s => s.score === null || s.score === undefined).length;
              }
            }
            stats[module.id] = { marked, unmarked, total };
          } catch (err) {
            stats[module.id] = { marked: 0, unmarked: 0, total: 0 };
          }
        }));
        setModuleStats(stats);
      } catch (err) {
        setError('Failed to load modules. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  // Fetch students and submissions for selected module
  useEffect(() => {
    const fetchStudentsAndSubmissions = async () => {
      if (!selectedModule) return;
      setSubLoading(true);
      setSubError('');
      setSubmissions([]);
      setStudents([]);
      try {
        // Fetch module details to get student IDs
        const moduleRes = await axios.get(`http://localhost:8000/api/modules/instructor/modules/${selectedModule.id}/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        const studentIds = moduleRes.data.students || [];
        let studentsData = [];
        if (studentIds.length > 0) {
          // Fetch all students and filter by IDs (or fetch individually if needed)
          const allStudentsRes = await axios.get('http://localhost:8000/api/accounts/instructors/students/', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          });
          studentsData = allStudentsRes.data.filter(s => studentIds.includes(s.id));
        }
        setStudents(studentsData);
        // Fetch assignments for the module
        const assignmentsRes = await axios.get(`http://localhost:8000/api/modules/instructor/modules/${selectedModule.id}/assignments/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        const assignments = assignmentsRes.data || [];
        // Build a map: { [studentId]: { [assignmentId]: submission } }
        const submissionMap = {};
        for (const assignment of assignments) {
          if (assignment.submissions && Array.isArray(assignment.submissions)) {
            for (const sub of assignment.submissions) {
              if (!submissionMap[sub.studentId]) submissionMap[sub.studentId] = {};
              submissionMap[sub.studentId][assignment.id] = {
                ...sub,
                assignmentTitle: assignment.title,
                assignmentId: assignment.id,
                pdf: sub.pdf_file,
                studentId: sub.student_id || sub.student || sub.studentId,
                studentName: sub.student_name || sub.student || 'Unknown',
              };
            }
          }
        }
        setSubmissions({ assignments, submissionMap });
      } catch (err) {
        setSubError(''); // Do not show error if no submissions
      } finally {
        setSubLoading(false);
      }
    };
    fetchStudentsAndSubmissions();
  }, [selectedModule]);

  // Handle grade/feedback edit
  const handleEditChange = (id, field, value) => {
    setEditGrades(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  // Update grade/feedback
  const handleUpdate = async (submissionId) => {
    setUpdateMsg('');
    try {
      const { score, feedback } = editGrades[submissionId] || {};
      await axios.patch(
        `http://localhost:8000/api/assignments/submissions/${submissionId}/`,
        { score, feedback },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setUpdateMsg('Grade updated!');
      // Optionally, refresh submissions
    } catch (err) {
      setUpdateMsg('Failed to update grade.');
    }
  };

  return (
    <div className="grade-student">
      <h1>Grade Students</h1>
      {error && <div className="error">{error}</div>}
      {loading ? (
        <div className="loading">Loading modules...</div>
      ) : (
        <div className="modules-list">
          {Array.isArray(modules) && modules.map(module => (
            <div
              key={module.id}
              className={`module-card enhanced ${selectedModule?.id === module.id ? 'selected' : ''}`}
              onClick={() => setSelectedModule(module)}
            >
              <div className="module-info">
                <h3>{module.title}</h3>
                <p className="module-code">{module.code}</p>
                <p className="module-instructor">Instructor: {module.instructor?.name || 'N/A'}</p>
                {module.description && <p className="module-desc">{module.description}</p>}
                <div className="module-stats">
                  <span className="marked">Marked: {moduleStats[module.id]?.marked ?? '--'}</span>
                  <span className="unmarked">Unmarked: {moduleStats[module.id]?.unmarked ?? '--'}</span>
                  <span className="total">Total: {moduleStats[module.id]?.total ?? '--'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submissions Section */}
      {selectedModule && (
        <div className="submissions-section">
          <h2>Submissions for {selectedModule.title}</h2>
          {subError && <div className="error">{subError}</div>}
          {subLoading ? (
            <div className="loading">Loading submissions...</div>
          ) : (
            <table className="submissions-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assignment</th>
                  <th>Created At</th>
                  <th>PDF</th>
                  <th>Grade</th>
                  <th>Feedback</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(students) && students.length === 0 ? (
                  <tr><td colSpan="7">No students found for this module.</td></tr>
                ) : (
                  students.map(student => (
                    submissions.assignments && submissions.assignments.length > 0 ? (
                      submissions.assignments.map(assignment => {
                        const sub = submissions.submissionMap[student.id]?.[assignment.id];
                        return (
                          <tr key={`${student.id}-${assignment.id}`}>
                            <td>{student.name || student.user?.first_name + ' ' + student.user?.last_name}</td>
                            <td>{assignment.title}</td>
                            {sub ? (
                              <>
                                <td>{sub.created_at || '-'}</td>
                                <td>{sub.pdf ? <a href={sub.pdf} target="_blank" rel="noopener noreferrer">View PDF</a> : '--'}</td>
                                <td><input type="number" value={editGrades[sub.id]?.score ?? sub.score ?? ''} onChange={e => handleEditChange(sub.id, 'score', e.target.value)} /></td>
                                <td><input type="text" value={editGrades[sub.id]?.feedback ?? sub.feedback ?? ''} onChange={e => handleEditChange(sub.id, 'feedback', e.target.value)} /></td>
                                <td><button onClick={() => handleUpdate(sub.id)}>Save</button></td>
                              </>
                            ) : (
                              <>
                                <td>--</td>
                                <td>--</td>
                                <td>--</td>
                                <td>--</td>
                                <td>--</td>
                              </>
                            )}
                          </tr>
                        );
                      })
                    ) : (
                      <tr key={student.id}>
                        <td>{student.name || student.user?.first_name + ' ' + student.user?.last_name}</td>
                        <td colSpan="6" style={{ textAlign: 'center', color: '#888' }}>No assignments for this module.</td>
                      </tr>
                    )
                  ))
                )}
              </tbody>
            </table>
          )}
          {updateMsg && <div className="update-msg">{updateMsg}</div>}
        </div>
      )}
    </div>
  );
};

export default GradeStudent; 