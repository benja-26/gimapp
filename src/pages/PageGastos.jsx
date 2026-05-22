import { useState } from "react"
import { Modal, Field, Input, Select, BtnRow, TxItem, PageHeader, SubTitle, Empty, Tabs } from "../components/ui.jsx"
import { fmt, fdate, uid } from "../utils/helpers.js"
import { toast } from "../hooks/useToast.js"

export default function PageGastos({ gastos_fijos, setGastosFijos, gastos_var, setGastosVar }) {
  const [tab,   setTab]    = useState("fijos")
  const [modal, setModal]  = useState(false)
  const [form,  setFormRaw]= useState({})
  const set = (k,v) => setFormRaw(f=>({...f,[k]:v}))

  const openNew = () => {
    setFormRaw({ fecha:new Date().toISOString().split("T")[0], categoria:"Mantenimiento", pago:"Efectivo", tipo:tab==="fijos"?"Fijo":"Variable" })
    setModal(true)
  }
  const save = () => {
    if (!form.concepto?.trim() || !form.monto) { toast("⚠️ Completá concepto y monto"); return }
    const item = {...form, id:uid(), monto:+form.monto}
    if (form.tipo === "Fijo") setGastosFijos(l => [...l, item])
    else setGastosVar(l => [...l, item])
    toast("✅ Gasto registrado")
    setModal(false)
  }
  const del = (id, tipo) => {
    if (!window.confirm("¿Eliminar?")) return
    if (tipo === "fijos") setGastosFijos(l => l.filter(g => g.id !== id))
    else setGastosVar(l => l.filter(g => g.id !== id))
    toast("🗑️ Eliminado")
  }

  const list  = tab === "fijos" ? gastos_fijos : gastos_var
  const total = list.reduce((s,g) => s+(g.monto||0), 0)

  return (
    <div>
      <PageHeader title="Gastos" action="+ Gasto" onAction={openNew}/>
      <SubTitle>Total {tab}: ${fmt(total)}</SubTitle>
      <Tabs options={[{v:"fijos",l:"Fijos"},{v:"variables",l:"Variables"}]} value={tab} onChange={setTab}/>

      {list.length===0 && <Empty icon="📦" text="Sin gastos registrados"/>}
      {[...list].reverse().map(g => (
        <TxItem key={g.id} concepto={g.concepto}
          detalle={fdate(g.fecha)+" · "+(g.categoria||"")}
          monto={g.monto} positive={false} onDelete={()=>del(g.id, tab)}/>
      ))}

      <Modal open={modal} onClose={()=>setModal(false)} title="Registrar gasto">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="Concepto" full><Input placeholder="Ej: Reparación cinta" value={form.concepto||""} onChange={e=>set("concepto",e.target.value)}/></Field>
          <Field label="Monto $"><Input type="number" placeholder="5000" value={form.monto||""} onChange={e=>set("monto",e.target.value)}/></Field>
          <Field label="Tipo"><Select value={form.tipo||"Variable"} onChange={e=>set("tipo",e.target.value)}><option>Variable</option><option>Fijo</option></Select></Field>
          <Field label="Categoría"><Select value={form.categoria||"Mantenimiento"} onChange={e=>set("categoria",e.target.value)}><option>Mantenimiento</option><option>Insumos</option><option>Marketing</option><option>Reposición</option><option>Personal</option><option>Alquiler</option><option>Servicios</option><option>Imprevistos</option><option>Otro</option></Select></Field>
          <Field label="Proveedor"><Input placeholder="Opcional" value={form.proveedor||""} onChange={e=>set("proveedor",e.target.value)}/></Field>
          <Field label="Medio de pago"><Select value={form.pago||"Efectivo"} onChange={e=>set("pago",e.target.value)}><option>Efectivo</option><option>Transferencia</option><option>Tarjeta</option></Select></Field>
          <Field label="Fecha"><Input type="date" value={form.fecha||""} onChange={e=>set("fecha",e.target.value)}/></Field>
        </div>
        <BtnRow onCancel={()=>setModal(false)} onSave={save}/>
      </Modal>
    </div>
  )
}
