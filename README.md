# EthioCal Admin Panel

A complete Firebase-based admin panel for managing Remote Config and Cloud Messaging for EthioCal mobile applications (Android & iOS).

## Features

### 🔐 Authentication
- Gmail-based authentication using Firebase Auth
- Hard-coded admin email whitelist for authorization
- Only authorized admins can access the panel

### ⚙️ Remote Config Management
- View all holiday offset configurations
- Edit existing configurations
- Add new configurations
- Delete configurations
- Real-time updates to Firebase Remote Config

### 📱 Push Notifications
- Send notifications to Android/iOS apps
- Support for debug and production variants
- Topic-based messaging (broadcast to all users)
- Token-based messaging (specific device)
- Rich notification support with images, actions, and categories

## Architecture

```
EthioCal-FirebaseAdmin/
├── functions/              # Firebase Cloud Functions (Backend)
│   ├── src/
│   │   └── index.ts       # Three HTTPS functions + auth middleware
│   ├── package.json
│   └── tsconfig.json
├── web/                   # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── RemoteConfigManager.tsx
│   │   │   ├── EditConfigModal.tsx
│   │   │   └── MessagingPanel.tsx
│   │   ├── App.tsx
│   │   ├── firebase.ts
│   │   ├── api.ts
│   │   └── types.ts
│   └── package.json
├── firebase.json          # Firebase configuration
└── .firebaserc           # Firebase project ID
```

## Setup Instructions

### Prerequisites

1. Node.js 18 or higher
2. Firebase CLI: `npm install -g firebase-tools`
3. A Firebase project with:
   - Firebase Authentication enabled (Google provider)
   - Firebase Remote Config enabled
   - Firebase Cloud Messaging enabled

### Step 1: Firebase Project Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)

2. Enable Firebase Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Google" provider

3. Enable Firebase Remote Config:
   - Go to Remote Config
   - Create a new parameter called `config_holiday_offset`
   - Set default value to: `[]` (empty array)

4. Enable Firebase Cloud Messaging:
   - Go to Cloud Messaging

5. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll to "Your apps" and add a web app
   - Copy the Firebase config object

### Step 2: Update Admin Email List

Edit `functions/src/index.ts` and update the admin email list:

```typescript
function getAdminEmails(): string[] {
  return [
    "your-email@gmail.com",
    "admin@gmail.com",
    // Add more authorized emails here
  ];
}
```

### Step 3: Configure Firebase Project

1. Update `.firebaserc` with your Firebase project ID:

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

### Step 4: Deploy Cloud Functions

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

After deployment, note the URLs of your functions:
- `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/getRemoteConfig`
- `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/updateRemoteConfig`
- `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/sendMessage`

### Step 5: Configure Frontend

1. Create `web/.env.local` based on `web/.env.example`:

```bash
cd web
cp .env.example .env.local
```

2. Edit `web/.env.local` with your Firebase configuration:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FUNCTIONS_BASE_URL=https://us-central1-your-project-id.cloudfunctions.net
```

### Step 6: Build and Deploy Frontend

```bash
cd web
npm install
npm run build
cd ..
firebase deploy --only hosting
```

Your admin panel will be available at:
`https://your-project-id.web.app`

## Local Development

### Run Cloud Functions Locally

```bash
cd functions
npm run serve
```

Functions will be available at `http://localhost:5001/YOUR_PROJECT_ID/us-central1/`

### Run Frontend Locally

1. Update `web/.env.local` to use local functions:

```env
REACT_APP_FUNCTIONS_BASE_URL=http://localhost:5001/your-project-id/us-central1
```

2. Start the development server:

```bash
cd web
npm start
```

The app will open at `http://localhost:3000`

## API Reference

### Cloud Functions

#### 1. Get Remote Config

**Endpoint:** `GET /getRemoteConfig`

**Headers:**
```
Authorization: Bearer {firebase-id-token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "offset_description": "Holiday offset configuration for 2025",
      "offset_eid_al_adha": 0,
      "offset_eid_al_fitr": 0,
      "offset_mawlid": 0,
      "offset_greg_year": 2025,
      "offset_ethio_year": 2018,
      "offset_hirji_year": 1445,
      "offset_stage": "dev",
      "offset_update_timestamp": 1762745586832
    }
  ],
  "email": "admin@gmail.com"
}
```

#### 2. Update Remote Config

**Endpoint:** `POST /updateRemoteConfig`

**Headers:**
```
Authorization: Bearer {firebase-id-token}
Content-Type: application/json
```

**Body:**
```json
{
  "configArray": [
    {
      "offset_description": "Holiday offset configuration for 2025",
      "offset_eid_al_adha": 0,
      "offset_eid_al_fitr": 0,
      "offset_mawlid": 0,
      "offset_greg_year": 2025,
      "offset_ethio_year": 2018,
      "offset_hirji_year": 1445,
      "offset_stage": "prod"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Remote config updated successfully",
  "version": "123",
  "email": "admin@gmail.com"
}
```

