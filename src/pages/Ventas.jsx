import { useState } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'

import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import FormField from '../components/FormField'
import SectionHeader from '../components/SectionHeader'
import ConfirmModal from '../components/ConfirmModal'

function Ventas() {
  const { productos, ventas, addVenta, removeVenta, resumen } = useData()
  const { role } = useAuth()

  const isAdmin = role === 'owner' || role === 'admin'

  const [productoId, setProductoId] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [efectivo, setEfectivo] = useState('')
  const [transferencia, setTransferencia] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const [ventaAEliminar, setVentaAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  const productoSeleccionado = productos.find((p) => p.id === productoId)

  const cantidadNum = Number(cantidad || 0)
  const efectivoNum = Number(efectivo || 0)
  const transferenciaNum = Number(transferencia || 0)

  const precioUnitario = Number(
    productoSeleccionado?.precio_venta || productoSeleccionado?.precio || 0
  )

  const costoUnitario = Number(productoSeleccionado?.costo_promedio || 0)

  const totalEsperado = precioUnitario * cantidadNum
  const totalRecibido = efectivoNum + transferenciaNum
  const diferencia = totalRecibido - totalEsperado

  const utilidadEstimada = (precioUnitario - costoUnitario) * cantidadNum

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

  const ventasFiltradas = ventas.filter((v) =>
    v.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalVentas = ventas.reduce(
    (acc, v) => acc + Number(v.total || 0),
    0
  )

  const totalEfectivo = ventas.reduce(
    (acc, v) => acc + Number(v.efectivo || 0),
    0
  )

  const totalTransferencia = ventas.reduce(
    (acc, v) => acc + Number(v.transferencia || 0),
    0
  )

  const totalUtilidad = ventas.reduce(
    (acc, v) => acc + Number(v.utilidad_total || 0),
    0
  )

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!productoId) {
      alert('Selecciona un producto')
      return
    }

    if (!productoSeleccionado) {
      alert('Producto no encontrado')
      return
    }

    if (!cantidad || cantidadNum <= 0) {
      alert('Ingresa una cantidad válida')
      return
    }

    if (cantidadNum > Number(productoSeleccionado.stock || 0)) {
      alert('Stock insuficiente')
      return
    }

    if (totalEsperado <= 0) {
      alert('El total esperado debe ser mayor a cero')
      return
    }

    if (totalRecibido !== totalEsperado) {
      alert(
        `El pago no coincide con el total esperado.\n\nTotal esperado: ${formatMoney(totalEsperado)}\nTotal recibido: ${formatMoney(totalRecibido)}\nDiferencia: ${formatMoney(diferencia)}`
      )
      return
    }

    await addVenta({
      productoId,
      cantidad: cantidadNum,
      efectivo: efectivoNum,
      transferencia: transferenciaNum,
      total: totalEsperado,
    })

    setProductoId('')
    setCantidad('')
    setEfectivo('')
    setTransferencia('')
  }

  const abrirModalEliminar = (venta) => {
    if (!isAdmin) {
      alert('No tienes permisos para eliminar ventas')
      return
    }

    setVentaAEliminar(venta)
  }

  const cerrarModalEliminar = () => {
    if (eliminando) return
    setVentaAEliminar(null)
  }

  const confirmarEliminarVenta = async () => {
    if (!ventaAEliminar) return

    try {
      setEliminando(true)
      await removeVenta(ventaAEliminar.id)
      setVentaAEliminar(null)
    } finally {
      setEliminando(false)
    }
  }

  return (
    <div className="page">
      <PageHeader
        label="Registro comercial"
        title="Ventas"
        subtitle="Registra ventas con cálculo automático, control de pagos y utilidad por producto."
      />

      <div className="stats-grid">
        <StatCard title="Total ventas" value={formatMoney(totalVentas)} />
        <StatCard title="Efectivo" value={formatMoney(totalEfectivo)} />
        <StatCard
          title="Transferencia"
          value={formatMoney(totalTransferencia)}
        />
        <StatCard
          title="Utilidad estimada"
          value={formatMoney(totalUtilidad || resumen.utilidad)}
        />
      </div>

      <div className="content-grid">
        <section className="card">
          <h2 className="section-title">Nueva venta</h2>

          <form onSubmit={handleSubmit} className="form">
            <FormField
              as="select"
              label="Producto"
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
            >
              <option value="">Seleccionar producto</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} - {formatMoney(p.precio_venta || p.precio)} - Stock: {p.stock}
                </option>
              ))}
            </FormField>

            {productoSeleccionado && (
              <div className="note-box">
                <strong>{productoSeleccionado.nombre}</strong>
                <br />
                Precio venta: {formatMoney(precioUnitario)}
                <br />
                Costo promedio: {formatMoney(costoUnitario)}
                <br />
                Stock disponible: {productoSeleccionado.stock}
              </div>
            )}

            <div className="field">
              <label className="input-label">Cantidad</label>
              <input
                className="input"
                type="text"
                inputMode="numeric"
                placeholder="Ej: 1"
                value={cantidad}
                onChange={(e) => handleOnlyNumbers(e.target.value, setCantidad)}
              />
            </div>

            <div className="total-box">
              Total esperado: <strong>{formatMoney(totalEsperado)}</strong>
              <br />
              Utilidad estimada:{' '}
              <strong
                className={utilidadEstimada < 0 ? 'text-danger' : 'text-success'}
              >
                {formatMoney(utilidadEstimada)}
              </strong>
            </div>

            <div className="field">
              <label className="input-label">Pago en efectivo</label>
              <input
                className="input"
                type="text"
                inputMode="numeric"
                placeholder="Ej: 20000"
                value={efectivo}
                onChange={(e) => handleOnlyNumbers(e.target.value, setEfectivo)}
              />
            </div>

            <div className="field">
              <label className="input-label">Pago por transferencia</label>
              <input
                className="input"
                type="text"
                inputMode="numeric"
                placeholder="Ej: 30000"
                value={transferencia}
                onChange={(e) =>
                  handleOnlyNumbers(e.target.value, setTransferencia)
                }
              />
            </div>

            <div
              className={
                diferencia === 0
                  ? 'total-box'
                  : diferencia < 0
                  ? 'total-box total-warning'
                  : 'total-box total-danger'
              }
            >
              Total recibido: <strong>{formatMoney(totalRecibido)}</strong>
              <br />
              Diferencia: <strong>{formatMoney(diferencia)}</strong>
            </div>

            <button className="primary-button" type="submit">
              Registrar venta
            </button>
          </form>
        </section>

        <section className="card card-table">
          <SectionHeader
            title="Ventas registradas"
            count={ventasFiltradas.length}
            search={busqueda}
            setSearch={setBusqueda}
            searchPlaceholder="Buscar venta..."
          />

          {ventasFiltradas.length === 0 ? (
            <EmptyState text="No hay ventas registradas." />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio unit.</th>
                    <th>Costo unit.</th>
                    <th>Efectivo</th>
                    <th>Transferencia</th>
                    <th>Total</th>
                    <th>Utilidad</th>
                    {isAdmin && <th>Acción</th>}
                  </tr>
                </thead>

                <tbody>
                  {ventasFiltradas.map((v) => (
                    <tr key={v.id}>
                      <td>
                        <strong>{v.nombre}</strong>
                      </td>

                      <td>{v.cantidad}</td>
                      <td>{formatMoney(v.precio_unitario)}</td>
                      <td>{formatMoney(v.costo_unitario)}</td>
                      <td>{formatMoney(v.efectivo)}</td>
                      <td>{formatMoney(v.transferencia)}</td>
                      <td>
                        <strong>{formatMoney(v.total)}</strong>
                      </td>
                      <td>
                        <strong
                          className={
                            Number(v.utilidad_total || 0) < 0
                              ? 'text-danger'
                              : 'text-success'
                          }
                        >
                          {formatMoney(v.utilidad_total)}
                        </strong>
                      </td>

                      {isAdmin && (
                        <td>
                          <button
                            className="delete-button"
                            onClick={() => abrirModalEliminar(v)}
                          >
                            Eliminar
                          </button>
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

      <ConfirmModal
        open={Boolean(ventaAEliminar)}
        title="Eliminar venta"
        danger
        confirmText={eliminando ? 'Eliminando...' : 'Eliminar venta'}
        cancelText="Cancelar"
        message={
          ventaAEliminar
            ? `¿Seguro que deseas eliminar esta venta?\n\nProducto: ${ventaAEliminar.nombre}\nTotal: ${formatMoney(ventaAEliminar.total)}\n\nEl stock será restaurado y se eliminará el movimiento de caja asociado.`
            : ''
        }
        onCancel={cerrarModalEliminar}
        onConfirm={confirmarEliminarVenta}
      />
    </div>
  )
}

export default Ventas