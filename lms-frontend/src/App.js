// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import RoleSelect from './pages/RoleSelect';
import LoginFunder from './pages/LoginFunder';
import LoginStudent from './pages/LoginStudent';
import LoginInstructor from './pages/LoginInstructor';
import StudentLayout from './pages/StudentLayout';
import StudentDashboard from './pages/TempStudentDashboard';
import StudentProfile from './pages/Studentprofile';
import StudentGrades from './pages/StudentGrades';
import StudentGradesSub from './pages/StudentGradesSub';
import Messages from './pages/Messages';
import MessaageChat from './pages/MessaageChat';
import Logout from './pages/logout';
import StudentCourses from './pages/StudentCourses';
import StudentCourseDetails from './pages/StudentCourseDetails';
import AssignmentSubmission from './pages/AssignmentSubmission';
import QuizAssessment from './pages/QuizAssessment';
import StudentAnnouncement from './pages/StudentAnnouncement';
import StudentAnnouncementChat from './pages/StudentAnnouncementChat';
import Ewallet from './pages/ewallet';
import AddStudent from './pages/instructor/AddStudent';
import AddModule from './pages/instructor/AddModule';
import GradeStudent from './pages/instructor/GradeStudent';
import InstructorLayout from './pages/instructor/InstructorLayout';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import AnnouncementSystem from './pages/instructor/AnnouncementSystem';
import Login from './pages/Login';
import ModulesList from './pages/instructor/ModulesList';
import ModuleDetail from './pages/instructor/ModuleDetail';
// Import new student module components
import StudentModulesList from './pages/student/ModulesList';
import StudentModuleDetail from './pages/student/ModuleDetail';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/select-role" replace />} />
        <Route path="/select-role" element={<RoleSelect />} />
        <Route path="/login/instructor" element={<LoginInstructor />} />
        <Route path="/login/student" element={<LoginStudent />} />
        <Route path="/login/funder" element={<LoginFunder />} />
        <Route path="/logout" element={<Logout />} />

        {/* Student routes */}
        <Route path="/dashboard/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="grades" element={<StudentGrades />} />
          <Route path="grades/details/:courseId" element={<StudentGradesSub />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/chat/:id" element={<MessaageChat />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="courses/:courseId" element={<StudentCourseDetails />} />
          <Route path="courses/:courseId/assignments/:assignmentId" element={<AssignmentSubmission />} />
          <Route path="assessments" element={<QuizAssessment />} />
          <Route path="announcements" element={<StudentAnnouncement />} />
          <Route path="announcements/:id" element={<StudentAnnouncementChat />} />
          <Route path="ewallet" element={<Ewallet />} />
          {/* New module routes */}
          <Route path="modules" element={<StudentModulesList />} />
          <Route path="modules/:moduleId" element={<StudentModuleDetail />} />
          <Route path="modules/:moduleId/quiz" element={<QuizAssessment />} />
          <Route path="modules/:moduleId/notifications" element={<StudentModuleDetail activeTab="notifications" />} />
        </Route>

        {/* Instructor routes */}
        <Route path="/dashboard/instructor" element={<InstructorLayout />}>
          <Route index element={<InstructorDashboard />} />
          <Route path="dashboard" element={<InstructorDashboard />} />
          <Route path="modules" element={<ModulesList />} />
          <Route path="modules/:moduleId" element={<ModuleDetail />} />
          <Route path="modules/:moduleId/quiz" element={<QuizAssessment />} />
          <Route path="add-module" element={<AddModule />} />
          <Route path="add-student" element={<AddStudent />} />
          <Route path="grade-students" element={<GradeStudent />} />
          <Route path="announcements" element={<AnnouncementSystem />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/select-role" replace />} />
      </Routes>
    </Router>
  );
}

export default App;





