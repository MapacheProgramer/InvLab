import { createContext, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const showToast = ({ title, message, type = 'info', duration = 3500 }) => {
    const id = crypto.randomUUID()

    const toast = {
      id,
      title,
      message,
      type,
    }

    setToasts((prev) => [toast, ...prev])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  const success = (message, title = 'Operación exitosa') => {
    showToast({
      title,
      message,
      type: 'success',
    })
  }

  const error = (message, title = 'Error') => {
    showToast({
      title,
      message,
      type: 'error',
      duration: 5000,
    })
  }

  const warning = (message, title = 'Atención') => {
    showToast({
      title,
      message,
      type: 'warning',
    })
  }

  const info = (message, title = 'Información') => {
    showToast({
      title,
      message,
      type: 'info',
    })
  }

  const value = useMemo(
    () => ({
      showToast,
      success,
      error,
      warning,
      info,
      removeToast,
    }),
    []
  )

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
          >
            <div>
              <strong className="toast-title">{toast.title}</strong>
              {toast.message && (
                <p className="toast-message">{toast.message}</p>
              )}
            </div>

            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(toast.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}