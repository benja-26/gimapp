import { useState } from "react"
import { Modal, Field, Input, Select, BtnRow, PageHeader, SubTitle, Empty } from "../components/ui.jsx"
import { fmt, uid } from "../utils/helpers.js"
import { toast } from "../hooks/useToast.js"

export default function PageIngresos({ ingresos, setIngresos, clientes, setClientes }) {
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setFormRaw] = useState({})
  const set = (k, v) => setFormRaw(f => ({ ...f, [k]: v }))

  const getHoyStr = () => new Date().toLocaleDateString("sv-SE")

  const openNew = () => {
    setEditing(null)
    setFormRaw({
      concepto: "Renovación Abono",
      monto: "",
      fecha: getHoyStr(),
      pago: "Efectivo",
      clienteId: ""
    })
    setModal(true)
  }

  const openEdit = (item) => {
    setEditing(item.id)
    setFormRaw({ ...item })
    setModal(true)
  }

  const save = () => {
    if (!form.concepto?.trim()) { toast("⚠️ Ingresá un concepto"); return }
    if (!form.monto || +form.monto <= 0) { toast("⚠️ Ingresá un monto válido"); return }

    const montoNum = +form.monto

    if (editing) {
      // Lanzamos el cartel de advertencia de seguridad que me pediste
      const seguro = window.confirm("⚠️ ¿Estás seguro de que querés modificar este movimiento de caja? Esto alterará los reportes financieros.")
      if (!seguro) return

      // 1. Actualizar el flujo en la caja
      setIngresos(list => list.map(item => item.id === editing ? { ...item, ...form, monto: montoNum } : item))

      // 2. Si este ingreso está atado a un cliente (como un Alta), impactamos la corrección de vuelta en el cliente
      if (form.clienteId && setClientes) {
        setClientes(list => list.map(c => {
          if (c.id === form.clienteId) {
            return { ...c, precio: montoNum } // Sincroniza el precio corregido en el Stock
          }
          return c
        }))
        toast("✅ Registro de caja actualizado y sincronizado con el cliente")
      } else {
        toast("✅ Registro de caja actualizado")
      }

    } else {
      // Ingreso manual común (ej: una renovación mensual o venta de cantina)
      let conceptoFinal = form.concepto
      if (form.clienteId) {
        const socio = clientes.find(c => c.id === form.clienteId)
        if (socio) conceptoFinal = `Renovación: ${socio.nombre} (${form.concepto})`
      }

      setIngresos(list => [...list, {
        ...form,
        id: uid(),
        concepto: conceptoFinal,
        monto: montoNum
      }])
      toast("💰 Ingreso registrado en caja")
    }
    setModal(false)
  }

  const del = (id, item) => {
    if (!window.confirm("¿Eliminar este movimiento de caja?")) return
    setIngresos(list => list.filter(i => i.id !== id))
    toast("🗑️ Movimiento eliminado")
  }

  const total = ingresos.reduce((acc, curr) => acc + (curr.monto || 0), 0)

  return (
    <div>
      <PageHeader title="Caja / Ingresos" action="+ Nuevo Ingreso" onAction={openNew} />
      <SubTitle>Total recaudado: <span style={{ color: "#4caf50", fontWeight: 700 }}>${fmt(total)}</span></SubTitle>

      {ingresos.length === 0 && <Empty icon="💰" text="No hay movimientos en la caja" />}
      
      <div style={{ marginTop: 15 }}>
        {ingresos.map(item => (
          <div key={item.id} style={{ background: "#1c2130", border: "1px solid #252d3d", borderRadius: 14, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div onClick={() => openEdit(item)} style={{ flex: 1, cursor: "pointer" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff" }}>{item.concepto}</div>
              <div style={{ fontSize: 11, color: "#8891a8", marginTop: 2 }}>
                {item.fecha.split("-").reverse().join("/")} · <span style={{ color: "#ff5722" }}>{item.pago}</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#4caf50" }}>
                +${fmt(item.monto)}
              </div>
              <button onClick={() => del(item.id, item)} style={{ background: "none", border: "none", color: "#3e4658", cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Editar Movimiento" : "Registrar Ingreso"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          
          <Field label="Asociar a un Cliente (Opcional)">
            <Select value={form.clienteId || ""} onChange={e => set("clienteId", e.target.value)}>
              <option value="">-- Movimiento Suelto / No Cliente --</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </Select>
          </Field>

          <Field label="Concepto / Detalle">
            <Input placeholder="Ej: Venta de remera o Renovación" value={form.concepto || ""} onChange={e => set("concepto", e.target.value)} />
          </Field>

          <Field label="Monto $">
            <Input type="number" placeholder="0.00" value={form.monto || ""} onChange={e => set("monto", e.target.value)} />
          </Field>

          <Field label="Fecha">
            <Input type="date" value={form.fecha || ""} onChange={e => set("fecha", e.target.value)} />
          </Field>

          <Field label="Medio de Pago">
            <Select value={form.pago || "Efectivo"} onChange={e => set("pago", e.target.value)}>
              <option>Efectivo</option>
              <option>Transferencia</option>
              <option>Débito</option>
              <option>Tarjeta</option>
              <option>MercadoPago</option>
            </Select>
          </Field>
        </div>
        <BtnRow onCancel={() => setModal(false)} onSave={save} />
      </Modal>
    </div>
  )
}