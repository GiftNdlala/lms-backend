import React, { useState } from 'react';
import './StudentDashboard.css';

const AddModule = () => {
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    startDate: '',
    endDate: '',
    modules: [
      {
        title: '',
        description: '',
        order: 1,
        startDate: '',
        endDate: '',
        lessons: [
          {
            title: '',
            content: '',
            order: 1,
            estimatedTime: 60,
          }
        ]
      }
    ]
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleModuleChange = (index, e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newModules = [...prev.modules];
      newModules[index] = {
        ...newModules[index],
        [name]: value
      };
      return { ...prev, modules: newModules };
    });
  };

  const handleLessonChange = (moduleIndex, lessonIndex, e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newModules = [...prev.modules];
      newModules[moduleIndex].lessons[lessonIndex] = {
        ...newModules[moduleIndex].lessons[lessonIndex],
        [name]: value
      };
      return { ...prev, modules: newModules };
    });
  };

  const addModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [
        ...prev.modules,
        {
          title: '',
          description: '',
          order: prev.modules.length + 1,
          startDate: '',
          endDate: '',
          lessons: [
            {
              title: '',
              content: '',
              order: 1,
              estimatedTime: 60,
            }
          ]
        }
      ]
    }));
  };

  const addLesson = (moduleIndex) => {
    setFormData(prev => {
      const newModules = [...prev.modules];
      newModules[moduleIndex].lessons.push({
        title: '',
        content: '',
        order: newModules[moduleIndex].lessons.length + 1,
        estimatedTime: 60,
      });
      return { ...prev, modules: newModules };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/courses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Course and modules added successfully!' });
        setFormData({
          title: '',
          code: '',
          description: '',
          startDate: '',
          endDate: '',
          modules: [
            {
              title: '',
              description: '',
              order: 1,
              startDate: '',
              endDate: '',
              lessons: [
                {
                  title: '',
                  content: '',
                  order: 1,
                  estimatedTime: 60,
                }
              ]
            }
          ]
        });
      } else {
        throw new Error('Failed to add course');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add course. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Add New Course & Modules</h2>
      
      {message.text && (
        <div className={`p-4 mb-4 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Details */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-xl font-semibold mb-4">Course Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Course Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Course Code</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input"
                rows="3"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>
        </div>

        {/* Modules */}
        {formData.modules.map((module, moduleIndex) => (
          <div key={moduleIndex} className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Module {moduleIndex + 1}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Module Title</label>
                <input
                  type="text"
                  name="title"
                  value={module.title}
                  onChange={(e) => handleModuleChange(moduleIndex, e)}
                  className="input"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block mb-1">Module Description</label>
                <textarea
                  name="description"
                  value={module.description}
                  onChange={(e) => handleModuleChange(moduleIndex, e)}
                  className="input"
                  rows="2"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={module.startDate}
                  onChange={(e) => handleModuleChange(moduleIndex, e)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={module.endDate}
                  onChange={(e) => handleModuleChange(moduleIndex, e)}
                  className="input"
                  required
                />
              </div>
            </div>

            {/* Lessons */}
            <div className="mt-4">
              <h4 className="text-md font-semibold mb-2">Lessons</h4>
              {module.lessons.map((lesson, lessonIndex) => (
                <div key={lessonIndex} className="bg-gray-50 p-3 rounded mb-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1">Lesson Title</label>
                      <input
                        type="text"
                        name="title"
                        value={lesson.title}
                        onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, e)}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Estimated Time (minutes)</label>
                      <input
                        type="number"
                        name="estimatedTime"
                        value={lesson.estimatedTime}
                        onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, e)}
                        className="input"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block mb-1">Content</label>
                      <textarea
                        name="content"
                        value={lesson.content}
                        onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, e)}
                        className="input"
                        rows="2"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addLesson(moduleIndex)}
                className="text-blue-600 hover:text-blue-800 text-sm mt-2"
              >
                + Add Lesson
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addModule}
          className="text-blue-600 hover:text-blue-800"
        >
          + Add Module
        </button>

        <button
          type="submit"
          disabled={loading}
          className="button w-full"
        >
          {loading ? 'Creating Course...' : 'Create Course'}
        </button>
      </form>
    </div>
  );
};

export default AddModule; 