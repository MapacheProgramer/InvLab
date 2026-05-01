import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function Login() {
  const { login, register } = useAuth()

  const [mode, setMode] = useState('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const isRegister = mode === 'register'

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      alert('Ingresa correo y contraseña')
      return
    }

    if (isRegister && !fullName.trim()) {
      alert('Ingresa tu nombre')
      return
    }

    try {
      setLoading(true)

      if (isRegister) {
        await register({
          email,
          password,
          fullName,
        })

        alert('Cuenta creada. Revisa tu correo si Supabase pide confirmación.')
      } else {
        await login({
          email,
          password,
        })
      }
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="page-label">Sistema de inventario</p>
        <h1 className="auth-title">InvLab</h1>
        <p className="auth-subtitle">
          {isRegister
            ? 'Crea una cuenta para administrar tu negocio.'
            : 'Inicia sesión para acceder al panel.'}
        </p>

        <form className="form" onSubmit={handleSubmit}>
          {isRegister && (
            <div className="field">
              <label className="input-label">Nombre completo</label>
              <input
                className="input"
                placeholder="Tu nombre"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div className="field">
            <label className="input-label">Correo</label>
            <input
              className="input"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="input-label">Contraseña</label>
            <input
              className="input"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="primary-button" type="submit" disabled={loading}>
            {loading
              ? 'Procesando...'
              : isRegister
              ? 'Crear cuenta'
              : 'Iniciar sesión'}
          </button>
        </form>

        <button
          className="auth-switch"
          onClick={() => setMode(isRegister ? 'login' : 'register')}
        >
          {isRegister
            ? 'Ya tengo cuenta, iniciar sesión'
            : 'No tengo cuenta, crear una'}
        </button>
      </div>
    </div>
  )
}

export default Login