import { useState, useEffect } from "react"
import { useStore }    from "./hooks/useStore.js"
import { Toast, toast } from "./hooks/useToast.js"
import { exportExcel } from "./utils/exportExcel.js"
import { KEYS, DEFAULT_CONFIG, DEFAULT_PROY, HORARIOS_INIT } from "./data/defaults.js"

// Pages
import PageDash       from "./pages/PageDash.jsx"
import PageClientes   from "./pages/PageClientes.jsx"
import PageIngresos   from "./pages/PageIngresos.jsx"
import PageGastos     from "./pages/PageGastos.jsx"
import PageAsist      from "./pages/PageAsist.jsx"
import PageHorarios   from "./pages/PageHorarios.jsx"
import PageInventario from "./pages/PageInventario.jsx"
import PageRRHH       from "./pages/PageRRHH.jsx"
import PageKPIs       from "./pages/PageKPIs.jsx"
import PageProy       from "./pages/PageProy.jsx"
import PageReub       from "./pages/PageReub.jsx"
import PageExp        from "./pages/PageExp.jsx"
import PageComp       from "./pages/PageComp.jsx"
import PageConfig     from "./pages/PageConfig.jsx"
import PageMas        from "./pages/PageMas.jsx"

const NAV = [
  { id:"dash",      ico:"📊", lbl:"Inicio"   },
  { id:"clientes",  ico:"👥", lbl:"Clientes" },
  { id:"ingresos",  ico:"💰", lbl:"Caja"     },
  { id:"gastos",    ico:"💸", lbl:"Gastos"   },
  { id:"mas",       ico:"☰",  lbl:"Más"      },
]

export default function App() {
  // ── Persistent state ────────────────────────────────────────────
  const [clientes,    setClientes]    = useStore(KEYS.clientes,     [])
  const [ingresos,    setIngresos]    = useStore(KEYS.ingresos,     [])
  const [gastos_fijos,setGastosFijos] = useStore(KEYS.gastos_fijos, [])
  const [gastos_var,  setGastosVar]   = useStore(KEYS.gastos_var,   [])
  const [inventario,  setInventario]  = useStore(KEYS.inventario,   [])
  const [rrhh,        setRRHH]        = useStore(KEYS.rrhh,         [])
  const [asistencias, setAsistencias] = useStore(KEYS.asistencias,  [])
  const [horarios,    setHorarios]    = useStore(KEYS.horarios,     HORARIOS_INIT)
  const [config,      setConfig]      = useStore(KEYS.config,       DEFAULT_CONFIG)
  const [proy,        setProy]        = useStore(KEYS.proy,         DEFAULT_PROY)

  // ── UI state ─────────────────────────────────────────────────────
  const [page,       setPage]       = useState("dash")
  const [saveStatus, setSaveStatus] = useState("💾 Listo")

  useEffect(() => {
    setSaveStatus("⏳ Guardando...")
    const t = setTimeout(() => setSaveStatus("✅ Guardado"), 600)
    return () => clearTimeout(t)
  }, [clientes, ingresos, gastos_fijos, gastos_var, inventario, rrhh, asistencias, horarios, config, proy])

  const nav = pg => setPage(pg)

  // ── All props bundled for pages that need them ──────────────────
  const allData = { clientes, ingresos, gastos_fijos, gastos_var, inventario, rrhh, asistencias, horarios, config, proy }
  const allSetters = { setClientes, setIngresos, setGastosFijos, setGastosVar, setInventario, setRRHH, setAsistencias, setHorarios, setConfig, setProy }

  const renderPage = () => {
    switch (page) {
      case "dash":      return <PageDash       {...allData} onNav={nav}/>
      case "clientes":  return <PageClientes   clientes={clientes} setClientes={setClientes} setIngresos={setIngresos}/>
      case "ingresos":  return <PageIngresos   ingresos={ingresos} setIngresos={setIngresos} clientes={clientes} setClientes={setClientes}/>
      case "gastos":    return <PageGastos     gastos_fijos={gastos_fijos} setGastosFijos={setGastosFijos} gastos_var={gastos_var} setGastosVar={setGastosVar}/>
      case "horarios":  return <PageHorarios   horarios={horarios} setHorarios={setHorarios} config={config}/>
      case "asist":     return <PageAsist      asistencias={asistencias} setAsistencias={setAsistencias} clientes={clientes}/>
      case "inv":       return <PageInventario inventario={inventario} setInventario={setInventario}/>
      case "rrhh":      return <PageRRHH       rrhh={rrhh} setRRHH={setRRHH}/>
      case "kpis":      return <PageKPIs       clientes={clientes} ingresos={ingresos} gastos_fijos={gastos_fijos} gastos_var={gastos_var} rrhh={rrhh} config={config}/>
      case "proy":      return <PageProy       proy={proy} setProy={setProy}/>
      case "reub":      return <PageReub       clientes={clientes} config={config} gastos_fijos={gastos_fijos}/>
      case "exp":       return <PageExp/>
      case "comp":      return <PageComp/>
      case "cfg":       return <PageConfig     config={config} setConfig={setConfig}/>
      case "mas":       return <PageMas        onNav={nav}/>
      default:          return null
    }
  }

  return (
    <div style={{
      maxWidth: 430, margin: "0 auto", height: "100vh",
      background: "#0c0e13", display: "flex", flexDirection: "column",
    }}>

      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0, background: "#0c0e13", borderBottom: "1px solid #252d3d",
        padding: "11px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:19, fontWeight:800, letterSpacing:-.5 }}>
          GIM<span style={{color:"#ff5722"}}>APP</span>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ fontSize:11, color:"#3e4658", background:"#1c2130", border:"1px solid #252d3d", borderRadius:8, padding:"5px 10px" }}>
            {saveStatus}
          </div>
          <button
            onClick={() => exportExcel(clientes, ingresos, gastos_fijos, gastos_var, inventario, rrhh, asistencias, config)}
            style={{ background:"#1c2130", border:"1px solid #252d3d", borderRadius:8, color:"#8891a8", fontSize:11, padding:"5px 10px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:4 }}
          >
            📊 Excel
          </button>
        </div>
      </div>

      {/* ── PAGE CONTENT ────────────────────────────────────────── */}
      <div style={{ flex:1, overflowY:"auto", padding:"16px 14px", paddingBottom:72 }}>
        {renderPage()}
      </div>

      {/* ── BOTTOM NAV ──────────────────────────────────────────── */}
      <nav style={{
        flexShrink: 0, background:"#12151c", borderTop:"1px solid #252d3d",
        display:"flex", paddingBottom:"env(safe-area-inset-bottom)", zIndex:100,
      }}>
        {NAV.map(ni => (
          <button key={ni.id} onClick={() => nav(ni.id)} style={{
            flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3,
            padding:"7px 0", cursor:"pointer", border:"none", background:"none",
            fontFamily:"'DM Sans',sans-serif",
            color: page === ni.id ? "#ff5722" : "#3e4658",
            transition:"color .2s",
          }}>
            <div style={{fontSize:19, lineHeight:1}}>{ni.ico}</div>
            <div style={{fontSize:9, letterSpacing:.3, fontWeight:500}}>{ni.lbl}</div>
          </button>
        ))}
      </nav>

      <Toast/>
    </div>
  )
}
