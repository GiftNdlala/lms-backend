import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './InstructorStyles.css';

const AssignmentDetail = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    totalMarks: '',
  });

  const fetchAssignmentDetails = async () => {
    try {
      const response = await fetch(`/api/modules/assignments/${assignmentId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch assignment details');
      }
      const data = await response.json();
      setAssignment(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Error fetching assignment details');
    }
  };

  useEffect(() => {
    fetchAssignmentDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleUpdate = async (updatedData) => {
    try {
      const response = await fetch(`/api/modules/assignments/${assignmentId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        throw new Error('Failed to update assignment');
      }
      const data = await response.json();
      setAssignment(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Error updating assignment');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/modules/assignments/${assignmentId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete assignment');
      }
      navigate('/dashboard/instructor/assignments');
    } catch (error) {
      console.error('Error:', error);
      setError('Error deleting assignment');
    }
  };

  if (loading) return <div>Loading assignment details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!assignment) return <div>Assignment not found</div>;

  return (
    <div className="assignment-detail-container">
      <div className="assignment-header">
        <h1>{isEditing ? 'Edit Assignment' : assignment.title}</h1>
        <div className="assignment-actions">
          {!isEditing && (
            <>
              <button 
                className="edit-button"
                onClick={() => setIsEditing(true)}
              >
                Edit Assignment
              </button>
              <button 
                className="delete-button"
                onClick={handleDelete}
              >
                Delete Assignment
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="assignment-form">
          <div className="form-group">
            <label htmlFor="title">Assignment Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="datetime-local"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="totalMarks">Total Marks</label>
            <input
              type="number"
              id="totalMarks"
              name="totalMarks"
              value={formData.totalMarks}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              className="cancel-button"
            >
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="assignment-details">
          <div className="detail-group">
            <h3>Description</h3>
            <p>{assignment.description}</p>
          </div>

          <div className="detail-group">
            <h3>Due Date</h3>
            <p>{new Date(assignment.due_date).toLocaleString()}</p>
          </div>

          <div className="detail-group">
            <h3>Total Marks</h3>
            <p>{assignment.total_marks}</p>
          </div>

          <div className="detail-group">
            <h3>Status</h3>
            <span className={`status-badge ${assignment.status.toLowerCase()}`}>
              {assignment.status}
            </span>
          </div>

          <div className="detail-group">
            <h3>Submissions</h3>
            <p>{assignment.submission_count || 0} submissions received</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentDetail; 