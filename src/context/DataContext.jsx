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

export function DataProvider({ children, companyId }) {
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
    if (!companyId) return

    try {
      setLoading(true)

      const [
        productosData,
        ventasData,
        comprasData,
        creditosData,
        cajaData,
      ] = await Promise.all([
        getProductos(companyId),
        getVentas(companyId),
        getCompras(companyId),
        getCreditos(companyId),
        getCaja(companyId),
      ])

      setProductos(productosData)
      setVentas(ventasData)
      setCompras(comprasData)
      setCreditos(creditosData)
      setCaja(cajaData)
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error cargando datos desde Supabase')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [companyId])

  const addProducto = async ({ nombre, precio, stock }) => {
    try {
      await createProducto({ nombre, precio, stock }, companyId)
      await cargarDatos()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error creando producto')
    }
  }

  const updateProducto = async () => {
    alert('Edición de producto pendiente por implementar')
  }

  const removeProducto = async (id) => {
    try {
      await deleteProducto(id, companyId)
      await cargarDatos()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error eliminando producto')
    }
  }

  const addVenta = async ({ productoId, cantidad, efectivo, transferencia }) => {
    try {
      const producto = productos.find((p) => p.id === productoId)

      if (!producto) {
        alert('Producto no encontrado')
        return
      }

      await createVenta(
        {
          producto,
          cantidad,
          efectivo,
          transferencia,
        },
        companyId
      )

      await cargarDatos()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error registrando venta')
    }
  }

  const addCompra = async ({ productoId, cantidad, costo }) => {
    try {
      const producto = productos.find((p) => p.id === productoId)

      if (!producto) {
        alert('Producto no encontrado')
        return
      }

      await createCompra(
        {
          producto,
          cantidad,
          costo,
        },
        companyId
      )

      await cargarDatos()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error registrando compra')
    }
  }

  const addCredito = async ({ cliente, monto }) => {
    try {
      await createCredito({ cliente, monto }, companyId)
      await cargarDatos()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error creando crédito')
    }
  }

  const abonarCredito = async (id, valor) => {
    try {
      await pagarCredito(id, valor, companyId)
      await cargarDatos()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error abonando crédito')
    }
  }

  const setSaldoInicial = async (monto) => {
    try {
      await updateSaldoInicial(monto, companyId)
      await cargarDatos()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error actualizando saldo inicial')
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