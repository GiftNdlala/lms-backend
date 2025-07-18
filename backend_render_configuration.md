# 🚀 Backend Configuration Guide for Render Deployment

## 🎯 Quick Answer to Your Questions:

### 🔓 **Is the backend endpoint `/api/accounts/login/` live?**
**YES** - Your frontend expects: `POST /api/accounts/login/` (not `/auth/login/`)

**Test it:**
```bash
curl https://gas-learning-management-system.onrender.com/api/accounts/login/
```
Should return `405 (Method Not Allowed)` or `401`, **NOT** connection refused.

### 🔄 **CORS Configuration Status:**
Based on your current `settings.py`, you need to **ADD** your Render domain to CORS settings.

---

## 📋 **Required Backend Settings (settings.py)**

### 1. **ALLOWED_HOSTS Configuration**
```python
ALLOWED_HOSTS = [
    'gas-learning-management-system.onrender.com',  # Your Render backend domain
    'localhost',
    '127.0.0.1',
]
```

### 2. **CORS Configuration**
```python
CORS_ALLOWED_ORIGINS = [
    "https://gas-learning-management-system.onrender.com",  # Your frontend domain
    "http://localhost:3000",  # for development
    "http://127.0.0.1:3000",  # for development
]

# Enable credentials for JWT tokens
CORS_ALLOW_CREDENTIALS = True

# For testing purposes only (remove in production):
# CORS_ALLOW_ALL_ORIGINS = True  # ⚠️ Only for debugging!
```

### 3. **CSRF Configuration**
```python
CSRF_TRUSTED_ORIGINS = [
    "https://gas-learning-management-system.onrender.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

---

## 🔍 **Your Current API Endpoint Structure**

Based on your code, your frontend uses these endpoints:
- **Login:** `POST /api/accounts/login/` ✅
- **Token Refresh:** `POST /api/auth/token/refresh/` ✅
- **User Management:** `/api/accounts/users/` ✅
- **Courses:** `/api/courses/` ✅
- **Modules:** `/api/modules/` ✅

---

## 🌐 **Environment Variables for Render**

Set these environment variables in your Render dashboard:

```bash
# Required
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=gas-learning-management-system.onrender.com,localhost,127.0.0.1

# Database (if using PostgreSQL)
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432
```

---

## 🧪 **Testing Your Backend**

### Test Backend Connectivity:
```bash
# 1. Test if backend is reachable
curl https://gas-learning-management-system.onrender.com/api/docs/

# 2. Test login endpoint (should return 405 Method Not Allowed)
curl https://gas-learning-management-system.onrender.com/api/accounts/login/

# 3. Test CORS headers
curl -I -X OPTIONS https://gas-learning-management-system.onrender.com/api/accounts/login/ \
  -H "Origin: https://gas-learning-management-system.onrender.com"
```

### Expected Responses:
- **API Docs:** `200 OK` with Swagger UI
- **Login GET:** `405 Method Not Allowed` (correct - it only accepts POST)
- **CORS Options:** Should include `Access-Control-Allow-Origin` header

---

## 🔧 **Frontend Configuration**

Ensure your frontend has this environment variable:
```bash
REACT_APP_API_URL=https://gas-learning-management-system.onrender.com
```

---

## 🚨 **Common Issues & Solutions**

### Issue 1: "Connection Refused"
**Cause:** Backend not deployed or domain incorrect
**Solution:** Check Render deployment status and domain spelling

### Issue 2: "CORS Error"
**Cause:** Frontend domain not in `CORS_ALLOWED_ORIGINS`
**Solution:** Add your frontend domain to CORS settings

### Issue 3: "404 Not Found on /auth/login/"
**Cause:** Wrong endpoint - your API uses `/api/accounts/login/`
**Solution:** Your frontend is already correct - uses `/api/accounts/login/`

### Issue 4: "CSRF Token Missing"
**Cause:** CSRF protection blocking API calls
**Solution:** Add frontend domain to `CSRF_TRUSTED_ORIGINS`

---

## 📝 **Deployment Checklist**

- [ ] ✅ **ALLOWED_HOSTS** includes Render domain
- [ ] ✅ **CORS_ALLOWED_ORIGINS** includes frontend domain  
- [ ] ✅ **CSRF_TRUSTED_ORIGINS** includes frontend domain
- [ ] ✅ Environment variables set in Render
- [ ] ✅ Database configured (PostgreSQL recommended)
- [ ] ✅ Static files collected: `python manage.py collectstatic`
- [ ] ✅ Migrations applied: `python manage.py migrate`

---

## 🎯 **Your Specific Endpoint Verification**

Your Django URLs include:
```python
path('api/accounts/', include('accounts.urls')),  # Contains login/
```

Your accounts/urls.py includes:
```python
path('login/', login, name='login'),  # Creates /api/accounts/login/
```

**✅ Your backend endpoint is correctly configured as `/api/accounts/login/`**

---

## 🔄 **Quick Fix Commands**

If you need to update your settings.py quickly:

```python
# Add to your settings.py
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'gas-learning-management-system.onrender.com,localhost,127.0.0.1').split(',')

CORS_ALLOWED_ORIGINS = [
    "https://gas-learning-management-system.onrender.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CSRF_TRUSTED_ORIGINS = [
    "https://gas-learning-management-system.onrender.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

---

## 📞 **Next Steps**

1. **Update your `settings.py`** with the CORS and ALLOWED_HOSTS changes above
2. **Deploy to Render** 
3. **Test the endpoints** using the curl commands provided
4. **Verify frontend can connect** by checking browser network tab

Your API structure looks solid - the main issue is likely just the CORS configuration for your production domain! 🎉