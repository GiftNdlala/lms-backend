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
        const response = await axios.get('http://localhost:8000/api/modules/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        setModules(response.data);
        if (response.data.length > 0) {
          setSelectedModule(response.data[0]);
        }
        // Fetch stats for each module
        const stats = {};
        await Promise.all(response.data.map(async (module) => {
          try {
            const submissionsRes = await axios.get(`http://localhost:8000/api/modules/${module.id}/assignments/`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
              }
            });
            // Flatten all submissions for all assignments in this module
            let marked = 0, unmarked = 0, total = 0;
            for (const assignment of submissionsRes.data) {
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
        // Fetch students in the module
        const studentsRes = await axios.get(`http://localhost:8000/api/modules/${selectedModule.id}/students/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        setStudents(studentsRes.data);
        // Fetch assignments and submissions
        const assignmentsRes = await axios.get(`http://localhost:8000/api/modules/${selectedModule.id}/assignments/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        // Flatten all submissions for all assignments
        let allSubs = [];
        for (const assignment of assignmentsRes.data) {
          if (assignment.submissions && Array.isArray(assignment.submissions)) {
            for (const sub of assignment.submissions) {
              allSubs.push({
                ...sub,
                assignmentTitle: assignment.title,
                assignmentId: assignment.id,
                pdf: sub.pdf_file,
                studentId: sub.student_id || sub.student || sub.studentId,
                studentName: sub.student_name || sub.student || 'Unknown',
              });
            }
          }
        }
        setSubmissions(allSubs);
      } catch (err) {
        setSubError('Failed to load students or submissions.');
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
          {modules.map(module => (
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
                  <th>PDF</th>
                  <th>Grade</th>
                  <th>Feedback</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan="6">No students found for this module.</td></tr>
                ) : (
                  students.map(student => {
                    // Find all submissions for this student
                    const studentSubs = submissions.filter(sub => sub.studentId === student.id);
                    if (studentSubs.length === 0) {
                      // No submissions for this student
                      return (
                        <tr key={student.id}>
                          <td>{student.name || student.full_name || student.email}</td>
                          <td colSpan="5">No submissions</td>
                        </tr>
                      );
                    }
                    // Show a row for each submission
                    return studentSubs.map(sub => (
                      <tr key={sub.id}>
                        <td>{student.name || student.full_name || student.email}</td>
                        <td>{sub.assignmentTitle}</td>
                        <td>
                          {sub.pdf ? (
                            <a href={sub.pdf} target="_blank" rel="noopener noreferrer">Download</a>
                          ) : '--'}
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editGrades[sub.id]?.score ?? (sub.score !== null && sub.score !== undefined ? sub.score : '')}
                            placeholder="--"
                            onChange={e => handleEditChange(sub.id, 'score', e.target.value)}
                          />
                          {sub.score !== null && sub.score !== undefined && !editGrades[sub.id]?.score && (
                            <span className="grade-percent">{sub.score}%</span>
                          )}
                        </td>
                        <td>
                          <input
                            type="text"
                            value={editGrades[sub.id]?.feedback ?? (sub.feedback || '')}
                            placeholder="Feedback"
                            onChange={e => handleEditChange(sub.id, 'feedback', e.target.value)}
                          />
                        </td>
                        <td>
                          <button onClick={() => handleUpdate(sub.id)}>
                            Update
                          </button>
                        </td>
                      </tr>
                    ));
                  })
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