import { useState } from "react"
import { Field, Input } from "../components/ui.jsx"
import { toast } from "../hooks/useToast.js"

export default function PageConfig({ config, setConfig }) {
  const [form, setFormRaw] = useState({...config})
  const set = (k,v) => setFormRaw(f=>({...f,[k]:v}))
  const save = () => {
    setConfig({...form, ticket:+form.ticket, cap:+form.cap})
    toast("✅ Config guardada")
  }
  return (
    <div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,marginBottom:16}}>⚙️ Configuración</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Nombre del gimnasio" full><Input value={form.nombre||""} onChange={e=>set("nombre",e.target.value)}/></Field>
        <Field label="Ticket promedio $"><Input type="number" value={form.ticket||""} onChange={e=>set("ticket",e.target.value)}/></Field>
        <Field label="Capacidad máxima"><Input type="number" value={form.cap||""} onChange={e=>set("cap",e.target.value)}/></Field>
      </div>
      <button onClick={save} style={{marginTop:18,width:"100%",background:"#ff5722",border:"none",borderRadius:9,color:"#fff",padding:14,fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,cursor:"pointer"}}>Guardar</button>
    </div>
  )
}
