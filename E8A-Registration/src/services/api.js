import axios from "axios";

/*
 ╔════════════════════════════════════════════════════╗
 ║  SET TO true FOR MOCK DATA, false FOR REAL BACKEND ║
 ╚════════════════════════════════════════════════════╝
*/
const USE_MOCK = false;

// ─────────────────────────────────────
// MOCK DATA (kept for reference or fallback)
// ─────────────────────────────────────
const mockUser = {
  id: 1, name: "John Doe", email: "admin@traininghub.com",
  phone: "08012345678", role: "admin", referral_code: "JOHN2024",
  courses_enrolled: 3, referral_count: 12,
  referral_earnings: 36000, payment_status: "Paid",
};

const mockCourses = [
  { id: 1, name: "Full-Stack Web Development", description: "Master React, Node.js, and databases.", amount: 75000, welcome_note: "Welcome!", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600", duration: "12 Weeks", level: "Intermediate", students: 1240 },
  // ... other mock courses ...
];

// ─────────────────────────────────────
// MOCK API
// ─────────────────────────────────────
function createMockApi() {
  function mockRequest(url, method, body) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log(`[MOCK] ${method} ${url}`);
        // ... (existing mock logic) ...
        if (url.includes("/payment/verify")) {
             return resolve({ data: { status: "success", message: "Payment verified successfully" } });
        }
        return resolve({ data: { message: "OK" } });
      }, 300);
    });
  }
  
  const mock = {
    get: (url) => mockRequest(url, "GET", null),
    post: (url, data) => mockRequest(url, "POST", data),
    put: (url, data) => mockRequest(url, "PUT", data),
    delete: (url) => mockRequest(url, "DELETE", null),
    patch: (url, data) => mockRequest(url, "PATCH", data),
  };

  // Add specific method for payment verification
  mock.verifyPayment = (reference) => mock.get(`/payment/verify/${reference}`);
  
  return mock;
}

// ─────────────────────────────────────
// REAL API — matches YOUR FastAPI exactly
// ─────────────────────────────────────
function createRealApi() {
  const baseURL =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
    "http://localhost:8000/api";

  const instance = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  });

  // ── Add token to every request ──
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // ── Handle 401 responses ──
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      if (status === 401) {
        const path = window.location.pathname;
        const isPublicPage = path === "/" || path === "/login" || path === "/signup";
        if (!isPublicPage) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );

  // ── NEW: Verify Payment Method ──
  instance.verifyPayment = async (reference, options = {}) => {
    console.log(`[API] Verifying payment reference: ${reference}`);
    // Optionally pass registration_id in query params for better linking
    const params = options.registration_id 
      ? { registration_id: options.registration_id } 
      : {};
    return await instance.get(`/payment/verify/${reference}`, { params });
  };

  return instance;
}

// ─────────────────────────────────────
// EXPORT
// ─────────────────────────────────────
const api = USE_MOCK ? createMockApi() : createRealApi();

export default api;