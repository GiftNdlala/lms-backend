# 🔗 Frontend-Backend Connection Guide

Your Django backend is now **live and deployed** on Render! Here's how to connect your React frontend to the production backend.

## ✅ What's Already Done

### Backend (Deployed) ✅
- **URL**: https://gas-learning-management-system.onrender.com
- **Status**: ✅ Live and running on Gunicorn
- **Database**: ✅ PostgreSQL connected with 62 tables
- **Static Files**: ✅ Collected and served (162 files)

### Frontend Configuration ✅
- **Environment Variables**: Set up in `lms-frontend/.env`
- **API Service**: Already configured with Axios
- **CORS**: Configured for local development
- **Test Component**: Added for connection testing

## 🚀 Steps to Connect Frontend

### 1. **Install Frontend Dependencies**
```bash
cd lms-frontend
npm install
```

### 2. **Test API Connection**
```bash
# Start the React development server
npm start

# Visit the test page in your browser
http://localhost:3000/test-api
```

### 3. **Environment Configuration**
Your `.env` file in `lms-frontend/` contains:
```ini
REACT_APP_API_URL=https://gas-learning-management-system.onrender.com
REACT_APP_API_VERSION=v1
REACT_APP_ENV=production
REACT_APP_DEBUG=false
```

### 4. **Update CORS for Production** (If Deploying Frontend)
When you deploy your frontend, update the backend's CORS settings:

```python
# In settings.py, add your frontend domain:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://your-frontend-domain.onrender.com",  # Add this
]
```

## 🔧 API Endpoints Available

Your backend provides these API endpoints:

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/token/refresh/` - Token refresh
- `POST /api/auth/users/` - User registration

### Student APIs
- `GET /api/student/profile/` - Get student profile
- `GET /api/student/courses/` - Get enrolled courses
- `GET /api/student/grades/` - Get grades
- `POST /api/student/assignments/submit/` - Submit assignment

### Instructor APIs
- `GET /api/instructor/students/` - Get students list
- `POST /api/instructor/students/` - Add new student
- `GET /api/instructor/modules/` - Get modules
- `POST /api/instructor/modules/` - Create module

### Course Management
- `GET /api/courses/` - List courses
- `GET /api/courses/{id}/` - Course details
- `GET /api/modules/` - List modules
- `GET /api/assessments/` - List assessments

## 🧪 Testing the Connection

### Using the Test Component
1. Start your frontend: `npm start`
2. Visit: `http://localhost:3000/test-api`
3. Check for green "✅ Backend Connection Successful!" message

### Manual API Testing
```javascript
// Test API call in browser console
fetch('https://gas-learning-management-system.onrender.com/admin/')
  .then(response => console.log('Status:', response.status))
  .catch(error => console.error('Error:', error));
```

## 🚨 Troubleshooting

### Common Issues & Solutions

1. **CORS Error**
   ```
   Error: Access to fetch blocked by CORS policy
   ```
   **Solution**: Add your frontend domain to CORS_ALLOWED_ORIGINS in backend settings.py

2. **Network Error**
   ```
   Error: Network Error
   ```
   **Solution**: Check if backend URL is correct and backend is running.

3. **404 Not Found**
   ```
   Error: 404 Not Found
   ```
   **Solution**: Verify API endpoint URLs and ensure they exist in Django URLs.

4. **Authentication Issues**
   ```
   Error: 401 Unauthorized
   ```
   **Solution**: Check JWT token implementation and ensure tokens are properly stored.

## 📱 Development vs Production

### Development Mode
```bash
# Use local backend
REACT_APP_API_URL=http://localhost:8000

# Start both servers
# Terminal 1: Backend
cd /path/to/backend
python manage.py runserver

# Terminal 2: Frontend  
cd lms-frontend
npm start
```

### Production Mode
```bash
# Use deployed backend
REACT_APP_API_URL=https://gas-learning-management-system.onrender.com

# Frontend only (backend already deployed)
cd lms-frontend
npm start
```

## 🚀 Next Steps

### For Local Development
1. ✅ Frontend connects to deployed backend (current setup)
2. Test all major features (login, courses, assignments)
3. Fix any API integration issues

### For Production Deployment
1. Deploy frontend to Render/Netlify/Vercel
2. Update CORS settings with frontend domain
3. Set production environment variables
4. Test end-to-end functionality

## 📊 Connection Status

- **Backend**: ✅ Deployed and Running
- **Database**: ✅ PostgreSQL Connected
- **Frontend Config**: ✅ Environment Variables Set
- **API Services**: ✅ Axios Configured
- **CORS**: ✅ Configured for Development
- **Test Route**: ✅ Available at `/test-api`

Your LMS is now ready for full-stack development! 🎓

---

**Quick Test**: Visit `http://localhost:3000/test-api` after running `npm start` to verify the connection!