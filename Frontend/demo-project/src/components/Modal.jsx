export default function Modal({ title, children, onClose, actions }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>{title}</h3>
        <div className="modal-body">{children}</div>

        <div className="modal-actions">
          {actions}
          {onClose && (
            <button className="btn secondary" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}