import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModuleForm from '../../components/ModuleForm';
import instructorApi from '../../services/instructorApi';

const EditModule = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const data = await instructorApi.getModuleDetails(moduleId);
        setModuleData(data);
        const studentsData = await instructorApi.getModuleStudents(moduleId);
        setStudents(studentsData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [moduleId]);

  const handleSubmit = async (formData) => {
    try {
      await instructorApi.updateModule(moduleId, formData);
      navigate('/dashboard/instructor/modules');
    } catch (error) {
      throw error;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <ModuleForm
        initialData={moduleData}
        onSubmit={handleSubmit}
        submitButtonText="Update Module"
        isEditing={true}
      />
      <div>
        <h3>Manage Students</h3>
        <ul>
          {students.map(student => (
            <li key={student.id}>{student.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EditModule; 