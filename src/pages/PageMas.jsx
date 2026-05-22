const ITEMS = [
  ["📤","Gastos","gastos"],["⏰","Horarios","horarios"],["🏃","Asistencias","asist"],
  ["🏋️","Inventario","inv"],["👥","RRHH","rrhh"],["📈","Proyección","proy"],
  ["🏠","Reubicación","reub"],["🚀","Expansión","exp"],["🔍","Competencia","comp"],
  ["⚙️","Configuración","cfg"],
]

export default function PageMas({ onNav }) {
  return (
    <div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,marginBottom:16}}>Más</div>
      {ITEMS.map(([ico,lbl,pg])=>(
        <div key={pg} onClick={()=>onNav(pg)} style={{background:"#1c2130",border:"1px solid #252d3d",borderRadius:13,padding:14,marginBottom:8,display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
          <div style={{fontSize:18,width:30,textAlign:"center"}}>{ico}</div>
          <div style={{flex:1,fontSize:14,fontWeight:500}}>{lbl}</div>
          <div style={{color:"#3e4658",fontSize:15}}>›</div>
        </div>
      ))}
    </div>
  )
}
