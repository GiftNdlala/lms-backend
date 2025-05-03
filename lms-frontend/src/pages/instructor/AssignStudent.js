import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import instructorApi from '../../services/instructorApi';
import './InstructorStyles.css';

const AssignStudent = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get all students
        const allStudents = await instructorApi.getStudents();
        // Get assigned students for this module
        const moduleStudents = await instructorApi.getModuleStudents(moduleId);
        const assignedIds = moduleStudents.map(s => s.id);
        setStudents(allStudents);
        setAssigned(assignedIds);
      } catch (err) {
        setError('Failed to load students.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [moduleId]);

  const handleCheck = (studentId) => {
    setAssigned(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await instructorApi.updateModuleStudents(moduleId, assigned);
      navigate(-1); // Go back to modules list
    } catch (err) {
      setError('Failed to update assigned students.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading students...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="assign-student-container">
      <h2>Assign Students to Module</h2>
      <div className="student-list">
        {students.map(student => (
          <div key={student.id} className="student-checkbox">
            <input
              type="checkbox"
              id={`student-${student.id}`}
              checked={assigned.includes(student.id)}
              onChange={() => handleCheck(student.id)}
            />
            <label htmlFor={`student-${student.id}">
              {student.user?.first_name || student.first_name} {student.user?.last_name || student.last_name}
            </label>
          </div>
        ))}
      </div>
      <div className="actions">
        <button className="btn-secondary" onClick={() => navigate(-1)} disabled={saving}>Cancel</button>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Assignments'}
        </button>
      </div>
    </div>
  );
};

export default AssignStudent; 