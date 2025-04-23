// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoleSelect from './pages/RoleSelect';
import LoginInstructor from './pages/LoginInstructor';
import LoginStudent from './pages/LoginStudent';
import LoginFunder from './pages/LoginFunder';
import StudentLayout from './pages/StudentLayout';
import StudentDashboard from './pages/TempStudentDashboard';
import StudentProfile from './pages/Studentprofile';
import StudentGrades from './pages/StudentGrades';
import StudentGradesSub from './pages/StudentGradesSub';
import Messages from './pages/Messages';
import MessaageChat from './pages/MessaageChat';
import SignOut from './pages/SignOut'; 
import StudentCourses from './pages/StudentCourses'; 
import StudentCourseDetails from './pages/StudentCourseDetails';
import QuizAssessment from './pages/QuizAssessment';
import StudentAnnouncement from './pages/StudentAnnouncement';
import StudentAnnouncementChat from './pages/StudentAnnouncementChat';
import Ewallet from './pages/ewallet';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RoleSelect />} />
        <Route path="/select-role" element={<RoleSelect />} />
        <Route path="/login/instructor" element={<LoginInstructor />} />
        <Route path="/login/student" element={<LoginStudent />} />
        <Route path="/login/funder" element={<LoginFunder />} />
        <Route path="/signout" element={<SignOut />} /> 
        
      
        {/* Student Routes */}
        <Route path="/dashboard/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="grades" element={<StudentGrades />} />
          <Route path="grades/details/:courseId" element={<StudentGradesSub />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/chat/:id" element={<MessaageChat />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="courses/:courseId" element={<StudentCourseDetails />} />
          <Route path="assessments" element={<QuizAssessment />} />
          <Route path="announcements" element={<StudentAnnouncement />} />
          <Route path="announcements/:id" element={<StudentAnnouncementChat />} />
          <Route path="ewallet" element={<Ewallet />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;





