import { useState } from "react"
import { Modal, Field, Input, Select, BtnRow, PageHeader, SubTitle, Empty, Tabs } from "../components/ui.jsx"
import { fmt, uid } from "../utils/helpers.js"
import { toast } from "../hooks/useToast.js"

const CATS = ["todos","Cardio","Fuerza libre","Máquinas","Instalaciones","Accesorios"]
const estColor = e => e==="Bueno"?"#00e676":e==="Regular"?"#ffd740":"#ff4444"

export default function PageInventario({ inventario, setInventario }) {
  const [tab,   setTab]    = useState("todos")
  const [modal, setModal]  = useState(false)
  const [form,  setFormRaw]= useState({})
  const set = (k,v) => setFormRaw(f=>({...f,[k]:v}))

  const openNew = () => { setFormRaw({estado:"Bueno",categoria:"Cardio"}); setModal(true) }
  const save = () => {
    if (!form.equipo?.trim()) { toast("⚠️ Ingresá el nombre del equipo"); return }
    setInventario(l => [...l, {...form, id:uid(), costo:+form.costo||0, valor_actual:+form.valor_actual||0, cantidad:+form.cantidad||1, uso_hs:+form.uso_hs||0}])
    toast("✅ Equipo agregado")
    setModal(false)
  }
  const del = id => {
    if (!window.confirm("¿Eliminar?")) return
    setInventario(l => l.filter(i => i.id !== id))
  }

  const totOrig = inventario.reduce((s,i) => s+(i.costo||0), 0)
  const totAct  = inventario.reduce((s,i) => s+Math.max(0,i.valor_actual||0), 0)
  const list    = tab==="todos" ? inventario : inventario.filter(i => i.categoria===tab)

  return (
    <div>
      <PageHeader title="Inventario" action="+ Equipo" onAction={openNew}/>
      <SubTitle>Activos: ${fmt(totAct)} · original ${fmt(totOrig)}</SubTitle>
      <Tabs options={CATS.map(c=>({v:c,l:c==="todos"?"Todo":c}))} value={tab} onChange={setTab}/>

      {list.length===0 && <Empty icon="🏋️" text="Sin equipos"/>}
      {list.map(i => (
        <div key={i.id} style={{background:"#1c2130",border:"1px solid #252d3d",borderRadius:14,padding:13,marginBottom:9}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:14,fontWeight:600}}>{i.equipo}</div>
              <div style={{fontSize:11,color:"#8891a8",marginTop:2}}>{i.categoria} · {i.marca||"—"} · cant. {i.cantidad||1}</div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:12,fontWeight:600,color:estColor(i.estado)}}>{i.estado}</span>
              <button onClick={()=>del(i.id)} style={{background:"none",border:"none",color:"#3e4658",cursor:"pointer",fontSize:14}}>✕</button>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginTop:10}}>
            {[["Costo orig.","$"+fmt(i.costo)],["Valor actual","$"+fmt(Math.max(0,i.valor_actual))],["Uso diario",(i.uso_hs||0)+"hs"]].map(([l,v])=>(
              <div key={l} style={{background:"#181c25",borderRadius:8,padding:8,textAlign:"center"}}>
                <div style={{fontSize:9,color:"#8891a8",textTransform:"uppercase",letterSpacing:.3}}>{l}</div>
                <div style={{fontSize:13,fontWeight:700,marginTop:3}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Modal open={modal} onClose={()=>setModal(false)} title="Agregar equipo">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="Nombre del equipo" full><Input placeholder="Ej: Cinta de correr" value={form.equipo||""} onChange={e=>set("equipo",e.target.value)}/></Field>
          <Field label="Categoría"><Select value={form.categoria||"Cardio"} onChange={e=>set("categoria",e.target.value)}><option>Cardio</option><option>Fuerza libre</option><option>Máquinas</option><option>Instalaciones</option><option>Accesorios</option></Select></Field>
          <Field label="Marca"><Input placeholder="Ej: Technogym" value={form.marca||""} onChange={e=>set("marca",e.target.value)}/></Field>
          <Field label="Cantidad"><Input type="number" placeholder="1" value={form.cantidad||""} onChange={e=>set("cantidad",e.target.value)}/></Field>
          <Field label="Estado"><Select value={form.estado||"Bueno"} onChange={e=>set("estado",e.target.value)}><option>Bueno</option><option>Regular</option><option>Malo</option></Select></Field>
          <Field label="Uso diario (hs)"><Input type="number" placeholder="4" value={form.uso_hs||""} onChange={e=>set("uso_hs",e.target.value)}/></Field>
          <Field label="Costo original $"><Input type="number" placeholder="100000" value={form.costo||""} onChange={e=>set("costo",e.target.value)}/></Field>
          <Field label="Valor actual $"><Input type="number" placeholder="60000" value={form.valor_actual||""} onChange={e=>set("valor_actual",e.target.value)}/></Field>
          <Field label="Mantenimiento" full><Input placeholder="Ej: Engrase mensual" value={form.mantenimiento||""} onChange={e=>set("mantenimiento",e.target.value)}/></Field>
        </div>
        <BtnRow onCancel={()=>setModal(false)} onSave={save}/>
      </Modal>
    </div>
  )
}
