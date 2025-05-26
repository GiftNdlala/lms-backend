import Assignments from '../pages/instructor/Assignments';
import ManageAssignments from '../pages/instructor/ManageAssignments';
import AssignmentList from '../pages/instructor/assignments/AssignmentList';
import CreateAssignment from '../pages/instructor/assignments/CreateAssignment';
import AssignmentDetail from '../pages/instructor/assignments/AssignmentDetail';
import EditAssignment from '../pages/instructor/assignments/EditAssignment';
import ModuleContent from '../pages/instructor/ModuleContent';

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
  },
  {
    path: '/dashboard/instructor/assignments/:id/edit',
    element: <EditAssignment />
  },
  {
    path: '/dashboard/instructor/modules/:moduleId/content',
    element: <ModuleContent />
  }
];

export default instructorRoutes; 