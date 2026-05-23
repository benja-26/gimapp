import { useState } from "react"
import { Modal, Field, Input, Select, BtnRow, PageHeader, SubTitle, Empty } from "../components/ui.jsx"
import { fmt, uid } from "../utils/helpers.js"
import { toast } from "../hooks/useToast.js"

export default function PageIngresos({ ingresos, setIngresos, clientes, setClientes, planes }) {
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setFormRaw] = useState({})
  
  // Estados para el buscador predictivo de alumnos
  const [busqueda, setBusqueda] = useState("")
  const [mostrarDropdown, setMostrarDropdown] = useState(false)

  const set = (k, v) => setFormRaw(f => ({ ...f, [k]: v }))
  const getHoyStr = () => new Date().toLocaleDateString("sv-SE")

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
    
    // Si el ingreso editado pertenece a un cliente, precargar su nombre en el buscador
    const socio = clientes.find(c => c.id === item.clienteId)
    setBusqueda(socio ? socio.nombre : "")
    setMostrarDropdown(false)
    
    setModal(true)
  }

  // Lógica de selección del buscador predictivo
  const seleccionarCliente = (socio, fechaActual) => {
    setMostrarDropdown(false)
    if (!socio) {
      // Caso Venta Casual / Limpiar
      setBusqueda("")
      setFormRaw(f => ({
        ...f,
        clienteId: "",
        concepto: "",
        monto: ""
      }))
      return
    }

    setBusqueda(socio.nombre)
    
    // Buscar la configuración de precios de su pack en SKOL
    const planConfig = planes.find(p => p.nombre === socio.plan)
    const nuevoConcepto = `Renovación: ${socio.nombre} (${socio.plan})`
    let nuevoMonto = ""

    if (planConfig) {
      const fechaCobro = new Date(fechaActual || form.fecha || getHoyStr())
      const fechaVtoCliente = socio.vencimiento ? new Date(socio.vencimiento) : null

      if (!fechaVtoCliente) {
        nuevoMonto = planConfig.p2 // Al Día por defecto
      } else {
        fechaCobro.setHours(0,0,0,0)
        fechaVtoCliente.setHours(0,0,0,0)

        if (fechaCobro < fechaVtoCliente) {
          nuevoMonto = planConfig.p1 // Antes Vto
          toast(`✨ Beneficio pronto pago detectado para ${socio.nombre}`)
        } else if (fechaCobro.getTime() === fechaVtoCliente.getTime()) {
          nuevoMonto = planConfig.p2 // Al día
        } else {
          nuevoMonto = planConfig.p3 // Fuera de término
          toast(`⚠️ Pago fuera de término detectado para ${socio.nombre}`)
        }
      }
    }

    // Forzamos la actualización simultánea de todo el bloque del formulario
    setFormRaw(f => ({
      ...f,
      clienteId: socio.id,
      concepto: nuevoConcepto,
      monto: nuevoMonto
    }))
  }

  // Filtrar la lista de alumnos según lo que escribe el usuario
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

  const total = ingresos.reduce((acc, curr) => acc + (curr.monto || 0), 0)

  return (
    <div>
      <PageHeader title="Caja / Ingresos" action="+ Nuevo Ingreso" onAction={openNew} />
      <SubTitle>Total recaudado: <span style={{ color: "#4caf50", fontWeight: 700 }}>${fmt(total)}</span></SubTitle>

      {ingresos.length === 0 && <Empty icon="💰" text="No hay movimientos en la caja" />}
      
      <div style={{ marginTop: 15 }}>
        {ingresos.map(item => (
          <div key={item.id} style={{ background: "#1c2130", border: "1px solid #252d3d", borderRadius: 14, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", justifyInbound: "space-between" }}>
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
              <button onClick={() => del(item.id)} style={{ background: "none", border: "none", color: "#3e4658", cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Editar Movimiento" : "Registrar Ingreso"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
          
          {/* ── BUSCADOR PREDICTIVO DE ALUMNOS ────────────────── */}
          <Field label="Buscar Socio (Para Renovaciones)">
            <div style={{ position: "relative" }}>
              <Input 
                placeholder="Escribí el nombre del alumno..." 
                value={busqueda} 
                onChange={e => {
                  setBusqueda(e.target.value)
                  setMostrarDropdown(true)
                  if(!e.target.value) seleccionarCliente(null) // Si borra todo, se hace venta casual
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

            {/* Listado desplegable flotante */}
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

          {/* Cambiar la fecha actualiza dinámicamente el precio del cliente seleccionado */}
          <Field label="Fecha de Cobro">
            <Input 
              type="date" 
              value={form.fecha || ""} 
              onChange={e => {
                const nuevaFecha = e.target.value
                set("fecha", nuevaFecha)
                // Si había un cliente seleccionado, recalculamos el precio con la nueva fecha
                if (form.clienteId) {
                  const socioActivo = clientes.find(c => c.id === form.clienteId)
                  if (socioActivo) seleccionarCliente(socioActivo, nuevaFecha)
                }
              }} 
            />
          </Field>

          <Field label="Concepto / Detalle">
            <Input 
              placeholder="Ej: Venta de remera de SKOL" 
              value={form.concepto || ""} 
              onChange={e => set("concepto", e.target.value)} 
            />
          </Field>

          <Field label="Monto $">
            <Input 
              type="number" 
              placeholder="0.00" 
              value={form.monto || ""} 
              onChange={e => set("monto", e.target.value)} 
            />
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