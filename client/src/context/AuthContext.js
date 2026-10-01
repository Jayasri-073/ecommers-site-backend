import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("bookverse_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const persistAuth = (payload) => {
    localStorage.setItem("bookverse_token", payload.token);
    localStorage.setItem("bookverse_user", JSON.stringify(payload.user));
    setUser(payload.user);
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", formData);
      persistAuth(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", credentials);
      persistAuth(data);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("bookverse_token");
    localStorage.removeItem("bookverse_user");
    setUser(null);
  };

  const refreshProfile = async () => {
    if (!localStorage.getItem("bookverse_token")) return;
    const { data } = await api.get("/auth/profile");
    localStorage.setItem("bookverse_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const updateProfile = async (profile) => {
    const { data } = await api.put("/auth/profile", profile);
    localStorage.setItem("bookverse_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  useEffect(() => {
    refreshProfile().catch(logout);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      register,
      login,
      logout,
      updateProfile,
      refreshProfile
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
