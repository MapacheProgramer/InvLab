function ConfirmModal({
  open,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  danger = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2 className="modal-title">{title}</h2>

        <p className="modal-message">
          {message}
        </p>

        <div className="modal-actions">
          <button className="secondary-button" onClick={onCancel}>
            {cancelText}
          </button>

          <button
            className={danger ? 'danger-button' : 'primary-button'}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal