import { supabase } from '../lib/supabaseClient'

// ==========================
// PRODUCTOS
// ==========================

export async function getProductos(companyId) {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map((p) => ({
    ...p,

    // Compatibilidad con páginas antiguas que todavía usan p.precio
    precio: Number(p.precio_venta ?? p.precio ?? 0),

    precio_venta: Number(p.precio_venta ?? p.precio ?? 0),
    costo_promedio: Number(p.costo_promedio || 0),
    stock_minimo: Number(p.stock_minimo || 3),
    categoria: p.categoria || 'General',
  }))
}

export async function createProducto(producto, companyId) {
  const precioVenta = Number(producto.precio_venta ?? producto.precio ?? 0)
  const costoPromedio = Number(producto.costo_promedio || 0)
  const stock = Number(producto.stock || 0)

  const { data, error } = await supabase
    .from('productos')
    .insert({
      nombre: producto.nombre,
      precio_venta: precioVenta,
      precio: precioVenta,
      costo_promedio: costoPromedio,
      stock,
      stock_minimo: Number(producto.stock_minimo || 3),
      categoria: producto.categoria || 'General',
      company_id: companyId,
    })
    .select()
    .single()

  if (error) throw error

  if (stock > 0) {
    await registrarMovimientoInventario({
      productoId: data.id,
      companyId,
      tipo: 'ajuste_entrada',
      concepto: 'Stock inicial',
      cantidad: stock,
      stockAnterior: 0,
      stockNuevo: stock,
      referenciaTipo: 'producto',
      referenciaId: data.id,
    })
  }

  return data
}

