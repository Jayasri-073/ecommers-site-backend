const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div className="toast-container position-fixed top-0 end-0 p-3">
      <div className={`toast show border-0 text-bg-${toast.type || "primary"}`} role="alert">
        <div className="d-flex">
          <div className="toast-body fw-semibold">{toast.message}</div>
          <button
            type="button"
            className="btn-close btn-close-white me-2 m-auto"
            aria-label="Close"
            onClick={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default Toast;
