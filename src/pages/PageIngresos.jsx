import { useState } from "react"
import { Modal, Field, Input, Select, BtnRow, TxItem, PageHeader, SubTitle, Empty, Tabs } from "../components/ui.jsx"
import { fmt, fdate, uid } from "../utils/helpers.js"
import { toast } from "../hooks/useToast.js"

const CATS = ["todos","Cuota","Personal Training","Suplementos","Inscripción","Otros"]

export default function PageIngresos({ ingresos, setIngresos, clientes }) {
  const [tab,   setTab]    = useState("todos")
  const [modal, setModal]  = useState(false)
  const [form,  setFormRaw]= useState({})
  const set = (k,v) => setFormRaw(f=>({...f,[k]:v}))

  const openNew = () => {
    setFormRaw({ fecha:new Date().toISOString().split("T")[0], categoria:"Cuota", pago:"Efectivo" })
    setModal(true)
  }
  const save = () => {
    if (!form.concepto?.trim() || !form.monto) { toast("⚠️ Completá concepto y monto"); return }
    setIngresos(l => [...l, {...form, id:uid(), monto:+form.monto}])
    toast("✅ Cobro registrado")
    setModal(false)
  }
  const del = id => {
    if (!window.confirm("¿Eliminar?")) return
    setIngresos(l => l.filter(i => i.id !== id))
    toast("🗑️ Eliminado")
  }

  const total = ingresos.reduce((s,i) => s+(i.monto||0), 0)
  let list = [...ingresos].reverse()
  if (tab !== "todos") list = list.filter(i => i.categoria === tab)

  return (
    <div>
      <PageHeader title="Ingresos" action="+ Cobro" onAction={openNew}/>
      <SubTitle>Total: ${fmt(total)} · {ingresos.length} registros</SubTitle>
      <Tabs options={CATS.map(c=>({v:c,l:c==="todos"?"Todos":c}))} value={tab} onChange={setTab}/>

      {list.length===0 && <Empty icon="💰" text="Sin registros"/>}
      {list.map(i => (
        <TxItem key={i.id} concepto={i.concepto}
          detalle={fdate(i.fecha)+" · "+(i.categoria||"")+" · "+(i.pago||"")}
          monto={i.monto} onDelete={()=>del(i.id)}/>
      ))}

      <Modal open={modal} onClose={()=>setModal(false)} title="Registrar cobro">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="Concepto" full><Input placeholder="Ej: Cuota mayo - Juan" value={form.concepto||""} onChange={e=>set("concepto",e.target.value)}/></Field>
          <Field label="Monto $"><Input type="number" placeholder="18000" value={form.monto||""} onChange={e=>set("monto",e.target.value)}/></Field>
          <Field label="Categoría"><Select value={form.categoria||"Cuota"} onChange={e=>set("categoria",e.target.value)}><option>Cuota</option><option>Personal Training</option><option>Suplementos</option><option>Inscripción</option><option>Otros</option></Select></Field>
          <Field label="Medio de pago"><Select value={form.pago||"Efectivo"} onChange={e=>set("pago",e.target.value)}><option>Efectivo</option><option>Transferencia</option><option>Débito</option><option>Tarjeta</option><option>MercadoPago</option></Select></Field>
          <Field label="Fecha"><Input type="date" value={form.fecha||""} onChange={e=>set("fecha",e.target.value)}/></Field>
          <Field label="Cliente"><Input placeholder="Nombre (opcional)" value={form.cliente||""} onChange={e=>set("cliente",e.target.value)}/></Field>
        </div>
        <BtnRow onCancel={()=>setModal(false)} onSave={save}/>
      </Modal>
    </div>
  )
}
