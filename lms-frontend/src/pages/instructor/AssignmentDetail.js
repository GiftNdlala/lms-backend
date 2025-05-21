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

  const fetchAssignmentDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssignment(data);
        setFormData({
          title: data.title,
          description: data.description,
          dueDate: data.due_date,
          totalMarks: data.total_marks,
        });
      } else {
        setError('Failed to fetch assignment details');
      }
    } catch (error) {
      setError('Error fetching assignment details');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchAssignmentDetails();
  }, [fetchAssignmentDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/assignments/${assignmentId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsEditing(false);
        fetchAssignmentDetails();
      } else {
        setError('Failed to update assignment');
      }
    } catch (error) {
      setError('Error updating assignment');
      console.error('Error:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        const response = await fetch(`/api/assignments/${assignmentId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (response.ok) {
          navigate('/dashboard/instructor/assignments');
        } else {
          setError('Failed to delete assignment');
        }
      } catch (error) {
        setError('Error deleting assignment');
        console.error('Error:', error);
      }
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