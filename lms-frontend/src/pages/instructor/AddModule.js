import React from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleForm from '../../components/ModuleForm';
import instructorApi from '../../services/instructorApi';
import './AddModule.css';

const AddModule = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      // Validate required fields
      if (!formData.title || !formData.code || !formData.description) {
        throw new Error('Title, code, and description are required');
      }

      // For non-template modules, validate duration and credits
      if (!formData.isTemplate) {
        if (!formData.duration || !formData.credits) {
          throw new Error('Duration and credits are required for non-template modules');
        }
        if (formData.duration < 1 || formData.credits < 1) {
          throw new Error('Duration and credits must be positive numbers');
        }
      }

      // Prepare the data to send to the API
      const submitData = {
        title: formData.title,
        code: formData.code,
        description: formData.description,
        duration: formData.isTemplate ? 0 : parseInt(formData.duration),
        credits: formData.isTemplate ? 0 : parseInt(formData.credits)
      };

      console.log('Submitting module data:', submitData);
      const response = await instructorApi.createModule(submitData);
      console.log('Module created successfully:', response);
      
      // Navigate to modules list on success
      navigate('/instructor/modules');
    } catch (error) {
      console.error('Error creating module:', error);
      throw error;
    }
  };

  return (
    <div className="add-module-container">
      <ModuleForm onSubmit={handleSubmit} />
    </div>
  );
};

export default AddModule; 