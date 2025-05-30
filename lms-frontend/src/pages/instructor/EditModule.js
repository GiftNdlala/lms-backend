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
        const studentIds = Array.isArray(data.students)
          ? data.students.map(s => (typeof s === 'object' ? s.id : s))
          : [];
        setModuleData({ ...data, students: studentIds });
        const studentsData = await instructorApi.getStudents();
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
        submitButtonText="Save Changes"
        isEditing={true}
        students={students}
      />
    </div>
  );
};

export default EditModule; 