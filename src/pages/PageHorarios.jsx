export default function PageHorarios({ horarios, setHorarios, config }) {
  const cap = config.cap || 40
  const { franjas, dias, vals } = horarios

  const edit = (fr, di) => {
    const cur = (vals[fr] || Array(7).fill(0))[di]
    const v   = window.prompt(`${dias[di]} ${fr} — asistentes:`, cur)
    if (v === null) return
    setHorarios(h => ({
      ...h,
      vals: {
        ...h.vals,
        [fr]: Object.assign([...(h.vals[fr] || Array(7).fill(0))], { [di]: +v || 0 }),
      },
    }))
  }

  const cellStyle = v => {
    if (!v) return { bg:"#161a24", color:"#3e4658" }
    const p = v / cap
    if (p < 0.3) return { bg:"#00e67612", color:"#00e676" }
    if (p < 0.7) return { bg:"#ffd74020", color:"#ffd740" }
    return      { bg:"#ff444425", color:"#ff4444" }
  }

  return (
    <div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,marginBottom:4}}>Horarios</div>
      <div style={{fontSize:12,color:"#8891a8",marginBottom:14}}>Saturación · tocá para editar · cap. {cap} pers.</div>
      <div style={{overflowX:"auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"44px repeat(7, 1fr)",gap:2,minWidth:320}}>
          <div style={{fontSize:9,background:"#181c25",borderRadius:4,padding:"5px 3px",textAlign:"center",color:"#3e4658"}}></div>
          {dias.map(d => <div key={d} style={{fontSize:9,background:"#181c25",borderRadius:4,padding:"5px 3px",textAlign:"center",color:"#8891a8",fontWeight:700}}>{d}</div>)}
          {franjas.map(fr => (
            <>
              <div key={fr+"l"} style={{fontSize:8,background:"#181c25",borderRadius:4,padding:"7px 4px",color:"#8891a8",display:"flex",alignItems:"center",whiteSpace:"nowrap"}}>{fr}</div>
              {(vals[fr]||Array(7).fill(0)).map((v,i) => {
                const {bg,color} = cellStyle(v)
                return <div key={fr+i} onClick={()=>edit(fr,i)} style={{background:bg,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",padding:"6px 2px",fontSize:11,fontWeight:700,color,cursor:"pointer",minHeight:26}}>{v||""}</div>
              })}
            </>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:14,flexWrap:"wrap"}}>
        {[["#00e67612","#00e676","Bajo"],["#ffd74020","#ffd740","Medio"],["#ff444425","#ff4444","Lleno"]].map(([bg,c,l])=>(
          <span key={l} style={{fontSize:11,padding:"3px 10px",borderRadius:20,background:bg,color:c}}>● {l}</span>
        ))}
      </div>
    </div>
  )
}
