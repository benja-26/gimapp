import { useState } from "react"
import { Modal, Field, Input, BtnRow, PageHeader, SubTitle, Empty } from "../components/ui.jsx"
import { uid } from "../utils/helpers.js"
import { toast } from "../hooks/useToast.js"

export default function PageAsist({ asistencias = [], setAsistencias, clientes = [], setClientes, planes = [] }) {
  const [modal, setModal] = useState(false)
  const [busqueda, setBusqueda] = useState("")
  const [mostrarDropdown, setMostrarDropdown] = useState(false)
  
  const [form, setFormRaw] = useState({
    fecha: new Date().toLocaleDateString("sv-SE"),
    horario: "19:00–20:00",
    clienteId: ""
  })
  const set = (k, v) => setFormRaw(f => ({ ...f, [k]: v }))

  const openNew = () => {
    setBusqueda("")
    setMostrarDropdown(false)
    setFormRaw({
      fecha: new Date().toLocaleDateString("sv-SE"),
      horario: "19:00–20:00",
      clienteId: ""
    })
    setModal(true)
  }

  // Al seleccionar el alumno en el buscador, chequeamos su estado e inicializamos alertas
  const seleccionarCliente = (socio) => {
    setMostrarDropdown(false)
    if (!socio) {
      setBusqueda("")
      set("clienteId", "")
      return
    }

    setBusqueda(socio.nombre)
    set("clienteId", socio.id)
    if (socio.horario) set("horario", socio.horario)

    // 🚨 REGLAS DE CONTROL EN TIEMPO REAL
    // 1. Alerta por Vencimiento en Semáforo Rojo
    const hoy = new Date()
    hoy.setHours(0,0,0,0)
    const vto = socio.vencimiento ? new Date(socio.vencimiento + "T00:00:00") : null
    
    if (vto && vto < hoy) {
      toast(`🔴 ADVERTENCIA: ${socio.nombre} tiene el abono VENCIDO.`)
      return
    }

    // 2. Alerta por falta de clases/créditos disponibles
    const planConfig = planes.find(p => p.nombre === socio.plan)
    const limiteClases = planConfig ? planConfig.clases : 12
    const clasesUsadas = socio.clasesUsadas || 0
    
    if (clasesUsadas >= limiteClases) {
      toast(`⚠️ LÍMITE: A ${socio.nombre} no le quedan créditos disponibles este mes (${clasesUsadas}/${limiteClases}).`)
    }
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) && c.estado === "Activo"
  )

  const save = () => {
    if (!form.clienteId) { toast("⚠️ Seleccioná un alumno"); return }

    const socio = clientes.find(c => c.id === form.clienteId)
    if (!socio) return

    // Buscar el límite total de clases que permite su pack
    const planConfig = planes.find(p => p.nombre === socio.plan)
    const maxClases = planConfig ? planConfig.clases : 12
    const nuevasClasesUsadas = (socio.clasesUsadas || 0) + 1

    // 1. Guardamos el registro de asistencia en la lista diaria
    const nuevaAsistencia = {
      id: uid(),
      clienteId: socio.id,
      nombre: socio.nombre,
      plan: socio.plan,
      fecha: form.fecha,
      horario: form.horario
    }
    setAsistencias(list => [nuevaAsistencia, ...list])

    // 2. Descontamos el crédito actualizando la ficha del cliente
    if (setClientes) {
      setClientes(list => list.map(c => {
        if (c.id === socio.id) {
          return {
            ...c,
            clasesUsadas: nuevasClasesUsadas
          }
        }
        return c
      }))
    }

    toast(`🏋️ Presente marcado. Créditos: ${nuevasClasesUsadas}/${maxClases}`)
    setModal(false)
  }

  const del = (asistId, clienteId) => {
    if (!window.confirm("¿Anular este presente diario? Se le devolverá el crédito al alumno.")) return
    
    // Devolvemos el crédito restando 1 en la ficha del alumno
    if (setClientes) {
      setClientes(list => list.map(c => {
        if (c.id === clienteId) {
          return { ...c, clasesUsadas: Math.max(0, (c.clasesUsadas || 0) - 1) }
        }
        return c
      }))
    }

    setAsistencias(list => list.filter(a => a.id !== asistId))
    toast("🗑️ Asistencia anulada")
  }

  // Filtrar las asistencias para mostrar solo las del día de hoy en pantalla
  const hoyStr = new Date().toLocaleDateString("sv-SE")
  const presentesHoy = asistencias.filter(a => a.fecha === hoyStr)

  return (
    <div>
      <PageHeader title="Asistencias / Clase" action="+ Dar Presente" onAction={openNew} />
      <SubTitle>Presentes hoy: <span style={{ color: "#ff5722", fontWeight: 700 }}>{presentesHoy.length} alumnos</span></SubTitle>

      {presentesHoy.length === 0 && <Empty icon="📋" text="Nadie dio el presente todavía hoy" />}

      {/* 📋 LISTADO PREMIUM DE PRESENTES DEL DÍA */}
      <div style={{ marginTop: 15 }}>
        {presentesHoy.map(a => {
          const socioFicha = clientes.find(c => c.id === a.clienteId)
          const planConfig = planes.find(p => p.nombre === a.plan)
          const maxClases = planConfig ? planConfig.clases : 12
          const usadas = socioFicha ? (socioFicha.clasesUsadas || 0) : 0

          return (
            <div key={a.id} style={{ background: "#1c2130", border: "1px solid #252d3d", borderRadius: 14, padding: "12px 14px", marginBottom: 9, display: "flex", alignItems: "center", justifyInbound: "space-between", gap: 12 }}>
              
              {/* Icono estético de check para la asistencia */}
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255, 87, 34, 0.12)", color: "#ff5722", display: "flex", alignItems: "center", justifyInbound: "center", fontSize: 14, flexShrink: 0 }}>
                ✔️
              </div>

              {/* Información */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {a.nombre}
                </div>
                <div style={{ fontSize: 11, color: "#8891a8", marginTop: 2 }}>
                  {a.horario} · <span style={{ color: "#5c657a" }}>{a.plan}</span>
                </div>
              </div>

              {/* Píldora de Créditos Restantes */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <div style={{ 
                  fontSize: 10, 
                  fontWeight: 600, 
                  padding: "3px 8px", 
                  borderRadius: 6, 
                  background: usadas >= maxClases ? "rgba(255, 77, 77, 0.15)" : "#252d3d", 
                  color: usadas >= maxClases ? "#ff4d4d" : "#8891a8" 
                }}>
                  {usadas}/{maxClases} Clases
                </div>
                <button onClick={() => del(a.id, a.clienteId)} style={{ background: "none", border: "none", color: "#3e4658", cursor: "pointer", fontSize: 14 }}>✕</button>
              </div>

            </div>
          )
        })}
      </div>

      {/* MODAL DE CONTROL DE ASISTENCIA */}
      <Modal open={modal} onClose={() => setModal(false)} title="Marcar Presente en Clase">
        <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
          
          <Field label="Buscar Alumno">
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
            </div>

            {mostrarDropdown && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#1c2130", border: "1px solid #252d3d", borderRadius: 10, maxHeight: 160, overflowY: "auto", zIndex: 999, marginTop: 4, boxShadow: "0px 8px 24px rgba(0,0,0,0.5)" }}>
                {clientesFiltrados.length === 0 ? (
                  <div style={{ padding: "10px 12px", fontSize: 12, color: "#8891a8" }}>No hay alumnos activos con ese nombre</div>
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

          <Field label="Horario del Turno">
            <select 
              value={form.horario || "19:00–20:00"} 
              onChange={e => set("horario", e.target.value)}
              style={{ width: "100%", background: "#1c2130", color: "#ffffff", border: "1px solid #252d3d", borderRadius: 10, padding: 10, fontSize: 14 }}
            >
              {["06:00–07:00","07:00–08:00","08:00–09:00","09:00–10:00","10:00–11:00","17:00–18:00","18:00–19:00","19:00–20:00","20:00–21:00","21:00–22:00"].map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </Field>

          <Field label="Fecha">
            <Input type="date" value={form.fecha || ""} onChange={e => set("fecha", e.target.value)} />
          </Field>

        </div>
        <BtnRow onCancel={() => setModal(false)} onSave={save} />
      </Modal>
    </div>
  )
}