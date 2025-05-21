import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import instructorApi from '../../services/instructorApi';
import { FaTrash, FaEdit, FaEye } from 'react-icons/fa';
import './InstructorStyles.css';

// Custom hook to manage authentication
const useAuth = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login/instructor');
    }
  }, [navigate]);
};

const parseStudentResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (response?.results) return response.results;
  if (response?.data) return Array.isArray(response.data) ? response.data : response.data.results || [];
  return [];
};

const StudentList = () => {
  useAuth(); // Check authentication
  
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await instructorApi.getStudents();
        setStudents(parseStudentResponse(response));
        if (!students.length) setError('No students found.');
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load students.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleAction = async (action, studentId) => {
    try {
      setError(null);
      await action(studentId);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
    } catch (err) {
      setError('Action failed.');
    }
  };

  if (loading) return <p>Loading students...</p>;

  return (
    <div className="student-list-page">
      <h1>Student List</h1>
      {error && <p>{error}</p>}
      <table>
        <thead>
          <tr><th>ID</th><th>Name</th><th>Email</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.student_id}</td>
              <td>{`${student.user.first_name} ${student.user.last_name}`}</td>
              <td>{student.user.email}</td>
              <td>
                <button onClick={() => navigate(`/dashboard/instructor/students/${student.id}`)}><FaEye /></button>
                <button onClick={() => navigate(`/dashboard/instructor/students/${student.id}/edit`)}><FaEdit /></button>
                <button onClick={() => handleAction(instructorApi.removeStudent, student.id)}><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentList;
