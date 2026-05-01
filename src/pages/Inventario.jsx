import { useState } from 'react'
import { useData } from '../context/DataContext'

import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import FormField from '../components/FormField'
import SectionHeader from '../components/SectionHeader'

function Inventario() {
  const { productos, addProducto, removeProducto } = useData()

  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [stock, setStock] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalProductos = productos.length

  const valorInventario = productos.reduce(
    (total, p) => total + Number(p.precio || 0) * Number(p.stock || 0),
    0
  )

  const bajoStock = productos.filter((p) => Number(p.stock) <= 3).length

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    })
  }

  const handleAdd = (e) => {
    e.preventDefault()

    if (!nombre.trim()) {
      alert('Escribe el nombre del producto')
      return
    }

    if (!precio || Number(precio) <= 0) {
      alert('Ingresa un precio válido')
      return
    }

    addProducto({
      nombre: nombre.trim(),
      precio: Number(precio),
      stock: Number(stock || 0),
    })

    setNombre('')
    setPrecio('')
    setStock('')
  }

  return (
    <div className="page">
      <PageHeader
        label="Gestión de productos"
        title="Inventario"
        subtitle="Registra productos, controla existencias y revisa el valor total disponible."
      />

      <div className="stats-grid">
        <StatCard title="Productos" value={totalProductos} />
        <StatCard title="Valor inventario" value={formatMoney(valorInventario)} />
        <StatCard title="Bajo stock" value={bajoStock} warning />
      </div>

      <div className="content-grid">
        <section className="card">
          <h2 className="section-title">Agregar producto</h2>

          <form onSubmit={handleAdd} className="form">
            <FormField
              label="Nombre del producto"
              placeholder="Ej: Protector tacómetro"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />

            <FormField
              label="Precio de venta"
              type="number"
              placeholder="Ej: 25000"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />

            <FormField
              label="Stock inicial"
              type="number"
              placeholder="Ej: 10"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />

            <button className="primary-button" type="submit">
              Guardar producto
            </button>
          </form>
        </section>

        <section className="card card-table">
          <SectionHeader
            title="Productos registrados"
            count={productosFiltrados.length}
            search={busqueda}
            setSearch={setBusqueda}
            searchPlaceholder="Buscar producto..."
          />

          {productosFiltrados.length === 0 ? (
            <EmptyState
              text="No hay productos registrados."
              detail="Agrega tu primer producto desde el formulario."
            />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Valor total</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {productosFiltrados.map((p) => {
                    const stockActual = Number(p.stock || 0)
                    const valorTotal = Number(p.precio || 0) * stockActual

                    return (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.nombre}</strong>
                        </td>

                        <td>{formatMoney(p.precio)}</td>

                        <td>{stockActual}</td>

                        <td>{formatMoney(valorTotal)}</td>

                        <td>
                          <span
                            className={
                              stockActual <= 0
                                ? 'badge badge-danger'
                                : stockActual <= 3
                                ? 'badge badge-warning'
                                : 'badge badge-success'
                            }
                          >
                            {stockActual <= 0
                              ? 'Agotado'
                              : stockActual <= 3
                              ? 'Bajo stock'
                              : 'Disponible'}
                          </span>
                        </td>

                        <td>
                          <button
                            className="delete-button"
                            onClick={() => {
                              const ok = confirm(`¿Eliminar "${p.nombre}"?`)
                              if (ok) removeProducto(p.id)
                            }}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Inventario