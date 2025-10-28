# Demo Authentication Setup

## Overview
This document explains the demo authentication setup that allows users to enter the app with just an invite code, without needing to sign up or log in.

## How It Works
1. **Invite Code Entry**: Users enter the invite code `AFVH9` on the welcome screen
2. **Auto-Authentication**: If not already logged in, the app automatically signs in as a demo user
3. **Seamless Access**: Users are immediately taken to the main app without any sign-up/login forms

## Demo User Credentials
- **Email**: demo@locul.com
- **Password**: LoculDemo2024!
- **Status**: Active and confirmed
- **User ID**: cab4bcc7-4983-4e6d-9fab-76b0a7aaa8be

## Implementation Details

### Modified Files
- `app/(public)/invite-code.tsx`: Updated `handleConfirm` function to auto-authenticate with demo user

### Code Changes
When a user enters the correct invite code, the app now:
1. Checks if a session already exists
2. If no session, automatically signs in as `demo@locul.com` with the demo password
3. Redirects to protected routes once authenticated

### Fallback Behavior
- If demo login fails (user doesn't exist or password is wrong), users are redirected to the sign-up page
- This ensures the app always has a graceful fallback

## For Production
When you're ready to remove the demo authentication:

1. Update `app/(public)/invite-code.tsx` in the `handleConfirm` function:
```typescript
// Replace the auto-authentication logic:
} else {
  // User needs to sign up/in
  router.replace("/sign-up");
}
```

2. Optionally delete the demo user from Supabase if you no longer need it

## Testing
To test the demo flow:
1. Make sure you're logged out
2. Navigate to the invite code screen
3. Enter code: `AFVH9`
4. Click "Confirm"
5. You should be automatically signed in and taken to the main app

## Benefits
- ✅ Smooth demo experience - no sign-up forms during demos
- ✅ App remains fully functional with real authentication for production
- ✅ Easy to toggle on/off
- ✅ No breaking changes to existing authentication logic

