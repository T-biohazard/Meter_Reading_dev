// src/components/ui/Toast.jsx
import { CheckCircle, XCircle } from "lucide-react";

function Toast({ message, type, onClose }) {
  const isSuccess = type === "success";
  const icon = isSuccess ? <CheckCircle /> : <XCircle />;
  const alertClass = isSuccess ? "alert-success" : "alert-error";

  return (
    <div className={`alert ${alertClass} shadow-lg`}>
      <div>
        {icon}
        <span>{message}</span>
      </div>
      <div className="flex-none">
        <button className="btn btn-ghost btn-sm" onClick={onClose}>
          <XCircle size={20} />
        </button>
      </div>
    </div>
  );
}

export default Toast;