# Page Refresh Authentication Fix

## Problem
When refreshing a page in production (`/grn-transfer/`), users are being redirected back to the landing page and losing their authentication state, even though they were previously logged in.

## Root Causes

1. **`storeAuthStateInCookie` was set to `false`**: This prevented MSAL from storing auth state in cookies, which are more reliable across page refreshes in production environments.

2. **Missing `navigateToLoginRequestUrl` configuration**: This flag ensures MSAL navigates back to the original requested URL after authentication.

3. **Incomplete active account restoration**: The protected route wasn't properly restoring the active account from the redirect response.

## Changes Made

### 1. Updated `src/lib/msal.ts`

**Before:**
```typescript
cache: {
  cacheLocation: "localStorage",
  storeAuthStateInCookie: false,
}
```

**After:**
```typescript
auth: {
  // ... existing config
  navigateToLoginRequestUrl: true,  // NEW
},
cache: {
  cacheLocation: "localStorage",
  storeAuthStateInCookie: true,  // CHANGED from false
}
```

**Why this helps:**
- `storeAuthStateInCookie: true` - Stores auth state in cookies as a fallback, which persists better across page refreshes
- `navigateToLoginRequestUrl: true` - Ensures users return to the page they were trying to access after login

### 2. Enhanced `src/routes/_protected/route.tsx`

**Added:**
- Proper handling of redirect response from MSAL
- Setting active account from redirect response
- Better error handling with try-catch
- Console logging for debugging

**Key improvements:**
```typescript
const redirectResponse = await msalInstance.handleRedirectPromise()

if (redirectResponse) {
  msalInstance.setActiveAccount(redirectResponse.account)
}

const accounts = msalInstance.getAllAccounts()

if (accounts.length > 0 && !msalInstance.getActiveAccount()) {
  msalInstance.setActiveAccount(accounts[0])
}

const activeAccount = msalInstance.getActiveAccount()
const isAuthenticated = activeAccount !== null
```

## Testing Steps

### 1. Build and Deploy

```bash
# In grn-local directory
npm run build

# Copy dist/ contents to c:\Users\Gboyega\dev\fc-vimp\html\grn-transfer\
# Ensure .htaccess is included
```

### 2. Test Scenarios

**Scenario A: Fresh Login**
1. Clear browser cache and cookies
2. Navigate to production URL
3. Click "GRN (Stock Transfer)" button
4. Complete Azure AD login
5. Verify you land on the Create GRN page
6. **Refresh the page (F5 or Ctrl+R)**
7. ✅ **Expected**: Page reloads and stays on Create GRN
8. ❌ **Previous behavior**: Redirected to landing page

**Scenario B: Deep Link Refresh**
1. While logged in, navigate to `/grn-transfer/grn-history`
2. **Refresh the page**
3. ✅ **Expected**: Page reloads and stays on GRN History
4. ❌ **Previous behavior**: Redirected to landing page

**Scenario C: Browser Tab Close/Reopen**
1. Log in and navigate to any protected page
2. Close the browser tab (not the entire browser)
3. Reopen browser and navigate to the same URL
4. ✅ **Expected**: Still logged in, page loads normally
5. ❌ **Previous behavior**: Redirected to landing page

### 3. Browser Console Debugging

If issues persist, check the browser console (F12) for:

```
Console Logs to Look For:
- "No active account found, redirecting to login" - Auth state lost
- "Auth check error:" - Error during auth check
- MSAL errors related to token acquisition
```

**Check localStorage:**
```javascript
// In browser console
Object.keys(localStorage).filter(key => key.includes('msal'))
```

**Check cookies:**
```javascript
// In browser console
document.cookie
```

## Additional Considerations

### If Issue Persists

1. **Check Azure AD Redirect URIs**
   - Ensure production URL is registered: `https://your-domain.com/grn-transfer`
   - Check for trailing slash consistency

2. **Verify Environment Variables**
   - `VITE_MSAL_REDIRECT_URI` should match production URL exactly
   - `VITE_MSAL_AUTHORITY` should be correct tenant

3. **Browser Security Settings**
   - Some browsers block third-party cookies
   - Try in incognito/private mode
   - Check if localStorage is enabled

4. **HTTPS Requirement**
   - Azure AD requires HTTPS in production
   - Verify SSL certificate is valid

5. **Session Storage Alternative**
   If localStorage issues persist, try:
   ```typescript
   cache: {
     cacheLocation: "sessionStorage",  // Alternative
     storeAuthStateInCookie: true,
   }
   ```

## Rollback Plan

If the changes cause issues, revert to previous configuration:

```typescript
// src/lib/msal.ts
cache: {
  cacheLocation: "localStorage",
  storeAuthStateInCookie: false,
}
// Remove navigateToLoginRequestUrl
```

## Expected Outcome

After these changes:
- ✅ Users can refresh any protected page without losing auth state
- ✅ Deep links work correctly after refresh
- ✅ Browser tab close/reopen maintains login session
- ✅ Auth state persists across page navigations
- ✅ Proper error handling and logging for debugging

## Notes

- The `storeAuthStateInCookie: true` change is the most critical fix
- Cookies provide a more reliable fallback than localStorage alone
- The enhanced route guard ensures active account is always set
- Console logs help diagnose any remaining issues
