/**
 * ═══════════════════════════════════════════════════════════
 *  CBSH Digital Library — InsForge REST API Wrapper
 *  All backend calls go through this module.
 *  Uses fetch() against the InsForge REST API.
 * ═══════════════════════════════════════════════════════════
 */

const Insforge = (() => {
  // ── Helpers ───────────────────────────────────────────

  /** Get auth headers — uses JWT if logged in, otherwise anon key */
  function getHeaders(useAuth = true) {
    const headers = { 'Content-Type': 'application/json' };
    const token = useAuth ? localStorage.getItem('cbsh_jwt') : null;
    headers['Authorization'] = `Bearer ${token || INSFORGE_CONFIG.anonKey}`;
    return headers;
  }

  /** Standard fetch wrapper with error handling */
  async function request(endpoint, options = {}) {
    try {
      const url = `${INSFORGE_CONFIG.baseUrl}${endpoint}`;
      const res = await fetch(url, {
        ...options,
        headers: { ...getHeaders(), ...options.headers }
      });

      // Handle 204 No Content
      if (res.status === 204) return { data: null, error: null };

      const contentType = res.headers.get('content-type');
      let body = null;

      if (contentType && contentType.includes('application/json')) {
        body = await res.json();
      } else {
        body = await res.text();
      }

      if (!res.ok) {
        return {
          data: null,
          error: {
            status: res.status,
            message: body?.message || body?.error || `Request failed (${res.status})`,
            details: body
          }
        };
      }

      // Get total count from headers if available
      const totalCount = res.headers.get('X-Total-Count');
      return { data: body, error: null, totalCount: totalCount ? parseInt(totalCount) : null };
    } catch (err) {
      console.error('[Insforge] Request error:', err);
      return {
        data: null,
        error: { status: 0, message: err.message || 'Network error' }
      };
    }
  }

  // ══════════════════════════════════════════════════════
  //  AUTH MODULE
  // ══════════════════════════════════════════════════════

  const Auth = {
    /** Register a new user */
    async register(email, password, name) {
      return request('/api/auth/users', {
        method: 'POST',
        body: JSON.stringify({ email, password, name })
      });
    },

    /** Sign in with email and password */
    async login(email, password) {
      return request('/api/auth/sessions', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    },

    /** Refresh access token using CSRF token */
    async refreshToken(csrfToken) {
      return request('/api/auth/refresh', {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken }
      });
    },

    /** Logout */
    async logout() {
      return request('/api/auth/logout', { method: 'POST' });
    },

    /** Get current authenticated user */
    async getCurrentUser() {
      return request('/api/auth/sessions/current');
    },

    /** Update user profile */
    async updateProfile(profileData) {
      return request('/api/auth/profiles/current', {
        method: 'PATCH',
        body: JSON.stringify({ profile: profileData })
      });
    },

    /** Get user profile by ID */
    async getProfile(userId) {
      return request(`/api/auth/profiles/${userId}`);
    },

    /** Send email verification code */
    async sendVerificationEmail(email) {
      return request('/api/auth/email/send-verification', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    },

    /** Verify email with 6-digit code */
    async verifyEmail(email, otp) {
      return request('/api/auth/email/verify', {
        method: 'POST',
        body: JSON.stringify({ email, otp })
      });
    },

    /** Send password reset email */
    async sendPasswordResetEmail(email) {
      return request('/api/auth/email/send-reset-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    },

    /** Exchange password reset code for token */
    async exchangeResetCode(email, code) {
      return request('/api/auth/email/exchange-reset-password-token', {
        method: 'POST',
        body: JSON.stringify({ email, code })
      });
    },

    /** Reset password with token */
    async resetPassword(newPassword, otp) {
      return request('/api/auth/email/reset-password', {
        method: 'POST',
        body: JSON.stringify({ newPassword, otp })
      });
    }
  };

  // ══════════════════════════════════════════════════════
  //  DATABASE MODULE
  // ══════════════════════════════════════════════════════

  const DB = {
    /**
     * Query records from a table.
     * @param {string} table - Table name
     * @param {Object} options - { filters, order, limit, offset, select }
     *   filters = { status: 'eq.active', role: 'in.(admin,teacher)' }
     */
    async query(table, options = {}) {
      const params = new URLSearchParams();

      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          params.append(key, value);
        });
      }
      if (options.order) params.append('order', options.order);
      if (options.limit) params.append('limit', options.limit);
      if (options.offset !== undefined) params.append('offset', options.offset);
      if (options.select) params.append('select', options.select);

      const qs = params.toString();
      return request(`/api/database/records/${table}${qs ? '?' + qs : ''}`);
    },

    /** Get a single record by ID */
    async getById(table, id) {
      const result = await this.query(table, { filters: { id: `eq.${id}` }, limit: 1 });
      if (result.error) return result;
      return { data: result.data?.[0] || null, error: result.data?.length ? null : { message: 'Not found' } };
    },

    /** Insert one or more records. Body MUST be an array. */
    async insert(table, records) {
      const body = Array.isArray(records) ? records : [records];
      return request(`/api/database/records/${table}`, {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify(body)
      });
    },

    /** Update records matching filters */
    async update(table, filters, data) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        params.append(key, value);
      });
      return request(`/api/database/records/${table}?${params.toString()}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify(data)
      });
    },

    /** Delete records matching filters */
    async delete(table, filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        params.append(key, value);
      });
      return request(`/api/database/records/${table}?${params.toString()}`, {
        method: 'DELETE',
        headers: { 'Prefer': 'return=representation' }
      });
    },

    /** Call an RPC function */
    async rpc(functionName, params = {}) {
      return request(`/api/database/rpc/${functionName}`, {
        method: 'POST',
        body: JSON.stringify(params)
      });
    }
  };

  // ══════════════════════════════════════════════════════
  //  STORAGE MODULE
  // ══════════════════════════════════════════════════════

  const Storage = {
    /**
     * Upload a file using the upload-strategy approach.
     * @param {File} file - The file object to upload
     * @param {string} folder - Optional subfolder path (e.g., 'materials/pdfs/mathematics')
     * @param {Function} onProgress - Optional progress callback (0-100)
     * @returns {Object} { data: { key, url, bucket }, error }
     */
    async upload(file, folder = '', onProgress = null) {
      const bucket = INSFORGE_CONFIG.storageBucket;
      try {
        // Step 1: Get upload strategy
        const strategyRes = await request(`/api/storage/buckets/${bucket}/upload-strategy`, {
          method: 'POST',
          body: JSON.stringify({
            filename: folder ? `${folder}/${file.name}` : file.name,
            contentType: file.type,
            size: file.size
          })
        });

        if (strategyRes.error) return strategyRes;

        const strategy = strategyRes.data;

        // Step 2: Upload file
        if (strategy.method === 'direct') {
          // Direct upload to InsForge
          const formData = new FormData();
          formData.append('file', file);

          const uploadUrl = `${INSFORGE_CONFIG.baseUrl}${strategy.uploadUrl}`;
          const token = localStorage.getItem('cbsh_jwt') || INSFORGE_CONFIG.anonKey;

          const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });

          if (!uploadRes.ok) {
            const err = await uploadRes.json().catch(() => ({}));
            return { data: null, error: { message: err.message || 'Upload failed' } };
          }

          const data = await uploadRes.json();
          if (onProgress) onProgress(100);
          return { data: { key: strategy.key, ...data }, error: null };

        } else if (strategy.method === 'presigned') {
          // S3 presigned upload
          const formData = new FormData();
          // Add all presigned fields
          if (strategy.fields) {
            Object.entries(strategy.fields).forEach(([k, v]) => {
              formData.append(k, v);
            });
          }
          formData.append('file', file);

          const uploadRes = await fetch(strategy.uploadUrl, {
            method: 'POST',
            body: formData
          });

          if (!uploadRes.ok && uploadRes.status !== 204) {
            return { data: null, error: { message: 'S3 upload failed' } };
          }

          // Step 3: Confirm upload
          if (strategy.confirmRequired) {
            const confirmRes = await request(strategy.confirmUrl, {
              method: 'POST',
              body: JSON.stringify({
                size: file.size,
                contentType: file.type
              })
            });

            if (confirmRes.error) return confirmRes;
            if (onProgress) onProgress(100);
            return { data: { key: strategy.key, ...confirmRes.data }, error: null };
          }

          if (onProgress) onProgress(100);
          return { data: { key: strategy.key, bucket }, error: null };
        }

        return { data: null, error: { message: 'Unknown upload method' } };
      } catch (err) {
        console.error('[Insforge] Upload error:', err);
        return { data: null, error: { message: err.message } };
      }
    },

    /** Get download URL (may be presigned) */
    async getDownloadUrl(objectKey, expiresIn = 3600) {
      const bucket = INSFORGE_CONFIG.storageBucket;
      const encodedKey = encodeURIComponent(objectKey);
      return request(`/api/storage/buckets/${bucket}/objects/${encodedKey}/download-strategy`, {
        method: 'POST',
        body: JSON.stringify({ expiresIn })
      });
    },

    /** Delete a file */
    async delete(objectKey) {
      const bucket = INSFORGE_CONFIG.storageBucket;
      return request(`/api/storage/buckets/${bucket}/objects/${objectKey}`, {
        method: 'DELETE'
      });
    },

    /** List files in a bucket (optionally filtered by prefix) */
    async list(prefix = '', limit = 100, offset = 0) {
      const bucket = INSFORGE_CONFIG.storageBucket;
      const params = new URLSearchParams({ limit, offset });
      if (prefix) params.append('prefix', prefix);
      return request(`/api/storage/buckets/${bucket}/objects?${params.toString()}`);
    },

    /**
     * Build public URL for an object.
     * For private buckets, use getDownloadUrl() instead.
     */
    objectUrl(objectKey) {
      const bucket = INSFORGE_CONFIG.storageBucket;
      const encodedKey = encodeURIComponent(objectKey);
      return `${INSFORGE_CONFIG.baseUrl}/api/storage/buckets/${bucket}/objects/${encodedKey}`;
    }
  };

  // ══════════════════════════════════════════════════════
  //  PUBLIC API
  // ══════════════════════════════════════════════════════
  return { Auth, DB, Storage, request, getHeaders };
})();
