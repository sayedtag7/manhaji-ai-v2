# 🚀 Manhaji.ai - Docker Quick Start (Ultra-Simple)

## Step 1: Install Docker Desktop
Download from https://docker.com/get-started/ and install.

## Step 2: Start Everything
```powershell
cd e:\abilitopa\Manhaji.ai
docker-compose up --build
```

## Step 3: Initialize Database (First Time Only)
```powershell
# In new terminal window:
docker-compose exec backend npm run db:push
docker-compose exec backend npm run db:seed
```

## Step 4: Open App
Go to http://localhost:3000

---

## ✅ What You Get
- ✅ Frontend: http://localhost:3000
- ✅ Backend API: http://localhost:5000/api
- ✅ Database: PostgreSQL (automatic)
- ✅ All dependencies installed automatically
- ✅ No Node.js installation needed!

## 🛑 Stop Everything
```powershell
docker-compose down
```

## 🔄 Restart After Code Changes
Just save your files - changes reload automatically!

## 🐛 Problems?
```powershell
# View logs
docker-compose logs -f

# Start fresh
docker-compose down -v
docker-compose up --build
```

That's it! Simple as that. 🎉
