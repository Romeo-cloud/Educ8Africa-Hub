import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();
let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg) => addToast(msg, "success"), [addToast]);
  const error = useCallback((msg) => addToast(msg, "error"), [addToast]);
  const warning = useCallback((msg) => addToast(msg, "warning"), [addToast]);
  const info = useCallback((msg) => addToast(msg, "info"), [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);