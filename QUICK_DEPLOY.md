# 🚀 DEPLOYMENT TO RENDER - QUICK START

## Prerequisites
- GitHub account with your code pushed
- Render account (free at render.com)
- MySQL database (create on Render or use external)

---

## ⚡ 5-Minute Quick Deployment

### Step 1: Create MySQL Database
```
Render Dashboard → New → MySQL
Name: nexuschain-db
Region: Choose one
Keep default settings
→ Create → Copy connection string
```

### Step 2: Deploy Web Service
```
Render Dashboard → New → Web Service
→ Connect GitHub repo (nexuschain)
→ Choose main branch
```

### Step 3: Configure Service
```
Name: nexuschain
Environment: Docker
Region: (same as database)
Auto-deploy: Enable
→ Create Web Service
```

### Step 4: Set Environment Variables
Go to **Environment** tab and add:
```
DATABASE_URL=mysql://username:password@host:port/nexuschain
JWT_SECRET=<long-random-string>
OWNER_EMAIL=admin@example.com
```

### Step 5: Initialize Database
```
Click Shell tab
Run: npm run db:push
Wait for completion
```

### Step 6: Test
```
Visit: https://nexuschain.onrender.com
Should see your app
Check Logs if any issues
```

---

## 🔑 How to Generate JWT_SECRET

Run this command in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output → Paste in Render environment variables

---

## 📝 Environment Variables

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | `mysql://user:pass@host:3306/db` | From Render MySQL |
| `JWT_SECRET` | Long random string | Use command above |
| `OWNER_EMAIL` | your@email.com | Admin email |

---

## 🐛 Common Issues & Fixes

### Build Failed
- Check logs in Render dashboard
- Ensure package-lock.json is in repo
- Run `npm run build` locally to test

### Database Connection Error
- Verify DATABASE_URL is correct
- Run `npm run db:push` in Shell tab
- Check database is created

### App Not Starting
- Check logs for errors
- Verify all env variables are set
- Ensure port 3000 is available

### Deploy Failed
- Check build logs
- Ensure Dockerfile exists
- Verify all dependencies in package.json

---

## 📚 Detailed Resources

- **Full Guide**: See `DEPLOYMENT.md` for step-by-step
- **Checklist**: See `PRODUCTION_CHECKLIST.md` for verification
- **Render Docs**: https://render.com/docs
- **Support**: Check Render dashboard support chat

---

## ✅ Verification Checklist

After deployment:
- [ ] App loads at public URL
- [ ] No errors in logs
- [ ] Database migrations completed
- [ ] API endpoints respond
- [ ] Authentication works (if testing)

---

## 💰 Estimated Monthly Cost

| Service | Price |
|---------|-------|
| Web (Standard) | $7 |
| MySQL (Starter) | $15 |
| **Total** | ~$22/month |

---

## 🚀 Deploy Again (After Updates)

1. Update code locally
2. Commit and push to GitHub
3. Render auto-deploys (if enabled)
4. Or manually click "Redeploy" in dashboard

---

## 📞 Support

- Check logs in Render dashboard
- Verify environment variables
- Read DEPLOYMENT.md for troubleshooting
- Contact Render support if needed

---

**You're ready to deploy! 🎉**

Start with Step 1 above.
