import { SecH } from "../components/ui.jsx"

const GYMS = [
  ["Gimnasio Olímpico","Centro","$20k","200+",6],["Gold's Gym","Balcarce","$22k","180+",7],
  ["Fitness Center","San Bernardo","$16k","80",5],["CrossFit Salta","Tres Cerritos","$25k","40",8],
  ["Gym Palermo","Castañares","$14k","70",4],["Studio Pilates","Centro","$18k","30",7],
  ["Gymnos Club","V. Lavalle","$13k","60",5],
]
const OPPS = [
  ["💰 Brecha de precio","Espacio entre $14k y $22k — posicionarte en $18–21k con diferenciación de servicio"],
  ["👩 Nicho desatendido","Clientes 35–55 buscando salud y bienestar, no solo estética"],
  ["📍 Zona norte/sur","Castañares, Limache, Bº Solidaridad — baja oferta, población creciente"],
  ["📱 Personalización","Seguimiento individual + app de progreso vs. gimnasios masivos"],
  ["🤝 Alianzas","Obras sociales (OSDE, Swiss Medical) y empresas locales"],
  ["🎥 Digital","Clases en vivo por Zoom e Instagram — sin costo adicional de local"],
  ["💊 Nutrición","Suplementos + asesoramiento — ticket adicional $5–15k por cliente"],
]

export default function PageComp() {
  return (
    <div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,marginBottom:14}}>Competencia</div>
      <div style={{overflowX:"auto",marginBottom:14}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead><tr>{["Gimnasio","Zona","Precio","Score"].map(h=>(
            <th key={h} style={{background:"#181c25",color:"#8891a8",padding:"6px 7px",textAlign:"left",borderBottom:"1px solid #252d3d",fontSize:10}}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {GYMS.map(([n,z,p,c,s])=>(
              <tr key={n}>
                <td style={{padding:"8px 7px",borderBottom:"1px solid #181c25",fontWeight:600}}>{n}</td>
                <td style={{padding:"8px 7px",borderBottom:"1px solid #181c25",color:"#8891a8"}}>{z}</td>
                <td style={{padding:"8px 7px",borderBottom:"1px solid #181c25"}}>{p}</td>
                <td style={{padding:"8px 7px",borderBottom:"1px solid #181c25",fontWeight:700,color:s>=7?"#00e676":s>=5?"#ffd740":"#ff4444"}}>{s}/10</td>
              </tr>
            ))}
            <tr style={{background:"rgba(255,87,34,.05)"}}>
              <td style={{padding:"8px 7px",fontWeight:700,color:"#ff5722"}}>Tu gimnasio</td>
              <td style={{padding:"8px 7px",color:"#8891a8"}}>Actual</td>
              <td style={{padding:"8px 7px"}}>$18k</td>
              <td style={{padding:"8px 7px",fontWeight:700,color:"#ff5722"}}>?</td>
            </tr>
          </tbody>
        </table>
      </div>
      <SecH title="Oportunidades"/>
      {OPPS.map(([l,t])=>(
        <div key={l} style={{background:"#1c2130",borderLeft:"3px solid #ff5722",border:"1px solid #252d3d",borderLeftWidth:3,borderLeftColor:"#ff5722",borderRadius:"0 12px 12px 0",padding:"11px 13px",marginBottom:8}}>
          <div style={{fontSize:12,fontWeight:600,color:"#ff5722"}}>{l}</div>
          <div style={{fontSize:12,color:"#8891a8",marginTop:3,lineHeight:1.4}}>{t}</div>
        </div>
      ))}
    </div>
  )
}
