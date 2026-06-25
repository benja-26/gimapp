import { useState, useEffect, useRef } from "react"
import { useStore } from "./hooks/useStore.js"
import { Toast, toast } from "./hooks/useToast.js"
import { exportExcel } from "./utils/exportExcel.js"
import { KEYS, DEFAULT_CONFIG, DEFAULT_PROY, HORARIOS_INIT } from "./data/defaults.js"
import { supabase } from "./utils/supabase.js"

// Pages
import PageDash        from "./pages/PageDash.jsx"
import PageClientes    from "./pages/PageClientes.jsx"
import PageIngresos    from "./pages/PageIngresos.jsx"
import PageGastos      from "./pages/PageGastos.jsx"
import PageAsist        from "./pages/PageAsist.jsx"
import PageHorarios    from "./pages/PageHorarios.jsx"
import PageInventario from "./pages/PageInventario.jsx"
import PageRRHH        from "./pages/PageRRHH.jsx"
import PageKPIs        from "./pages/PageKPIs.jsx"
import PageProy        from "./pages/PageProy.jsx"
import PageReub        from "./pages/PageReub.jsx"
import PageExp         from "./pages/PageExp.jsx"
import PageComp        from "./pages/PageComp.jsx"
import PageConfig      from "./pages/PageConfig.jsx"
import PageMas         from "./pages/PageMas.jsx"

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
  const [gastos_var,  setGastosVar]   = useStore(KEYS.gastos_var,    [])
  const [inventario,  setInventario]  = useStore(KEYS.inventario,   [])
  const [rrhh,        setRRHH]        = useStore(KEYS.rrhh,         [])
  const [asistencias, setAsistencias] = useStore(KEYS.asistencias,  [])
  const [horarios,    setHorarios]    = useStore(KEYS.horarios,     HORARIOS_INIT)
  const [config,      setConfig]      = useStore(KEYS.config,       DEFAULT_CONFIG)
  const [proy,        setProy]        = useStore(KEYS.proy,         DEFAULT_PROY)
  
  const [planes,      setPlanes]      = useStore("skol_planes", [
    { id: "p8",  nombre: "Pack 8 (2x)",  clases: 8,  p1: 32000, p2: 35000, p3: 38000, activo: true },
    { id: "p12", nombre: "Pack 12 (3x)", clases: 12, p1: 35000, p2: 38000, p3: 41000, activo: true },
    { id: "p20", nombre: "Pack 20 (5x)", clases: 20, p1: 38000, p2: 41000, p3: 44000, activo: true },
    { id: "pg",  nombre: "Promo Grupo (3+)", clases: 12, p1: 35000, p2: 35000, p3: 35000, activo: true },
    { id: "pa3", nombre: "Promo Adolescente (3x)", clases: 12, p1: 30000, p2: 33000, p3: 36000, activo: true },
    { id: "pa5", nombre: "Promo Adolescente (5x)", clases: 20, p1: 33000, p2: 36000, p3: 39000, activo: true }
  ])

  // ── UI state ─────────────────────────────────────────────────────
  const [page,       setPage]       = useState("dash")
  const [saveStatus, setSaveStatus] = useState("⏳ Iniciando...")
  
  const cargadoRef = useRef(false)

  // ── 1. Carga Inicial Inteligente ──────────────────────────────────
  useEffect(() => {
    async function inicializarSincronizacion() {
      try {
        setSaveStatus("⏳ Sincronizando...")
        
        // --- CLIENTES ---
        const { data: cData } = await supabase.from('clientes').select('*')
        if (cData && cData.length > 0) {
          setClientes(cData)
        } else if (clientes.length > 0) {
          // Si la nube está vacía pero localmente hay datos, los inyectamos de entrada
          await supabase.from('clientes').upsert(clientes)
        }

        // --- INGRESOS ---
        const { data: iData } = await supabase.from('ingresos').select('*')
        if (iData && iData.length > 0) {
          setIngresos(iData)
        } else if (ingresos.length > 0) {
          await supabase.from('ingresos').upsert(ingresos)
        }

        // --- GASTOS FIJOS ---
        const { data: gfData } = await supabase.from('gastos_fijos').select('*')
        if (gfData && gfData.length > 0) {
          setGastosFijos(gfData)
        } else if (gastos_fijos.length > 0) {
          await supabase.from('gastos_fijos').upsert(gastos_fijos)
        }

        // --- GASTOS VARIABLES ---
        const { data: gvData } = await supabase.from('gastos_var').select('*')
        if (gvData && gvData.length > 0) {
          setGastosVar(gvData)
        } else if (gastos_var.length > 0) {
          await supabase.from('gastos_var').upsert(gastos_var)
        }

        setSaveStatus("🟢 Al día")
        cargadoRef.current = true
      } catch (error) {
        console.error("Error inicializando SKOL:", error)
        setSaveStatus("⚠️ Error Sinc")
        cargadoRef.current = true
      }
    }
    inicializarSincronizacion()
  }, [])

  // ── 2. RASTREADOR AUTOMÁTICO DE CAMBIOS FUTUROS ──────────────────
  
  useEffect(() => {
    if (!cargadoRef.current) return
    
    async function syncClientes() {
      try {
        setSaveStatus("⏳ Subiendo...")
        
        // Enviamos el lote e interceptamos cualquier problema real
        const { data, error } = await supabase.from('clientes').upsert(clientes)
        
        if (error) {
          console.error("🔴 ERROR DE SUPABASE DETECTADO:", error)
          alert("Supabase rechazó el guardado: " + error.message)
          setSaveStatus("⚠️ Error Guardado")
          return
        }
        
        setSaveStatus("🟢 Al día")
      } catch (e) { 
        console.error("🔴 Error crítico en la función:", e)
        setSaveStatus("⚠️ Error Guardado") 
      }
    }
    syncClientes()
  }, [clientes])

 useEffect(() => {
    if (!cargadoRef.current) return
    async function syncIngresos() {
      try {
        setSaveStatus("⏳ Subiendo...")
        
        // Enviamos el lote de caja e interceptamos el error real
        const { data, error } = await supabase.from('ingresos').upsert(ingresos)
        
        if (error) {
          console.error("🔴 ERROR EN CAJA DETECTADO:", error)
          alert("Supabase rechazó la Caja: " + error.message)
          setSaveStatus("⚠️ Error Guardado")
          return
        }
        
        setSaveStatus("🟢 Al día")
      } catch (e) { 
        console.error("🔴 Error crítico en caja:", e)
        setSaveStatus("⚠️ Error Guardado")
      }
    }
    syncIngresos()
  }, [ingresos])
  useEffect(() => {
    if (!cargadoRef.current) return
    async function syncFijos() {
      try {
        setSaveStatus("⏳ Subiendo...")
        const { data: DBData } = await supabase.from('gastos_fijos').select('id')
        if (DBData) {
          const eliminados = DBData.filter(db => !gastos_fijos.some(loc => loc.id === db.id))
          for (const el of eliminados) {
            await supabase.from('gastos_fijos').delete().eq('id', el.id)
          }
        }
        if (gastos_fijos.length > 0) {
          await supabase.from('gastos_fijos').upsert(gastos_fijos)
        }
        setSaveStatus("🟢 Al día")
      } catch (e) { console.error(e) }
    }
    syncFijos()
  }, [gastos_fijos])

  useEffect(() => {
    if (!cargadoRef.current) return
    async function syncVariables() {
      try {
        setSaveStatus("⏳ Subiendo...")
        const { data: DBData } = await supabase.from('gastos_var').select('id')
        if (DBData) {
          const eliminados = DBData.filter(db => !gastos_var.some(loc => loc.id === db.id))
          for (const el of eliminados) {
            await supabase.from('gastos_var').delete().eq('id', el.id)
          }
        }
        if (gastos_var.length > 0) {
          await supabase.from('gastos_var').upsert(gastos_var)
        }
        setSaveStatus("🟢 Al día")
      } catch (e) { console.error(e) }
    }
    syncVariables()
  }, [gastos_var])

  const nav = pg => setPage(pg)
  const allData = { clientes, ingresos, gastos_fijos, gastos_var, inventario, rrhh, asistencias, horarios, config, proy, planes }

  const renderPage = () => {
    switch (page) {
      case "dash":      return <PageDash       {...allData} onNav={nav}/>
      case "clientes":  return <PageClientes   clientes={clientes} setClientes={setClientes} setIngresos={setIngresos} planes={planes}/>
      case "ingresos":  return <PageIngresos   ingresos={ingresos} setIngresos={setIngresos} clientes={clientes} setClientes={setClientes} planes={planes}/>
      case "gastos":    return <PageGastos     gastos_fijos={gastos_fijos} setGastosFijos={setGastosFijos} gastos_var={gastos_var} setGastosVar={setGastosVar}/>
      case "horarios":  return <PageHorarios   horarios={horarios} setHorarios={setHorarios} config={config}/>
      case "asist":     return <PageAsist      asistencias={asistencias} setAsistencias={setAsistencias} clientes={clientes} setClientes={setClientes} planes={planes}/>
      case "inv":       return <PageInventario inventario={inventario} setInventario={setInventario}/>
      case "rrhh":      return <PageRRHH       rrhh={rrhh} setRRHH={setRRHH}/>
      case "kpis":      return <PageKPIs       clientes={clientes} ingresos={ingresos} gastos_fijos={gastos_fijos} gastos_var={gastos_var} rrhh={rrhh} config={config}/>
      case "proy":      return <PageProy       proy={proy} setProy={setProy}/>
      case "reub":      return <PageReub       clientes={clientes} config={config} gastos_fijos={gastos_fijos}/>
      case "exp":       return <PageExp/>
      case "comp":      return <PageComp/>
      case "cfg":       return <PageConfig     planes={planes} setPlanes={setPlanes}/>
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
          <div style={{ fontSize:11, color:"#4cd137", background:"rgba(76, 209, 55, 0.05)", border:"1px solid rgba(76, 209, 55, 0.15)", borderRadius:8, padding:"5px 10px" }}>
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