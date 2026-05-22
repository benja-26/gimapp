import { KCard, SecH } from "../components/ui.jsx"
import { fmt } from "../utils/helpers.js"

export default function PageReub({ clientes, config, gastos_fijos }) {
  const act    = clientes.filter(c => c.estado === "Activo")
  const ticket = act.length ? act.reduce((s,c)=>s+(c.precio||0),0)/act.length : config.ticket
  const gf     = gastos_fijos.reduce((s,g)=>s+(g.monto||0),0)||346000

  const zonas = [
    ["Centro/Alberdi","$180k","Muy alto","Alta","8/10"],
    ["Bº San Bernardo","$140k","Alto","Media","7/10"],
    ["Tres Cerritos","$160k","Medio","Baja","8/10"],
    ["Palermo/Castañares","$120k","Alto","Baja","7/10"],
    ["Nueva Córdoba","$130k","Medio","Muy baja","6/10"],
  ]

  return (
    <div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,marginBottom:4}}>Reubicación</div>
      <div style={{fontSize:12,color:"#8891a8",marginBottom:14}}>Análisis financiero del cambio de local</div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:14}}>
        {[["📍 Actual",[["Alquiler","$85k/mes"],["Superficie","150 m²"],["Capacidad","40 pers."],["EBITDA est.","$"+fmt(act.length*ticket-gf)]]],
          ["🆕 Nuevo",[["Alquiler","$160k/mes"],["Superficie","280 m²"],["Capacidad","80 pers."],["Inv. total","$2.88M"]]]].map(([tit,vals])=>(
          <div key={tit} style={{background:"#1c2130",border:"1px solid #252d3d",borderRadius:14,padding:12}}>
            <div style={{fontSize:11,color:"#8891a8",fontWeight:700,textTransform:"uppercase",marginBottom:8}}>{tit}</div>
            {vals.map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"4px 0",borderBottom:"1px solid #181c25"}}>
                <span style={{color:"#8891a8"}}>{l}</span><span style={{fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <KCard label="Veredicto" value="🔴 No conviene aún" sub="Payback negativo · Necesitás más clientes primero" color="#ff4444"/>

      <div style={{marginTop:14}}>
        <SecH title="Zonas potenciales en Salta"/>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr>{["Zona","Alquiler","Tránsito","Comp.","Score"].map(h=>(
              <th key={h} style={{background:"#181c25",color:"#8891a8",padding:"6px 7px",textAlign:"left",borderBottom:"1px solid #252d3d",fontSize:10}}>{h}</th>
            ))}</tr></thead>
            <tbody>{zonas.map(([z,a,t,c,s])=>(
              <tr key={z}>
                <td style={{padding:"7px",borderBottom:"1px solid #181c25",fontWeight:600}}>{z}</td>
                <td style={{padding:"7px",borderBottom:"1px solid #181c25"}}>{a}</td>
                <td style={{padding:"7px",borderBottom:"1px solid #181c25"}}>{t}</td>
                <td style={{padding:"7px",borderBottom:"1px solid #181c25"}}>{c}</td>
                <td style={{padding:"7px",borderBottom:"1px solid #181c25",fontWeight:700,color:"#ff5722"}}>{s}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
