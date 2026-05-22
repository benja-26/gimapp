import { useState } from "react"
import { Modal, Field, Input, Select, BtnRow, PageHeader, SubTitle, Empty } from "../components/ui.jsx"
import { fmt, uid } from "../utils/helpers.js"
import { toast } from "../hooks/useToast.js"

export default function PageRRHH({ rrhh, setRRHH }) {
  const [modal, setModal]  = useState(false)
  const [form,  setFormRaw]= useState({})
  const set = (k,v) => setFormRaw(f=>({...f,[k]:v}))

  const openNew = () => { setFormRaw({tipo_contrato:"Relación dep."}); setModal(true) }
  const save = () => {
    if (!form.nombre?.trim()) { toast("⚠️ Ingresá el nombre"); return }
    const bruto = +form.bruto||0
    const cargas = Math.round(bruto*0.23)
    setRRHH(l => [...l, {...form, id:uid(), bruto, cargas, costo_total:bruto+cargas, horas_sem:+form.horas_sem||0}])
    toast("✅ Empleado agregado")
    setModal(false)
  }
  const del = id => {
    if (!window.confirm("¿Eliminar?")) return
    setRRHH(l => l.filter(r => r.id !== id))
  }

  const total = rrhh.reduce((s,r) => s+(r.costo_total||0), 0)

  return (
    <div>
      <PageHeader title="RRHH" action="+ Empleado" onAction={openNew}/>
      <SubTitle>Costo total nómina: ${fmt(total)}/mes</SubTitle>

      {rrhh.length===0 && <Empty icon="👤" text="Sin personal registrado"/>}
      {rrhh.map(r => (
        <div key={r.id} style={{background:"#1c2130",border:"1px solid #252d3d",borderRadius:14,padding:14,marginBottom:9}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:15,fontWeight:600}}>{r.nombre}</div>
              <div style={{fontSize:11,color:"#8891a8",marginTop:2}}>{r.rol} · {r.tipo_contrato} · {r.horas_sem}hs/sem</div>
            </div>
            <button onClick={()=>del(r.id)} style={{background:"none",border:"none",color:"#3e4658",cursor:"pointer",fontSize:15}}>✕</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginTop:10}}>
            {[["Bruto","$"+fmt(r.bruto),"#eef0f8"],["Cargas 23%","$"+fmt(r.cargas),"#8891a8"],["Total","$"+fmt(r.costo_total),"#ff5722"]].map(([l,v,c])=>(
              <div key={l} style={{background:"#181c25",borderRadius:8,padding:8,textAlign:"center"}}>
                <div style={{fontSize:9,color:"#8891a8",textTransform:"uppercase"}}>{l}</div>
                <div style={{fontSize:13,fontWeight:700,marginTop:3,color:c}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Modal open={modal} onClose={()=>setModal(false)} title="Agregar empleado">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="Nombre" full><Input placeholder="Nombre completo" value={form.nombre||""} onChange={e=>set("nombre",e.target.value)}/></Field>
          <Field label="Rol"><Input placeholder="Instructor" value={form.rol||""} onChange={e=>set("rol",e.target.value)}/></Field>
          <Field label="Tipo contrato"><Select value={form.tipo_contrato||"Relación dep."} onChange={e=>set("tipo_contrato",e.target.value)}><option>Relación dep.</option><option>Autónomo</option><option>Medio tiempo</option><option>Part time</option></Select></Field>
          <Field label="Horas/semana"><Input type="number" placeholder="40" value={form.horas_sem||""} onChange={e=>set("horas_sem",e.target.value)}/></Field>
          <Field label="Sueldo bruto $"><Input type="number" placeholder="120000" value={form.bruto||""} onChange={e=>set("bruto",e.target.value)}/></Field>
          <Field label="Observaciones" full><Input placeholder="Opcional" value={form.obs||""} onChange={e=>set("obs",e.target.value)}/></Field>
        </div>
        <BtnRow onCancel={()=>setModal(false)} onSave={save}/>
      </Modal>
    </div>
  )
}
