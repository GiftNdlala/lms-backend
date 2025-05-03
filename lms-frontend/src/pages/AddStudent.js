import React, { useState, useEffect } from 'react';
import './StudentDashboard.css';

const AddStudent = () => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    studentId: '',
    program: '',
    batch: '',
    selectedCourses: [],
  });

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Fetch available courses
    const fetchCourses = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/courses/');
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCourseSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      selectedCourses: selectedOptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/students/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Student added successfully!' });
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          studentId: '',
          program: '',
          batch: '',
          selectedCourses: [],
        });
      } else {
        throw new Error('Failed to add student');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add student. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Add New Student</h2>
      
      {message.text && (
        <div className={`p-4 mb-4 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Student ID</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block mb-1">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Program</label>
            <input
              type="text"
              name="program"
              value={formData.program}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Batch</label>
            <input
              type="text"
              name="batch"
              value={formData.batch}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
        </div>

        <div>
          <label className="block mb-1">Assign Courses</label>
          <select
            multiple
            name="selectedCourses"
            value={formData.selectedCourses}
            onChange={handleCourseSelection}
            className="input h-32"
          >
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple courses</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="button w-full"
        >
          {loading ? 'Adding Student...' : 'Add Student'}
        </button>
      </form>
    </div>
  );
};

export default AddStudent; 