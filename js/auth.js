/**
 * ═══════════════════════════════════════════════════════════
 *  CBSH Digital Library — Auth Guard & Session Management
 *  Include this script on EVERY protected page.
 * ═══════════════════════════════════════════════════════════
 */

const AuthGuard = (() => {
  const SESSION_KEYS = {
    jwt: 'cbsh_jwt',
    csrf: 'cbsh_csrf',
    user: 'cbsh_user',
    role: 'cbsh_role',
    lastActivity: 'cbsh_last_activity'
  };

  const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
  let inactivityTimer = null;

  // ── Session Storage ──────────────────────────────────

  /** Save session after login */
  function saveSession(accessToken, csrfToken, user, appUser) {
    localStorage.setItem(SESSION_KEYS.jwt, accessToken);
    if (csrfToken) localStorage.setItem(SESSION_KEYS.csrf, csrfToken);
    localStorage.setItem(SESSION_KEYS.user, JSON.stringify({
      authId: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      ...appUser
    }));
    localStorage.setItem(SESSION_KEYS.role, appUser.role);
    localStorage.setItem(SESSION_KEYS.lastActivity, Date.now().toString());
  }

  /** Get stored JWT */
  function getToken() {
    return localStorage.getItem(SESSION_KEYS.jwt);
  }

  /** Get stored CSRF token */
  function getCsrfToken() {
    return localStorage.getItem(SESSION_KEYS.csrf);
  }

  /** Get stored user object */
  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEYS.user));
    } catch {
      return null;
    }
  }

  /** Get stored role */
  function getRole() {
    return localStorage.getItem(SESSION_KEYS.role);
  }

  /** Is user logged in (has JWT)? */
  function isLoggedIn() {
    return !!getToken();
  }

  /** Clear all session data */
  function clearSession() {
    Object.values(SESSION_KEYS).forEach(key => localStorage.removeItem(key));
  }

  // ── Login Flow ───────────────────────────────────────

  /**
   * Full login flow:
   * 1. Call InsForge Auth login
   * 2. Look up user in our users table
   * 3. Check if user is approved
   * 4. Save session
   * 5. Update last_login
   * 6. Log activity
   * @returns {Object} { success, user, error, redirect }
   */
  async function login(email, password) {
    // Step 1: Auth login
    const authRes = await Insforge.Auth.login(email, password);
    if (authRes.error) {
      // Check if it's an email verification issue
      const errMsg = (authRes.error.message || '').toLowerCase();
      if (errMsg.includes('verify') || errMsg.includes('email')) {
        // User exists in InsForge Auth but email not verified
        // Look up in our users table by email to give a useful message
        const lookupRes = await Insforge.DB.query('users', {
          filters: { email: `eq.${email}` },
          limit: 1
        });
        const appUser = lookupRes.data?.[0];
        if (appUser) {
          const statusMessages = {
            pending: 'Your account is pending admin approval. Please wait for the admin to approve your account.',
            approved: 'Your email is not verified yet. Please verify your email before logging in.',
            denied: 'Your account has been denied. Please contact the admin.'
          };
          return { success: false, error: statusMessages[appUser.status] || 'Account not approved.' };
        }
        return { success: false, error: 'Please verify your email first.', needsVerification: true, email };
      }
      return { success: false, error: authRes.error.message || 'Login failed. Check your credentials.' };
    }

    const { accessToken, csrfToken, user: authUser } = authRes.data;

    if (!accessToken) {
      // Email not verified — look up user by email for status message
      const lookupRes = await Insforge.DB.query('users', {
        filters: { email: `eq.${email}` },
        limit: 1
      });
      const appUser = lookupRes.data?.[0];
      if (appUser && appUser.status === 'pending') {
        return { success: false, error: 'Your account is pending admin approval. Please wait for the admin to approve your account.' };
      }
      return { success: false, error: 'Please verify your email first.', needsVerification: true, email };
    }

    // Save token temporarily so DB queries work
    localStorage.setItem(SESSION_KEYS.jwt, accessToken);

    // Step 2: Get user from our users table (try insforge_uid first, then email)
    let userRes = await Insforge.DB.query('users', {
      filters: { insforge_uid: `eq.${authUser.id}` },
      limit: 1
    });

    if (userRes.error || !userRes.data?.length) {
      // Fallback: look up by email
      userRes = await Insforge.DB.query('users', {
        filters: { email: `eq.${email}` },
        limit: 1
      });
    }

    if (userRes.error || !userRes.data?.length) {
      clearSession();
      return { success: false, error: 'User profile not found. Please register first or contact admin.' };
    }

    const appUser = userRes.data[0];

    // If insforge_uid is missing, update it now
    if (!appUser.insforge_uid) {
      Insforge.DB.update('users', { id: `eq.${appUser.id}` }, { insforge_uid: authUser.id });
    }

    // Step 3: Check approval status
    if (appUser.status !== 'approved') {
      clearSession();
      const messages = {
        pending: 'Your account is pending admin approval. Please wait for the admin to approve your account.',
        email_verified: 'Your email is verified. Awaiting admin approval.',
        denied: 'Your account has been denied. Contact admin for details.'
      };
      return { success: false, error: messages[appUser.status] || 'Account not approved.' };
    }

    // Step 4: Save full session
    saveSession(accessToken, csrfToken, authUser, appUser);

    // Step 5: Update last login (fire and forget)
    Insforge.DB.update('users', { id: `eq.${appUser.id}` }, { last_login: new Date().toISOString() });

    // Step 6: Log activity
    logActivity('LOGIN', 'User logged in successfully');

    // Step 7: Determine redirect
    const redirectMap = {
      admin: 'admin/dashboard.html',
      teacher: 'teacher/dashboard.html',
      student: 'student/dashboard.html'
    };

    return {
      success: true,
      user: appUser,
      redirect: redirectMap[appUser.role] || 'index.html'
    };
  }

  // ── Logout ───────────────────────────────────────────

  async function logout() {
    logActivity('LOGOUT', 'User logged out');
    await Insforge.Auth.logout();
    clearSession();
    // Navigate to login
    const isSubfolder = window.location.pathname.includes('/admin/') ||
                        window.location.pathname.includes('/teacher/') ||
                        window.location.pathname.includes('/student/');
    window.location.href = isSubfolder ? '../index.html' : 'index.html';
  }

  // ── Route Guard ──────────────────────────────────────

  /**
   * Call at the top of every protected page.
   * @param {string|string[]} allowedRoles - e.g., 'admin' or ['admin', 'teacher']
   */
  function requireAuth(allowedRoles = null) {
    if (!isLoggedIn()) {
      redirectToLogin();
      return false;
    }

    // Check role
    if (allowedRoles) {
      const role = getRole();
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      if (!roles.includes(role)) {
        // Redirect to their own dashboard
        const redirectMap = {
          admin: '../admin/dashboard.html',
          teacher: '../teacher/dashboard.html',
          student: '../student/dashboard.html'
        };
        window.location.href = redirectMap[role] || '../index.html';
        return false;
      }
    }

    // Reset inactivity timer
    resetInactivityTimer();
    return true;
  }

  /** Redirect to login page */
  function redirectToLogin() {
    const isSubfolder = window.location.pathname.includes('/admin/') ||
                        window.location.pathname.includes('/teacher/') ||
                        window.location.pathname.includes('/student/');
    window.location.href = isSubfolder ? '../index.html' : 'index.html';
  }

  // ── Inactivity Timer ─────────────────────────────────

  function resetInactivityTimer() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    localStorage.setItem(SESSION_KEYS.lastActivity, Date.now().toString());
    inactivityTimer = setTimeout(() => {
      Swal.fire({
        icon: 'warning',
        title: 'Session Expired',
        text: 'You have been logged out due to inactivity.',
        confirmButtonText: 'OK'
      }).then(() => {
        logout();
      });
    }, TIMEOUT_MS);
  }

  /** Attach listeners to reset timer on user activity */
  function initInactivityListeners() {
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
      document.addEventListener(evt, () => resetInactivityTimer(), { passive: true });
    });
  }

  // ── Token Refresh ────────────────────────────────────

  async function refreshTokenIfNeeded() {
    const csrf = getCsrfToken();
    if (!csrf) return;

    const res = await Insforge.Auth.refreshToken(csrf);
    if (res.data?.accessToken) {
      localStorage.setItem(SESSION_KEYS.jwt, res.data.accessToken);
      if (res.data.csrfToken) {
        localStorage.setItem(SESSION_KEYS.csrf, res.data.csrfToken);
      }
    }
  }

  // Set up periodic token refresh (every 10 minutes)
  function startTokenRefresh() {
    setInterval(refreshTokenIfNeeded, 10 * 60 * 1000);
  }

  // ── Activity Logging ─────────────────────────────────

  async function logActivity(action, details, status = 'success') {
    const user = getUser();
    try {
      await Insforge.DB.insert('activity_logs', {
        user_id: user?.id || null,
        user_name: user?.name || 'Unknown',
        role: user?.role || getRole() || 'unknown',
        action,
        details,
        status
      });
    } catch (e) {
      console.warn('[Auth] Failed to log activity:', e);
    }
  }

  // ── Init ─────────────────────────────────────────────

  function init(allowedRoles = null) {
    const ok = requireAuth(allowedRoles);
    if (ok) {
      initInactivityListeners();
      startTokenRefresh();
      // Async JWT validation — catches expired tokens without blocking page load
      validateSession();
    }
    return ok;
  }

  // ── Async Session Validation ────────────────────────

  /**
   * Non-blocking server-side JWT check.
   * If the token is expired/invalid, clears session and redirects to login.
   */
  async function validateSession() {
    try {
      const res = await Insforge.Auth.getCurrentUser();
      if (res.error && (res.error.status === 401 || res.error.status === 403)) {
        console.warn('[Auth] Session invalid — token expired or revoked.');
        // Try to refresh first
        const csrf = getCsrfToken();
        if (csrf) {
          const refreshRes = await Insforge.Auth.refreshToken(csrf);
          if (refreshRes.data?.accessToken) {
            localStorage.setItem(SESSION_KEYS.jwt, refreshRes.data.accessToken);
            if (refreshRes.data.csrfToken) localStorage.setItem(SESSION_KEYS.csrf, refreshRes.data.csrfToken);
            console.log('[Auth] Token refreshed successfully.');
            return; // Token refreshed, session is valid
          }
        }
        // Refresh failed — force logout
        clearSession();
        Swal.fire({
          icon: 'warning',
          title: 'Session Expired',
          text: 'Your session has expired. Please log in again.',
          confirmButtonText: 'OK'
        }).then(() => {
          redirectToLogin();
        });
      }
    } catch (e) {
      console.warn('[Auth] Session validation error (may be offline):', e.message);
    }
  }

  // ── Public API ───────────────────────────────────────
  return {
    login,
    logout,
    requireAuth,
    init,
    getToken,
    getUser,
    getRole,
    isLoggedIn,
    clearSession,
    saveSession,
    logActivity,
    getCsrfToken,
    refreshTokenIfNeeded
  };
})();
