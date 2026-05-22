import * as XLSX from "xlsx"
import { fmt } from "./helpers.js"

export function exportExcel(
  clientes, ingresos, gastos_fijos, gastos_var,
  inventario, rrhh, asistencias, config
) {
  const wb = XLSX.utils.book_new()

  const toSheet = (data, cols) => {
    const rows = data.map(item => cols.map(c => item[c] ?? ""))
    return XLSX.utils.aoa_to_sheet([cols, ...rows])
  }

  XLSX.utils.book_append_sheet(wb,
    toSheet(clientes, ["id","nombre","edad","sexo","actividad","plan",
      "precio","pago","horario","referido","estado","deuda","alta","obs"]),
    "Clientes"
  )
  XLSX.utils.book_append_sheet(wb,
    toSheet(ingresos, ["id","fecha","concepto","categoria","monto","pago","cliente","obs"]),
    "Ingresos"
  )
  XLSX.utils.book_append_sheet(wb,
    toSheet(gastos_fijos, ["id","fecha","concepto","categoria","monto","proveedor","pago"]),
    "Gastos Fijos"
  )
  XLSX.utils.book_append_sheet(wb,
    toSheet(gastos_var, ["id","fecha","concepto","categoria","monto","proveedor","pago"]),
    "Gastos Variables"
  )
  XLSX.utils.book_append_sheet(wb,
    toSheet(inventario, ["id","equipo","categoria","marca","cantidad",
      "estado","costo","valor_actual","uso_hs","mantenimiento"]),
    "Inventario"
  )
  XLSX.utils.book_append_sheet(wb,
    toSheet(rrhh, ["id","nombre","rol","tipo_contrato","horas_sem","bruto","cargas","costo_total"]),
    "RRHH"
  )
  XLSX.utils.book_append_sheet(wb,
    toSheet(asistencias, ["id","nombre","fecha","hora"]),
    "Asistencias"
  )

  const act    = clientes.filter(c => c.estado === "Activo")
  const ticket = act.length
    ? act.reduce((s, c) => s + (c.precio || 0), 0) / act.length
    : config.ticket
  const gfTotal  = gastos_fijos.reduce((s, g) => s + (g.monto || 0), 0)
  const gvTotal  = gastos_var.reduce((s, g) => s + (g.monto || 0), 0)
  const ingTotal = ingresos.reduce((s, i) => s + (i.monto || 0), 0)
  const ebitda   = ingTotal - gfTotal - gvTotal

  XLSX.utils.book_append_sheet(wb,
    XLSX.utils.aoa_to_sheet([
      ["KPI", "Valor"],
      ["Clientes activos", act.length],
      ["Ticket promedio", Math.round(ticket)],
      ["Total ingresos registrados", ingTotal],
      ["Gastos fijos totales", gfTotal],
      ["Gastos variables totales", gvTotal],
      ["EBITDA", ebitda],
      ["Punto de equilibrio (clientes)", ticket ? Math.ceil((gfTotal + gvTotal) / ticket) : 0],
      ["Ocupación %", ((act.length / (config.cap || 40)) * 100).toFixed(1) + "%"],
      ["LTV estimado 12m", Math.round(ticket * 12)],
    ]),
    "KPIs"
  )

  const fecha = new Date().toISOString().split("T")[0]
  XLSX.writeFile(wb, `GimApp_Salta_${fecha}.xlsx`)
}
