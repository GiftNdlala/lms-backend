import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import instructorApi from '../../services/instructorApi';
import { FaTrash } from 'react-icons/fa';
import './AddStudent.css';


const AddStudent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    student_id: '',
    program: '',
    batch: '',
    password: ''
  });

  const [students, setStudents] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showedPassword, setShowedPassword] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login/instructor');
        return;
      }

      try {
        await instructorApi.getProfile();
        fetchStudents();
      } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('access_token');
        navigate('/login/instructor');
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchStudents = async () => {
    try {
      const response = await instructorApi.getStudents();
      if (response && Array.isArray(response)) {
        setStudents(response);
      } else {
        setMessage({
          type: 'error',
          text: 'Invalid student data received'
        });
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to load students list. Please refresh the page.'
      });
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await instructorApi.deleteStudent(studentId);
        setMessage({
          type: 'success',
          text: 'Student deleted successfully'
        });
        fetchStudents();
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Failed to delete student. Please try again.'
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.student_id.match(/^\d{8}$/)) {
      newErrors.student_id = 'Student ID must be 8 digits';
    }

    if (formData.first_name.length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    }

    if (formData.last_name.length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    }

    if (formData.program.length < 2) {
      newErrors.program = 'Please enter a valid program';
    }

    if (!formData.batch.match(/^\d{4}$/)) {
      newErrors.batch = 'Please enter a valid year';
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage({
        type: 'error',
        text: 'Please correct the errors in the form'
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await instructorApi.addStudent(formData);
      setShowedPassword(formData.password);
      setMessage({
        type: 'success',
        text: `Student ${formData.first_name} ${formData.last_name} has been successfully added!`
      });
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        student_id: '',
        program: '',
        batch: '',
        password: ''
      });
      fetchStudents();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Error adding student. Please check the information and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-student-page">
      <div className="add-student-form">
        <h1>Add New GAS Student</h1>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {showedPassword && message.type === 'success' && (
          <div className="message success" style={{ marginBottom: '1rem' }}>
            <strong>Initial Password:</strong> <span style={{ fontFamily: 'monospace' }}>{showedPassword}</span>
            <br />
            <span style={{ fontSize: '0.9em', color: '#666' }}>
              Please copy and send this password to the student. It will not be shown again.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="student-form">
          <div className="form-group">
            <label htmlFor="student_id">Student ID:</label>
            <input
              type="text"
              id="student_id"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              required
              placeholder="Enter 8-digit student ID"
              autoComplete="off"
              className={errors.student_id ? 'error' : ''}
            />
            {errors.student_id && <span className="error-text">{errors.student_id}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="student@example.com"
              autoComplete="email"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="first_name">First Name:</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              placeholder="Enter first name"
              autoComplete="given-name"
              className={errors.first_name ? 'error' : ''}
            />
            {errors.first_name && <span className="error-text">{errors.first_name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Last Name:</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              placeholder="Enter last name"
              autoComplete="family-name"
              className={errors.last_name ? 'error' : ''}
            />
            {errors.last_name && <span className="error-text">{errors.last_name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="program">Program:</label>
            <input
              type="text"
              id="program"
              name="program"
              value={formData.program}
              onChange={handleChange}
              required
              placeholder="Enter program name"
              className={errors.program ? 'error' : ''}
            />
            {errors.program && <span className="error-text">{errors.program}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="batch">Batch Year:</label>
            <input
              type="text"
              id="batch"
              name="batch"
              value={formData.batch}
              onChange={handleChange}
              required
              placeholder="Enter batch year (e.g., 2023)"
              className={errors.batch ? 'error' : ''}
            />
            {errors.batch && <span className="error-text">{errors.batch}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Set initial password for student"
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button type="submit" disabled={loading} className={loading ? 'loading' : ''}>
            {loading ? 'Adding Student...' : 'Add Student'}
          </button>
        </form>
      </div>

      <div className="students-list">
        <h2>Registered GAS Students</h2>
        <div className="students-table">
          {students?.length === 0 ? (
            <p style={{ textAlign: "center", padding: "1rem", color: "#606266", fontSize: "1rem" }}>
              No registered students yet.
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Program</th>
                  <th>Batch</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.student_id}</td>
                    <td>{`${student.user.first_name} ${student.user.last_name}`}</td>
                    <td>{student.user.email}</td>
                    <td>{student.program}</td>
                    <td>{student.batch}</td>
                    <td>
                      <button className="delete-btn" onClick={() => handleDeleteStudent(student.id)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddStudent;
