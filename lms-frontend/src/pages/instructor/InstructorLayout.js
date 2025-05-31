import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import LogoText from '../../components/LogoText';
import './InstructorStyles.css';
import { 
  DashboardIcon, 
  BookIcon, 
  AssignmentIcon, 
  PeopleIcon, 
  AccountBalanceWalletIcon,
  EmojiEventsIcon
} from '../../components/icons';

const menuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard/instructor'
  },
  {
    text: 'Modules',
    icon: <BookIcon />,
    path: '/dashboard/instructor/modules'
  },
  {
    text: 'All Quizzes',
    icon: <AssignmentIcon />,
    path: '/dashboard/instructor/quizzes'
  },
  {
    text: 'Assignments',
    icon: <AssignmentIcon />,
    subItems: [
      {
        text: 'All Assignments',
        path: '/dashboard/instructor/assignments'
      },
      {
        text: 'Create Assignment',
        path: '/dashboard/instructor/assignments/create'
      }
    ]
  },
  {
    text: 'Students',
    icon: <PeopleIcon />,
    subItems: [
      {
        text: 'All Students',
        path: '/dashboard/instructor/students'
      },
      {
        text: 'Add Student',
        path: '/dashboard/instructor/students/add'
      }
    ]
  },
  {
    text: 'E-Wallet',
    icon: <AccountBalanceWalletIcon />,
    path: '/dashboard/instructor/ewallet'
  },
  {
    text: 'Grade Students',
    icon: <EmojiEventsIcon />,
    path: '/dashboard/instructor/grade-students'
  },
  {
    text: 'Announcements',
    icon: <AssignmentIcon />,
    path: '/dashboard/instructor/announcements'
  }
];

const InstructorLayout = () => {
  const navigate = useNavigate();
  const [openSubMenu, setOpenSubMenu] = useState(null);

  const handleLogout = () => {
    // Clear auth token
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('role_data');
    navigate('/login/instructor');
  };

  const toggleSubMenu = (index) => {
    setOpenSubMenu(openSubMenu === index ? null : index);
  };

  return (
    <div className="instructor-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <LogoText variant="sidebar" />
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <div key={index} className="nav-item">
              {item.subItems ? (
                <>
                  <div 
                    className="nav-link"
                    onClick={() => toggleSubMenu(index)}
                  >
                    {item.icon}
                    {item.text}
                    <span className={`dropdown-arrow ${openSubMenu === index ? 'open' : ''}`}>
                      ▼
                    </span>
                  </div>
                  {openSubMenu === index && (
                    <div className="submenu">
                      {item.subItems.map((subItem, subIndex) => (
          <NavLink 
                          key={subIndex}
                          to={subItem.path}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
                          {subItem.text}
          </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
          <NavLink 
                  to={item.path} 
            className={({ isActive }) => isActive ? 'active' : ''}
          >
                  {item.icon}
                  {item.text}
          </NavLink>
              )}
            </div>
          ))}
        </nav>
        <button onClick={handleLogout} className="logout-button">
          <i className="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default InstructorLayout; 