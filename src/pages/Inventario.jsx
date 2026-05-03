import { useState } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import FormField from '../components/FormField'
import SectionHeader from '../components/SectionHeader'
import ConfirmModal from '../components/ConfirmModal'

function Inventario() {
  const {
    productos,
    addProducto,
    updateProducto,
    ajustarStock,
    removeProducto,
  } = useData()

  const { role } = useAuth()
  const toast = useToast()

  const isAdmin = role === 'owner' || role === 'admin'

  const [nombre, setNombre] = useState('')
  const [precioVenta, setPrecioVenta] = useState('')
  const [costoPromedio, setCostoPromedio] = useState('')
  const [stock, setStock] = useState('')
  const [stockMinimo, setStockMinimo] = useState('3')
  const [categoria, setCategoria] = useState('General')
  const [busqueda, setBusqueda] = useState('')

  const [productoEditando, setProductoEditando] = useState(null)
  const [productoAjustando, setProductoAjustando] = useState(null)
  const [productoEliminando, setProductoEliminando] = useState(null)

  const [editForm, setEditForm] = useState({
    nombre: '',
    categoria: '',
    precio_venta: '',
    costo_promedio: '',
    stock_minimo: '',
  })

  const [ajusteForm, setAjusteForm] = useState({
    tipo: 'entrada',
    cantidad: '',
    motivo: '',
  })

  const [ajusteError, setAjusteError] = useState('')
  const [editError, setEditError] = useState('')

  const handleOnlyNumbers = (value, setter) => {
    const cleanValue = value.replace(/\D/g, '')
    setter(cleanValue)
  }

  const handleObjectNumber = (value, key, setter) => {
    const cleanValue = value.replace(/\D/g, '')
    setter((prev) => ({ ...prev, [key]: cleanValue }))
  }

  const productosFiltrados = productos.filter((p) => {
    const texto = `${p.nombre} ${p.categoria}`.toLowerCase()
    return texto.includes(busqueda.toLowerCase())
  })

  const totalProductos = productos.length

  const valorInventarioVenta = productos.reduce(
    (total, p) => total + Number(p.precio_venta || 0) * Number(p.stock || 0),
    0
  )

  const valorInventarioCosto = productos.reduce(
    (total, p) => total + Number(p.costo_promedio || 0) * Number(p.stock || 0),
    0
  )

  const bajoStock = productos.filter(
    (p) => Number(p.stock || 0) <= Number(p.stock_minimo || 3)
  ).length

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    })
  }

  const handleAdd = async (e) => {
    e.preventDefault()

    if (!isAdmin) {
      toast.warning('No tienes permisos para crear productos')
      return
    }

    if (!nombre.trim()) {
      toast.warning('Escribe el nombre del producto')
      return
    }

    if (!precioVenta || Number(precioVenta) <= 0) {
      toast.warning('Ingresa un precio de venta válido')
      return
    }

    try {
      await addProducto({
        nombre: nombre.trim(),
        precio_venta: Number(precioVenta),
        costo_promedio: Number(costoPromedio || 0),
        stock: Number(stock || 0),
        stock_minimo: Number(stockMinimo || 3),
        categoria: categoria.trim() || 'General',
      })

      toast.success('Producto guardado correctamente')

      setNombre('')
      setPrecioVenta('')
      setCostoPromedio('')
      setStock('')
      setStockMinimo('3')
      setCategoria('General')
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'No se pudo guardar el producto')
    }
  }

  const abrirEditar = (producto) => {
    setProductoEditando(producto)
    setEditError('')

    setEditForm({
      nombre: producto.nombre || '',
      categoria: producto.categoria || 'General',
      precio_venta: String(producto.precio_venta || producto.precio || ''),
      costo_promedio: String(producto.costo_promedio || ''),
      stock_minimo: String(producto.stock_minimo || 3),
    })
  }

  const cerrarEditar = () => {
    setProductoEditando(null)
    setEditError('')
  }

  const confirmarEditar = async () => {
    if (!productoEditando) return

    if (!editForm.nombre.trim()) {
      setEditError('El nombre del producto es obligatorio.')
      return
    }

    if (!editForm.precio_venta || Number(editForm.precio_venta) <= 0) {
      setEditError('El precio de venta debe ser mayor a cero.')
      return
    }

    try {
      await updateProducto(productoEditando.id, {
        nombre: editForm.nombre,
        categoria: editForm.categoria,
        precio_venta: Number(editForm.precio_venta || 0),
        costo_promedio: Number(editForm.costo_promedio || 0),
        stock_minimo: Number(editForm.stock_minimo || 3),
      })

      toast.success('Producto actualizado correctamente')
      setProductoEditando(null)
      setEditError('')
    } catch (error) {
      console.error(error)
      setEditError(error.message || 'No se pudo actualizar el producto.')
    }
  }

  const abrirAjuste = (producto) => {
    setProductoAjustando(producto)
    setAjusteError('')

    setAjusteForm({
      tipo: 'entrada',
      cantidad: '',
      motivo: '',
    })
  }

  const cerrarAjuste = () => {
    setProductoAjustando(null)
    setAjusteError('')
  }

  const confirmarAjuste = async () => {
    if (!productoAjustando) return

    if (!ajusteForm.cantidad || Number(ajusteForm.cantidad) <= 0) {
      setAjusteError('Ingresa una cantidad válida para realizar el ajuste.')
      return
    }

    if (!ajusteForm.motivo.trim()) {
      setAjusteError('Debes escribir el motivo del ajuste.')
      return
    }

    try {
      await ajustarStock(productoAjustando.id, {
        tipo: ajusteForm.tipo,
        cantidad: Number(ajusteForm.cantidad || 0),
        motivo: ajusteForm.motivo,
      })

      toast.success('Stock ajustado correctamente')
      setProductoAjustando(null)
      setAjusteError('')
    } catch (error) {
      console.error(error)
      setAjusteError(error.message || 'No se pudo ajustar el stock.')
    }
  }

  const confirmarEliminar = async () => {
    if (!productoEliminando) return

    try {
      await removeProducto(productoEliminando.id)
      toast.success('Producto eliminado correctamente')
      setProductoEliminando(null)
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'No se pudo eliminar el producto')
    }
  }

  return (
    <div className="page">
      <PageHeader
        label="Gestión de productos"
        title="Inventario"
        subtitle="Administra productos, costos, precios de venta, categorías, stock mínimo y ajustes manuales."
      />

      <div className="stats-grid">
        <StatCard title="Productos" value={totalProductos} />

        <StatCard
          title="Valor a precio venta"
          value={formatMoney(valorInventarioVenta)}
        />

        <StatCard
          title="Valor a costo"
          value={formatMoney(valorInventarioCosto)}
        />

        <StatCard title="Bajo stock" value={bajoStock} warning />
      </div>

      <div className="content-grid">
        {isAdmin ? (
          <section className="card">
            <h2 className="section-title">Agregar producto</h2>

            <form onSubmit={handleAdd} className="form">
              <FormField
                label="Nombre del producto"
                placeholder="Ej: Filtro de aceite"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />

              <FormField
                label="Categoría"
                placeholder="Ej: Repuestos"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              />

              <FormField
                label="Precio de venta"
                type="text"
                inputMode="numeric"
                placeholder="Ej: 25000"
                value={precioVenta}
                onChange={(e) => handleOnlyNumbers(e.target.value, setPrecioVenta)}
              />

              <FormField
                label="Costo inicial / promedio"
                type="text"
                inputMode="numeric"
                placeholder="Ej: 15000"
                value={costoPromedio}
                onChange={(e) =>
                  handleOnlyNumbers(e.target.value, setCostoPromedio)
                }
              />

              <FormField
                label="Stock inicial"
                type="text"
                inputMode="numeric"
                placeholder="Ej: 10"
                value={stock}
                onChange={(e) => handleOnlyNumbers(e.target.value, setStock)}
              />

              <FormField
                label="Stock mínimo"
                type="text"
                inputMode="numeric"
                placeholder="Ej: 3"
                value={stockMinimo}
                onChange={(e) =>
                  handleOnlyNumbers(e.target.value, setStockMinimo)
                }
              />

              <button className="primary-button" type="submit">
                Guardar producto
              </button>
            </form>
          </section>
        ) : (
          <section className="card">
            <h2 className="section-title">Modo empleado</h2>
            <p className="small-text">
              Puedes consultar el inventario, pero no crear, editar ni eliminar
              productos.
            </p>
          </section>
        )}

        <section className="card card-table">
          <SectionHeader
            title="Productos registrados"
            count={productosFiltrados.length}
            search={busqueda}
            setSearch={setBusqueda}
            searchPlaceholder="Buscar producto o categoría..."
          />

          {productosFiltrados.length === 0 ? (
            <EmptyState
              text="No hay productos registrados."
              detail={
                isAdmin ? 'Agrega tu primer producto desde el formulario.' : ''
              }
            />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Precio venta</th>
                    <th>Costo promedio</th>
                    <th>Stock</th>
                    <th>Stock mín.</th>
                    <th>Margen</th>
                    <th>Estado</th>
                    {isAdmin && <th>Acciones</th>}
                  </tr>
                </thead>

                <tbody>
                  {productosFiltrados.map((p) => {
                    const stockActual = Number(p.stock || 0)
                    const stockMin = Number(p.stock_minimo || 3)
                    const precioVenta = Number(p.precio_venta || p.precio || 0)
                    const costoPromedio = Number(p.costo_promedio || 0)
                    const margen = precioVenta - costoPromedio

                    return (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.nombre}</strong>
                        </td>

                        <td>{p.categoria || 'General'}</td>
                        <td>{formatMoney(precioVenta)}</td>
                        <td>{formatMoney(costoPromedio)}</td>
                        <td>{stockActual}</td>
                        <td>{stockMin}</td>

                        <td>
                          <strong
                            className={
                              margen < 0 ? 'text-danger' : 'text-success'
                            }
                          >
                            {formatMoney(margen)}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={
                              stockActual <= 0
                                ? 'badge badge-danger'
                                : stockActual <= stockMin
                                ? 'badge badge-warning'
                                : 'badge badge-success'
                            }
                          >
                            {stockActual <= 0
                              ? 'Agotado'
                              : stockActual <= stockMin
                              ? 'Bajo stock'
                              : 'Disponible'}
                          </span>
                        </td>

                        {isAdmin && (
                          <td>
                            <div className="action-group">
                              <button
                                type="button"
                                className="small-button"
                                onClick={() => abrirEditar(p)}
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                className="small-button"
                                onClick={() => abrirAjuste(p)}
                              >
                                Ajustar
                              </button>

                              <button
                                type="button"
                                className="delete-button"
                                onClick={() => setProductoEliminando(p)}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <ConfirmModal
        open={Boolean(productoEliminando)}
        title="Eliminar producto"
        danger
        confirmText="Eliminar"
        cancelText="Cancelar"
        message={
          productoEliminando
            ? `¿Seguro que deseas eliminar "${productoEliminando.nombre}"?\n\nEsta acción eliminará el producto del inventario.`
            : ''
        }
        onCancel={() => setProductoEliminando(null)}
        onConfirm={confirmarEliminar}
      />

      {productoEditando && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 className="modal-title">Editar producto</h2>

            <div className="form">
              {editError && (
                <div className="form-error">
                  {editError}
                </div>
              )}

              <FormField
                label="Nombre"
                value={editForm.nombre}
                onChange={(e) => {
                  setEditError('')
                  setEditForm((prev) => ({ ...prev, nombre: e.target.value }))
                }}
              />

              <FormField
                label="Categoría"
                value={editForm.categoria}
                onChange={(e) => {
                  setEditError('')
                  setEditForm((prev) => ({
                    ...prev,
                    categoria: e.target.value,
                  }))
                }}
              />

              <FormField
                label="Precio de venta"
                type="text"
                inputMode="numeric"
                value={editForm.precio_venta}
                onChange={(e) => {
                  setEditError('')
                  handleObjectNumber(e.target.value, 'precio_venta', setEditForm)
                }}
              />

              <FormField
                label="Costo promedio"
                type="text"
                inputMode="numeric"
                value={editForm.costo_promedio}
                onChange={(e) => {
                  setEditError('')
                  handleObjectNumber(
                    e.target.value,
                    'costo_promedio',
                    setEditForm
                  )
                }}
              />

              <FormField
                label="Stock mínimo"
                type="text"
                inputMode="numeric"
                value={editForm.stock_minimo}
                onChange={(e) => {
                  setEditError('')
                  handleObjectNumber(e.target.value, 'stock_minimo', setEditForm)
                }}
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={cerrarEditar}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={confirmarEditar}
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {productoAjustando && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 className="modal-title">Ajustar stock</h2>

            <p className="modal-message">
              Producto: {productoAjustando.nombre}
              {'\n'}
              Stock actual: {productoAjustando.stock}
            </p>

            <div className="form">
              {ajusteError && (
                <div className="form-error">
                  {ajusteError}
                </div>
              )}

              <FormField
                as="select"
                label="Tipo de ajuste"
                value={ajusteForm.tipo}
                onChange={(e) => {
                  setAjusteError('')
                  setAjusteForm((prev) => ({
                    ...prev,
                    tipo: e.target.value,
                  }))
                }}
              >
                <option value="entrada">Entrada manual</option>
                <option value="salida">Salida manual</option>
              </FormField>

              <FormField
                label="Cantidad"
                type="text"
                inputMode="numeric"
                value={ajusteForm.cantidad}
                placeholder="Ej: 2"
                onChange={(e) => {
                  setAjusteError('')
                  handleObjectNumber(e.target.value, 'cantidad', setAjusteForm)
                }}
              />

              <FormField
                label="Motivo"
                value={ajusteForm.motivo}
                placeholder="Ej: Producto dañado, conteo físico, ajuste por error"
                onChange={(e) => {
                  setAjusteError('')
                  setAjusteForm((prev) => ({
                    ...prev,
                    motivo: e.target.value,
                  }))
                }}
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={cerrarAjuste}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={confirmarAjuste}
                >
                  Guardar ajuste
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventario