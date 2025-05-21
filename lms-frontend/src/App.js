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
import ModulesList from './pages/instructor/ModulesList';
import StudentModules from './pages/student/StudentModules';
import StudentModuleDetail from './pages/student/ModuleDetail';
import Assignments from './pages/instructor/Assignments';
import ManageAssignments from './pages/instructor/ManageAssignments';
import AssignmentList from './pages/instructor/assignments/AssignmentList';
import CreateAssignment from './pages/instructor/assignments/CreateAssignment';
import AssignmentDetail from './pages/instructor/assignments/AssignmentDetail';
import StudentList from './pages/instructor/StudentList';
import InstructorEwallet from './pages/instructor/InstructorEwallet';
import ViewContent from './pages/student/ViewContent';
import EditModule from './pages/instructor/EditModule';


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
          <Route path="courses" element={<StudentCourses />} />
          <Route path="courses/:courseId" element={<StudentCourseDetails />} />
          <Route path="courses/:courseId/assignments/:assignmentId" element={<AssignmentSubmission />} />
          <Route path="assessments" element={<QuizAssessment />} />
          <Route path="announcements" element={<StudentAnnouncement />} />
          <Route path="announcements/:id" element={<StudentAnnouncementChat />} />
          <Route path="ewallet" element={<Ewallet />} />
          {/* New module routes */}
          <Route path="modules" element={<StudentModules />} />
          <Route path="modules/:moduleId" element={<StudentModuleDetail />} />
          <Route path="modules/:moduleId/quiz" element={<QuizAssessment />} />
          <Route path="modules/:moduleId/notifications" element={<StudentModuleDetail activeTab="notifications" />} />
          <Route path="student-modules" element={<StudentModules />} />
          <Route path="modules/new-venture-creation" element={<ViewContent />} />
        </Route>

        {/* Instructor routes */}
        <Route path="/dashboard/instructor" element={<InstructorLayout />}>
          <Route index element={<InstructorDashboard />} />
          <Route path="dashboard" element={<InstructorDashboard />} />
          
          {/* Module routes */}
          <Route path="modules" element={<ModulesList />} />
          <Route path="modules/create" element={<AddModule />} />
          <Route path="modules/:moduleId/edit" element={<EditModule />} />
          <Route path="modules/:moduleId/quiz" element={<QuizAssessment />} />
          
          {/* Assignment routes */}
          <Route path="assignments" element={<Assignments />} />
          <Route path="assignments/:moduleId" element={<ManageAssignments />} />
          <Route path="assignments/list" element={<AssignmentList />} />
          <Route path="assignments/create" element={<CreateAssignment />} />
          <Route path="assignments/:id" element={<AssignmentDetail />} />
          
          {/* Student routes */}
          <Route path="students" element={<StudentList />} />
          <Route path="students/add" element={<AddStudent />} />
          
          {/* Other routes */}
          <Route path="ewallet" element={<InstructorEwallet />} />
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





