# NUTRI-CONNECT DEPLOYMENT

This project consists of a backend and frontend setup. The backend is a Node.js-based server, while the frontend is a React application :

## Deployment

### Vercel

- **Frontend**: [Live Demo](https://nutri-connect-frontend.vercel.app)
- **Backend**: [API](https://nutri-connect-backend.vercel.app)

### Render

- **Frontend**: [Live Demo](https://nutri-connect-frontend.onrender.com)
- **Backend**: [API](https://nutri-connect-backend.onrender.com)

- **`backend/`**: Root directory for the backend.

  - **`node_modules/`**: Contains backend dependencies.
  - **`public/`**: Holds static files served by the backend.
  - **`src/`**: Contains backend source code.
    - **`controllers/`**: Houses logic for handling requests.
    - **`db/`**: Database-related files or configurations.
    - **`middlewares/`**: Middleware functions for request processing.
    - **`models/`**: Data models (e.g., for database schemas).
    - **`routes/`**: Defines API endpoints.
    - **`utils/`**: Utility functions or helpers.
    - **`app.js`**: Main application file.
    - **`constants.js`**: Constant values used across the backend.
    - **`index.js`**: Entry point for the backend server.
  - **`.env` and `.env-sample`**: Environment variable files.
  - **`.gitignore`**: Files/folders to exclude from version control.
  - **`.prettierrc` and `.prettierrignore`**: Prettier configuration for code formatting.
  - **`package-lock.json` and `package.json`**: Manage dependencies and scripts.
  - **`Readme.md`**: Project documentation.

- **`frontend/`**: (Based on the previous image, as no new `frontend` details are provided.)
  - **`node_modules/`**: Contains frontend dependencies.
  - **`public/`**: Holds static files like `index.html`.
  - **`src/`**: Contains React source code (e.g., components, styles).
  - **`.gitignore`**: Files/folders to exclude from version control.
  - **`eslint.config.js`**: Linting configuration.
  - **`index.html`**: Main HTML file.
  - **`package-lock.json` and `package.json`**: Manage frontend dependencies.

=======
This Repo Contains all React Files
=======

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Deployment Guide

### VERCEL Deployment

#### Frontend Deployment on Vercel

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the repository and click "Import"

3. **Configure Build Settings**
   - **Framework Preset**: Select `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables** (if needed)
   - Go to Settings → Environment Variables
   - Add `VITE_API_URL=https://your-backend-api.vercel.app`
   - Click "Save"

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your frontend is live!

#### Backend Deployment on Vercel

1. **Prepare Backend for Vercel**
   - Create `vercel.json` in backend folder:
     ```json
     {
       "version": 2,
       "builds": [
         {
           "src": "src/index.js",
           "use": "@vercel/node"
         }
       ],
       "routes": [
         {
           "src": "/(.*)",
           "dest": "src/index.js"
         }
       ]
     }
     ```

2. **Go to Vercel Dashboard**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the repository and click "Import"

3. **Configure Build Settings**
   - **Root Directory**: `backend`
   - **Build Command**: (leave empty or `npm install`)
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`
   - **Start Command**: `node src/index.js`

4. **Add Environment Variables**
   - Go to Settings → Environment Variables
   - Add all variables from your `.env` file:
     ```
     MONGO_URI=your_mongodb_uri
     JWT_SECRET=your_jwt_secret
     PORT=5000
     NODE_ENV=production
     ```

5. **Deploy**
   - Click "Deploy"
   - Backend API is now live!

---

### RENDER Deployment

#### Frontend Deployment on Render (Static Site)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

2. **Go to [Render Dashboard](https://dashboard.render.com)**
   - Click "New" → "Static Site"
   - Connect your GitHub repository
   - Select your repository and branch

3. **Configure Settings**
   - **Name**: `nutri-connect-frontend` (or your choice)
   - **Branch**: `main`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Root Directory**: (leave empty)

4. **Add Environment Variables** (if needed)
   - Click "Environment"
   - Add `VITE_API_URL=https://your-backend-api.onrender.com`

5. **Deploy**
   - Click "Create Static Site"
   - Render will build and deploy
   - Your frontend is live at: `https://nutri-connect-frontend.onrender.com`

#### Backend Deployment on Render (Web Service)

1. **Create `render.yaml` in root directory** (optional, for infrastructure as code):
   ```yaml
   services:
     - type: web
       name: nutri-connect-backend
       env: node
       plan: free
       buildCommand: cd backend && npm install
       startCommand: cd backend && npm start
       envVars:
         - key: MONGO_URI
           value: your_mongodb_uri
         - key: JWT_SECRET
           value: your_jwt_secret
   ```

2. **Go to [Render Dashboard](https://dashboard.render.com)**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select your repository and branch

3. **Configure Settings**
   - **Name**: `nutri-connect-backend` (or your choice)
   - **Environment**: `Node`
   - **Region**: `Frankfurt` (or nearest to you)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (or `node src/index.js`)

4. **Add Environment Variables**
   - Click "Environment"
   - Add all variables:
     ```
     MONGO_URI = your_mongodb_connection_string
     JWT_SECRET = your_jwt_secret
     NODE_ENV = production
     PORT = 5000
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy
   - Your backend API is live at: `https://nutri-connect-backend.onrender.com`

---

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| CSS not loading | Ensure `base: '/'` in `vite.config.js` |
| CORS errors | Update backend CORS settings with frontend URL |
| Env variables not working | Verify spelling and case sensitivity |
| Build fails | Check `node_modules` isn't in git; add to `.gitignore` |
| API 404 errors | Update `VITE_API_URL` in frontend environment variables |

---

### Quick Reference Commands

```bash
# Local Testing
cd frontend && npm run dev        # Test frontend locally
cd ../backend && npm run dev      # Test backend locally

# Build for Production
cd frontend && npm run build      # Build frontend
cd backend && npm install         # Install backend dependencies

# Environment Variables
# Create .env file in backend:
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your_secret_key_here
NODE_ENV=production

# Create .env file in frontend (if needed):
VITE_API_URL=https://your-backend-api.onrender.com
```

---

### Useful Links
- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Node.js Best Practices](https://nodejs.org/en/docs/)
