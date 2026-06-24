import { useState } from "react"
import { Modal, Field, Input, Select, BtnRow, PageHeader, SubTitle, Empty, Tabs } from "../components/ui.jsx"
import { fmt, uid, initials } from "../utils/helpers.js"
import { toast } from "../hooks/useToast.js"
import { COLORS } from "../data/defaults.js"

const TABS = [
  {v:"todos",l:"Todos"},{v:"activo",l:"Activos"},
  {v:"inactivo",l:"Inactivos"},{v:"deuda",l:"Con deuda"},
]

export default function PageClientes({ clientes, setClientes, setIngresos, planes }) {
  const [tab,    setTab]    = useState("todos")
  const [modal,  setModal]  = useState(false)
  const [editing,setEditing]= useState(null)
  const [form,   setFormRaw]= useState({})
  
  // Interfaz Premium: Buscador rápido en la barra de clientes
  const [filtroNombre, setFiltroNombre] = useState("")

  const set = (k, v) => setFormRaw(f => ({...f, [k]: v}))

  const getHoyStr = () => new Date().toLocaleDateString("sv-SE")

  const calcularVencimiento = (fechaAlta) => {
    if (!fechaAlta) return ""
    const fecha = new Date(fechaAlta + "T00:00:00")
    fecha.setDate(fecha.getDate() + 30)
    return fecha.toLocaleDateString("sv-SE")
  }

  // 🧠 FUNCIÓN SEMÁFORO: Analiza las fechas en tiempo real
  const obtenerEstadoVencimiento = (vencimientoStr) => {
    if (!vencimientoStr) return { color: "#8891a8", texto: "No fijado", bg: "#1c2130" }
    
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    
    const vto = new Date(vencimientoStr + "T00:00:00")
    vto.setHours(0, 0, 0, 0)

    // Calcular diferencia en días corridos
    const diffTiempo = vto.getTime() - hoy.getTime()
    const diffDias = Math.ceil(diffTiempo / (1000 * 60 * 60 * 24))

    if (diffDias < 0) {
      return { 
        color: "#ff4d4d", 
        texto: `Vencido hace ${Math.abs(diffDias)} ${Math.abs(diffDias) === 1 ? 'día' : 'días'}`, 
        bg: "rgba(255, 77, 77, 0.15)" 
      }
    } else if (diffDias <= 3) {
      return { 
        color: "#ff9f43", 
        texto: diffDias === 0 ? "⚠️ Vence HOY" : `⏳ Vence en ${diffDias} ${diffDias === 1 ? 'día' : 'días'}`, 
        bg: "rgba(255, 159, 67, 0.15)" 
      }
    } else {
      return { 
        color: "#4cd137", 
        texto: `🟢 Al día (Vence ${vencimientoStr.split("-").reverse().join("/")})`, 
        bg: "rgba(76, 209, 55, 0.12)" 
      }
    }
  }

  const planesActivos = planes ? planes.filter(p => p.activo !== false) : []

  const handlePlanChange = (planNombre) => {
    set("plan", planNombre)
    const planSeleccionado = planesActivos.find(p => p.nombre === planNombre)
    if (planSeleccionado) set("precio", planSeleccionado.p2)
  }

  const openNew = () => {
    setEditing(null)
    const primerPlan = planesActivos[0]?.nombre || "Pack 12 (3x)"
    const primerPrecio = planesActivos[0]?.p2 || 38000

    setFormRaw({ 
      estado: "Activo", 
      actividad: "Crossfit", 
      plan: primerPlan, 
      pago: "Efectivo", 
      referido: "Instagram", 
      deuda: 0,
      precio: primerPrecio, 
      alta: getHoyStr()
    })
    setModal(true)
  }
  
  const openEdit = c => { 
    setEditing(c.id)
    setFormRaw({ ...c })
    setModal(true) 
  }

  const save = () => {
    if (!form.nombre?.trim()) { toast("⚠️ Ingresá el nombre"); return }
    const fechaVto = calcularVencimiento(form.alta)

    if (editing) {
      setClientes(l => l.map(c => c.id === editing ? {...c, ...form, vencimiento: fechaVto, precio:+form.precio||0, deuda:+form.deuda||0} : c))
      toast("✅ Cliente actualizado")
    } else {
      const nuevoId = uid()
      const montoCobrado = +form.precio || 0

      setClientes(l => [...l, { ...form, id: nuevoId, vencimiento: fechaVto, precio: montoCobrado, deuda: 0 }])

      if (montoCobrado > 0 && setIngresos) {
        setIngresos(ing => [...ing, {
          id: uid(),
          clienteId: nuevoId,
          concepto: `Alta Socio: ${form.nombre} (${form.plan})`,
          monto: montoCobrado,
          fecha: form.alta, 
          pago: form.pago
        }])
      }
      toast(`✅ Socio creado e ingreso de $${fmt(montoCobrado)} registrado`)
    }
    setModal(false)
  }

  const del = id => {
    if (!window.confirm("¿Eliminar cliente?")) return
    setClientes(l => l.filter(c => c.id !== id))
    toast("🗑️ Eliminado")
  }

  // Filtrado combinado por Tab + Buscador predictivo superior
  const list = clientes.filter(c => {
    const cumpleFiltroText = c.nombre.toLowerCase().includes(filtroNombre.toLowerCase()) || c.plan.toLowerCase().includes(filtroNombre.toLowerCase())
    if (!cumpleFiltroText) return false

    if (tab === "activo") return c.estado === "Activo"
    if (tab === "inactivo") return c.estado === "Inactivo"
    if (tab === "deuda") return (c.deuda || 0) < 0
    return true
  })

  const actCount = clientes.filter(c => c.estado === "Activo").length

  return (
    <div>
      <PageHeader title="Clientes" action="+ Nuevo" onAction={openNew}/>
      <SubTitle>{actCount} activos · {clientes.length} total</SubTitle>
      
      {/* 🔍 Interfaz Premium: Barra de búsqueda superior */}
      <div style={{ marginBottom: 12 }}>
        <Input 
          placeholder="🔍 Buscar por nombre o pack..." 
          value={filtroNombre} 
          onChange={e => setFiltroNombre(e.target.value)} 
          style={{ background: "#1c2130", borderColor: "#252d3d", borderRadius: 10 }}
        />
      </div>

      <Tabs options={TABS} value={tab} onChange={setTab}/>

      {list.length === 0 && <Empty icon="👥" text="Sin coincidencias de alumnos"/>}
      
      <div style={{ marginTop: 10 }}>
        {list.map((c, i) => {
          const col = COLORS[i % COLORS.length]
          const ini = initials(c.nombre)
          
          // Calcular el estado del semáforo para este cliente específico
          const semaforo = obtenerEstadoVencimiento(c.vencimiento)

          return (
            <div key={c.id} style={{background:"#1c2130",border:"1px solid #252d3d",borderRadius:14,padding:"12px 13px",marginBottom:9,display:"flex",alignItems:"center",gap:12}}>
              <div onClick={() => openEdit(c)} style={{flex:1,display:"flex",alignItems:"center",gap:12,cursor:"pointer",minWidth:0}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:col+"20",color:col,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,flexShrink:0}}>{ini}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",color:"#ffffff"}}>{c.nombre}</div>
                  <div style={{fontSize:11,color:"#8891a8",marginTop:2}}>
                    {c.plan} · {c.actividad}
                  </div>
                  {/* Etiqueta Premium con el Semáforo */}
                  <div style={{
                    display: "inline-block",
                    marginTop: 6,
                    padding: "3px 8px",
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 600,
                    color: semaforo.color,
                    background: semaforo.bg,
                    border: `1px solid ${semaforo.color}30`
                  }}>
                    {semaforo.texto}
                  </div>
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", alignItems: "end", gap: 10 }}>
                <button onClick={() => del(c.id)} style={{background:"none",border:"none",color:"#3e4658",cursor:"pointer",fontSize:14,padding:"0 4px"}}>✕</button>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 10, color: c.estado === "Activo" ? "#4cd137" : "#8891a8" }}>{c.estado}</span>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.estado === "Activo" ? "#4cd137" : "#8891a8" }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Editar cliente" : "Nuevo cliente"}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="Nombre completo" full><Input placeholder="Nombre y apellido" value={form.nombre||""} onChange={e=>set("nombre",e.target.value)}/></Field>
          <Field label="Edad"><Input type="number" placeholder="25" value={form.edad||""} onChange={e=>set("edad",e.target.value)}/></Field>
          <Field label="Sexo"><Select value={form.sexo||"M"} onChange={e=>set("sexo",e.target.value)}><option>M</option><option>F</option><option>Otro</option></Select></Field>
          <Field label="Fecha de Alta"><Input type="date" value={form.alta||""} onChange={e=>set("alta",e.target.value)}/></Field>
          
          <Field label="Plan/Pack">
            <Select value={form.plan || ""} onChange={e => handlePlanChange(e.target.value)}>
              {planesActivos.length === 0 ? (
                <option>Carga packs en Configuración</option>
              ) : (
                planesActivos.map(p => (
                  <option key={p.id} value={p.nombre}>{p.nombre}</option>
                ))
              )}
            </Select>
          </Field>

          <Field label="Monto Cobrado $"><Input type="number" placeholder="38000" value={form.precio||""} onChange={e=>set("precio",e.target.value)}/></Field>
          <Field label="Medio de pago"><Select value={form.pago||"Efectivo"} onChange={e=>set("pago",e.target.value)}><option>Efectivo</option><option>Transferencia</option><option>Débito</option><option>Tarjeta</option><option>MercadoPago</option></Select></Field>
          <Field label="Horario"><Select value={form.horario||"18:00–19:00"} onChange={e=>set("horario",e.target.value)}>{["06:00–07:00","07:00–08:00","08:00–09:00","09:00–10:00","10:00–11:00","17:00–18:00","18:00–19:00","19:00–20:00","20:00–21:00","21:00–22:00"].map(h=><option key={h}>{h}</option>)}</Select></Field>
          <Field label="Referido por"><Select value={form.referido||"Instagram"} onChange={e=>set("referido",e.target.value)}><option>Instagram</option><option>Facebook</option><option>Amigo/a</option><option>Pasando</option><option>Google</option><option>Otro</option></Select></Field>
          <Field label="Estado"><Select value={form.estado||"Activo"} onChange={e=>set("estado",e.target.value)}><option>Activo</option><option>Inactivo</option></Select></Field>
          <Field label="Observaciones" full><Input placeholder="Opcional" value={form.obs||""} onChange={e=>set("obs",e.target.value)}/></Field>
        </div>
        <BtnRow onCancel={()=>setModal(false)} onSave={save}/>
      </Modal>
    </div>
  )
}