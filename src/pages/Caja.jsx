import { useState } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'

import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import FormField from '../components/FormField'
import SectionHeader from '../components/SectionHeader'

function Caja() {
  const { caja, resumen, setSaldoInicial } = useData()
  const { role } = useAuth()

  const isAdmin = role === 'owner' || role === 'admin'

  const [saldo, setSaldo] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const handleOnlyNumbers = (value, setter) => {
    const cleanValue = value.replace(/\D/g, '')
    setter(cleanValue)
  }

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    })
  }

  const movimientosFiltrados = caja.movimientos.filter((m) =>
    m.concepto.toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalIngresos = caja.movimientos
    .filter((m) => m.tipo === 'ingreso')
    .reduce((acc, m) => acc + Number(m.monto || 0), 0)

  const totalEgresos = caja.movimientos
    .filter((m) => m.tipo === 'egreso')
    .reduce((acc, m) => acc + Number(m.monto || 0), 0)

  const handleSet = (e) => {
    e.preventDefault()

    if (!isAdmin) {
      alert('No tienes permisos para modificar el saldo inicial')
      return
    }

    if (saldo === '' || Number(saldo) < 0) {
      alert('Ingresa un saldo inicial válido')
      return
    }

    setSaldoInicial(saldo)
    setSaldo('')
  }

  return (
    <div className="page">
      <PageHeader
        label="Control financiero"
        title="Caja"
        subtitle="Consulta los ingresos, egresos, saldo disponible y movimientos generados por ventas, compras y abonos."
      />

      <div className="stats-grid">
        <StatCard title="Saldo inicial" value={formatMoney(caja.saldoInicial)} />
        <StatCard title="Ingresos" value={formatMoney(totalIngresos)} />
        <StatCard title="Egresos" value={formatMoney(totalEgresos)} warning />
        <StatCard title="Saldo actual" value={formatMoney(resumen.saldo)} />
      </div>

      <div className="content-grid">
        <section className="card">
          <h2 className="section-title">
            {isAdmin ? 'Configurar caja' : 'Información de caja'}
          </h2>

          {isAdmin ? (
            <>
              <form onSubmit={handleSet} className="form">
                <FormField
                  label="Saldo inicial"
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej: 100000"
                  value={saldo}
                  onChange={(e) => handleOnlyNumbers(e.target.value, setSaldo)}
                />

                <button className="primary-button" type="submit">
                  Guardar saldo
                </button>
              </form>

              <div className="note-box mt-18">
                <strong>Nota:</strong> el saldo actual se calcula automáticamente con el saldo inicial, ingresos y egresos.
              </div>
            </>
          ) : (
            <div className="note-box mt-18">
              <strong>Modo empleado:</strong> puedes consultar la caja, pero no modificar el saldo inicial.
            </div>
          )}
        </section>

        <section className="card card-table">
          <SectionHeader
            title="Movimientos"
            count={movimientosFiltrados.length}
            search={busqueda}
            setSearch={setBusqueda}
            searchPlaceholder="Buscar movimiento..."
          />

          {movimientosFiltrados.length === 0 ? (
            <EmptyState text="No hay movimientos registrados." />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Concepto</th>
                    <th>Monto</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {movimientosFiltrados.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <span
                          className={
                            m.tipo === 'ingreso'
                              ? 'badge badge-success'
                              : 'badge badge-danger'
                          }
                        >
                          {m.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                        </span>
                      </td>

                      <td>
                        <strong>{m.concepto}</strong>
                      </td>

                      <td>
                        <strong>{formatMoney(m.monto)}</strong>
                      </td>

                      <td>
                        {m.tipo === 'ingreso' ? 'Suma a caja' : 'Resta de caja'}
                      </td>
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

export default Caja