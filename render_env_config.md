# 🔧 Render Environment Configuration

## 🚀 **Environment Variables for Render Service**

Copy and paste these into your Render service's Environment Variables section:

### **Essential Variables:**

| Variable Name | Value |
|--------------|-------|
| `DEBUG` | `False` |
| `SECRET_KEY` | `your-secret-key-here` |
| `ALLOWED_HOSTS` | `gas-learning-management-system.onrender.com,localhost,127.0.0.1` |

### **Database Variables:**

| Variable Name | Value |
|--------------|-------|
| `DB_NAME` | `lms_db_lf65` |
| `DB_USER` | `lms_user` |
| `DB_PASSWORD` | `dstMZicyMnW3TvFr7y00dIvevStmfECs` |
| `DB_HOST` | `dpg-d1t1vr6r433s73estut0-a.frankfurt-postgres.render.com` |
| `DB_PORT` | `5432` |

## 📋 **Step-by-Step Render Configuration**

### **1. Go to your Render Dashboard**
- Navigate to your web service
- Click on "Environment" tab

### **2. Add Environment Variables**
Add each variable from the tables above:

```bash
# Click "Add Environment Variable" for each:
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=gas-learning-management-system.onrender.com,localhost,127.0.0.1

DB_NAME=lms_db_lf65
DB_USER=lms_user
DB_PASSWORD=dstMZicyMnW3TvFr7y00dIvevStmfECs
DB_HOST=dpg-d1t1vr6r433s73estut0-a.frankfurt-postgres.render.com
DB_PORT=5432
```

### **3. Deploy Your Service**
- Click "Manual Deploy" or push to your connected repository
- Monitor the deployment logs

## 🧪 **Testing After Configuration**

Once deployed, test these endpoints:

```bash
# 1. Test basic connectivity
curl https://gas-learning-management-system.onrender.com/api/accounts/login/

# 2. Test login with POST
curl -X POST https://gas-learning-management-system.onrender.com/api/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","role":"student"}'
```

## 🔍 **Expected Results After Fix**

### **Before Database Fix:**
```json
{"detail":"connection failed: Connection refused"}
```

### **After Database Fix:**
```json
{"detail":"No active account found with the given credentials"}
```

The second response means your database is connected! The error is just that the test user doesn't exist.

## 🚨 **If You Still Get Connection Errors**

1. **Check Database Status in Render:**
   - Go to PostgreSQL service in Render
   - Verify it's "Available" (green status)

2. **Verify Database Connection String:**
   - Ensure all credentials match exactly
   - Check for typos in hostname

3. **Check Database Expiry:**
   - Your database expires: **August 17, 2025**
   - Upgrade to paid plan if needed

## ✅ **Success Indicators**

You'll know it's working when:
- ✅ No "Connection refused" errors
- ✅ Login returns credential validation errors (not connection errors)
- ✅ API endpoints respond with data

## 🔄 **Migration Commands**

After database connection is working, run:

```bash
# In Render console or deployment:
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
```

## 📞 **Support**

If you continue having issues:
1. Check Render PostgreSQL service logs
2. Verify all environment variables are set correctly
3. Ensure no typos in database credentials
4. Check if database service is in the same region (Frankfurt)