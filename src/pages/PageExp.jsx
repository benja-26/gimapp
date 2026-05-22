import { useState } from "react"

const ETAPAS = [
  {n:"Etapa 1 — Diagnóstico",p:"Meses 1–3",col:"#4fc3f7",inv:"$0–50k",riesgo:"🟢 Bajo",
   items:["Armar sistema de gestión","Medir KPIs reales mes a mes","Identificar horarios saturados","Calcular ticket promedio real","Detectar clientes con mayor LTV","Sistematizar cobros y bajas"]},
  {n:"Etapa 2 — Optimización",p:"Meses 4–6",col:"#00e676",inv:"$50k–150k",riesgo:"🟡 Medio",
   items:["Aumentar precios con análisis","Lanzar plan premium con extras","Crear programa de referidos","Reducir churn con seguimiento","Optimizar horarios muertos","Incorporar personal training"]},
  {n:"Etapa 3 — Expansión",p:"Meses 7–12",col:"#ffd740",inv:"$2M–4M",riesgo:"🔴 Alto",
   items:["Ejecutar mudanza si KPIs lo validan","Ampliar equipamiento (cardio)","Contratar instructor adicional","Lanzar app de gestión","Crear área de clases grupales","Medir NPS y satisfacción"]},
  {n:"Etapa 4 — Escalamiento",p:"Año 2+",col:"#ff5722",inv:"$5M–15M",riesgo:"🔴 Muy alto",
   items:["Evaluar segunda sede","Franquicia o partnership","Clases online / streaming","Venta suplementos y merchandising","Entrenamientos corporativos","Convenios con obras sociales"]},
]

export default function PageExp() {
  const [open, setOpen] = useState(0)
  return (
    <div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,marginBottom:14}}>Expansión</div>
      {ETAPAS.map((e,i)=>(
        <div key={i} style={{background:"#1c2130",border:"1px solid #252d3d",borderLeft:`3px solid ${e.col}`,borderRadius:14,marginBottom:9,overflow:"hidden"}}>
          <div onClick={()=>setOpen(open===i?-1:i)} style={{padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700}}>{e.n}</div>
              <div style={{fontSize:11,color:"#8891a8",marginTop:2}}>{e.p} · {e.riesgo} · {e.inv}</div>
            </div>
            <div style={{color:"#3e4658",fontSize:18,transform:open===i?"rotate(90deg)":"",transition:".2s"}}>›</div>
          </div>
          {open===i && (
            <div style={{padding:"0 16px 14px"}}>
              {e.items.map(it=>(
                <div key={it} style={{fontSize:13,color:"#8891a8",padding:"4px 0",display:"flex",gap:8}}>
                  <span style={{color:"#ff5722"}}>→</span>{it}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
