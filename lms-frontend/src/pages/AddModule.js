import React from 'react';
import ModuleForm from '../components/ModuleForm';

const AddModule = () => {
  const handleSubmit = async (formData) => {
    try {
      const response = await fetch('/api/modules/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create module');
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  };

  return (
    <ModuleForm
      onSubmit={handleSubmit}
      submitButtonText="Create Module"
    />
  );
};

export default AddModule; 