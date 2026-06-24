import { useState } from "react"
import { Modal, Field, Input, Select, BtnRow, PageHeader, Empty, Tabs } from "../components/ui.jsx"
import { fmt, uid } from "../utils/helpers.js"
import { toast } from "../hooks/useToast.js"

const TABS = [
  { v: "fijos", l: "Gastos Fijos" },
  { v: "variables", l: "Gastos Variables" }
]

export default function PageGastos({ gastos_fijos = [], setGastosFijos, gastos_var = [], setGastosVar }) {
  const [tab, setTab] = useState("fijos")
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setFormRaw] = useState({})
  
  const set = (k, v) => setFormRaw(f => ({ ...f, [k]: v }))
  const getHoyStr = () => new Date().toLocaleDateString("sv-SE")

  const CATEGORIAS_FIJAS = ["Alquiler", "Servicios (Luz/Agua)", "Internet / Soft", "Afiliación Oficial", "Sueldos Profes", "Otros Fijos"]
  const CATEGORIAS_VAR = ["Mantenimiento", "Equipamiento", "Limpieza", "Marketing/Publicidad", "Insumos", "Otros Variables"]

  // Diccionario de íconos estéticos para que cada egreso tenga identidad visual
  const ICONOS_CATEGORIAS = {
    "Alquiler": { ico: "🏢", col: "#ff5722" },
    "Servicios (Luz/Agua)": { ico: "⚡", col: "#00a8ff" },
    "Internet / Soft": { ico: "💻", col: "#9c27b0" },
    "Afiliación Oficial": { ico: "📜", col: "#ffc107" },
    "Sueldos Profes": { ico: "👥", col: "#4cd137" },
    "Otros Fijos": { ico: "💸", col: "#8891a8" },
    "Mantenimiento": { ico: "🔧", col: "#e67e22" },
    "Equipamiento": { ico: "🏋️", col: "#e74c3c" },
    "Limpieza": { ico: "🧼", col: "#1abc9c" },
    "Marketing/Publicidad": { ico: "📣", col: "#2ecc71" },
    "Insumos": { ico: "📦", col: "#34495e" },
    "Otros Variables": { ico: "💰", col: "#8891a8" }
  }

  const openNew = () => {
    setEditing(null)
    setFormRaw({
      concepto: "",
      monto: "",
      fecha: getHoyStr(),
      categoria: tab === "fijos" ? CATEGORIAS_FIJAS[0] : CATEGORIAS_VAR[0],
      pago: "Efectivo"
    })
    setModal(true)
  }

  const openEdit = (g) => {
    setEditing(g.id)
    setFormRaw({ ...g })
    setModal(true)
  }

  const save = () => {
    if (!form.concepto?.trim()) { toast("⚠️ Ingresá un detalle del gasto"); return }
    if (!form.monto || +form.monto <= 0) { toast("⚠️ Ingresá un monto válido"); return }

    const montoNum = +form.monto
    const nuevoGasto = { ...form, id: editing || uid(), monto: montoNum }

    if (tab === "fijos") {
      if (editing) {
        setGastosFijos(list => list.map(g => g.id === editing ? nuevoGasto : g))
        toast("✅ Gasto fijo actualizado")
      } else {
        setGastosFijos(list => [...list, nuevoGasto])
        toast("💸 Gasto fijo registrado")
      }
    } else {
      if (editing) {
        setGastosVar(list => list.map(g => g.id === editing ? nuevoGasto : g))
        toast("✅ Gasto variable actualizado")
      } else {
        setGastosVar(list => [...list, nuevoGasto])
        toast("💸 Gasto variable registrado")
      }
    }
    setModal(false)
  }

  const del = (id) => {
    if (!window.confirm("¿Eliminar este registro de gasto?")) return
    if (tab === "fijos") {
      setGastosFijos(list => list.filter(g => g.id !== id))
    } else {
      setGastosVar(list => list.filter(g => g.id !== id))
    }
    toast("🗑️ Gasto eliminado")
  }

  const totalFijos = gastos_fijos.reduce((acc, c) => acc + (c.monto || 0), 0)
  const totalVar = gastos_var.reduce((acc, c) => acc + (c.monto || 0), 0)
  const totalGeneral = totalFijos + totalVar

  const list = tab === "fijos" ? gastos_fijos : gastos_var
  const categoriasUso = tab === "fijos" ? CATEGORIAS_FIJAS : CATEGORIAS_VAR

  return (
    <div>
      <PageHeader title="Gastos / Egresos" action="+ Registrar" onAction={openNew} />
      
      {/* 📊 TARJETA DE RESUMEN PREMIUM (Estilo Tablero Digital) */}
      <div style={{
        background: "linear-gradient(135deg, #1c2130 0%, #151924 100%)",
        border: "1px solid #252d3d",
        borderRadius: 16,
        padding: "16px 18px",
        marginTop: 15,
        marginBottom: 16,
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
      }}>
        <div style={{ fontSize: 11, color: "#8891a8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Egreso Total Acumulado
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#ff4d4d", marginTop: 4, fontFamily: "'Syne', sans-serif" }}>
          -${fmt(totalGeneral)}
        </div>
        
        {/* Divisor interno tenue */}
        <div style={{ height: 1, background: "#252d3d", margin: "12px 0" }} />
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: "#5c657a" }}>Egresos Fijos</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", marginTop: 2 }}>${fmt(totalFijos)}</div>
          </div>
          <div style={{ borderLeft: "1px solid #252d3d", paddingLeft: 12 }}>
            <div style={{ fontSize: 10, color: "#5c657a" }}>Egresos Variables</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", marginTop: 2 }}>${fmt(totalVar)}</div>
          </div>
        </div>
      </div>

      <Tabs options={TABS} value={tab} onChange={setTab} />

      {list.length === 0 && (
        <Empty icon="💸" text={`No hay ${tab === "fijos" ? "gastos fijos" : "gastos variables"} cargados`} />
      )}

      {/* 📋 LISTADO DE GASTOS ESTILO TARJETA PREMIUM */}
      <div style={{ marginTop: 12 }}>
        {list.map(g => {
          // Obtener el ícono y color correspondiente a la categoría o usar uno por defecto
          const configuracionVisual = ICONOS_CATEGORIAS[g.categoria] || { ico: "💸", col: "#8891a8" }

          return (
            <div 
              key={g.id} 
              style={{ 
                background: "#1c2130", 
                border: "1px solid #252d3d", 
                borderRadius: 14, 
                padding: "12px 14px", 
                marginBottom: 9, 
                display: "flex", 
                alignItems: "center", 
                gap: 12
              }}
            >
              {/* Círculo identificador con ícono de categoría */}
              <div style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: configuracionVisual.col + "15",
                color: configuracionVisual.col,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                flexShrink: 0
              }}>
                {configuracionVisual.ico}
              </div>

              {/* Contenido Central */}
              <div onClick={() => openEdit(g)} style={{ flex: 1, cursor: "pointer", minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {g.concepto}
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, color: "#5c657a" }}>
                    {g.fecha.split("-").reverse().join("/")}
                  </span>
                  <span style={{ color: "#252d3d", fontSize: 10 }}>•</span>
                  {/* Píldora de categoría satinada */}
                  <span style={{ 
                    fontSize: 9, 
                    fontWeight: 600,
                    padding: "2px 6px",
                    borderRadius: 5,
                    color: configuracionVisual.col,
                    background: configuracionVisual.col + "15",
                    border: `1px solid ${configuracionVisual.col}20`
                  }}>
                    {g.categoria}
                  </span>
                  <span style={{ color: "#252d3d", fontSize: 10 }}>•</span>
                  <span style={{ fontSize: 10, color: "#3e4658" }}>{g.pago}</span>
                </div>
              </div>

              {/* Sección Monto y Eliminar */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                <button onClick={() => del(g.id)} style={{ background: "none", border: "none", color: "#3e4658", cursor: "pointer", fontSize: 14, padding: "0 2px" }}>✕</button>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#ff4d4d", fontFamily: "'Syne', sans-serif" }}>
                  -${fmt(g.monto)}
                </div>
              </div>

            </div>
          )
        })}
      </div>

      {/* MODAL DE CARGA */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Editar Gasto" : "Registrar Gasto"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Detalle / Concepto">
            <Input placeholder="Ej: Pago Alquiler Junio" value={form.concepto || ""} onChange={e => set("concepto", e.target.value)} />
          </Field>
          <Field label="Monto $">
            <Input type="number" placeholder="0.00" value={form.monto || ""} onChange={e => set("monto", e.target.value)} />
          </Field>
          <Field label="Categoría">
            <Select value={form.categoria || ""} onChange={e => set("categoria", e.target.value)}>
              {categoriasUso.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </Field>
          <Field label="Fecha de Pago">
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