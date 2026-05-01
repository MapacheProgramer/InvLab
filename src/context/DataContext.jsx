import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import {
  getProductos,
  createProducto,
  deleteProducto,
  getVentas,
  createVenta,
  getCompras,
  createCompra,
  getCreditos,
  createCredito,
  pagarCredito,
  getCaja,
  updateSaldoInicial,
} from '../services/databaseService'

export const DataContext = createContext(null)

export const useData = () => useContext(DataContext)

export function DataProvider({ children }) {
  const [productos, setProductos] = useState([])
  const [ventas, setVentas] = useState([])
  const [compras, setCompras] = useState([])
  const [creditos, setCreditos] = useState([])
  const [caja, setCaja] = useState({
    saldoInicial: 0,
    movimientos: [],
  })

  const [loading, setLoading] = useState(true)

  const cargarDatos = async () => {
    try {
      setLoading(true)

      const [
        productosData,
        ventasData,
        comprasData,
        creditosData,
        cajaData,
      ] = await Promise.all([
        getProductos(),
        getVentas(),
        getCompras(),
        getCreditos(),
        getCaja(),
      ])

      setProductos(productosData)
      setVentas(ventasData)
      setCompras(comprasData)
      setCreditos(creditosData)
      setCaja(cajaData)
    } catch (error) {
      console.error(error)
      alert('Error cargando datos desde Supabase')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  // Inventario
  const addProducto = async ({ nombre, precio, stock }) => {
    try {
      await createProducto({ nombre, precio, stock })
      await cargarDatos()
    } catch (error) {
      console.error(error)
      alert('Error creando producto')
    }
  }

  const updateProducto = async () => {
    alert('Edición de producto pendiente por implementar')
  }

  const removeProducto = async (id) => {
    try {
      await deleteProducto(id)
      await cargarDatos()
    } catch (error) {
      console.error(error)
      alert('Error eliminando producto')
    }
  }

  // Ventas
  const addVenta = async ({ productoId, cantidad, efectivo, transferencia }) => {
    try {
      const producto = productos.find((p) => p.id === productoId)

      if (!producto) {
        alert('Producto no encontrado')
        return
      }

      await createVenta({
        producto,
        cantidad,
        efectivo,
        transferencia,
      })

      await cargarDatos()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error registrando venta')
    }
  }

  // Compras
  const addCompra = async ({ productoId, cantidad, costo }) => {
    try {
      const producto = productos.find((p) => p.id === productoId)

      if (!producto) {
        alert('Producto no encontrado')
        return
      }

      await createCompra({
        producto,
        cantidad,
        costo,
      })

      await cargarDatos()
    } catch (error) {
      console.error(error)
      alert('Error registrando compra')
    }
  }

  // Créditos
  const addCredito = async ({ cliente, monto }) => {
    try {
      await createCredito({ cliente, monto })
      await cargarDatos()
    } catch (error) {
      console.error(error)
      alert('Error creando crédito')
    }
  }

  const abonarCredito = async (id, valor) => {
    try {
      await pagarCredito(id, valor)
      await cargarDatos()
    } catch (error) {
      console.error(error)
      alert('Error abonando crédito')
    }
  }

  // Caja
  const setSaldoInicial = async (monto) => {
    try {
      await updateSaldoInicial(monto)
      await cargarDatos()
    } catch (error) {
      console.error(error)
      alert('Error actualizando saldo inicial')
    }
  }

  const resumen = useMemo(() => {
    const ingresos = caja.movimientos
      .filter((m) => m.tipo === 'ingreso')
      .reduce((a, b) => a + Number(b.monto), 0)

    const egresos = caja.movimientos
      .filter((m) => m.tipo === 'egreso')
      .reduce((a, b) => a + Number(b.monto), 0)

    const saldo =
      Number(caja.saldoInicial) + Number(ingresos) - Number(egresos)

    return { ingresos, egresos, saldo }
  }, [caja])

  const value = {
    productos,
    ventas,
    compras,
    creditos,
    caja,
    resumen,
    loading,

    cargarDatos,

    addProducto,
    updateProducto,
    removeProducto,

    addCompra,
    addVenta,

    addCredito,
    abonarCredito,

    setSaldoInicial,
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-card">
          <h2>InvLab</h2>
          <p>Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}