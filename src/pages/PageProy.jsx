import { useState } from "react"
import { Modal, Field, Input, BtnRow, KCard, SecH } from "../components/ui.jsx"
import { fmt } from "../utils/helpers.js"
import { toast } from "../hooks/useToast.js"

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]

function calcProy(p) {
  let rows=[], cl=p.ci, gfm=p.gf
  for (let m=0; m<12; m++) {
    const bajas = Math.round(cl*p.churn)
    const cf    = Math.min(cl+p.altas-bajas, p.cap)
    const fac   = cf*p.ticket
    const gt    = gfm + cf*p.gv
    rows.push({m:MESES[m], cf, fac, gt, ebitda:fac-gt})
    cl=cf; gfm=gfm*(1+p.inf)
  }
  return rows
}

export default function PageProy({ proy, setProy }) {
  const [modal, setModal]  = useState(false)
  const [form,  setFormRaw]= useState({})
  const set = (k,v) => setFormRaw(f=>({...f,[k]:v}))

  const rows   = calcProy(proy)
  const maxAbs = Math.max(...rows.map(r=>Math.abs(r.ebitda)), 1)

  const openEdit = () => {
    setFormRaw({...proy, churn:proy.churn*100, inf:proy.inf*100})
    setModal(true)
  }
  const save = () => {
    setProy({ci:+form.ci,altas:+form.altas,churn:+form.churn/100,ticket:+form.ticket,gf:+form.gf,gv:+form.gv,inf:+form.inf/100,cap:+form.cap})
    toast("✅ Proyección actualizada")
    setModal(false)
  }

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800}}>Proyección</div>
        <button onClick={openEdit} style={{background:"#1c2130",border:"1px solid #252d3d",borderRadius:9,color:"#8891a8",padding:"8px 14px",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Editar supuestos</button>
      </div>
      <div style={{fontSize:12,color:"#8891a8",marginBottom:14}}>Modelo 12 meses dinámico</div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
        {[["Clientes iniciales",proy.ci],["Altas/mes",proy.altas],["Churn",(proy.churn*100).toFixed(0)+"%"],["Ticket","$"+fmt(proy.ticket)]].map(([l,v])=>(
          <KCard key={l} label={l} value={v} color="#8891a8"/>
        ))}
      </div>

      <SecH title="EBITDA proyectado"/>
      <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:16}}>
        {rows.map(r => {
          const pct = Math.max(0, (r.ebitda/maxAbs)*100)
          const col = r.ebitda>=0?"#00e676":"#ff4444"
          return (
            <div key={r.m} style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{fontSize:10,color:"#8891a8",width:28,textAlign:"right",flexShrink:0}}>{r.m}</div>
              <div style={{flex:1,background:"#181c25",borderRadius:4,height:20,overflow:"hidden"}}>
                <div style={{width:pct+"%",height:"100%",background:col,borderRadius:4,display:"flex",alignItems:"center",paddingLeft:6}}>
                  <span style={{fontSize:9,fontWeight:700,color:"#fff",whiteSpace:"nowrap"}}>${fmt(r.ebitda)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <SecH title="Tabla mensual"/>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead><tr>{["Mes","Clientes","Facturación","Gastos","EBITDA"].map(h=>(
            <th key={h} style={{background:"#181c25",color:"#8891a8",padding:"6px 7px",textAlign:"left",borderBottom:"1px solid #252d3d",fontSize:10,whiteSpace:"nowrap"}}>{h}</th>
          ))}</tr></thead>
          <tbody>{rows.map(r=>(
            <tr key={r.m}>
              <td style={{padding:"7px",borderBottom:"1px solid #181c25"}}>{r.m}</td>
              <td style={{padding:"7px",borderBottom:"1px solid #181c25"}}>{r.cf}</td>
              <td style={{padding:"7px",borderBottom:"1px solid #181c25"}}>${fmt(r.fac)}</td>
              <td style={{padding:"7px",borderBottom:"1px solid #181c25"}}>${fmt(r.gt)}</td>
              <td style={{padding:"7px",borderBottom:"1px solid #181c25",fontWeight:700,color:r.ebitda>=0?"#00e676":"#ff4444"}}>${fmt(r.ebitda)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title="Supuestos del modelo">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[["ci","Clientes iniciales"],["altas","Altas/mes"],["churn","Churn % (ej: 5)"],["ticket","Ticket promedio $"],["gf","Gastos fijos $"],["gv","Gasto var/cliente $"],["inf","Inflación gastos % (ej: 4)"],["cap","Cap. máxima"]].map(([k,l])=>(
            <Field key={k} label={l}><Input type="number" value={form[k]||""} onChange={e=>set(k,e.target.value)}/></Field>
          ))}
        </div>
        <BtnRow onCancel={()=>setModal(false)} onSave={save} saveLabel="Recalcular"/>
      </Modal>
    </div>
  )
}
