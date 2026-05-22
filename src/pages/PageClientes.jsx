import { useState } from "react"
import { Modal, Field, Input, Select, BtnRow, Badge, PageHeader, SubTitle, Empty, Tabs } from "../components/ui.jsx"
import { fmt, uid, initials } from "../utils/helpers.js"
import { toast } from "../hooks/useToast.js"
import { COLORS } from "../data/defaults.js"

const TABS = [
  {v:"todos",l:"Todos"},{v:"activo",l:"Activos"},
  {v:"inactivo",l:"Inactivos"},{v:"deuda",l:"Con deuda"},
]

export default function PageClientes({ clientes, setClientes, setIngresos }) {
  const [tab,    setTab]    = useState("todos")
  const [modal,  setModal]  = useState(false)
  const [editing,setEditing]= useState(null)
  const [form,   setFormRaw]= useState({})
  const set = (k, v) => setFormRaw(f => ({...f, [k]: v}))

  const getHoyStr = () => new Date().toLocaleDateString("sv-SE")

  // Función matemática para sumarle exactamente 30 días a una fecha
  const calcularVencimiento = (fechaAlta) => {
    if (!fechaAlta) return ""
    const fecha = new Date(fechaAlta + "T00:00:00")
    fecha.setDate(fecha.getDate() + 30)
    return fecha.toLocaleDateString("sv-SE")
  }

  const openNew = () => {
    setEditing(null)
    setFormRaw({ 
      estado: "Activo", 
      actividad: "Crossfit", // Por defecto SKOL es puro Crossfit
      plan: "Pack 12 (3x)", 
      pago: "Efectivo", 
      referido: "Instagram", 
      deuda: 0,
      precio: 38000, // Precio base inicial sugerido
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
    
    // Calcular el vencimiento automático en base a la fecha de alta elegida
    const fechaVto = calcularVencimiento(form.alta)

    if (editing) {
      // EDICIÓN: Solo actualiza la ficha del cliente (el Stock), no altera la caja vieja
      setClientes(l => l.map(c => c.id === editing ? {...c, ...form, vencimiento: fechaVto, precio:+form.precio||0, deuda:+form.deuda||0} : c))
      toast("✅ Cliente actualizado")
    } else {
      // NUEVO CLIENTE: Genera el Stock y dispara el Flujo de Caja simultáneamente
      const nuevoId = uid()
      const montoCobrado = +form.precio || 0

      // 1. Guardar datos del cliente con su fecha de vencimiento calculada
      setClientes(l => [...l, {
        ...form, 
        id: nuevoId, 
        vencimiento: fechaVto, 
        precio: montoCobrado, 
        deuda: 0 // Arranca en cero porque ya te pagó en la mano
      }])

      // 2. Inyectar automáticamente el cobro en el Flujo de Caja (Ingresos)
      if (montoCobrado > 0 && setIngresos) {
        setIngresos(ing => [
          ...ing, 
          {
            id: uid(),
            clienteId: nuevoId,
            concepto: `Alta Socio: ${form.nombre} (${form.plan})`,
            monto: montoCobrado,
            fecha: form.alta, // Se registra con la misma fecha en que ingresó
            pago: form.pago
          }
        ])
      }
      toast(`✅ Socio creado e ingreso de $${fmt(montoCobrado)} registrado en Caja`)
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
        const vtoFormateado = c.vencimiento ? c.vencimiento.split("-").reverse().join("/") : "No fijado"

        return (
          <div key={c.id} style={{background:"#1c2130",border:"1px solid #252d3d",borderRadius:14,padding:"12px 13px",marginBottom:9,display:"flex",alignItems:"center",gap:12}}>
            <div onClick={() => openEdit(c)} style={{flex:1,display:"flex",alignItems:"center",gap:12,cursor:"pointer",minWidth:0}}>
              <div style={{width:40,height:40,borderRadius:"50%",background:col+"20",color:col,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,flexShrink:0}}>{ini}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.nombre}</div>
                <div style={{fontSize:11,color:"#8891a8",marginTop:2}}>
                  {c.plan} · {c.actividad}
                  <div style={{marginTop:3, color:"#ff9f43", fontWeight: 500}}>
                    ⏳ Vence: {vtoFormateado}
                  </div>
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
          
          <Field label="Plan/Pack"><Select value={form.plan||"Pack 12 (3x)"} onChange={e=>set("plan",e.target.value)}>
            <option>Pack 8 (2x)</option>
            <option>Pack 12 (3x)</option>
            <option>Pack 20 (5x)</option>
            <option>Promo Grupo (3+)</option>
            <option>Promo Adolescente (3x)</option>
            <option>Promo Adolescente (5x)</option>
            <option>Clase Suelta</option>
          </Select></Field>

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