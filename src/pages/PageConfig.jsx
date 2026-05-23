import { useState, useEffect } from "react"
import { Modal, Field, Input, BtnRow, PageHeader, Empty } from "../components/ui.jsx"
import { uid, fmt } from "../utils/helpers.js"
import { toast } from "../hooks/useToast.js"

// Lista maestra de los precios reales de SKOL
const PACKS_DEFECTO = [
  { id: "p8",  nombre: "Pack 8 (2x)",  clases: 8,  p1: 32000, p2: 35000, p3: 38000, activo: true },
  { id: "p12", nombre: "Pack 12 (3x)", clases: 12, p1: 35000, p2: 38000, p3: 41000, activo: true },
  { id: "p20", nombre: "Pack 20 (5x)", clases: 20, p1: 38000, p2: 41000, p3: 44000, activo: true },
  { id: "pg",  nombre: "Promo Grupo (3+)", clases: 12, p1: 35000, p2: 35000, p3: 35000, activo: true },
  { id: "pa3", nombre: "Promo Adolescente (3x)", clases: 12, p1: 30000, p2: 33000, p3: 36000, activo: true },
  { id: "pa5", nombre: "Promo Adolescente (5x)", clases: 20, p1: 33000, p2: 36000, p3: 39000, activo: true }
]

export default function PageConfig({ planes, setPlanes }) {
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setFormRaw] = useState({})
  const set = (k, v) => setFormRaw(f => ({ ...f, [k]: v }))

  // Si la memoria está vacía, le inyectamos los packs iniciales al arrancar
  useEffect(() => {
    if (!planes || planes.length === 0) {
      setPlanes(PACKS_DEFECTO)
    }
  }, [planes, setPlanes])

  const cargarValoresPorDefecto = () => {
    if (window.confirm("¿Querés restablecer todos los packs a los precios base de SKOL? Se perderán las modificaciones manuales.")) {
      setPlanes(PACKS_DEFECTO)
      toast("🔄 Packs restablecidos")
    }
  }

  const openNew = () => {
    setEditing(null)
    setFormRaw({ nombre: "", clases: 12, p1: "", p2: "", p3: "", activo: true })
    setModal(true)
  }

  const openEdit = (p) => {
    setEditing(p.id)
    setFormRaw({ ...p })
    setModal(true)
  }

  const save = () => {
    if (!form.nombre?.trim() || !form.p1) { toast("⚠️ Completá nombre y precios"); return }
    
    if (editing) {
      setPlanes(list => list.map(p => p.id === editing ? { ...form, p1: +form.p1, p2: +form.p2, p3: +form.p3 } : p))
      toast("✅ Pack actualizado")
    } else {
      setPlanes(list => [...list, { ...form, id: uid(), p1: +form.p1, p2: +form.p2, p3: +form.p3 }])
      toast("✅ Nuevo Pack creado")
    }
    setModal(false)
  }

  return (
    <div>
      <PageHeader title="Configuración de Packs" action="+ Nuevo Pack" onAction={openNew} />
      
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
        <button 
          onClick={cargarValoresPorDefecto}
          style={{ background: "#1c2130", border: "1px solid #252d3d", borderRadius: 8, color: "#8891a8", fontSize: 11, padding: "6px 12px", cursor: "pointer" }}
        >
          🔄 Restablecer Base SKOL
        </button>
      </div>
      
      <div style={{ marginTop: 15 }}>
        {(!planes || planes.length === 0) && <Empty icon="⚙️" text="No hay packs configurados" />}
        {planes && planes.map(p => (
          <div key={p.id} style={{ background: "#1c2130", border: "1px solid #252d3d", borderRadius: 14, padding: 15, marginBottom: 12, opacity: p.activo ? 1 : 0.5 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div onClick={() => openEdit(p)} style={{ cursor: "pointer", flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#ffffff" }}>{p.nombre} {p.activo ? "" : "(Inactivo)"}</div>
                <div style={{ fontSize: 11, color: "#8891a8", marginTop: 4 }}>{p.clases} clases mensuales</div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
                  <div style={{ fontSize: 11, color: "#4cd137" }}><b>Vto:</b> ${fmt(p.p1)}</div>
                  <div style={{ fontSize: 11, color: "#ff9f43" }}><b>Al Día:</b> ${fmt(p.p2)}</div>
                  <div style={{ fontSize: 11, color: "#ff4444" }}><b>Abono:</b> ${fmt(p.p3)}</div>
                </div>
              </div>
              <button onClick={() => setPlanes(l => l.filter(x => x.id !== p.id))} style={{ background: "none", border: "none", color: "#3e4658", fontSize: 14, cursor: "pointer", padding: "0 4px" }}>✕</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Editar Pack" : "Nuevo Pack"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Nombre del Pack"><Input placeholder="Ej: Pack 12 (3x)" value={form.nombre || ""} onChange={e => set("nombre", e.target.value)} /></Field>
          <Field label="Cantidad de Clases"><Input type="number" value={form.clases || ""} onChange={e => set("clases", e.target.value)} /></Field>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <Field label="Antes Vto $"><Input type="number" value={form.p1 || ""} onChange={e => set("p1", e.target.value)} /></Field>
            <Field label="Al Día $"><Input type="number" value={form.p2 || ""} onChange={e => set("p2", e.target.value)} /></Field>
            <Field label="Abono $"><Input type="number" value={form.p3 || ""} onChange={e => set("p3", e.target.value)} /></Field>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
            <input type="checkbox" checked={form.activo !== false} onChange={e => set("activo", e.target.checked)} />
            <label style={{ fontSize: 14, color: "#ffffff" }}>Pack Activo (Se muestra en los formularios)</label>
          </div>
        </div>
        <BtnRow onCancel={() => setModal(false)} onSave={save} />
      </Modal>
    </div>
  )
}