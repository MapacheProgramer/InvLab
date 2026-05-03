import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import FormField from '../components/FormField'
import SectionHeader from '../components/SectionHeader'

import {
  addMemberByEmail,
  getCompanyMembers,
  removeMember,
  updateMemberRole,
} from '../services/teamService'

function Equipo() {
  const { companyId, role, user } = useAuth()

  const isOwner = role === 'owner'

  const [members, setMembers] = useState([])
  const [email, setEmail] = useState('')
  const [newRole, setNewRole] = useState('employee')
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)

  const cargarMiembros = async () => {
    try {
      setLoading(true)
      const data = await getCompanyMembers(companyId)
      setMembers(data)
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error cargando miembros')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (companyId) cargarMiembros()
  }, [companyId])

  const miembrosFiltrados = members.filter((m) => {
    const fullName = m.profiles?.full_name || ''
    const email = m.profiles?.email || ''

    return `${fullName} ${email}`.toLowerCase().includes(busqueda.toLowerCase())
  })

  const handleAddMember = async (e) => {
    e.preventDefault()

    if (!isOwner) {
      alert('Solo el dueño puede agregar miembros')
      return
    }

    if (!email.trim()) {
      alert('Ingresa el correo del usuario')
      return
    }

    try {
      await addMemberByEmail({
        companyId,
        email: email.trim(),
        role: newRole,
      })

      setEmail('')
      setNewRole('employee')
      await cargarMiembros()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error agregando miembro')
    }
  }

  const handleRoleChange = async (memberId, value) => {
    if (!isOwner) {
      alert('Solo el dueño puede cambiar roles')
      return
    }

    try {
      await updateMemberRole({
        memberId,
        role: value,
      })

      await cargarMiembros()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error actualizando rol')
    }
  }

  const handleRemove = async (member) => {
    if (!isOwner) {
      alert('Solo el dueño puede eliminar miembros')
      return
    }

    if (member.user_id === user.id) {
      alert('No puedes eliminarte a ti mismo de la empresa')
      return
    }

    const ok = confirm('¿Eliminar este miembro de la empresa?')
    if (!ok) return

    try {
      await removeMember(member.id)
      await cargarMiembros()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error eliminando miembro')
    }
  }

  return (
    <div className="page">
      <PageHeader
        label="Gestión de usuarios"
        title="Equipo"
        subtitle="Administra los usuarios que pertenecen a tu empresa y define sus permisos dentro del sistema."
      />

      <div className="content-grid">
        <section className="card">
          <h2 className="section-title">
            {isOwner ? 'Agregar miembro' : 'Permisos'}
          </h2>

          {isOwner ? (
            <form className="form" onSubmit={handleAddMember}>
              <FormField
                label="Correo del usuario"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <FormField
                as="select"
                label="Rol"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="employee">Empleado</option>
                <option value="admin">Administrador</option>
              </FormField>

              <button className="primary-button" type="submit">
                Agregar usuario
              </button>

              <div className="note-box mt-18">
                <strong>Importante:</strong> el usuario debe haberse registrado previamente en InvLab.
              </div>
            </form>
          ) : (
            <div className="note-box mt-18">
              Solo el dueño de la empresa puede agregar, eliminar o cambiar roles de usuarios.
            </div>
          )}
        </section>

        <section className="card card-table">
          <SectionHeader
            title="Miembros registrados"
            count={miembrosFiltrados.length}
            search={busqueda}
            setSearch={setBusqueda}
            searchPlaceholder="Buscar usuario..."
          />

          {loading ? (
            <EmptyState text="Cargando miembros..." />
          ) : miembrosFiltrados.length === 0 ? (
            <EmptyState text="No hay miembros registrados." />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    {isOwner && <th>Acción</th>}
                  </tr>
                </thead>

                <tbody>
                  {miembrosFiltrados.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <strong>{m.profiles?.full_name || 'Sin nombre'}</strong>
                      </td>

                      <td>{m.profiles?.email || 'Sin correo'}</td>

                      <td>
                        {isOwner && m.user_id !== user.id ? (
                          <select
                            className="input table-select"
                            value={m.role}
                            onChange={(e) => handleRoleChange(m.id, e.target.value)}
                          >
                            <option value="owner">Dueño</option>
                            <option value="admin">Administrador</option>
                            <option value="employee">Empleado</option>
                          </select>
                        ) : (
                          <span
                            className={
                              m.role === 'owner'
                                ? 'badge badge-success'
                                : m.role === 'admin'
                                ? 'badge badge-warning'
                                : 'badge badge-info'
                            }
                          >
                            {m.role === 'owner'
                              ? 'Dueño'
                              : m.role === 'admin'
                              ? 'Administrador'
                              : 'Empleado'}
                          </span>
                        )}
                      </td>

                      {isOwner && (
                        <td>
                          {m.user_id !== user.id ? (
                            <button
                              className="delete-button"
                              onClick={() => handleRemove(m)}
                            >
                              Eliminar
                            </button>
                          ) : (
                            <span className="small-text">Usuario actual</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Equipo