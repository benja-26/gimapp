import { useState } from "react"
import { Modal, Field, Input, Select, BtnRow, PageHeader, Empty } from "../components/ui.jsx"
import { fmt, uid } from "../utils/helpers.js"
import { toast } from "../hooks/useToast.js"

export default function PageIngresos({ ingresos = [], setIngresos, clientes = [], setClientes, planes = [] }) {
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setFormRaw] = useState({})
  
  const [busqueda, setBusqueda] = useState("")
  const [mostrarDropdown, setMostrarDropdown] = useState(false)

  const set = (k, v) => setFormRaw(f => ({ ...f, [k]: v }))
  const getHoyStr = () => new Date().toLocaleDateString("sv-SE")

  // Configuración de colores estéticos para las píldoras de pago
  const MEDIOS_PAGO = {
    "Efectivo": { ico: "💵", col: "#4cd137" },
    "Transferencia": { ico: "📱", col: "#00a8ff" },
    "MercadoPago": { ico: "🔵", col: "#0097e6" },
    "Débito": { ico: "💳", col: "#9c27b0" },
    "Tarjeta": { ico: "💳", col: "#ff9f43" }
  }

  const openNew = () => {
    setEditing(null)
    setBusqueda("")
    setMostrarDropdown(false)
    setFormRaw({
      concepto: "",
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
    
    const socio = clientes.find(c => c.id === item.clienteId)
    setBusqueda(socio ? socio.nombre : "")
    setMostrarDropdown(false)
    setModal(true)
  }

  const seleccionarCliente = (socio, fechaActual) => {
    setMostrarDropdown(false)
    if (!socio) {
      setBusqueda("")
      setFormRaw(f => ({ ...f, clienteId: "", concepto: "", monto: "" }))
      return
    }

    setBusqueda(socio.nombre)
    const planConfig = planes.find(p => p.nombre === socio.plan)
    const nuevoConcepto = `Renovación: ${socio.nombre} (${socio.plan})`
    let nuevoMonto = ""

    if (planConfig) {
      const fechaCobro = new Date(fechaActual || form.fecha || getHoyStr())
      const fechaVtoCliente = socio.vencimiento ? new Date(socio.vencimiento) : null

      if (!fechaVtoCliente) {
        nuevoMonto = planConfig.p2
      } else {
        fechaCobro.setHours(0,0,0,0)
        fechaVtoCliente.setHours(0,0,0,0)

        if (fechaCobro < fechaVtoCliente) {
          nuevoMonto = planConfig.p1
          toast(`✨ Beneficio pronto pago detectado para ${socio.nombre}`)
        } else if (fechaCobro.getTime() === fechaVtoCliente.getTime()) {
          nuevoMonto = planConfig.p2
        } else {
          nuevoMonto = planConfig.p3
          toast(`⚠️ Pago fuera de término detectado para ${socio.nombre}`)
        }
      }
    }

    setFormRaw(f => ({
      ...f,
      clienteId: socio.id,
      concepto: nuevoConcepto,
      monto: nuevoMonto
    }))
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const save = () => {
    if (!form.concepto?.trim()) { toast("⚠️ Ingresá un concepto"); return }
    if (!form.monto || +form.monto <= 0) { toast("⚠️ Ingresá un monto válido"); return }

    const montoNum = +form.monto

    if (editing) {
      const seguro = window.confirm("⚠️ ¿Estás seguro de modificar este movimiento? Esto cambiará los reportes.")
      if (!seguro) return

      setIngresos(list => list.map(item => item.id === editing ? { ...item, ...form, monto: montoNum } : item))

      if (form.clienteId && setClientes) {
        setClientes(list => list.map(c => c.id === form.clienteId ? { ...c, precio: montoNum } : c))
      }
      toast("✅ Caja actualizada")
    } else {
      setIngresos(list => [...list, { ...form, id: uid(), monto: montoNum }])

      if (form.clienteId && setClientes) {
        setClientes(list => list.map(c => {
          if (c.id === form.clienteId) {
            const baseFechaStr = c.vencimiento && new Date(form.fecha) < new Date(c.vencimiento) 
              ? c.vencimiento 
              : form.fecha

            const nuevaFecha = new Date(baseFechaStr + "T00:00:00")
            nuevaFecha.setDate(nuevaFecha.getDate() + 30)
            
            return {
              ...c,
              estado: "Activo",
              precio: montoNum,
              vencimiento: nuevaFecha.toLocaleDateString("sv-SE")
            }
          }
          return c
        }))
        toast("💰 Renovación guardada y vencimiento del socio extendido")
      } else {
        toast("💰 Ingreso general registrado")
      }
    }
    setModal(false)
  }

  const del = (id) => {
    if (!window.confirm("¿Eliminar este movimiento de caja?")) return
    setIngresos(list => list.filter(i => i.id !== id))
    toast("🗑️ Movimiento eliminado")
  }

  // Cálculos de métricas rápidas de caja
  const total = ingresos.reduce((acc, curr) => acc + (curr.monto || 0), 0)
  const totalEfectivo = ingresos.filter(i => i.pago === "Efectivo").reduce((acc, c) => acc + (c.monto || 0), 0)
  const totalDigital = ingresos.filter(i => i.pago !== "Efectivo").reduce((acc, c) => acc + (c.monto || 0), 0)

  return (
    <div>
      <PageHeader title="Caja / Ingresos" action="+ Nuevo Ingreso" onAction={openNew} />
      
      {/* 📊 TARJETA DE RESUMEN UNIFICADA (Estilo Premium) */}
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
          Caja Total Recaudada
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#4caf50", marginTop: 4, fontFamily: "'Syne', sans-serif" }}>
          +${fmt(total)}
        </div>
        
        <div style={{ height: 1, background: "#252d3d", margin: "12px 0" }} />
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: "#5c657a" }}>Total Efectivo</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", marginTop: 2 }}>${fmt(totalEfectivo)}</div>
          </div>
          <div style={{ borderLeft: "1px solid #252d3d", paddingLeft: 12 }}>
            <div style={{ fontSize: 10, color: "#5c657a" }}>Bancos / Digital</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", marginTop: 2 }}>${fmt(totalDigital)}</div>
          </div>
        </div>
      </div>

      {ingresos.length === 0 && <Empty icon="💰" text="No hay movimientos en la caja" />}
      
      {/* 📋 LISTADO DE INGRESOS REDISEÑADO CON IDENTIDAD VISUAL */}
      <div style={{ marginTop: 12 }}>
        {ingresos.map(item => {
          const configVisual = MEDIOS_PAGO[item.pago] || { ico: "💰", col: "#8891a8" }
          // Si el concepto incluye la palabra "Renovación" o "Alta", usamos el ícono de atleta, sino fajo de billetes
          const esSocio = item.concepto.toLowerCase().includes("socio") || item.concepto.toLowerCase().includes("renovación")
          const iconoFila = esSocio ? "🏃" : configVisual.ico

          return (
            <div 
              key={item.id} 
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
              {/* Círculo identificador con ícono inteligente */}
              <div style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: (esSocio ? "#ff5722" : configVisual.col) + "15",
                color: esSocio ? "#ff5722" : configVisual.col,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                flexShrink: 0
              }}>
                {iconoFila}
              </div>

              {/* Contenido Central */}
              <div onClick={() => openEdit(item)} style={{ flex: 1, cursor: "pointer", minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.concepto}
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, color: "#5c657a" }}>
                    {item.fecha.split("-").reverse().join("/")}
                  </span>
                  <span style={{ color: "#252d3d", fontSize: 10 }}>•</span>
                  {/* Píldora satinada unificada para el medio de pago */}
                  <span style={{ 
                    fontSize: 9, 
                    fontWeight: 600,
                    padding: "2px 6px",
                    borderRadius: 5,
                    color: configVisual.col,
                    background: configVisual.col + "15",
                    border: `1px solid ${configVisual.col}20`
                  }}>
                    {item.pago}
                  </span>
                </div>
              </div>

              {/* Sección Monto e Ingreso */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                <button onClick={() => del(item.id)} style={{ background: "none", border: "none", color: "#3e4658", cursor: "pointer", fontSize: 14, padding: "0 2px" }}>✕</button>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#4caf50", fontFamily: "'Syne', sans-serif" }}>
                  +${fmt(item.monto)}
                </div>
              </div>

            </div>
          )
        })}
      </div>

      {/* MODAL DE REGISTRO */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Editar Movimiento" : "Registrar Ingreso"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
          
          <Field label="Buscar Socio (Para Renovaciones)">
            <div style={{ position: "relative" }}>
              <Input 
                placeholder="Escribí el nombre del alumno..." 
                value={busqueda} 
                onChange={e => {
                  setBusqueda(e.target.value)
                  setMostrarDropdown(true)
                  if(!e.target.value) seleccionarCliente(null)
                }}
                onFocus={() => setMostrarDropdown(true)}
              />
              {busqueda && (
                <button 
                  onClick={() => seleccionarCliente(null)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#8891a8", cursor: "pointer", fontSize: 12 }}
                >
                  Limpiar
                </button>
              )}
            </div>

            {mostrarDropdown && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#1c2130", border: "1px solid #252d3d", borderRadius: 10, maxHeight: 160, overflowY: "auto", zIndex: 999, marginTop: 4, boxShadow: "0px 8px 24px rgba(0,0,0,0.5)" }}>
                <div 
                  onClick={() => seleccionarCliente(null)}
                  style={{ padding: "10px 12px", fontSize: 13, color: "#ff5722", cursor: "pointer", borderBottom: "1px solid #252d3d", fontWeight: 600 }}
                >
                  💸 -- Es Venta Casual / Movimiento Suelto --
                </div>
                {clientesFiltrados.length === 0 ? (
                  <div style={{ padding: "10px 12px", fontSize: 12, color: "#8891a8" }}>No se encontraron alumnos</div>
                ) : (
                  clientesFiltrados.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => seleccionarCliente(c)}
                      style={{ padding: "10px 12px", fontSize: 13, color: "#ffffff", cursor: "pointer", borderBottom: "1px solid #12151c" }}
                    >
                      {c.nombre} <span style={{ color: "#8891a8", fontSize: 11 }}>({c.plan})</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </Field>

          <Field label="Fecha de Cobro">
            <Input 
              type="date" 
              value={form.fecha || ""} 
              onChange={e => {
                const nuevaFecha = e.target.value
                set("fecha", nuevaFecha)
                if (form.clienteId) {
                  const socioActivo = clientes.find(c => c.id === form.clienteId)
                  if (socioActivo) seleccionarCliente(socioActivo, nuevaFecha)
                }
              }} 
            />
          </Field>

          <Field label="Concepto / Detalle">
            <Input placeholder="Ej: Venta de remera de SKOL" value={form.concepto || ""} onChange={e => set("concepto", e.target.value)} />
          </Field>

          <Field label="Monto $">
            <Input type="number" placeholder="0.00" value={form.monto || ""} onChange={e => set("monto", e.target.value)} />
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