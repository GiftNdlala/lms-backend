import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './DashboardStyles.css';

const AssignmentSubmission = () => {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await api.assignments.get(courseId, assignmentId);
        setAssignment(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load assignment');
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [courseId, assignmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('content', submission);
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      await api.assignments.submit(courseId, assignmentId, formData);
      navigate(`/dashboard/student/courses/${courseId}`);
    } catch (err) {
      setError('Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  if (loading) return <div className="loading">Loading assignment...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!assignment) return <div className="error-message">Assignment not found</div>;

  const isOverdue = new Date(assignment.due_date) < new Date();

  return (
    <div className="assignment-submission-container">
      <div className="assignment-header">
        <h2>{assignment.title}</h2>
        <div className="assignment-meta">
          <span>Due: {new Date(assignment.due_date).toLocaleString()}</span>
          <span>Points: {assignment.points}</span>
          {isOverdue && <span className="overdue-badge">Overdue</span>}
        </div>
      </div>

      <div className="assignment-content">
        <div className="assignment-description">
          <h3>Instructions</h3>
          <p>{assignment.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="submission-form">
          <div className="form-group">
            <label htmlFor="submission">Your Answer</label>
            <textarea
              id="submission"
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
              placeholder="Type your answer here..."
              required
              rows={10}
            />
          </div>

          <div className="form-group">
            <label>
              Attachments
              <small> (Optional)</small>
            </label>
            <div className="file-upload-area">
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                className="file-input"
              />
              <div className="file-list">
                {files.map((file, index) => (
                  <div key={index} className="file-item">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="remove-file"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="submission-actions">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/student/courses/${courseId}`)}
              className="secondary-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={submitting || (isOverdue && !assignment.allow_late_submission)}
            >
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </div>

          {isOverdue && !assignment.allow_late_submission && (
            <div className="error-message">
              This assignment is overdue and late submissions are not allowed.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AssignmentSubmission; 