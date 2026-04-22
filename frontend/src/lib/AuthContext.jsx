import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

const AUTH_STORAGE_KEY = "auralis-auth-session";
const CUSTOM_USERS_STORAGE_KEY = "auralis-custom-users";

const demoUsers = [
  {
    email: "admin@auralis.org",
    password: "Admin@123",
    role: "admin",
    name: "Government Admin",
  },
  {
    email: "hospital@auralis.org",
    password: "Hospital@123",
    role: "hospital",
    name: "Hospital Operator",
  },
  {
    email: "official@auralis.org",
    password: "Official@123",
    role: "official",
    name: "Health Official",
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings] = useState(null);

  const getCustomUsers = useCallback(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_USERS_STORAGE_KEY);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Failed to parse custom users:", error);
      localStorage.removeItem(CUSTOM_USERS_STORAGE_KEY);
      return [];
    }
  }, []);

  const saveCustomUsers = useCallback((users) => {
    localStorage.setItem(CUSTOM_USERS_STORAGE_KEY, JSON.stringify(users));
  }, []);

  const getAllUsers = useCallback(() => {
    return [...demoUsers, ...getCustomUsers()];
  }, [getCustomUsers]);

  const checkAppState = useCallback(async () => {
    try {
      const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!savedSession) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      const parsed = JSON.parse(savedSession);
      if (parsed?.email && parsed?.role) {
        setUser(parsed);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Failed to restore auth session:", error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      await checkAppState();
      if (mounted) {
        setIsLoadingAuth(false);
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [checkAppState]);

  const login = async ({ email, password, role }) => {
    setAuthError(null);

    await new Promise((resolve) => {
      setTimeout(resolve, 400);
    });

    const matchedUser = getAllUsers().find(
      (candidate) =>
        candidate.email.toLowerCase() === email.toLowerCase() &&
        candidate.password === password &&
        candidate.role === role
    );

    if (!matchedUser) {
      const message = "Invalid credentials or role selection.";
      setAuthError(message);
      throw new Error(message);
    }

    const sessionUser = {
      email: matchedUser.email,
      role: matchedUser.role,
      name: matchedUser.name,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    setIsAuthenticated(true);

    return sessionUser;
  };

  const register = async ({ name, email, password, role }) => {
    setAuthError(null);

    await new Promise((resolve) => {
      setTimeout(resolve, 350);
    });

    const normalizedEmail = email.trim().toLowerCase();
    const existing = getAllUsers().find(
      (candidate) => candidate.email.toLowerCase() === normalizedEmail
    );

    if (existing) {
      const message = "An account with this email already exists.";
      setAuthError(message);
      throw new Error(message);
    }

    const safeName = String(name || "").trim() || "Auralis User";
    const newUser = {
      email: normalizedEmail,
      password,
      role,
      name: safeName,
    };

    const nextUsers = [...getCustomUsers(), newUser];
    saveCustomUsers(nextUsers);

    return {
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    };
  };

  const resetPassword = async ({ email, role, newPassword }) => {
    setAuthError(null);

    await new Promise((resolve) => {
      setTimeout(resolve, 300);
    });

    const normalizedEmail = email.trim().toLowerCase();
    const users = getCustomUsers();

    const userIndex = users.findIndex(
      (candidate) =>
        candidate.email.toLowerCase() === normalizedEmail &&
        candidate.role === role
    );

    if (userIndex === -1) {
      const message = "No custom account found for this email and role.";
      setAuthError(message);
      throw new Error(message);
    }

    users[userIndex] = {
      ...users[userIndex],
      password: newPassword,
    };

    saveCustomUsers(users);
    return true;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
  };

  const navigateToLogin = () => {
    window.location.assign("/login");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      login,
      register,
      resetPassword,
      logout,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

