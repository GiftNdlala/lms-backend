import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './StudentPages.css';

const formatDate = (dateString) => {
  if (!dateString) return '--';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isPdf = (filename) => filename && filename.toLowerCase().endsWith('.pdf');

const QuizAssessment = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFile, setModalFile] = useState(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        // 1. Fetch modules the student is enrolled in
        const modulesRes = await api.get('/api/modules/student/modules/');
        const modules = Array.isArray(modulesRes.data) ? modulesRes.data : modulesRes.data.modules;

        // 2. Fetch assignments for each module
        const allAssignments = [];
        for (const module of modules) {
          try {
            const assignmentsRes = await api.get(`/api/modules/student/modules/${module.id}/assignments/`);
            if (Array.isArray(assignmentsRes.data)) {
              // Optionally, add module info to each assignment
              assignmentsRes.data.forEach(a => a.module = module);
              allAssignments.push(...assignmentsRes.data);
            }
          } catch (err) {
            // Optionally handle per-module errors
          }
        }
        setAssessments(allAssignments);
      } catch (err) {
        setAssessments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  const getGrade = (assessment) => {
    if (!assessment.submissions || assessment.submissions.length === 0) return '--';
    const submission = assessment.submissions[0];
    return submission.grade !== undefined && submission.grade !== null ? submission.grade : '--';
  };

  const getSubmittedFile = (assessment) => {
    if (!assessment.submissions || assessment.submissions.length === 0) return null;
    return assessment.submissions[0].file || null;
  };

  const getSubmittedFileName = (assessment) => {
    const file = getSubmittedFile(assessment);
    if (!file) return null;
    return file.split('/').pop();
  };

  const handleFileClick = (fileUrl) => {
    if (isPdf(fileUrl)) {
      setModalFile(fileUrl);
      setModalOpen(true);
    } else {
      window.open(fileUrl, '_blank');
    }
  };

  const closeModal = (e) => {
    if (e.target.className === 'pdf-modal-overlay' || e.target.className === 'pdf-modal-close') {
      setModalOpen(false);
      setModalFile(null);
    }
  };

  if (loading) {
    return <div className="loading">Loading assessments...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 style={{ marginBottom: 4 }}>Assessments</h2>
        <p style={{ marginBottom: 24 }}>View and take your module assessments</p>
      </div>
      <div className="assessments-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'flex-start' }}>
        {assessments.map((assessment) => {
          const submittedFile = getSubmittedFile(assessment);
          const submittedFileName = getSubmittedFileName(assessment);
          const isSubmitted = !!submittedFile;
          const grade = getGrade(assessment);
          return (
            <div
              key={assessment.id}
              className="assessment-card"
              style={{
                position: 'relative',
                padding: 24,
                marginBottom: 24,
                borderRadius: 16,
                boxShadow: '0 2px 12px #0002',
                background: '#fff',
                minWidth: 320,
                maxWidth: 400,
                flex: '1 1 340px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              {/* Grade badge */}
              <div
                style={{
                  position: 'absolute',
                  top: 18,
                  right: 18,
                  background: '#3b82f6',
                  color: '#fff',
                  borderRadius: 999,
                  padding: '4px 18px',
                  fontWeight: 600,
                  fontSize: 15,
                  boxShadow: '0 1px 4px #0001',
                  letterSpacing: 1,
                }}
              >
                Grade: {grade}
              </div>
              <h3 style={{ margin: 0, color: '#1e293b', fontWeight: 700, fontSize: 22 }}>{assessment.title}</h3>
              <div style={{ color: '#64748b', fontSize: 15, fontWeight: 500, marginBottom: 2 }}>
                Module: <span style={{ color: '#0ea5e9' }}>{assessment.module?.title || '--'}</span>
              </div>
              <div style={{ color: '#64748b', fontSize: 14, marginBottom: 2 }}>
                Instructor: {assessment.instructor_name || '--'}
              </div>
              <div style={{ display: 'flex', gap: 18, fontSize: 14, color: '#334155', marginBottom: 2 }}>
                <span>Due: <span style={{ fontWeight: 500 }}>{formatDate(assessment.due_date)}</span></span>
                <span>Total Marks: <span style={{ fontWeight: 500 }}>{assessment.total_marks ?? assessment.total_points ?? '--'}</span></span>
              </div>
              <div style={{ margin: '8px 0', width: '100%', borderTop: '1px solid #e5e7eb' }} />
              <div style={{ marginBottom: 4, fontSize: 15, color: '#334155', minHeight: 32 }}>{assessment.description}</div>
              {/* Downloadable file */}
              {assessment.file && (
                <div style={{ marginBottom: 8, width: '100%', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 500 }}>File:</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span role="img" aria-label="file" style={{ fontSize: 18 }}>📄</span>
                    <span
                      onClick={() => handleFileClick(assessment.file)}
                      style={{ color: '#2563eb', textDecoration: 'none', fontSize: 15, fontWeight: 500, cursor: 'pointer', overflowWrap: 'anywhere' }}
                    >
                      {assessment.file.split('/').pop()}
                    </span>
              </span>
            </div>
              )}
              {/* Submission status and file */}
              {isSubmitted ? (
                <div style={{ marginBottom: 8, color: '#16a34a', fontWeight: 500, fontSize: 15 }}>
                  Assignment Submitted
                  {submittedFile && (
                    <>
                      : <a href={submittedFile} download target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontSize: 15 }}>{submittedFileName}</a>
                    </>
                  )}
            </div>
              ) : (
                <div style={{ marginBottom: 8, color: '#f59e42', fontWeight: 500, fontSize: 15 }}>
                  Not Submitted
            </div>
              )}
              {/* Submit Assignment Button */}
              <div style={{ display: 'flex', gap: 12, width: '100%' }}>
            <button
              className="btn-primary"
                  style={{ padding: '10px 0', fontSize: 16, width: '100%', borderRadius: 8 }}
                  onClick={() => navigate(`/dashboard/student/assignments/submit/${assessment.id}`)}
                  disabled={isSubmitted}
            >
                  {isSubmitted ? 'Submitted' : 'Submit Assignment'}
            </button>
          </div>
            </div>
          );
        })}
        {assessments.length === 0 && (
          <div className="empty-state">
            <p>No assessments available at this time.</p>
          </div>
        )}
      </div>
      {/* PDF Modal */}
      {modalOpen && (
        <div
          className="pdf-modal-overlay"
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 0,
              maxWidth: '90vw',
              maxHeight: '90vh',
              boxShadow: '0 4px 32px #0004',
              position: 'relative',
              width: 'min(800px, 95vw)',
              height: 'min(90vh, 700px)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <button
              className="pdf-modal-close"
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: 8,
                right: 12,
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '4px 12px',
                fontSize: 16,
                cursor: 'pointer',
                zIndex: 10,
              }}
            >
              Close
            </button>
            <iframe
              src={modalFile}
              title="PDF Viewer"
              style={{ flex: 1, width: '100%', height: '100%', border: 'none', borderRadius: 12 }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizAssessment;
