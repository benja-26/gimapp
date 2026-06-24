import { fmt } from "../utils/helpers.js"

export default function PageDash({ clientes = [], ingresos = [], gastos_fijos = [], gastos_var = [] }) {
  
  // 🧮 CÁLCULOS FINANCIEROS REALES EN TIEMPO REAL
  const totalIngresos = ingresos.reduce((acc, curr) => acc + (curr.monto || 0), 0)
  const totalEgresosFijos = gastos_fijos.reduce((acc, curr) => acc + (curr.monto || 0), 0)
  const totalEgresosVar = gastos_var.reduce((acc, curr) => acc + (curr.monto || 0), 0)
  const totalEgresos = totalEgresosFijos + totalEgresosVar
  
  // EBITDA: Ganancia Neta Real
  const ebitda = totalIngresos - totalEgresos

  // 👥 MÉTRICAS DE CLIENTES Y SEMÁFORO
  const sociosActivos = clientes.filter(c => c.estado === "Activo").length
  const ticketPromedio = sociosActivos > 0 ? Math.round(totalIngresos / sociosActivos) : 0

  // Contadores para el Semáforo de cobros
  let alDia = 0
  let proximos = 0
  let vencidos = 0

  clientes.forEach(c => {
    if (!c.vencimiento) return
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const vto = new Date(c.vencimiento + "T00:00:00")
    vto.setHours(0, 0, 0, 0)

    const diffTiempo = vto.getTime() - hoy.getTime()
    const diffDias = Math.ceil(diffTiempo / (1000 * 60 * 60 * 24))

    if (diffDias < 0) {
      vencidos++
    } else if (diffDias <= 3) {
      proximos++
    } else {
      alDia++
    }
  })

  return (
    <div style={{ paddingBottom: 20 }}>
      {/* Encabezado del Dashboard */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", fontFamily: "'Syne', sans-serif", margin: 0 }}>
          ⚙️ SKOL Dashboard
        </h1>
        <p style={{ fontSize: 12, color: "#8891a8", margin: "4px 0 0 0" }}>Control administrativo y financiero en tiempo real</p>
      </div>

      {/* 📊 SECCIÓN FINANCIERA PRINCIPAL (Panel Satinado) */}
      <div style={{
        background: "linear-gradient(135deg, #1c2130 0%, #151924 100%)",
        border: "1px solid #252d3d",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        boxShadow: "0 4px 25px rgba(0,0,0,0.3)"
      }}>
        <div style={{ fontSize: 11, color: "#8891a8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Caja Neta / EBITDA Comercial
        </div>
        <div style={{ 
          fontSize: 32, 
          fontWeight: 800, 
          color: ebitda >= 0 ? "#4cd137" : "#ff4d4d", 
          marginTop: 6, 
          fontFamily: "'Syne', sans-serif" 
        }}>
          {ebitda >= 0 ? "+" : ""}${fmt(ebitda)}
        </div>
        <p style={{ fontSize: 11, color: "#5c657a", margin: "4px 0 0 0" }}>
          Resultado neto libre tras deducir egresos operativos mensuales.
        </p>

        <div style={{ height: 1, background: "#252d3d", margin: "16px 0" }} />

        {/* Grilla de Ingresos vs Egresos */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: "rgba(76, 209, 55, 0.05)", padding: 12, borderRadius: 10, border: "1px solid rgba(76, 209, 55, 0.1)" }}>
            <div style={{ fontSize: 10, color: "#8891a8" }}>Total Ingresos (+)</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#4cd137", marginTop: 2 }}>${fmt(totalIngresos)}</div>
          </div>
          <div style={{ background: "rgba(255, 77, 77, 0.05)", padding: 12, borderRadius: 10, border: "1px solid rgba(255, 77, 77, 0.1)" }}>
            <div style={{ fontSize: 10, color: "#8891a8" }}>Total Egresos (-)</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#ff4d4d", marginTop: 2 }}>${fmt(totalEgresos)}</div>
          </div>
        </div>
      </div>

      {/* 📈 SECCIÓN TARJETAS DE RENDIMIENTO */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={{ background: "#1c2130", border: "1px solid #252d3d", borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 10, color: "#8891a8", fontWeight: 600 }}>SOCIOS ACTIVOS</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#ffffff", marginTop: 4, fontFamily: "'Syne', sans-serif" }}>
            {sociosActivos}
          </div>
          <div style={{ fontSize: 9, color: "#5c657a", marginTop: 4 }}>Alumnos con abono vigente</div>
        </div>

        <div style={{ background: "#1c2130", border: "1px solid #252d3d", borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 10, color: "#8891a8", fontWeight: 600 }}>TICKET PROMEDIO</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#00a8ff", marginTop: 4, fontFamily: "'Syne', sans-serif" }}>
            ${fmt(ticketPromedio)}
          </div>
          <div style={{ fontSize: 9, color: "#5c657a", marginTop: 4 }}>Ingreso medio por activo</div>
        </div>
      </div>

      {/* 🚦 SECCIÓN ESTADO DEL SEMÁFORO DE COBROS */}
      <div style={{ background: "#1c2130", border: "1px solid #252d3d", borderRadius: 14, padding: 16 }}>
        <div style={{ fontSize: 11, color: "#8891a8", fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Estado de Alertas (Semáforo)
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Al día */}
          <div style={{ display: "flex", alignItems: "center", justifyInbound: "space-between", background: "rgba(76, 209, 55, 0.05)", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(76, 209, 55, 0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#ffffff" }}>
              <span style={{ color: "#4cd137" }}>🟢</span> Al día / Vigentes
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#4cd137" }}>{alDia}</div>
          </div>

          {/* Próximos */}
          <div style={{ display: "flex", alignItems: "center", justifyInbound: "space-between", background: "rgba(255, 159, 67, 0.05)", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255, 159, 67, 0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#ffffff" }}>
              <span style={{ color: "#ff9f43" }}>⏳</span> Próximos a Vencer (0-3 días)
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#ff9f43" }}>{proximos}</div>
          </div>

          {/* Vencidos */}
          <div style={{ display: "flex", alignItems: "center", justifyInbound: "space-between", background: "rgba(255, 77, 77, 0.05)", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255, 77, 77, 0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#ffffff" }}>
              <span style={{ color: "#ff4d4d" }}>🔴</span> Vencidos / Retenidos
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#ff4d4d" }}> {vencidos} </div>
          </div>
        </div>
      </div>
    </div>
  )
}