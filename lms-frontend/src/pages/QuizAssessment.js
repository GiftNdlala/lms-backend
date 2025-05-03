import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import studentApi from '../services/studentApi';
import './StudentPages.css';

const QuizAssessment = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const data = await studentApi.getAssessments();
        setAssessments(data);
      } catch (err) {
        setError('Failed to load assessments. Please try again later.');
        console.error('Error fetching assessments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'upcoming':
        return 'status-upcoming';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading assessments...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Assessments</h2>
        <p>View and take your module assessments</p>
      </div>

      <div className="assessments-grid">
        {assessments.map((assessment) => (
          <div key={assessment.id} className="assessment-card">
            <div className="assessment-header">
              <h3>{assessment.title}</h3>
              <span className={`assessment-status ${getStatusClass(assessment.status)}`}>
                {assessment.status}
              </span>
            </div>

            <div className="assessment-info">
              <p>{assessment.description}</p>
            </div>

            <div className="assessment-meta">
              <span>Duration: {assessment.duration} mins</span>
              <span>Questions: {assessment.total_questions}</span>
              <span>Points: {assessment.total_points}</span>
            </div>

            <button
              className="btn-primary"
              onClick={() => navigate(`/dashboard/student/assessments/${assessment.id}`)}
              disabled={assessment.status.toLowerCase() === 'completed'}
            >
              {assessment.status.toLowerCase() === 'completed' ? 'View Results' : 'Start Assessment'}
            </button>
          </div>
        ))}

        {assessments.length === 0 && (
          <div className="empty-state">
            <p>No assessments available at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizAssessment;
