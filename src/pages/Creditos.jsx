import { useState } from 'react'
import { useData } from '../context/DataContext'

import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import FormField from '../components/FormField'
import SectionHeader from '../components/SectionHeader'

function Creditos() {
  const { creditos, addCredito } = useData()

  const [cliente, setCliente] = useState('')
  const [monto, setMonto] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    })
  }

  const creditosFiltrados = creditos.filter((c) =>
    c.cliente.toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalCreditos = creditos.reduce(
    (acc, c) => acc + Number(c.monto || 0),
    0
  )

  const saldoPendiente = creditos.reduce(
    (acc, c) => acc + Number(c.saldo || 0),
    0
  )

  const creditosPagados = creditos.filter(
    (c) => Number(c.saldo || 0) <= 0
  ).length

  const handleAdd = (e) => {
    e.preventDefault()

    if (!cliente.trim()) {
      alert('Escribe el nombre del cliente')
      return
    }

    if (!monto || Number(monto) <= 0) {
      alert('Ingresa un monto válido')
      return
    }

    addCredito({
      cliente: cliente.trim(),
      monto: Number(monto),
    })

    setCliente('')
    setMonto('')
  }

  return (
    <div className="page">
      <PageHeader
        label="Control de cartera"
        title="Créditos"
        subtitle="Registra ventas o saldos pendientes por cliente y controla los abonos recibidos."
      />

      <div className="stats-grid">
        <StatCard title="Total créditos" value={formatMoney(totalCreditos)} />
        <StatCard
          title="Saldo pendiente"
          value={formatMoney(saldoPendiente)}
          warning
        />
        <StatCard title="Créditos pagados" value={creditosPagados} />
      </div>

      <div className="content-grid">
        <section className="card">
          <h2 className="section-title">Nuevo crédito</h2>

          <form onSubmit={handleAdd} className="form">
            <FormField
              label="Cliente"
              placeholder="Ej: Juan Pérez"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
            />

            <FormField
              label="Monto inicial"
              type="number"
              placeholder="Ej: 50000"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />

            <button className="primary-button" type="submit">
              Crear crédito
            </button>
          </form>
        </section>

        <section className="card card-table">
          <SectionHeader
            title="Créditos registrados"
            count={creditosFiltrados.length}
            search={busqueda}
            setSearch={setBusqueda}
            searchPlaceholder="Buscar cliente..."
          />

          {creditosFiltrados.length === 0 ? (
            <EmptyState text="No hay créditos registrados." />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Monto</th>
                    <th>Saldo</th>
                    <th>Estado</th>
                    <th>Abonar</th>
                  </tr>
                </thead>

                <tbody>
                  {creditosFiltrados.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.cliente}</strong>
                      </td>

                      <td>{formatMoney(c.monto)}</td>

                      <td>
                        <strong>{formatMoney(c.saldo)}</strong>
                      </td>

                      <td>
                        <span
                          className={
                            Number(c.saldo || 0) <= 0
                              ? 'badge badge-success'
                              : 'badge badge-warning'
                          }
                        >
                          {Number(c.saldo || 0) <= 0 ? 'Pagado' : 'Pendiente'}
                        </span>
                      </td>

                      <td>
                        <Abono id={c.id} saldo={c.saldo} />
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

function Abono({ id, saldo }) {
  const { abonarCredito } = useData()
  const [valor, setValor] = useState('')

  const handleAbono = () => {
    if (!valor || Number(valor) <= 0) {
      alert('Ingresa un abono válido')
      return
    }

    if (Number(saldo || 0) <= 0) {
      alert('Este crédito ya está pagado')
      return
    }

    abonarCredito(id, valor)
    setValor('')
  }

  return (
    <div className="abono-box">
      <input
        className="abono-input"
        type="number"
        placeholder="Valor"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
      />

      <button className="small-button" onClick={handleAbono}>
        Abonar
      </button>
    </div>
  )
}

export default Creditos