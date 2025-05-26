import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './InstructorStyles.css';

const [modules, setModules] = useState([]);

  useEffect(() => {
  const fetchModules = async () => {
    try {
      const response = await api.get('/api/modules/');
      console.log('Fetched Modules:', response.data);  // ✅ Debugging step
      setModules(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };
  fetchModules();
}, []);

const AddAssignment = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    module: '',
    totalMarks: '',
  });

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
      // TODO: Add API call to create assignment
      const response = await fetch('/api/assignments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        navigate('/dashboard/instructor/assignments');
      } else {
        // Handle error
        console.error('Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  return (
    <div className="add-assignment-container">
      <h1>Create New Assignment</h1>
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
          <label htmlFor="moduleId">Module</label>
          <select
            id="moduleId"
            name="moduleId"
            value={formData.moduleId}
            onChange={handleChange}
            required
          >
            <option value="">Select a module</option>
            {/* TODO: Add module options dynamically */}
          </select>
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
          <button type="button" onClick={() => navigate('/dashboard/instructor/assignments')} className="cancel-button">
            Cancel
          </button>
          <button type="submit" className="submit-button">
            Create Assignment
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAssignment; 