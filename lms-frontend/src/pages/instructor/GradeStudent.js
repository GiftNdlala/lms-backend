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
        // Add dummy modules for testing
        const dummyModules = [
          {
            id: 1,
            title: 'Introduction to Programming',
            code: 'CS101',
            description: 'Basic programming concepts and practices',
            instructor: { name: 'Dr. Smith' },
            students: [
              { id: 1, name: 'John Doe', email: 'john@example.com' },
              { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
            ]
          },
          {
            id: 2,
            title: 'Data Structures',
            code: 'CS201',
            description: 'Advanced data structures and algorithms',
            instructor: { name: 'Dr. Johnson' },
            students: [
              { id: 3, name: 'Mike Brown', email: 'mike@example.com' },
              { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com' }
            ]
          }
        ];
        setModules(dummyModules);
        if (dummyModules.length > 0) {
          setSelectedModule(dummyModules[0]);
        }
        // Add dummy stats
        const dummyStats = {
          1: { marked: 5, unmarked: 3, total: 8 },
          2: { marked: 4, unmarked: 2, total: 6 }
        };
        setModuleStats(dummyStats);
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
        const [studentsRes, assignmentsRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/modules/${selectedModule.id}/students/`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          }),
          axios.get(`http://localhost:8000/api/modules/${selectedModule.id}/assignments/`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          })
        ]);
        setStudents(studentsRes.data || []);
        const assignments = assignmentsRes.data || [];
        let allSubs = [];
        for (const assignment of assignments) {
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
        // Add dummy students and submissions for testing
        const dummyStudents = selectedModule.students || [];
        setStudents(dummyStudents);
        
        const dummySubmissions = dummyStudents.map(student => ({
          id: Math.random(),
          studentId: student.id,
          studentName: student.name,
          assignmentTitle: 'Assignment 1',
          assignmentId: 1,
          score: null,
          feedback: '',
          pdf: null
        }));
        setSubmissions(dummySubmissions);
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
                  <th>PDF</th>
                  <th>Grade</th>
                  <th>Feedback</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(students) && students.length === 0 ? (
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
                          <textarea
                            value={editGrades[sub.id]?.feedback ?? (sub.feedback || '')}
                            placeholder="Add feedback..."
                            onChange={e => handleEditChange(sub.id, 'feedback', e.target.value)}
                          />
                        </td>
                        <td>
                          <button
                            onClick={() => handleUpdate(sub.id)}
                            disabled={!editGrades[sub.id]?.score}
                          >
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