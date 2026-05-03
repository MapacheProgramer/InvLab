import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import {
  getProductos,
  createProducto,
  deleteProducto,
  updateProducto as updateProductoService,
  ajustarStockProducto,
  getVentas,
  createVenta,
  deleteVenta,
  getCompras,
  createCompra,
  getCreditos,
  createCredito,
  pagarCredito,
  getCaja,
  updateSaldoInicial,
  getMovimientosInventario,
} from '../services/databaseService'

export const DataContext = createContext(null)

export const useData = () => useContext(DataContext)

export function DataProvider({ children, companyId }) {
  const [productos, setProductos] = useState([])
  const [ventas, setVentas] = useState([])
  const [compras, setCompras] = useState([])
  const [creditos, setCreditos] = useState([])
  const [movimientosInventario, setMovimientosInventario] = useState([])

  const [caja, setCaja] = useState({
    saldoInicial: 0,
    movimientos: [],
  })

  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const cargarDatos = async ({ initial = false } = {}) => {
    if (!companyId) return

    try {
      if (initial) {
        setInitialLoading(true)
      } else {
        setRefreshing(true)
      }

      const [
        productosData,
        ventasData,
        comprasData,
        creditosData,
        cajaData,
        movimientosInventarioData,
      ] = await Promise.all([
        getProductos(companyId),
        getVentas(companyId),
        getCompras(companyId),
        getCreditos(companyId),
        getCaja(companyId),
        getMovimientosInventario(companyId),
      ])

      setProductos(productosData)
      setVentas(ventasData)
      setCompras(comprasData)
      setCreditos(creditosData)
      setCaja(cajaData)
      setMovimientosInventario(movimientosInventarioData)
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error cargando datos desde Supabase')
    } finally {
      setInitialLoading(false)
      setRefreshing(false)
    }
  }

  const cargarProductos = async () => {
    const data = await getProductos(companyId)
    setProductos(data)
  }

  const cargarVentas = async () => {
    const data = await getVentas(companyId)
    setVentas(data)
  }

  const cargarCompras = async () => {
    const data = await getCompras(companyId)
    setCompras(data)
  }

  const cargarCreditos = async () => {
    const data = await getCreditos(companyId)
    setCreditos(data)
  }

  const cargarCaja = async () => {
    const data = await getCaja(companyId)
    setCaja(data)
  }

  const cargarMovimientosInventario = async () => {
    const data = await getMovimientosInventario(companyId)
    setMovimientosInventario(data)
  }

  useEffect(() => {
    cargarDatos({ initial: true })
  }, [companyId])

  const addProducto = async ({
    nombre,
    precio,
    precio_venta,
    costo_promedio,
    stock,
    stock_minimo,
    categoria,
  }) => {
    try {
      setRefreshing(true)

      await createProducto(
        {
          nombre,
          precio,
          precio_venta,
          costo_promedio,
          stock,
          stock_minimo,
          categoria,
        },
        companyId
      )

      await Promise.all([
        cargarProductos(),
        cargarMovimientosInventario(),
      ])
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error creando producto')
    } finally {
      setRefreshing(false)
    }
  }

  const updateProducto = async (id, producto) => {
    try {
      setRefreshing(true)

      await updateProductoService(id, producto, companyId)
      await cargarProductos()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error actualizando producto')
    } finally {
      setRefreshing(false)
    }
  }

  const ajustarStock = async (id, ajuste) => {
    try {
      setRefreshing(true)

      await ajustarStockProducto(id, ajuste, companyId)

      await Promise.all([
        cargarProductos(),
        cargarMovimientosInventario(),
      ])
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error ajustando stock')
    } finally {
      setRefreshing(false)
    }
  }

  const removeProducto = async (id) => {
    try {
      setRefreshing(true)

      await deleteProducto(id, companyId)

      await Promise.all([
        cargarProductos(),
        cargarMovimientosInventario(),
      ])
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error eliminando producto')
    } finally {
      setRefreshing(false)
    }
  }

  const addVenta = async ({
    productoId,
    cantidad,
    efectivo,
    transferencia,
    total,
  }) => {
    try {
      setRefreshing(true)

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
          total,
        },
        companyId
      )

      await Promise.all([
        cargarProductos(),
        cargarVentas(),
        cargarCaja(),
        cargarMovimientosInventario(),
      ])
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error registrando venta')
    } finally {
      setRefreshing(false)
    }
  }

  const removeVenta = async (id) => {
    try {
      setRefreshing(true)

      await deleteVenta(id, companyId)

      await Promise.all([
        cargarProductos(),
        cargarVentas(),
        cargarCaja(),
        cargarMovimientosInventario(),
      ])
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error eliminando venta')
    } finally {
      setRefreshing(false)
    }
  }

  const addCompra = async ({ productoId, cantidad, costo }) => {
    try {
      setRefreshing(true)

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

      await Promise.all([
        cargarProductos(),
        cargarCompras(),
        cargarCaja(),
        cargarMovimientosInventario(),
      ])
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error registrando compra')
    } finally {
      setRefreshing(false)
    }
  }

  const addCredito = async ({ cliente, monto }) => {
    try {
      setRefreshing(true)

      await createCredito({ cliente, monto }, companyId)

      await cargarCreditos()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error creando crédito')
    } finally {
      setRefreshing(false)
    }
  }

  const abonarCredito = async (id, valor) => {
    try {
      setRefreshing(true)

      await pagarCredito(id, valor, companyId)

      await Promise.all([
        cargarCreditos(),
        cargarCaja(),
      ])
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error abonando crédito')
    } finally {
      setRefreshing(false)
    }
  }

  const setSaldoInicial = async (monto) => {
    try {
      setRefreshing(true)

      await updateSaldoInicial(monto, companyId)
      await cargarCaja()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Error actualizando saldo inicial')
    } finally {
      setRefreshing(false)
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

    const utilidad = ventas.reduce(
      (acc, v) => acc + Number(v.utilidad_total || 0),
      0
    )

    return { ingresos, egresos, saldo, utilidad }
  }, [caja, ventas])

  const value = {
    productos,
    ventas,
    compras,
    creditos,
    caja,
    movimientosInventario,
    resumen,

    loading: initialLoading,
    refreshing,

    cargarDatos,

    addProducto,
    updateProducto,
    ajustarStock,
    removeProducto,

    addCompra,
    addVenta,
    removeVenta,

    addCredito,
    abonarCredito,

    setSaldoInicial,
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}