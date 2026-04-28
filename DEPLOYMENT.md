# Render Deployment Guide for NexusChain

## Prerequisites

1. **GitHub Account** - Push your code to GitHub
2. **Render Account** - Sign up at https://render.com
3. **Database** - You have two options:
   - Use Render's MySQL database (recommended)
   - Use an external MySQL service (AWS RDS, PlanetScale, etc.)

---

## Step-by-Step Deployment Guide

### Step 1: Prepare Your Repository

1. Ensure your code is pushed to GitHub
2. The following files are already configured:
   - `Dockerfile` - Production-ready Docker image
   - `render.yaml` - Render deployment configuration
   - `package.json` - Build and start scripts configured

### Step 2: Set Up Database on Render

#### Option A: Use Render's MySQL Database (Recommended)

1. Go to https://dashboard.render.com
2. Click **New** → **MySQL**
3. Configure:
   - **Name**: `nexuschain-db`
   - **Database Name**: `nexuschain`
   - **Region**: Choose same as your web service
   - **Version**: 8.0

4. Once created, copy the connection string
   - Format: `mysql://username:password@hostname:port/database`

#### Option B: Use External Database

- PlanetScale: https://planetscale.com (free tier available)
- AWS RDS MySQL
- Any MySQL service with public connection

### Step 3: Deploy Web Service

1. Go to https://dashboard.render.com
2. Click **New** → **Web Service**
3. Click **Connect** next to your GitHub repository (or search for it)
4. Configure the service:
   - **Name**: `nexuschain`
   - **Environment**: `Docker`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Dockerfile Path**: `Dockerfile` (default)
   - **Auto-Deploy**: Enable (optional, for auto-deploy on push)

5. Click **Create Web Service**

### Step 4: Configure Environment Variables

Once the service is created, add these environment variables in the **Environment** section:

```
DATABASE_URL=mysql://username:password@hostname:port/nexuschain
JWT_SECRET=your-very-long-random-secret-key-at-least-32-characters
OWNER_EMAIL=your-admin-email@example.com
NODE_ENV=production
```

**Important**: 
- Replace `mysql://username:password@hostname:port/nexuschain` with your actual database connection string
- Generate a strong JWT_SECRET (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- The `NODE_ENV=production` is set automatically in render.yaml

### Step 5: Run Initial Database Setup

After the service builds successfully:

1. Go to your Render web service dashboard
2. Click on the **Shell** tab
3. Run database migrations:
   ```bash
   npm run db:push
   ```

   This will:
   - Create all necessary database tables
   - Set up the schema using Drizzle ORM

### Step 6: Verify Deployment

1. Your service should be live at: `https://nexuschain.onrender.com` (or your custom domain)
2. Check the **Logs** tab for any errors
3. Visit the URL in your browser to verify it's running

---

## Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@host:3306/nexuschain` |
| `JWT_SECRET` | Secret for signing JWTs | `your-long-random-string` |
| `OWNER_EMAIL` | Admin/owner email | `admin@example.com` |
| `NODE_ENV` | Environment mode | `production` |

---

## Build & Start Process

The deployment follows this flow:

1. **Build** (`npm run build`):
   - Vite builds the React frontend → `dist/public`
   - esbuild bundles the Node.js backend → `dist/boot.js`

2. **Start** (`npm start`):
   - Sets `NODE_ENV=production`
   - Runs the bundled backend: `node dist/boot.js`
   - Serves both API and frontend on port 3000

---

## Troubleshooting

### Build Fails

**Error**: `Cannot find module...`
- **Solution**: Ensure `npm ci` can install all dependencies. Check package-lock.json is committed.

### Database Connection Error

**Error**: `Error: Access denied for user...`
- **Solution**: 
  1. Verify DATABASE_URL is correct
  2. Ensure database is created
  3. Run `npm run db:push` via Shell tab
  4. Check database credentials

### Port 3000 Issues

**Error**: `Port 3000 already in use`
- **Solution**: Render automatically handles this. If custom port needed, modify vite.config.ts and Dockerfile.

### Health Check Failing

- **Solution**: Render checks the root path `/`. Ensure your API serves the frontend at this path.

---

## Database Schema Initialization

The first time you deploy, you need to initialize the database:

1. **Via Render Shell** (Recommended):
   ```bash
   npm run db:push
   ```

2. **Or configure auto-migration in boot.ts**:
   - Add database migration logic to startup

---

## Production Best Practices

✅ **Already Configured**:
- Docker multi-stage builds for smaller image size
- Node.js Alpine image for minimal overhead
- Production build optimization
- Proper environment variable handling

✅ **Recommended Additional Steps**:

1. **Enable Auto-Deploy**: In Render dashboard, enable auto-deploy on GitHub push
2. **Set Up Custom Domain**: Go to Service Settings → Custom Domains
3. **Enable HTTPS**: Render provides free SSL/TLS
4. **Configure Backups**: 
   - If using Render MySQL, enable automated backups
   - Or schedule manual backups of external database
5. **Monitor Logs**: Set up alerts for errors in Render dashboard

---

## Scaling

By default, the service uses 1 instance on the Standard plan. To scale:

1. In Render dashboard, go to **Settings**
2. Adjust **Plan** or **Number of Instances**
3. Increase for higher traffic/performance

---

## Cost Estimation (Approximate)

| Component | Plan | Cost |
|-----------|------|------|
| Web Service | Standard | $7/month |
| MySQL Database | Starter | $15/month |
| **Total** | - | **$22+/month** |

*Prices as of 2026. Check Render pricing for current rates.*

---

## Rollback Procedure

If deployment has issues:

1. Go to Render Dashboard → Your Service
2. Click **Deployments** tab
3. Click **Redeploy** next to a previous working version
4. The service will rebuild and deploy from that commit

---

## Local Testing Before Deployment

Test locally first:

```bash
# Install dependencies
npm install

# Run database setup (requires running MySQL)
npm run db:push

# Build the production bundle
npm run build

# Start in production mode
npm start
```

Then visit `http://localhost:3000`

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Docker Docs**: https://docs.docker.com
- **Vite Docs**: https://vite.dev
- **Hono Docs**: https://hono.dev
- **Drizzle ORM**: https://orm.drizzle.team

---

## Quick Reference Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Database service created (MySQL)
- [ ] Database connection string copied
- [ ] Web service created and connected to GitHub
- [ ] Environment variables configured
- [ ] Service deployed successfully
- [ ] Database migrations run (`npm run db:push` via Shell)
- [ ] Application accessible at public URL
- [ ] Logs checked for errors