#### 3. Send Cloud Message

**Endpoint:** `POST /sendMessage`

**Headers:**
```
Authorization: Bearer {firebase-id-token}
Content-Type: application/json
```

**Body (Topic):**
```json
{
  "topic": "android-prod",
  "title": "መስቀል Tomorrow!",
  "body": "Meskel celebration begins tomorrow.",
  "category": "HOLIDAY",
  "priority": "HIGH",
  "actionType": "IN_APP_HOLIDAY",
  "actionTarget": "meskel_2024",
  "actionLabel": "Learn More",
  "imageUrl": "https://example.com/meskel.jpg"
}
```

**Body (Token):**
```json
{
  "token": "device-fcm-token-here",
  "title": "Test Notification",
  "body": "This is a test message"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "projects/your-project/messages/0:1234567890",
  "sentTo": "android-prod",
  "email": "admin@gmail.com"
}
```

## Remote Config Schema

### Holiday Offset Configuration

```typescript
{
  offset_description: string;        // Description of the config
  offset_eid_al_adha: number;       // Days offset for Eid al-Adha
  offset_eid_al_fitr: number;       // Days offset for Eid al-Fitr
  offset_mawlid: number;            // Days offset for Mawlid
  offset_greg_year: number;         // Gregorian year
  offset_ethio_year: number;        // Ethiopian year
  offset_hirji_year: number;        // Hijri year
  offset_stage: string;             // "dev", "staging", or "prod"
  offset_update_timestamp?: number; // Unix timestamp (auto-set)
}
```

## Message Schema

### Required Fields
- `title` (string): Notification title
- `body` (string): Notification message

### Optional Fields
- `category`: "HOLIDAY" | "SEASONAL" | "DAILY_INSIGHT" | "APP_UPDATE" | "GENERAL"
- `priority`: "LOW" | "NORMAL" | "HIGH"
- `actionType`: "URL" | "IN_APP_HOLIDAY" | "IN_APP_EVENT" | "IN_APP_CONVERTER" | "IN_APP_SETTINGS"
- `actionTarget` (string): URL or screen identifier
- `actionLabel` (string): Button text
- `imageUrl` (string): Image URL for rich notifications

## App Variants

The admin panel supports four app variants:

1. **android-debug**: Android debug builds
2. **android-prod**: Android production builds
3. **ios-debug**: iOS debug builds
4. **ios-prod**: iOS production builds

Each variant has a default topic for broadcasting notifications.

## Security

### Authorization Flow

1. User signs in with Google
2. Frontend gets Firebase ID token
3. ID token is sent with every API request
4. Cloud Functions verify the token
5. Email is extracted and checked against whitelist
6. If authorized, request proceeds; otherwise returns 403

### Admin Email Whitelist

Only emails listed in `getAdminEmails()` function (in `functions/src/index.ts`) can:
- View remote configs
- Update remote configs
- Send push notifications

**To add/remove admins:** Edit the function and redeploy:

```bash
firebase deploy --only functions
```

## Troubleshooting

### Functions deployment fails
- Ensure you're using Node.js 18
- Run `npm install` in the functions directory
- Check `firebase.json` configuration

### Frontend can't connect to functions
- Verify `REACT_APP_FUNCTIONS_BASE_URL` in `.env.local`
- Check CORS is enabled (already configured in functions)
- Verify the user is authenticated

### Authorization fails (403)
- Check the user's email is in the admin whitelist
- Redeploy functions after updating the email list
- Verify Firebase ID token is being sent correctly

### Remote Config not updating
- Ensure the parameter `config_holiday_offset` exists in Firebase Console
- Check function logs: `firebase functions:log`
- Verify you have permissions in Firebase project

## Mobile App Integration

### Android

1. Subscribe to topics in your app:

```kotlin
FirebaseMessaging.getInstance().subscribeToTopic("android-prod")
```

2. Fetch Remote Config:

```kotlin
val remoteConfig = FirebaseRemoteConfig.getInstance()
remoteConfig.fetchAndActivate().addOnCompleteListener { task ->
    if (task.isSuccessful) {
        val configJson = remoteConfig.getString("config_holiday_offset")
        // Parse JSON array
    }
}
```

### iOS

1. Subscribe to topics:

```swift
Messaging.messaging().subscribe(toTopic: "ios-prod")
```

2. Fetch Remote Config:

```swift
let remoteConfig = RemoteConfig.remoteConfig()
remoteConfig.fetch { status, error in
    remoteConfig.activate()
    let configJson = remoteConfig.configValue(forKey: "config_holiday_offset").stringValue
    // Parse JSON
}
```

## License

This project is part of the EthioCal application.

## Support

For issues or questions, please contact the project maintainers.
