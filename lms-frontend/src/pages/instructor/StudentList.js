import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import instructorApi from '../../services/instructorApi';
import { FaTrash, FaEdit, FaEye } from 'react-icons/fa';
import './InstructorStyles.css';

const StudentList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        console.log('Checking auth token:', token);
        
        if (!token) {
          console.log('No token found, redirecting to login');
          navigate('/login/instructor');
          return;
        }

        console.log('Fetching profile...');
        const profile = await instructorApi.getProfile();
        console.log('Profile fetched:', profile);

        console.log('Fetching students...');
        await fetchStudents();
      } catch (error) {
        console.error('Authentication check failed:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response,
          status: error.response?.status
        });
        setError('Authentication failed. Please login again.');
        localStorage.removeItem('access_token');
        navigate('/login/instructor');
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching students...');
      const response = await instructorApi.getStudents();
      console.log('Raw students response:', response);
      
      // Handle different response formats
      let studentList = [];
      if (Array.isArray(response)) {
        studentList = response;
      } else if (response && response.results) {
        studentList = response.results;
      } else if (response && response.data) {
        studentList = Array.isArray(response.data) ? response.data : response.data.results || [];
      }
      
      console.log('Processed students:', studentList);
      
      if (!studentList || !studentList.length) {
        console.log('No students found in response');
        setError('No students found. Add students to get started.');
      }
      setStudents(studentList);
    } catch (err) {
      console.error('Error fetching students:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status
      });
      setError(err.response?.data?.detail || err.message || 'Failed to load students. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        setError(null);
        console.log('Deleting student:', studentId);
        await instructorApi.removeStudent(studentId);
        console.log('Student deleted successfully');
        await fetchStudents();
      } catch (err) {
        console.error('Error deleting student:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response,
          status: err.response?.status
        });
        setError(err.response?.data?.detail || err.message || 'Failed to delete student. Please try again.');
      }
    }
  };

  const handleViewStudent = (studentId) => {
    navigate(`/dashboard/instructor/students/${studentId}`);
  };

  const handleEditStudent = (studentId) => {
    navigate(`/dashboard/instructor/students/${studentId}/edit`);
  };

  if (loading) {
    return (
      <div className="student-list-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="student-list-page"
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#f8f9fa',
        padding: '2rem 2rem 2rem 0', // less left padding to align with sidebar
        boxSizing: 'border-box',
      }}
    >
      <div
        className="student-list-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          marginLeft: '0',
          marginRight: '0',
        }}
      >
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '2px', margin: 0 }}>
          <span
            style={{
              background: 'linear-gradient(90deg, #ff005a, #ffb800, #00ffae, #00c3ff, #a259ff, #ff005a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              fontWeight: 900,
              fontSize: '2.5rem',
              letterSpacing: '3px',
              marginRight: '0.5rem',
              textTransform: 'uppercase',
            }}
          >
            GAS
          </span>
          <span style={{ color: '#222', fontWeight: 700, fontSize: '2.5rem', letterSpacing: '2px' }}>
            STUDENTS
          </span>
        </h1>
        <button 
          className="btn-primary"
          style={{ fontSize: '1rem', padding: '0.75rem 2rem', borderRadius: '8px' }}
          onClick={() => navigate('/dashboard/instructor/students/add')}
        >
          Add New Student
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button 
            className="retry-button"
            onClick={() => {
              setError(null);
              fetchStudents();
            }}
          >
            Retry
          </button>
        </div>
      )}

      <div
        className="students-list"
        style={{
          width: '100%',
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          padding: '2rem',
          marginLeft: 0,
          marginRight: 0,
          maxWidth: 'calc(100vw - 80px)', // leave a small margin for sidebar
          overflowX: 'auto',
        }}
      >
        <div className="students-table" style={{ width: '100%' }}>
          <table
            style={{
              width: '100%',
              minWidth: '900px',
              borderCollapse: 'collapse',
              fontSize: '1.1rem',
            }}
          >
            <thead style={{ background: '#f5f5f5' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Student ID</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Program</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Batch</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem' }}>{student.student_id}</td>
                    <td style={{ padding: '1rem' }}>{`${student.user.first_name} ${student.user.last_name}`}</td>
                    <td style={{ padding: '1rem' }}>{student.user.email}</td>
                    <td style={{ padding: '1rem' }}>{student.program}</td>
                    <td style={{ padding: '1rem' }}>{student.batch}</td>
                    <td style={{ padding: '1rem' }}>
                      <div className="action-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="action-btn view"
                          style={{ background: '#00c3ff', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.5rem' }}
                          onClick={() => handleViewStudent(student.id)}
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="action-btn edit"
                          style={{ background: '#ffb800', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.5rem' }}
                          onClick={() => handleEditStudent(student.id)}
                          title="Edit Student"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="action-btn delete"
                          style={{ background: '#ff005a', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.5rem' }}
                          onClick={() => handleDeleteStudent(student.id)}
                          title="Delete Student"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                    No students found. Add students to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentList; 