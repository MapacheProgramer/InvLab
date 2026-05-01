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
  return data || []
}

export async function createProducto(producto, companyId) {
  const { data, error } = await supabase
    .from('productos')
    .insert({
      nombre: producto.nombre,
      precio: Number(producto.precio || 0),
      stock: Number(producto.stock || 0),
      company_id: companyId,
    })
    .select()
    .single()

  if (error) throw error
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
    cantidad: v.cantidad,
    efectivo: v.efectivo,
    transferencia: v.transferencia,
    total: v.total,
    fecha: v.fecha,
  }))
}

export async function createVenta(
  { producto, cantidad, efectivo, transferencia },
  companyId
) {
  const qty = Number(cantidad || 0)
  const ef = Number(efectivo || 0)
  const tr = Number(transferencia || 0)
  const total = ef + tr

  if (qty > Number(producto.stock || 0)) {
    throw new Error('Stock insuficiente')
  }

  const { data: venta, error: ventaError } = await supabase
    .from('ventas')
    .insert({
      producto_id: producto.id,
      nombre: producto.nombre,
      cantidad: qty,
      efectivo: ef,
      transferencia: tr,
      total,
      company_id: companyId,
    })
    .select()
    .single()

  if (ventaError) throw ventaError

  const nuevoStock = Number(producto.stock || 0) - qty

  const { error: stockError } = await supabase
    .from('productos')
    .update({ stock: nuevoStock })
    .eq('id', producto.id)
    .eq('company_id', companyId)

  if (stockError) throw stockError

  const { error: cajaError } = await supabase
    .from('caja_movimientos')
    .insert({
      tipo: 'ingreso',
      concepto: `Venta: ${producto.nombre}`,
      monto: total,
      company_id: companyId,
    })

  if (cajaError) throw cajaError

  return venta
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
    cantidad: c.cantidad,
    costo: c.costo,
    total: c.total,
    fecha: c.fecha,
  }))
}

export async function createCompra({ producto, cantidad, costo }, companyId) {
  const qty = Number(cantidad || 0)
  const cost = Number(costo || 0)
  const total = qty * cost

  const { data: compra, error: compraError } = await supabase
    .from('compras')
    .insert({
      producto_id: producto.id,
      nombre: producto.nombre,
      cantidad: qty,
      costo: cost,
      total,
      company_id: companyId,
    })
    .select()
    .single()

  if (compraError) throw compraError

  const nuevoStock = Number(producto.stock || 0) + qty

  const { error: stockError } = await supabase
    .from('productos')
    .update({ stock: nuevoStock })
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
    })

  if (cajaError) throw cajaError

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
    monto: c.monto,
    saldo: c.saldo,
    fecha: c.fecha,
    pagos: c.pagos_credito || [],
  }))
}

export async function createCredito({ cliente, monto }, companyId) {
  const valor = Number(monto || 0)

  const { data, error } = await supabase
    .from('creditos')
    .insert({
      cliente,
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

  const { error: pagoError } = await supabase
    .from('pagos_credito')
    .insert({
      credito_id: id,
      monto,
    })

  if (pagoError) throw pagoError

  const { error: cajaError } = await supabase
    .from('caja_movimientos')
    .insert({
      tipo: 'ingreso',
      concepto: 'Abono crédito',
      monto,
      company_id: companyId,
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

  if (!config) {
    const { error: insertError } = await supabase
      .from('caja_config')
      .insert({
        saldo_inicial: 0,
        company_id: companyId,
      })

    if (insertError) throw insertError
  }

  const { data: movimientos, error: movimientosError } = await supabase
    .from('caja_movimientos')
    .select('*')
    .eq('company_id', companyId)
    .order('fecha', { ascending: false })

  if (movimientosError) throw movimientosError

  return {
    saldoInicial: Number(config?.saldo_inicial || 0),
    movimientos: movimientos || [],
  }
}

export async function updateSaldoInicial(monto, companyId) {
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
        saldo_inicial: Number(monto || 0),
        company_id: companyId,
      })

    if (insertError) throw insertError

    return
  }

  const { error } = await supabase
    .from('caja_config')
    .update({
      saldo_inicial: Number(monto || 0),
      updated_at: new Date().toISOString(),
    })
    .eq('company_id', companyId)

  if (error) throw error
}