import React, { useState, useEffect } from 'react';
import './ModuleForm.css';
import instructorApi from '../services/instructorApi';

const ModuleForm = ({ 
  initialData = null, 
  onSubmit, 
  submitButtonText = 'Create Module',
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    duration: '',
    credits: '',
    isTemplate: false,
    students: [],
    ...initialData
  });

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch available students when component mounts
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await instructorApi.getStudents();
        setStudents(data);
      } catch (error) {
        console.error('Error fetching students:', error);
        setMessage({ type: 'error', text: 'Failed to fetch students' });
      }
    };
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleStudentSelection = (studentId) => {
    setFormData(prev => {
      const students = [...prev.students];
      const index = students.indexOf(studentId);
      
      if (index === -1) {
        students.push(studentId);
      } else {
        students.splice(index, 1);
      }
      
      return { ...prev, students };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await onSubmit(formData);
      if (!isEditing) {
        // Only reset form if we're creating a new module
        setFormData({
          title: '',
          code: '',
          description: '',
          duration: '',
          credits: '',
          isTemplate: false,
          students: [],
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Operation failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="module-form-container">
      <h2 className="form-title">{isEditing ? 'Edit Module' : 'Create New Module'}</h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="module-form">
        <div className="form-section">
          <h3 className="section-title">Module Information</h3>
          
          <div className="form-group">
            <label htmlFor="title">Module Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="Enter module title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="code">Module Code *</label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="Enter module code (e.g., MOD101)"
              pattern="[A-Za-z0-9]+"
              title="Module code should contain only letters and numbers"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
              required
              placeholder="Enter module description"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isTemplate"
                checked={formData.isTemplate}
                onChange={handleChange}
              />
              Create as Template Module
            </label>
          </div>

          {!formData.isTemplate && (
            <>
              <div className="form-group">
                <label htmlFor="duration">Duration (weeks) *</label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="form-input"
                  required={!formData.isTemplate}
                  min="1"
                  placeholder="Enter module duration in weeks"
                />
              </div>

              <div className="form-group">
                <label htmlFor="credits">Credits *</label>
                <input
                  type="number"
                  id="credits"
                  name="credits"
                  value={formData.credits}
                  onChange={handleChange}
                  className="form-input"
                  required={!formData.isTemplate}
                  min="1"
                  placeholder="Enter number of credits"
                />
              </div>
            </>
          )}
        </div>

        {!formData.isTemplate && (
          <div className="form-section">
            <h3 className="section-title">Assign Students</h3>
            <div className="students-list">
              {students.map(student => (
                <div key={student.id} className="student-item">
                  <input
                    type="checkbox"
                    id={`student-${student.id}`}
                    checked={formData.students.includes(student.id)}
                    onChange={() => handleStudentSelection(student.id)}
                    className="student-checkbox"
                  />
                  <label htmlFor={`student-${student.id}`} className="student-label">
                    {student.user.first_name} {student.user.last_name}
                    <span className="student-id">({student.student_id})</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
            className={`submit-button ${loading ? 'loading' : ''}`}
          >
            {loading ? 'Processing...' : submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModuleForm; 