/**
 * In-memory Session Manager
 * Keyed by user's WhatsApp phone number.
 * Ensures state isolation for high concurrency (thousands of simultaneous users).
 */

class SessionManager {
  constructor() {
    this.sessions = new Map();
    // Auto-clean sessions inactive for > 24 hours to prevent memory leaks
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }

  getSession(phone) {
    if (!this.sessions.has(phone)) {
      this.sessions.set(phone, {
        state: 'WAITING_ROLE',
        data: {},
        updatedAt: Date.now()
      });
    }
    const session = this.sessions.get(phone);
    session.updatedAt = Date.now();
    return session;
  }

  updateSession(phone, partial) {
    const session = this.getSession(phone);
    if (partial.state) session.state = partial.state;
    if (partial.data) session.data = { ...session.data, ...partial.data };
    session.updatedAt = Date.now();
    return session;
  }

  resetSession(phone) {
    const newSession = {
      state: 'WAITING_ROLE',
      data: {},
      updatedAt: Date.now()
    };
    this.sessions.set(phone, newSession);
    return newSession;
  }

  cleanup() {
    const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
    const now = Date.now();
    for (const [phone, session] of this.sessions.entries()) {
      if (now - session.updatedAt > EXPIRY_MS) {
        this.sessions.delete(phone);
      }
    }
  }
}

module.exports = new SessionManager();

