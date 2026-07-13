import axios from "axios";

// Create an axios instance with default settings
// All requests made through this instance automatically
// use these settings as a base
const api = axios.create({
  // In development (Vite dev server), this hits the Vite proxy
  // In production (Docker), this hits the nginx proxy
  // We use a relative URL (/api) instead of absolute (http://...)
  // so it works in both environments automatically
  baseURL: "/api",

  // If a request takes longer than 10 seconds, cancel it
  // Better to show an error than to leave the user waiting forever
  timeout: 10000,

  headers: {
    "Content-Type": "application/json",
  },
});

// ── REQUEST INTERCEPTOR ───────────────────────────────────────────────────────
// An interceptor is a function that runs on every request BEFORE it's sent
// This one automatically adds the JWT token to every request
api.interceptors.request.use((config) => {
  // Read the token from memory
  // We store it here in this module (not localStorage — more on why below)
  const token = getToken();

  if (token) {
    // Every request automatically gets the Authorization header
    // without any component needing to think about it
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ── RESPONSE INTERCEPTOR ──────────────────────────────────────────────────────
// This runs on every response that comes back
// We use it to handle expired tokens globally
api.interceptors.response.use(
  // Success handler — just pass the response through unchanged
  (response) => response,

  // Error handler — called when the server returns 4xx or 5xx
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear it and redirect to login
      // This handles the case where a user's token expires while
      // they're using the app — instead of every component handling
      // this separately, it happens automatically here
      clearToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Token Storage ─────────────────────────────────────────────────────────────
// We store the token as a module-level variable (in memory)
// NOT in localStorage — here's why that matters:
//
// localStorage is vulnerable to XSS attacks:
// If any malicious JavaScript runs on your page, it can read
// localStorage and steal your token:
//   localStorage.getItem("token") — accessible to ANY script
//
// An in-memory variable is only accessible to YOUR code:
// A malicious script running in the page context can't reach
// variables defined inside a module closure
//
// Trade-off: the token is lost if the user refreshes the page,
// so we'll handle that case in AuthContext
let _token = null;

export const setToken = (token) => {
  _token = token;
};

export const getToken = () => _token;

export const clearToken = () => {
  _token = null;
};

export default api;