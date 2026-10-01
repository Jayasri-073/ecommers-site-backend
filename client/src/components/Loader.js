const Loader = ({ label = "Loading" }) => (
  <div className="d-flex align-items-center justify-content-center py-5">
    <div className="spinner-border text-warning me-3" role="status" aria-hidden="true" />
    <span className="fw-semibold text-secondary">{label}</span>
  </div>
);

export default Loader;
