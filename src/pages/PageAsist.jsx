import { useState } from "react"
import { Modal, Field, Input, BtnRow, PageHeader, SubTitle, Empty } from "../components/ui.jsx"
import { fdate, uid } from "../utils/helpers.js"
import { toast } from "../hooks/useToast.js"

export default function PageAsist({ asistencias, setAsistencias, clientes }) {
  const [modal, setModal]  = useState(false)
  const [form,  setFormRaw]= useState({})
  const set = (k,v) => setFormRaw(f=>({...f,[k]:v}))

  const openNew = () => {
    const now = new Date()
    setFormRaw({ fecha:now.toISOString().split("T")[0], hora:now.toTimeString().slice(0,5) })
    setModal(true)
  }
  const save = () => {
    if (!form.nombre?.trim()) { toast("⚠️ Ingresá el nombre"); return }
    setAsistencias(l => [...l, {...form, id:uid()}])
    toast("✅ Entrada registrada")
    setModal(false)
  }
  const del = id => {
    if (!window.confirm("¿Eliminar?")) return
    setAsistencias(l => l.filter(a => a.id !== id))
  }

  return (
    <div>
      <PageHeader title="Asistencias" action="+ Entrada" onAction={openNew}/>
      <SubTitle>{asistencias.length} entradas registradas</SubTitle>

      {asistencias.length===0 && <Empty icon="🏃" text="Sin entradas registradas"/>}
      {[...asistencias].reverse().map(a => (
        <div key={a.id} style={{background:"#1c2130",border:"1px solid #252d3d",borderRadius:13,padding:"12px 13px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:14,fontWeight:600}}>{a.nombre}</div>
            <div style={{fontSize:11,color:"#8891a8",marginTop:2}}>{fdate(a.fecha)} · {a.hora||""}</div>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <span style={{fontSize:11,padding:"3px 9px",borderRadius:20,background:"#4fc3f718",color:"#4fc3f7"}}>✓ entrada</span>
            <button onClick={()=>del(a.id)} style={{background:"none",border:"none",color:"#3e4658",cursor:"pointer",fontSize:15}}>✕</button>
          </div>
        </div>
      ))}

      <Modal open={modal} onClose={()=>setModal(false)} title="Registrar entrada">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="Nombre del cliente" full>
            <Input placeholder="Buscar nombre..." value={form.nombre||""} onChange={e=>set("nombre",e.target.value)} list="cl-list"/>
            <datalist id="cl-list">{clientes.map(c=><option key={c.id} value={c.nombre}/>)}</datalist>
          </Field>
          <Field label="Fecha"><Input type="date" value={form.fecha||""} onChange={e=>set("fecha",e.target.value)}/></Field>
          <Field label="Hora"><Input type="time" value={form.hora||""} onChange={e=>set("hora",e.target.value)}/></Field>
        </div>
        <BtnRow onCancel={()=>setModal(false)} onSave={save}/>
      </Modal>
    </div>
  )
}
