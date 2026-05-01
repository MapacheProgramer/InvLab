import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export const DataContext = createContext(null)
export const useData = () => useContext(DataContext)

const uid = () => Math.random().toString(36).slice(2, 10)
const today = () => new Date().toISOString()

const load = (key, fallback) => {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}

const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export function DataProvider({ children }) {
  const [productos, setProductos] = useState(() =>
    load('productos', [
      { id: uid(), nombre: 'Corte', precio: 15000, stock: 0 },
      { id: uid(), nombre: 'Cejas', precio: 8000, stock: 0 },
    ])
  )
  const [ventas, setVentas] = useState(() => load('ventas', []))
  const [compras, setCompras] = useState(() => load('compras', []))
  const [creditos, setCreditos] = useState(() => load('creditos', []))
  const [caja, setCaja] = useState(() =>
    load('caja', { saldoInicial: 0, movimientos: [] })
  )

  useEffect(() => save('productos', productos), [productos])
  useEffect(() => save('ventas', ventas), [ventas])
  useEffect(() => save('compras', compras), [compras])
  useEffect(() => save('creditos', creditos), [creditos])
  useEffect(() => save('caja', caja), [caja])

  // Inventario
  const addProducto = ({ nombre, precio, stock }) => {
    setProductos((prev) => [
      ...prev,
      { id: uid(), nombre, precio: Number(precio), stock: Number(stock || 0) },
    ])
  }

  const updateProducto = (id, patch) => {
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    )
  }

  const removeProducto = (id) => {
    setProductos((prev) => prev.filter((p) => p.id !== id))
  }

  // Compras (aumenta stock)
  const addCompra = ({ productoId, cantidad, costo }) => {
    const p = productos.find((x) => x.id === productoId)
    if (!p) return

    const qty = Number(cantidad)
    const cost = Number(costo)

    const compra = {
      id: uid(),
      productoId,
      nombre: p.nombre,
      cantidad: qty,
      costo: cost,
      total: qty * cost,
      fecha: today(),
    }

    setCompras((prev) => [compra, ...prev])

    setProductos((prev) =>
      prev.map((x) =>
        x.id === productoId ? { ...x, stock: Number(x.stock) + qty } : x
      )
    )

    setCaja((prev) => ({
      ...prev,
      movimientos: [
        {
          id: uid(),
          tipo: 'egreso',
          concepto: `Compra: ${p.nombre}`,
          monto: compra.total,
          fecha: today(),
        },
        ...prev.movimientos,
      ],
    }))
  }

  // Ventas (reduce stock y registra caja)
  const addVenta = ({ productoId, cantidad, efectivo, transferencia }) => {
    const p = productos.find((x) => x.id === productoId)
    if (!p) return

    const qty = Number(cantidad)
    const ef = Number(efectivo || 0)
    const tr = Number(transferencia || 0)
    const total = ef + tr

    if (qty > p.stock) {
      alert('Stock insuficiente')
      return
    }

    const venta = {
      id: uid(),
      productoId,
      nombre: p.nombre,
      cantidad: qty,
      efectivo: ef,
      transferencia: tr,
      total,
      fecha: today(),
    }

    setVentas((prev) => [venta, ...prev])

    setProductos((prev) =>
      prev.map((x) =>
        x.id === productoId ? { ...x, stock: Number(x.stock) - qty } : x
      )
    )

    setCaja((prev) => ({
      ...prev,
      movimientos: [
        {
          id: uid(),
          tipo: 'ingreso',
          concepto: `Venta: ${p.nombre}`,
          monto: total,
          fecha: today(),
        },
        ...prev.movimientos,
      ],
    }))
  }

  // Créditos
  const addCredito = ({ cliente, monto }) => {
    const c = {
      id: uid(),
      cliente,
      monto: Number(monto),
      saldo: Number(monto),
      fecha: today(),
      pagos: [],
    }
    setCreditos((prev) => [c, ...prev])
  }

  const abonarCredito = (id, valor) => {
    const v = Number(valor)
    setCreditos((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              saldo: Math.max(0, c.saldo - v),
              pagos: [
                { id: uid(), monto: v, fecha: today() },
                ...c.pagos,
              ],
            }
          : c
      )
    )

    setCaja((prev) => ({
      ...prev,
      movimientos: [
        {
          id: uid(),
          tipo: 'ingreso',
          concepto: `Abono crédito`,
          monto: v,
          fecha: today(),
        },
        ...prev.movimientos,
      ],
    }))
  }

  // Caja
  const setSaldoInicial = (monto) => {
    setCaja((prev) => ({ ...prev, saldoInicial: Number(monto) }))
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

    addProducto,
    updateProducto,
    removeProducto,

    addCompra,
    addVenta,

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