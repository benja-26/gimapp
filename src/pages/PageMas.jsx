import React from "react"
import { PageHeader } from "../components/ui.jsx"

export default function PageMas({ onNav }) {
  // Lista limpia con los módulos reales que le sirven a SKOL
  const OPCIONES = [
    { id: "kpis",       ico: "📈", lbl: "Métricas / KPIs", desc: "Análisis y evolución del box" },
    { id: "asist",      ico: "🏃", lbl: "Asistencias",     desc: "Control de presentismo diario" },
    { id: "horarios",   ico: "⏱️", lbl: "Horarios y Cupos", desc: "Configuración de las clases" },
    { id: "inv",        ico: "🏋️", lbl: "Inventario",       desc: "Equipamiento y elementos de SKOL" },
    { id: "rrhh",       ico: "👥", lbl: "Personal / RRHH",  desc: "Control de profesores y staff" },
    { id: "cfg",        ico: "⚙️", lbl: "Configuración",    desc: "Planes, precios y parámetros" },
  ]

  return (
    <div>
      <PageHeader title="Más Módulos" />
      
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 15 }}>
        {OPCIONES.map(opt => (
          <div 
            key={opt.id} 
            onClick={() => onNav(opt.id)}
            style={{
              background: "#1c2130",
              border: "1px solid #252d3d",
              borderRadius: 14,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              cursor: "pointer",
              transition: "transform 0.1s, background 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#22293a"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#1c2130"}
          >
            <div style={{ fontSize: 24, width: 32, textAlign: "center" }}>{opt.ico}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#ffffff" }}>{opt.lbl}</div>
              <div style={{ fontSize: 11, color: "#8891a8", marginTop: 2 }}>{opt.desc}</div>
            </div>
            <div style={{ color: "#3e4658", fontSize: 14 }}>❯</div>
          </div>
        ))}
      </div>
    </div>
  )
}