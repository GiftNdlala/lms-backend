import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './DashboardStyles.css';

const AssignmentSubmission = () => {
  const { id: assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submittedFile, setSubmittedFile] = useState(null);
  const [grade, setGrade] = useState(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/api/modules/student/assignments/${assignmentId}/`);
        setAssignment(response.data);
        // Check for existing submission
        if (response.data.submissions && response.data.submissions.length > 0) {
          setAlreadySubmitted(true);
          setSubmittedFile(response.data.submissions[0].file || null);
          setGrade(response.data.submissions[0].grade);
        }
      } catch (err) {
        setError('Failed to load assignment.');
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [assignmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    const formData = new FormData();
    formData.append('content', submission);
    if (file) formData.append('file', file);
    try {
      await api.post(`/api/modules/student/assignments/${assignmentId}/submit/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Assignment submitted successfully!');
      setAlreadySubmitted(true);
      // Optionally, refetch assignment details
    } catch (err) {
      setError('Failed to submit assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  if (loading) return <div className="loading">Loading assignment...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!assignment) return <div className="error-message">Assignment not found.</div>;

  const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date();

  return (
    <div className="assignment-submission-container" style={{ maxWidth: 600, margin: '40px auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #0001', padding: 32 }}>
      <div className="assignment-header" style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 8 }}>{assignment.title}</h2>
        <div style={{ color: '#64748b', marginBottom: 8 }}>Module: <b>{assignment.module?.title || '--'}</b></div>
        <div style={{ color: '#64748b', marginBottom: 8 }}>Due: <b>{assignment.due_date ? new Date(assignment.due_date).toLocaleString() : '--'}</b></div>
        <div style={{ color: '#64748b', marginBottom: 8 }}>Points: <b>{assignment.max_grade ?? assignment.total_marks ?? '--'}</b></div>
        {isOverdue && <span className="overdue-badge" style={{ color: '#fff', background: '#ef4444', borderRadius: 8, padding: '2px 10px', marginLeft: 8 }}>Overdue</span>}
      </div>
      <div className="assignment-description" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 4 }}>Instructions</h3>
        <p style={{ color: '#334155' }}>{assignment.description}</p>
      </div>
      {alreadySubmitted ? (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ color: '#16a34a', fontWeight: 600, marginBottom: 6 }}>Assignment already submitted.</div>
          {submittedFile && (
            <div>Submitted File: <a href={submittedFile} target="_blank" rel="noopener noreferrer">{submittedFile.split('/').pop()}</a></div>
          )}
          {grade !== null && assignment.total_marks ? (
            <div>Grade: <b>{Math.round((grade / assignment.total_marks) * 100)}% ({grade}/{assignment.total_marks})</b></div>
          ) : grade !== null ? (
            <div>Grade: <b>{grade}</b></div>
          ) : null}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="submission-form" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="form-group">
            <label htmlFor="submission">Your Answer</label>
            <textarea
              id="submission"
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
              placeholder="Type your answer here..."
              required
              rows={8}
              style={{ width: '100%', borderRadius: 8, border: '1px solid #e5e7eb', padding: 12, fontSize: 16 }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="file">Attachment (optional)</label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              style={{ marginTop: 6 }}
            />
            {file && <div style={{ marginTop: 6, color: '#334155' }}>Selected: {file.name}</div>}
          </div>
          <button
            type="submit"
            className="primary-button"
            style={{ padding: '12px 0', fontSize: 18, borderRadius: 8, background: '#3b82f6', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer' }}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Assignment'}
          </button>
          {success && <div style={{ color: '#16a34a', marginTop: 8 }}>{success}</div>}
          {error && <div style={{ color: '#ef4444', marginTop: 8 }}>{error}</div>}
        </form>
      )}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="secondary-button"
        style={{ marginTop: 24, background: '#e5e7eb', color: '#334155', border: 'none', borderRadius: 8, padding: '10px 0', fontSize: 16, width: '100%' }}
      >
        Back
      </button>
    </div>
  );
};

export default AssignmentSubmission; 