export async function deleteProducto(id, companyId) {
  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) throw error
}
export async function updateProducto(id, producto, companyId) {
  const precioVenta = Number(producto.precio_venta || 0)
  const costoPromedio = Number(producto.costo_promedio || 0)
  const stockMinimo = Number(producto.stock_minimo || 3)

  if (!producto.nombre?.trim()) {
    throw new Error('El nombre del producto es obligatorio')
  }

  if (precioVenta <= 0) {
    throw new Error('El precio de venta debe ser mayor a cero')
  }

  if (costoPromedio < 0) {
    throw new Error('El costo promedio no puede ser negativo')
  }

  if (stockMinimo < 0) {
    throw new Error('El stock mínimo no puede ser negativo')
  }

  const { data, error } = await supabase
    .from('productos')
    .update({
      nombre: producto.nombre.trim(),
      categoria: producto.categoria?.trim() || 'General',
      precio_venta: precioVenta,
      precio: precioVenta,
      costo_promedio: costoPromedio,
      stock_minimo: stockMinimo,
    })
    .eq('id', id)
    .eq('company_id', companyId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function ajustarStockProducto(
  id,
  { tipo, cantidad, motivo },
  companyId
) {
  const qty = Number(cantidad || 0)

  if (!['entrada', 'salida'].includes(tipo)) {
    throw new Error('Tipo de ajuste inválido')
  }

  if (qty <= 0) {
    throw new Error('La cantidad debe ser mayor a cero')
  }

  if (!motivo?.trim()) {
    throw new Error('Debes escribir el motivo del ajuste')
  }

  const { data: producto, error: productoError } = await supabase
    .from('productos')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (productoError) throw productoError

  const stockAnterior = Number(producto.stock || 0)

  const stockNuevo =
    tipo === 'entrada'
      ? stockAnterior + qty
      : stockAnterior - qty

  if (stockNuevo < 0) {
    throw new Error('No puedes dejar el stock en negativo')
  }

  const { error: updateError } = await supabase
    .from('productos')
    .update({
      stock: stockNuevo,
    })
    .eq('id', id)
    .eq('company_id', companyId)

  if (updateError) throw updateError

  await registrarMovimientoInventario({
    productoId: id,
    companyId,
    tipo: tipo === 'entrada' ? 'ajuste_entrada' : 'ajuste_salida',
    concepto: motivo.trim(),
    cantidad: tipo === 'entrada' ? qty : -qty,
    stockAnterior,
    stockNuevo,
    referenciaTipo: 'ajuste_manual',
    referenciaId: id,
  })
}
// ==========================
// VENTAS
// ==========================

export async function getVentas(companyId) {
  const { data, error } = await supabase
    .from('ventas')
    .select('*')
    .eq('company_id', companyId)
    .order('fecha', { ascending: false })

  if (error) throw error

  return (data || []).map((v) => ({
    id: v.id,
    productoId: v.producto_id,
    nombre: v.nombre,
    cantidad: Number(v.cantidad || 0),
    efectivo: Number(v.efectivo || 0),
    transferencia: Number(v.transferencia || 0),
    total: Number(v.total || 0),
    precio_unitario: Number(v.precio_unitario || 0),
    costo_unitario: Number(v.costo_unitario || 0),
    utilidad_unitaria: Number(v.utilidad_unitaria || 0),
    utilidad_total: Number(v.utilidad_total || 0),
    fecha: v.fecha,
  }))
}

export async function createVenta(
  { producto, cantidad, efectivo, transferencia, total },
  companyId
) {
  const qty = Number(cantidad || 0)
  const ef = Number(efectivo || 0)
  const tr = Number(transferencia || 0)

  const precioUnitario = Number(producto.precio_venta ?? producto.precio ?? 0)
  const costoUnitario = Number(producto.costo_promedio || 0)

  const totalEsperado = Number(total || precioUnitario * qty)
  const totalRecibido = ef + tr

  const utilidadUnitaria = precioUnitario - costoUnitario
  const utilidadTotal = utilidadUnitaria * qty

  if (qty <= 0) {
    throw new Error('La cantidad debe ser mayor a cero')
  }

  if (qty > Number(producto.stock || 0)) {
    throw new Error('Stock insuficiente')
  }

  if (precioUnitario <= 0) {
    throw new Error('El producto no tiene precio de venta válido')
  }

  if (totalEsperado <= 0) {
    throw new Error('El total de la venta debe ser mayor a cero')
  }

  if (totalRecibido !== totalEsperado) {
    throw new Error(
      `El pago recibido no coincide. Esperado: ${totalEsperado}, recibido: ${totalRecibido}`
    )
  }

  const stockAnterior = Number(producto.stock || 0)
  const stockNuevo = stockAnterior - qty

  const { data: venta, error: ventaError } = await supabase
    .from('ventas')
    .insert({
      producto_id: producto.id,
      nombre: producto.nombre,
      cantidad: qty,
      efectivo: ef,
      transferencia: tr,
      total: totalEsperado,
      precio_unitario: precioUnitario,
      costo_unitario: costoUnitario,
      utilidad_unitaria: utilidadUnitaria,
      utilidad_total: utilidadTotal,
      company_id: companyId,
    })
    .select()
    .single()

  if (ventaError) throw ventaError

  const { error: stockError } = await supabase
    .from('productos')
    .update({ stock: stockNuevo })
    .eq('id', producto.id)
    .eq('company_id', companyId)

  if (stockError) throw stockError

  const { error: cajaError } = await supabase
    .from('caja_movimientos')
    .insert({
      tipo: 'ingreso',
      concepto: `Venta: ${producto.nombre}`,
      monto: totalEsperado,
      company_id: companyId,
      referencia_tipo: 'venta',
      referencia_id: venta.id,
    })

  if (cajaError) throw cajaError

  await registrarMovimientoInventario({
    productoId: producto.id,
    companyId,
    tipo: 'venta',
    concepto: `Venta: ${producto.nombre}`,
    cantidad: -qty,
    stockAnterior,
    stockNuevo,
    referenciaTipo: 'venta',
    referenciaId: venta.id,
  })

  return venta
}

export async function deleteVenta(id, companyId) {
  const { data: venta, error: ventaError } = await supabase
    .from('ventas')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (ventaError) throw ventaError

  if (venta.producto_id) {
    const { data: producto, error: productoError } = await supabase
      .from('productos')
      .select('*')
      .eq('id', venta.producto_id)
      .eq('company_id', companyId)
      .maybeSingle()

    if (!productoError && producto) {
      const stockAnterior = Number(producto.stock || 0)
      const stockNuevo = stockAnterior + Number(venta.cantidad || 0)

      const { error: stockError } = await supabase
        .from('productos')
        .update({ stock: stockNuevo })
        .eq('id', producto.id)
        .eq('company_id', companyId)

      if (stockError) throw stockError

      await registrarMovimientoInventario({
        productoId: producto.id,
        companyId,
        tipo: 'ajuste_entrada',
        concepto: `Anulación venta: ${venta.nombre}`,
        cantidad: Number(venta.cantidad || 0),
        stockAnterior,
        stockNuevo,
        referenciaTipo: 'venta_eliminada',
        referenciaId: venta.id,
      })
    }
  }

  const { error: deleteMovimientoReferenciaError } = await supabase
    .from('caja_movimientos')
    .delete()
    .eq('company_id', companyId)
    .eq('referencia_tipo', 'venta')
    .eq('referencia_id', id)

  if (deleteMovimientoReferenciaError) {
    throw deleteMovimientoReferenciaError
  }

  const { error: deleteMovimientoViejoError } = await supabase
    .from('caja_movimientos')
    .delete()
    .eq('company_id', companyId)
    .eq('tipo', 'ingreso')
    .eq('concepto', `Venta: ${venta.nombre}`)
    .eq('monto', venta.total)

  if (deleteMovimientoViejoError) {
    throw deleteMovimientoViejoError
  }

  const { error: deleteError } = await supabase
    .from('ventas')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId)

  if (deleteError) throw deleteError
}

// ==========================
// COMPRAS
// ==========================

export async function getCompras(companyId) {
  const { data, error } = await supabase
    .from('compras')
    .select('*')
    .eq('company_id', companyId)
    .order('fecha', { ascending: false })

  if (error) throw error

  return (data || []).map((c) => ({
    id: c.id,
    productoId: c.producto_id,
    nombre: c.nombre,
    cantidad: Number(c.cantidad || 0),
    costo: Number(c.costo || 0),
    total: Number(c.total || 0),
    costo_promedio_anterior: Number(c.costo_promedio_anterior || 0),
    costo_promedio_nuevo: Number(c.costo_promedio_nuevo || 0),
    fecha: c.fecha,
  }))
}

export async function createCompra({ producto, cantidad, costo }, companyId) {
  const qty = Number(cantidad || 0)
  const cost = Number(costo || 0)
  const total = qty * cost

  if (qty <= 0) {
    throw new Error('La cantidad debe ser mayor a cero')
  }

  if (cost <= 0) {
    throw new Error('El costo debe ser mayor a cero')
  }

  const stockAnterior = Number(producto.stock || 0)
  const costoAnterior = Number(producto.costo_promedio || 0)

  const valorInventarioAnterior = stockAnterior * costoAnterior
  const valorNuevaCompra = qty * cost
  const stockNuevo = stockAnterior + qty

  const costoPromedioNuevo =
    stockNuevo > 0
      ? (valorInventarioAnterior + valorNuevaCompra) / stockNuevo
      : cost

  const { data: compra, error: compraError } = await supabase
    .from('compras')
    .insert({
      producto_id: producto.id,
      nombre: producto.nombre,
      cantidad: qty,
      costo: cost,
      total,
      costo_promedio_anterior: costoAnterior,
      costo_promedio_nuevo: costoPromedioNuevo,
      company_id: companyId,
    })
    .select()
    .single()

  if (compraError) throw compraError

  const { error: stockError } = await supabase
    .from('productos')
    .update({
      stock: stockNuevo,
      costo_promedio: costoPromedioNuevo,
    })
    .eq('id', producto.id)
    .eq('company_id', companyId)

  if (stockError) throw stockError

  const { error: cajaError } = await supabase
    .from('caja_movimientos')
    .insert({
      tipo: 'egreso',
      concepto: `Compra: ${producto.nombre}`,
      monto: total,
      company_id: companyId,
      referencia_tipo: 'compra',
      referencia_id: compra.id,
    })

  if (cajaError) throw cajaError

  await registrarMovimientoInventario({
    productoId: producto.id,
    companyId,
    tipo: 'compra',
    concepto: `Compra: ${producto.nombre}`,
    cantidad: qty,
    stockAnterior,
    stockNuevo,
    referenciaTipo: 'compra',
    referenciaId: compra.id,
  })

  return compra
}

// ==========================
// CRÉDITOS
// ==========================

export async function getCreditos(companyId) {
  const { data, error } = await supabase
    .from('creditos')
    .select(`
      *,
      pagos_credito (*)
    `)
    .eq('company_id', companyId)
    .order('fecha', { ascending: false })

  if (error) throw error

  return (data || []).map((c) => ({
    id: c.id,
    cliente: c.cliente,
    monto: Number(c.monto || 0),
    saldo: Number(c.saldo || 0),
    fecha: c.fecha,
    pagos: c.pagos_credito || [],
  }))
}

export async function createCredito({ cliente, monto }, companyId) {
  const valor = Number(monto || 0)

  if (!cliente?.trim()) {
    throw new Error('El cliente es obligatorio')
  }

  if (valor <= 0) {
    throw new Error('El monto debe ser mayor a cero')
  }

  const { data, error } = await supabase
    .from('creditos')
    .insert({
      cliente: cliente.trim(),
      monto: valor,
      saldo: valor,
      company_id: companyId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function pagarCredito(id, valor, companyId) {
  const monto = Number(valor || 0)

  if (monto <= 0) {
    throw new Error('El abono debe ser mayor a cero')
  }

  const { data: credito, error: creditoError } = await supabase
    .from('creditos')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (creditoError) throw creditoError

  const nuevoSaldo = Math.max(0, Number(credito.saldo || 0) - monto)

  const { error: updateError } = await supabase
    .from('creditos')
    .update({ saldo: nuevoSaldo })
    .eq('id', id)
    .eq('company_id', companyId)

  if (updateError) throw updateError

  const { data: pago, error: pagoError } = await supabase
    .from('pagos_credito')
    .insert({
      credito_id: id,
      monto,
    })
    .select()
    .single()

  if (pagoError) throw pagoError

  const { error: cajaError } = await supabase
    .from('caja_movimientos')
    .insert({
      tipo: 'ingreso',
      concepto: `Abono crédito: ${credito.cliente}`,
      monto,
      company_id: companyId,
      referencia_tipo: 'pago_credito',
      referencia_id: pago.id,
    })

  if (cajaError) throw cajaError
}

// ==========================
// CAJA
// ==========================

export async function getCaja(companyId) {
  const { data: config, error: configError } = await supabase
    .from('caja_config')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle()

  if (configError) throw configError

  let cajaConfig = config

  if (!cajaConfig) {
    const { data: nuevaConfig, error: insertError } = await supabase
      .from('caja_config')
      .insert({
        saldo_inicial: 0,
        company_id: companyId,
      })
      .select()
      .single()

    if (insertError) throw insertError

    cajaConfig = nuevaConfig
  }

  const { data: movimientos, error: movimientosError } = await supabase
    .from('caja_movimientos')
    .select('*')
    .eq('company_id', companyId)
    .order('fecha', { ascending: false })

  if (movimientosError) throw movimientosError

  return {
    saldoInicial: Number(cajaConfig?.saldo_inicial || 0),
    movimientos: movimientos || [],
  }
}

export async function updateSaldoInicial(monto, companyId) {
  const valor = Number(monto || 0)

  if (valor < 0) {
    throw new Error('El saldo inicial no puede ser negativo')
  }

  const { data: current, error: currentError } = await supabase
    .from('caja_config')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle()

  if (currentError) throw currentError

  if (!current) {
    const { error: insertError } = await supabase
      .from('caja_config')
      .insert({
        saldo_inicial: valor,
        company_id: companyId,
      })

    if (insertError) throw insertError

    return
  }

  const { error } = await supabase
    .from('caja_config')
    .update({
      saldo_inicial: valor,
      updated_at: new Date().toISOString(),
    })
    .eq('company_id', companyId)

  if (error) throw error
}

// ==========================
// MOVIMIENTOS INVENTARIO
// ==========================

export async function getMovimientosInventario(companyId) {
  const { data, error } = await supabase
    .from('movimientos_inventario')
    .select('*')
    .eq('company_id', companyId)
    .order('fecha', { ascending: false })

  if (error) throw error
  return data || []
}

async function registrarMovimientoInventario({
  productoId,
  companyId,
  tipo,
  concepto,
  cantidad,
  stockAnterior,
  stockNuevo,
  referenciaTipo,
  referenciaId,
}) {
  const { error } = await supabase
    .from('movimientos_inventario')
    .insert({
      producto_id: productoId,
      company_id: companyId,
      tipo,
      concepto,
      cantidad,
      stock_anterior: Number(stockAnterior || 0),
      stock_nuevo: Number(stockNuevo || 0),
      referencia_tipo: referenciaTipo,
      referencia_id: referenciaId,
    })

  if (error) throw error
}