import { KCard, KRow, TxItem, SecH } from "../components/ui.jsx"
import { fmt, fdate } from "../utils/helpers.js"

export default function PageDash({ clientes, ingresos, gastos_fijos, gastos_var, config, onNav }) {
  const act    = clientes.filter(c => c.estado === "Activo")
  const totIng = ingresos.reduce((s, i) => s + (i.monto || 0), 0)
  const totGF  = gastos_fijos.reduce((s, g) => s + (g.monto || 0), 0)
  const totGV  = gastos_var.reduce((s, g) => s + (g.monto || 0), 0)
  const ticket = act.length ? act.reduce((s, c) => s + (c.precio || 0), 0) / act.length : config.ticket
  const ebitda = totIng - totGF - totGV
  const ocup   = ((act.length / (config.cap || 40)) * 100).toFixed(0)
  const pe     = ticket ? Math.ceil((totGF + totGV) / ticket) : 0
  const hoy    = new Date().toLocaleDateString("es-AR", { weekday:"long", day:"numeric", month:"long" })

  return (
    <div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, marginBottom:2 }}>Dashboard</div>
      <div style={{ fontSize:12, color:"#8891a8", marginBottom:14 }}>{hoy.charAt(0).toUpperCase()+hoy.slice(1)}</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:14 }}>
        <KCard label="Clientes activos"  value={act.length} sub={clientes.filter(c=>c.estado==="Inactivo").length+" inactivos"} color="#4fc3f7"/>
        <KCard label="Ticket promedio"   value={"$"+fmt(ticket)} sub="por socio/mes" color="#ff5722"/>
        <KCard label="EBITDA registrado" value={(ebitda>=0?"+":"")+"$"+fmt(ebitda)} sub="ingresos − gastos" color={ebitda>=0?"#00e676":"#ff4444"}/>
        <KCard label="Ocupación"         value={ocup+"%"} sub={"cap. "+config.cap+" pers."} color={+ocup>=60?"#00e676":"#ffd740"}/>
      </div>
      <SecH title="Estado financiero"/>
      {[
        {l:"🎯 Punto de equilibrio",       v:pe+" clientes",    c:act.length>=pe?"#00e676":"#ff4444", s:"mínimo para cubrir costos"},
        {l:"💸 Gastos fijos totales",       v:"$"+fmt(totGF),   c:"#eef0f8"},
        {l:"📦 Gastos variables totales",   v:"$"+fmt(totGV),   c:"#eef0f8"},
        {l:"💰 Total ingresos registrados", v:"$"+fmt(totIng),  c:"#00e676"},
        {l:"💎 LTV estimado 12m",           v:"$"+fmt(ticket*12), c:"#4fc3f7"},
      ].map(r => <KRow key={r.l} label={r.l} value={r.v} color={r.c} sub={r.s}/>)}
      <SecH title="Últimos cobros" action="Ver todos →" onAction={()=>onNav("ingresos")}/>
      {[...ingresos].reverse().slice(0,4).map(i => (
        <TxItem key={i.id} concepto={i.concepto} detalle={fdate(i.fecha)+" · "+i.categoria+" · "+i.pago} monto={i.monto}/>
      ))}
      {!ingresos.length && <div style={{textAlign:"center",padding:"30px 0",color:"#3e4658",fontSize:13}}>Sin cobros registrados</div>}
    </div>
  )
}
