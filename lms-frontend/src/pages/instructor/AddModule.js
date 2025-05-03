import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import instructorApi from '../../services/instructorApi';
import './InstructorStyles.css';

const AddModule = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    duration: '',
    credits: '',
    isTemplate: false
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = {
        name: formData.title,
        code: formData.code,
        description: formData.description,
      };

      if (!formData.isTemplate) {
        // If creating a regular module, include additional fields
        submitData.duration = parseInt(formData.duration, 10);
        submitData.credits = parseInt(formData.credits, 10);
        await instructorApi.createModule(submitData);
      } else {
        // If creating a module template
        await instructorApi.createModuleTemplate(submitData);
      }
      
      navigate(formData.isTemplate ? '/dashboard/instructor/module-templates' : '/dashboard/instructor/modules');
    } catch (err) {
      console.error('Error creating module:', err);
      setError('Failed to create module. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-module-container">
      <div className="add-module-card">
        <h1>Create New {formData.isTemplate ? 'Module Template' : 'Module'}</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="add-module-form">
          <div className="form-group">
            <label htmlFor="isTemplate">
              <input
                type="checkbox"
                id="isTemplate"
                name="isTemplate"
                checked={formData.isTemplate}
                onChange={handleChange}
              />
              Create as Module Template
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="title">Module Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter module title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="code">Module Code</label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              placeholder="Enter module code (e.g., MOD101)"
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
              placeholder="Enter module description"
              rows="4"
            />
          </div>

          {!formData.isTemplate && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="duration">Duration (weeks)</label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="Enter duration"
                />
              </div>

              <div className="form-group">
                <label htmlFor="credits">Credits</label>
                <input
                  type="number"
                  id="credits"
                  name="credits"
                  value={formData.credits}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="Enter credits"
                />
              </div>
            </div>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
            >
              {loading ? 'Creating...' : `Create ${formData.isTemplate ? 'Template' : 'Module'}`}
            </button>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => navigate('/dashboard/instructor/modules')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModule; 