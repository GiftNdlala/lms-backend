import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InstructorStyles.css';

const AssignmentsList = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/modules/assignments/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Error fetching assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  if (loading) return <div>Loading assignments...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="assignments-list-container">
      <div className="assignments-header">
        <h1>Assignments</h1>
        <button 
          className="create-button"
          onClick={() => navigate('/dashboard/instructor/assignments/create')}
        >
          Create New Assignment
        </button>
      </div>

      <div className="assignments-grid">
        {assignments.length === 0 ? (
          <p>No assignments found. Create your first assignment!</p>
        ) : (
          assignments.map(assignment => (
            <div 
              key={assignment.id} 
              className="assignment-card"
              onClick={() => navigate(`/dashboard/instructor/assignments/${assignment.id}`)}
            >
              <h3>{assignment.title}</h3>
              <p className="module-name">Module: {assignment.module_name}</p>
              <p className="due-date">Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
              <p className="total-marks">Total Marks: {assignment.total_marks}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssignmentsList; 