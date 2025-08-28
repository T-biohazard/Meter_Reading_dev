// src/components/ui/oastContainer.jsx
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Toast from "./Toast";

const toastRoot = document.getElementById("toast-root");

function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="toast toast-end toast-bottom z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>,
    toastRoot
  );
}

export default ToastContainer;