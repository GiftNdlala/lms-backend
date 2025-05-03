import Assignments from '../pages/instructor/Assignments';
import ManageAssignments from '../pages/instructor/ManageAssignments';
import AssignmentList from '../pages/instructor/assignments/AssignmentList';
import CreateAssignment from '../pages/instructor/assignments/CreateAssignment';
import AssignmentDetail from '../pages/instructor/assignments/AssignmentDetail';

const instructorRoutes = [
  {
    path: '/dashboard/instructor/assignments',
    element: <Assignments />
  },
  {
    path: '/dashboard/instructor/assignments/:moduleId',
    element: <ManageAssignments />
  },
  {
    path: '/dashboard/instructor/assignments/list',
    element: <AssignmentList />
  },
  {
    path: '/dashboard/instructor/assignments/create',
    element: <CreateAssignment />
  },
  {
    path: '/dashboard/instructor/assignments/:id',
    element: <AssignmentDetail />
  }
];

export default instructorRoutes; 