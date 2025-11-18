# Quick Setup Guide

Follow these steps to get your EthioCal Admin Panel up and running.

## 1. Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Firebase project created
- [ ] Firebase Authentication enabled (Google provider)
- [ ] Firebase Remote Config enabled
- [ ] Firebase Cloud Messaging enabled

## 2. Update Admin Emails (5 minutes)

Edit `functions/src/index.ts`:

```typescript
function getAdminEmails(): string[] {
  return [
    "your-email@gmail.com",  // Replace with your email
    "admin@gmail.com",        // Add more emails as needed
  ];
}
```

## 3. Configure Firebase Project (5 minutes)

1. Update `.firebaserc`:
```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

2. Login to Firebase:
```bash
firebase login
```

## 4. Deploy Backend (5 minutes)

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

Note the function URLs after deployment.

## 5. Configure Frontend (5 minutes)

1. Create environment file:
```bash
cd web
cp .env.example .env.local
```

2. Edit `web/.env.local` with your Firebase credentials:
- Get them from Firebase Console > Project Settings > Your apps
- Update `REACT_APP_FUNCTIONS_BASE_URL` with your functions URL

## 6. Deploy Frontend (5 minutes)

```bash
cd web
npm install
npm run build
cd ..
firebase deploy --only hosting
```

## 7. Initialize Remote Config (2 minutes)

1. Go to Firebase Console > Remote Config
2. Add parameter: `config_holiday_offset`
3. Set default value: `[]`
4. Publish changes

## 8. Test Your Admin Panel

1. Visit your hosting URL: `https://your-project-id.web.app`
2. Sign in with an authorized Gmail account
3. Try creating a test configuration
4. Try sending a test notification

## Done! 🎉

Your admin panel is now live and ready to use.

## Need Help?

- Check `README.md` for detailed documentation
- Review Firebase Console logs for errors
- Verify all prerequisites are met
