import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
   * YOUR BACKEND RESPONSES:
   *
   * POST /api/auth/login returns:
   *   { access_token: "xxx", token_type: "bearer", user: { id, name, email, ... } }
   *
   * POST /api/auth/signup returns:
   *   { message: "Account created successfully", user: { id, name, email, ... } }
   *   ⚠️ NO TOKEN — we must login separately after signup
   *
   * GET /api/auth/me returns:
   *   { id, name, email, phone, ... }
   *   ⚠️ User object DIRECTLY — not wrapped in { user: {...} }
   */

  // ── Load user on page refresh ──
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/auth/me");

      /*
       * YOUR /auth/me returns the user DIRECTLY:
       *   { id: 1, name: "John", email: "john@example.com", ... }
       *
       * NOT wrapped like { user: { id: 1, ... } }
       */
      const userData = res.data;

      if (userData && (userData.id || userData.email)) {
        console.log("[Auth] User loaded:", userData.email);
        setUser(userData);
      } else {
        console.warn("[Auth] Invalid user data from /me:", userData);
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (err) {
      console.log(
        "[Auth] /me failed:",
        err?.response?.status || err.message
      );
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // ── Login ──
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      /*
       * YOUR /api/auth/login returns:
       * {
       *   access_token: "eyJhbG...",
       *   token_type: "bearer",
       *   user: { id: 1, name: "John", email: "john@example.com", role: "admin", ... }
       * }
       */
      const data = res.data;
      console.log("[Auth] Login response:", data);

      // Extract token
      const token = data.access_token;

      if (!token) {
        console.error("[Auth] No access_token in response:", data);
        throw new Error("Server did not return a token");
      }

      // Save token
      localStorage.setItem("token", token);
      console.log("[Auth] Token saved to localStorage");

      // Extract user from login response
      const userData = data.user;

      if (userData) {
        setUser(userData);
        console.log("[Auth] User set:", userData.email, "Role:", userData.role);
        return { token, user: userData };
      }

      // If no user in login response, fetch from /me
      console.log("[Auth] No user in login response, fetching /me...");
      const meRes = await api.get("/auth/me");
      const meUser = meRes.data;
      setUser(meUser);
      return { token, user: meUser };
    } catch (err) {
      console.error("[Auth] Login failed:", err?.response?.data || err.message);
      localStorage.removeItem("token");
      setUser(null);
      throw err;
    }
  };

  // ── Signup ──
  const signup = async (signupData) => {
    try {
      const res = await api.post("/auth/signup", signupData);

      /*
       * YOUR /api/auth/signup returns:
       * {
       *   message: "Account created successfully",
       *   user: { id: 1, name: "...", email: "...", ... }
       * }
       *
       * ⚠️ NO TOKEN IS RETURNED
       * So after signup, we must LOGIN to get a token
       */
      const data = res.data;
      console.log("[Auth] Signup response:", data);

      // Check if signup returns a token (if you fixed the backend)
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        const userData = data.user;
        setUser(userData);
        return { token: data.access_token, user: userData };
      }

      // ⚠️ NO TOKEN — auto-login after signup
      console.log("[Auth] No token in signup response, logging in...");

      const loginResult = await login(
        signupData.email,
        signupData.password
      );

      return loginResult;
        } catch (err) {
      console.error("[Auth] Signup failed:", err?.response?.data || err.message);
      localStorage.removeItem("token");
      setUser(null);

      // ✅ Parse FastAPI validation errors into readable string
      const detail = err?.response?.data?.detail;

      if (Array.isArray(detail)) {
        const message = detail
          .map((e) => {
            const field = e.loc?.[e.loc.length - 1] || "field";
            return `${field}: ${e.msg}`;
          })
          .join(", ");
        throw new Error(message);
      }

      if (typeof detail === "string") {
        throw new Error(detail);
      }

      throw new Error(err?.message || "Signup failed");
    }
  };

  // ── Logout ──
  const logout = () => {
    console.log("[Auth] Logging out");
    localStorage.removeItem("token");
    setUser(null);
  };

  // ── Update user locally ──
  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateUser,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};