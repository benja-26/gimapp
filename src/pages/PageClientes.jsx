import { useState } from "react"
import { Modal, Field, Input, Select, BtnRow, Badge, PageHeader, SubTitle, Empty, Tabs } from "../components/ui.jsx"
import { fmt, uid, initials } from "../utils/helpers.js"
import { toast } from "../hooks/useToast.js"
import { COLORS } from "../data/defaults.js"

const TABS = [
  {v:"todos",l:"Todos"},{v:"activo",l:"Activos"},
  {v:"inactivo",l:"Inactivos"},{v:"deuda",l:"Con deuda"},
]

export default function PageClientes({ clientes, setClientes }) {
  const [tab,    setTab]    = useState("todos")
  const [modal,  setModal]  = useState(false)
  const [editing,setEditing]= useState(null)
  const [form,   setFormRaw]= useState({})
  const set = (k, v) => setFormRaw(f => ({...f, [k]: v}))

  // Obtener la fecha de hoy en formato AAAA-MM-DD para Salta
  const getHoyStr = () => new Date().toLocaleDateString("sv-SE")

  const openNew = () => {
    setEditing(null)
    setFormRaw({ 
      estado: "Activo", 
      actividad: "Musculación", 
      plan: "Mensual", 
      pago: "Efectivo", 
      referido: "Instagram", 
      deuda: 0,
      alta: getHoyStr() // Por defecto arranca con el día de hoy
    })
    setModal(true)
  }
  
  const openEdit = c => { 
    setEditing(c.id)
    setFormRaw({
      ...c,
      alta: c.alta || getHoyStr() // Si los viejos no tenían, les pone hoy
    })
    setModal(true) 
  }

  const save = () => {
    if (!form.nombre?.trim()) { toast("⚠️ Ingresá el nombre"); return }
    if (editing) {
      setClientes(l => l.map(c => c.id === editing ? {...c, ...form, precio:+form.precio||0, deuda:+form.deuda||0} : c))
      toast("✅ Cliente actualizado")
    } else {
      setClientes(l => [...l, {...form, id:uid(), precio:+form.precio||0, deuda:+form.deuda||0}])
      toast("✅ Cliente agregado")
    }
    setModal(false)
  }

  const del = id => {
    if (!window.confirm("¿Eliminar cliente?")) return
    setClientes(l => l.filter(c => c.id !== id))
    toast("🗑️ Eliminado")
  }

  const actCount = clientes.filter(c => c.estado === "Activo").length
  const list = tab === "activo"   ? clientes.filter(c => c.estado === "Activo")
             : tab === "inactivo" ? clientes.filter(c => c.estado === "Inactivo")
             : tab === "deuda"    ? clientes.filter(c => (c.deuda||0) < 0)
             : clientes

  return (
    <div>
      <PageHeader title="Clientes" action="+ Nuevo" onAction={openNew}/>
      <SubTitle>{actCount} activos · {clientes.length} total</SubTitle>
      <Tabs options={TABS} value={tab} onChange={setTab}/>

      {list.length === 0 && <Empty icon="👥" text="Sin clientes aquí"/>}
      {list.map((c, i) => {
        const col = COLORS[i % COLORS.length]
        const ini = initials(c.nombre)
        // Formatear un poco la visual de la fecha (de AAAA-MM-DD a DD/MM/AAAA)
        const fechaFormateada = c.alta ? c.alta.split("-").reverse().join("/") : ""

        return (
          <div key={c.id} style={{background:"#1c2130",border:"1px solid #252d3d",borderRadius:14,padding:"12px 13px",marginBottom:9,display:"flex",alignItems:"center",gap:12}}>
            <div onClick={() => openEdit(c)} style={{flex:1,display:"flex",alignItems:"center",gap:12,cursor:"pointer",minWidth:0}}>
              <div style={{width:40,height:40,borderRadius:"50%",background:col+"20",color:col,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,flexShrink:0}}>{ini}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.nombre}</div>
                <div style={{fontSize:11,color:"#8891a8",marginTop:2}}>
                  {c.plan} · ${fmt(c.precio)}/mes · {c.actividad}
                  {fechaFormateada && <span style={{color:"#4cd137"}}> · Alta: {fechaFormateada}</span>}
                  {(c.deuda||0) < 0 && <span style={{color:"#ff4444"}}> · ⚠ deuda</span>}
                </div>
              </div>
            </div>
            <Badge active={c.estado === "Activo"}/>
            <button onClick={() => del(c.id)} style={{background:"none",border:"none",color:"#3e4658",cursor:"pointer",fontSize:15,padding:"0 4px"}}>✕</button>
          </div>
        )
      })}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Editar cliente" : "Nuevo cliente"}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="Nombre completo" full><Input placeholder="Nombre y apellido" value={form.nombre||""} onChange={e=>set("nombre",e.target.value)}/></Field>
          <Field label="Edad"><Input type="number" placeholder="25" value={form.edad||""} onChange={e=>set("edad",e.target.value)}/></Field>
          <Field label="Sexo"><Select value={form.sexo||"M"} onChange={e=>set("sexo",e.target.value)}><option>M</option><option>F</option><option>Otro</option></Select></Field>
          <Field label="Fecha de Alta"><Input type="date" value={form.alta||""} onChange={e=>set("alta",e.target.value)}/></Field>
          <Field label="Actividad"><Select value={form.actividad||"Musculación"} onChange={e=>set("actividad",e.target.value)}><option>Musculación</option><option>Funcional</option><option>Yoga</option><option>Crossfit</option></Select></Field>
          <Field label="Plan"><Select value={form.plan||"Mensual"} onChange={e=>set("plan",e.target.value)}><option>Mensual</option><option>Trimestral</option><option>Semestral</option><option>Anual</option></Select></Field>
          <Field label="Precio $"><Input type="number" placeholder="18000" value={form.precio||""} onChange={e=>set("precio",e.target.value)}/></Field>
          <Field label="Medio de pago"><Select value={form.pago||"Efectivo"} onChange={e=>set("pago",e.target.value)}><option>Efectivo</option><option>Transferencia</option><option>Débito</option><option>Tarjeta</option><option>MercadoPago</option></Select></Field>
          <Field label="Horario"><Select value={form.horario||"18:00–19:00"} onChange={e=>set("horario",e.target.value)}>{["06:00–07:00","07:00–08:00","08:00–09:00","09:00–10:00","10:00–11:00","17:00–18:00","18:00–19:00","19:00–20:00","20:00–21:00","21:00–22:00"].map(h=><option key={h}>{h}</option>)}</Select></Field>
          <Field label="Referido por"><Select value={form.referido||"Instagram"} onChange={e=>set("referido",e.target.value)}><option>Instagram</option><option>Facebook</option><option>Amigo/a</option><option>Pasando</option><option>Google</option><option>Otro</option></Select></Field>
          <Field label="Estado"><Select value={form.estado||"Activo"} onChange={e=>set("estado",e.target.value)}><option>Activo</option><option>Inactivo</option></Select></Field>
          <Field label="Deuda $"><Input type="number" placeholder="0" value={form.deuda||""} onChange={e=>set("deuda",e.target.value)}/></Field>
          <Field label="Observaciones" full><Input placeholder="Opcional" value={form.obs||""} onChange={e=>set("obs",e.target.value)}/></Field>
        </div>
        <BtnRow onCancel={()=>setModal(false)} onSave={save}/>
      </Modal>
    </div>
  )
}