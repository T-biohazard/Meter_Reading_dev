// src/components/roles/DeleteRoleModal.jsx
import Button from "../../components/ui/Button";

function DeleteRoleModal({ isOpen, onClose, onConfirm, role, isLoading }) {
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg text-error">Confirm Deletion</h3>
        <p className="py-4">
          Are you sure you want to delete the role **{role?.name}**? This action cannot be undone.
        </p>
        <div className="modal-action">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            intent="delete"
            loading={isLoading}
            loadingText="Deleting..."
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button type="button">close</button>
      </form>
    </dialog>
  );
}

export default DeleteRoleModal;