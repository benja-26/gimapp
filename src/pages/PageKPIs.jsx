import { fmt } from "../utils/helpers.js"

export default function PageKPIs({ clientes, ingresos, gastos_fijos, gastos_var, rrhh, config }) {
  const act    = clientes.filter(c => c.estado === "Activo")
  const ticket = act.length ? act.reduce((s,c)=>s+(c.precio||0),0)/act.length : config.ticket
  const gf     = gastos_fijos.reduce((s,g)=>s+(g.monto||0),0)
  const gv     = gastos_var.reduce((s,g)=>s+(g.monto||0),0)
  const fac    = act.length * ticket
  const ebitda = fac - gf - gv
  const margen = fac ? ((ebitda/fac)*100).toFixed(1) : 0
  const pe     = ticket ? Math.ceil((gf+gv)/ticket) : 0
  const ocup   = ((act.length/(config.cap||40))*100).toFixed(1)
  const totRRHH= rrhh.reduce((s,r)=>s+(r.costo_total||0),0)

  const rows = [
    {n:"Facturación mensual bruta",     v:"$"+fmt(fac),          b:"$2.7M+",          ok:fac>=2700000},
    {n:"Gastos totales / mes",          v:"$"+fmt(gf+gv),        b:"<$450k",          ok:(gf+gv)<450000},
    {n:"EBITDA mensual",                v:(ebitda>=0?"+":"")+"$"+fmt(ebitda), b:">$500k", ok:ebitda>0},
    {n:"Margen EBITDA",                 v:margen+"%",            b:">25%",            ok:+margen>=25},
    {n:"Punto de equilibrio",           v:pe+" clientes",        b:"<80% cap",        ok:pe<(config.cap||40)*.8},
    {n:"Ocupación actual",              v:ocup+"%",              b:"60–80%",          ok:+ocup>=60},
    {n:"Costo por cliente activo",      v:"$"+fmt(act.length?(gf+gv)/act.length:0), b:"<$2.8k", ok:act.length&&(gf+gv)/act.length<2800},
    {n:"LTV estimado 12m",              v:"$"+fmt(ticket*12),    b:">$200k",          ok:ticket*12>=200000},
    {n:"Costo total RRHH",              v:"$"+fmt(totRRHH),      b:"<60% ingresos",   ok:fac&&totRRHH/fac<0.6},
    {n:"Revenue / m² (150m²)",          v:"$"+fmt(fac/150),      b:">$15k/m²",        ok:fac/150>=15000},
  ]

  return (
    <div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,marginBottom:4}}>KPIs</div>
      <div style={{fontSize:12,color:"#8891a8",marginBottom:14}}>Indicadores en tiempo real vs. benchmark</div>
      {rows.map(r => (
        <div key={r.n} style={{background:"#1c2130",border:"1px solid #252d3d",borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:12,color:"#8891a8"}}>{r.n}</div>
            <div style={{fontSize:10,color:"#3e4658",marginTop:2}}>Benchmark: {r.b}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700}}>{r.v}</div>
            <div style={{fontSize:13}}>{r.ok?"✅":"🔴"}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
