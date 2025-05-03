import React, { useState, useEffect } from 'react';
import './StudentDashboard.css';

const GradeStudent = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/instructor/students/');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAssignments = async (studentId) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/instructor/students/${studentId}/assignments/`);
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    fetchAssignments(student.id);
  };

  const handleGradeSubmit = async (assignmentId, grade, feedback) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/instructor/assignments/${assignmentId}/grade/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grade, feedback }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Grade submitted successfully!' });
        // Refresh assignments
        fetchAssignments(selectedStudent.id);
      } else {
        throw new Error('Failed to submit grade');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit grade. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Grade Students</h2>
      
      {message.text && (
        <div className={`p-4 mb-4 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {/* Student List */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Students</h3>
          <div className="space-y-2">
            {students.map(student => (
              <button
                key={student.id}
                onClick={() => handleStudentSelect(student)}
                className={`w-full text-left p-2 rounded ${
                  selectedStudent?.id === student.id
                    ? 'bg-blue-100 text-blue-800'
                    : 'hover:bg-gray-100'
                }`}
              >
                {student.firstName} {student.lastName}
                <div className="text-sm text-gray-500">ID: {student.studentId}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Assignments List */}
        <div className="col-span-2">
          {selectedStudent ? (
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">
                Assignments for {selectedStudent.firstName} {selectedStudent.lastName}
              </h3>
              
              {assignments.length === 0 ? (
                <p className="text-gray-500">No assignments found for this student.</p>
              ) : (
                <div className="space-y-4">
                  {assignments.map(assignment => (
                    <div key={assignment.id} className="border-b pb-4">
                      <h4 className="font-medium">{assignment.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                      
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="mb-2">
                          <label className="block text-sm font-medium mb-1">
                            Submission Status: 
                            <span className={`ml-2 ${
                              assignment.status === 'submitted' ? 'text-green-600' : 'text-orange-600'
                            }`}>
                              {assignment.status}
                            </span>
                          </label>
                        </div>

                        {assignment.status === 'submitted' && (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const grade = e.target.grade.value;
                              const feedback = e.target.feedback.value;
                              handleGradeSubmit(assignment.id, grade, feedback);
                            }}
                            className="space-y-3"
                          >
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Grade (out of {assignment.totalMarks})
                              </label>
                              <input
                                type="number"
                                name="grade"
                                defaultValue={assignment.marksObtained}
                                min="0"
                                max={assignment.totalMarks}
                                className="input"
                                required
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Feedback
                              </label>
                              <textarea
                                name="feedback"
                                defaultValue={assignment.feedback}
                                className="input"
                                rows="2"
                                required
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={loading}
                              className="button"
                            >
                              {loading ? 'Submitting...' : 'Submit Grade'}
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-100 p-4 rounded text-center">
              Select a student to view their assignments
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradeStudent; 