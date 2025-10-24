# Pocket Guide Web - Deployment Guide

## 🚀 Quick Deploy to Vercel

### Prerequisites
- Vercel account (free tier available)
- GitHub account with repository pushed
- Firebase project with credentials

### Step 1: Push to GitHub (if not already done)

```bash
cd pocket-guide-web
git push origin main
```

### Step 2: Create Vercel Project

Option A: Using Vercel Dashboard
1. Go to https://vercel.com
2. Click "New Project"
3. Import GitHub repository
4. Select the `pocket-guide-web` folder as root directory
5. Click "Deploy"

Option B: Using Vercel CLI (Recommended)
```bash
npm i -g vercel
vercel
```
Then follow the prompts to deploy.

### Step 3: Configure Environment Variables

In Vercel Project Settings → Environment Variables, add:

```
VITE_FIREBASE_PROJECT_ID = your_project_id
VITE_FIREBASE_API_KEY = your_api_key
VITE_FIREBASE_AUTH_DOMAIN = your_project_id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL = https://your_project_id.firebaseio.com
VITE_FIREBASE_STORAGE_BUCKET = your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = your_messaging_sender_id
VITE_FIREBASE_APP_ID = your_app_id
VITE_FIREBASE_MEASUREMENT_ID = your_measurement_id
VITE_GEMINI_API_KEY = your_gemini_api_key
VITE_GOOGLE_MAPS_API_KEY = your_google_maps_api_key
```

Get these values from:
- **Firebase:** Firebase Console → Project Settings
- **Gemini:** Google AI Studio (https://ai.google.dev/)
- **Google Maps:** Google Cloud Console → APIs & Services

### Step 4: Configure Firebase Auth

In Firebase Console:
1. Go to Authentication → Settings
2. Add your Vercel domain to Authorized Domains:
   - `your-project.vercel.app`
   - `your-custom-domain.com` (if using custom domain)

### Step 5: Verify Deployment

After deployment:
1. Visit your Vercel URL
2. Test login flow with Google Sign-In
3. Test creating a new trip
4. Check browser console for any errors

## 📋 Production Checklist

- [ ] Firebase environment variables added to Vercel
- [ ] Firebase Auth domain whitelist updated
- [ ] Service Worker active (check DevTools → Application)
- [ ] PWA installable (check DevTools → Manifest)
- [ ] Login flow works end-to-end
- [ ] Trip creation works with Gemini
- [ ] Dark mode toggles correctly
- [ ] Mobile responsive (test on DevTools)

## 🔍 Troubleshooting

### Build fails on Vercel
- Check that all environment variables are set
- Verify Node.js version compatibility
- Check build logs in Vercel dashboard

### Firebase Auth not working
- Verify domain is in Firebase Auth whitelist
- Check .env variables match Firebase project exactly
- Ensure CORS settings are correct in Firebase

### PWA not installing
- Service Worker must be on HTTPS (Vercel provides this)
- Check manifest.webmanifest is served correctly
- Verify icons are accessible

## 📊 Performance Tips

The Vite build includes optimizations:
- Tree-shaking: Unused code removed automatically
- Code splitting: Large dependencies (Firebase) split into separate chunks
- Minification: CSS and JS minified for production
- Service Worker: Offline support and instant page reloads

Typical page load: <2s on 4G

## 🔄 Redeployment

To redeploy after code changes:

```bash
git push origin main
```

Vercel automatically redeploys on push to main branch.

## 📞 Support

For issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Check Firebase project quotas and limits
