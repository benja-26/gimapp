import { useState } from 'react'

// ─── TOAST (singleton via module-level ref) ──────────────────────
let _toastFn = () => {}
export const toast = (msg) => _toastFn(msg)

export function Toast() {
  const [msg, setMsg]   = useState('')
  const [show, setShow] = useState(false)

  _toastFn = (m) => {
    setMsg(m)
    setShow(true)
    setTimeout(() => setShow(false), 2600)
  }

  return (
    <div style={{
      position:   'fixed',
      bottom:     80,
      left:       '50%',
      transform:  `translateX(-50%) translateY(${show ? 0 : 12}px)`,
      background: '#1c2130',
      border:     '1px solid #252d3d',
      borderRadius: 10,
      padding:    '10px 18px',
      fontSize:   13,
      fontWeight: 500,
      zIndex:     500,
      opacity:    show ? 1 : 0,
      transition: 'all .3s',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
    }}>
      {msg}
    </div>
  )
}

// ─── MODAL ──────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)',
        zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div style={{
        background: '#12151c', border: '1px solid #252d3d',
        borderRadius: '22px 22px 0 0', width: '100%', maxWidth: 430,
        padding: '18px 18px 28px', maxHeight: '92vh', overflowY: 'auto',
        animation: 'slideUp .22s ease',
      }}>
        <div style={{ width: 36, height: 4, background: '#252d3d', borderRadius: 2, margin: '0 auto 16px' }} />
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 19, fontWeight: 800, marginBottom: 16 }}>
          {title}
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── FORM FIELD ─────────────────────────────────────────────────
export function Field({ label, children, full }) {
  return (
    <div style={{ gridColumn: full ? 'span 2' : 'auto' }}>
      <label style={{
        display: 'block', fontSize: 10, color: '#8891a8',
        textTransform: 'uppercase', letterSpacing: .5, marginBottom: 5, fontWeight: 500,
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', background: '#181c25', border: '1px solid #252d3d',
  borderRadius: 8, padding: '11px 12px', color: '#eef0f8', fontSize: 14,
  outline: 'none', fontFamily: "'DM Sans',sans-serif", WebkitAppearance: 'none',
}

export function Input(props) {
  return <input style={inputStyle} {...props} />
}

export function Select({ children, ...props }) {
  return <select style={inputStyle} {...props}>{children}</select>
}

// ─── BUTTON ROW ─────────────────────────────────────────────────
export function BtnRow({ onCancel, onSave, saveLabel = 'Guardar' }) {
  return (
    <div style={{ display: 'flex', gap: 9, marginTop: 18 }}>
      <button
        onClick={onCancel}
        style={{
          flex: 1, background: 'none', border: '1px solid #252d3d',
          borderRadius: 9, color: '#8891a8', padding: 13,
          fontSize: 14, fontFamily: "'DM Sans',sans-serif",
        }}
      >
        Cancelar
      </button>
      <button
        onClick={onSave}
        style={{
          flex: 2, background: '#ff5722', border: 'none',
          borderRadius: 9, color: '#fff', padding: 13,
          fontSize: 15, fontWeight: 700, fontFamily: "'Syne',sans-serif",
        }}
      >
        {saveLabel}
      </button>
    </div>
  )
}

// ─── BADGE ──────────────────────────────────────────────────────
export function Badge({ active }) {
  return (
    <span style={{
      fontSize: 10, padding: '3px 9px', borderRadius: 20, fontWeight: 600,
      background: active ? '#00e67618' : '#ff444418',
      color:      active ? '#00e676'   : '#ff4444',
    }}>
      {active ? 'Activo' : 'Inactivo'}
    </span>
  )
}

// ─── KPI CARD ───────────────────────────────────────────────────
export function KCard({ label, value, sub, color = '#ff5722' }) {
  return (
    <div style={{
      background: '#1c2130', border: '1px solid #252d3d',
      borderRadius: 14, padding: 13, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: color }} />
      <div style={{ fontSize: 10, color: '#8891a8', textTransform: 'uppercase', letterSpacing: .4, marginBottom: 7 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color, lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 10, color: '#3e4658', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

// ─── KPI ROW ────────────────────────────────────────────────────
export function KRow({ label, value, color = '#eef0f8', sub }) {
  return (
    <div style={{
      background: '#1c2130', border: '1px solid #252d3d', borderRadius: 12,
      padding: '12px 14px', marginBottom: 8,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div>
        <div style={{ fontSize: 12, color: '#8891a8' }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: '#3e4658', marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, color }}>
        {value}
      </div>
    </div>
  )
}

// ─── TX ITEM ────────────────────────────────────────────────────
export function TxItem({ concepto, detalle, monto, positive = true, onDelete }) {
  return (
    <div style={{
      background: '#1c2130', border: '1px solid #252d3d', borderRadius: 13,
      padding: '12px 13px', marginBottom: 8,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {concepto}
        </div>
        <div style={{ fontSize: 11, color: '#8891a8', marginTop: 2 }}>{detalle}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700,
          color: positive ? '#00e676' : '#ff4444',
        }}>
          {positive ? '+' : '-'}${Math.round(monto || 0).toLocaleString('es-AR')}
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            style={{ background: 'none', border: 'none', color: '#3e4658', fontSize: 16, padding: '0 2px', lineHeight: 1 }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

// ─── TABS ───────────────────────────────────────────────────────
export function Tabs({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 5, marginBottom: 14, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          style={{
            background:  value === o.v ? '#ff5722' : '#1c2130',
            border:      `1px solid ${value === o.v ? '#ff5722' : '#252d3d'}`,
            borderRadius: 20,
            color:       value === o.v ? '#fff' : '#8891a8',
            padding:     '6px 13px',
            fontSize:    12,
            whiteSpace:  'nowrap',
            fontFamily:  "'DM Sans',sans-serif",
            fontWeight:  500,
            flexShrink:  0,
          }}
        >
          {o.l}
        </button>
      ))}
    </div>
  )
}

// ─── SECTION HEADER ─────────────────────────────────────────────
export function SecH({ title, action, onAction }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700 }}>{title}</div>
      {action && (
        <button
          onClick={onAction}
          style={{ fontSize: 12, color: '#ff5722', background: 'none', border: 'none', fontFamily: "'DM Sans',sans-serif" }}
        >
          {action}
        </button>
      )}
    </div>
  )
}

// ─── PAGE HEADER ────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action, onAction }) {
  return (
    <div style={{ marginBottom: 2 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800 }}>{title}</div>
        {action && (
          <button
            onClick={onAction}
            style={{
              background: '#ff5722', border: 'none', borderRadius: 9,
              color: '#fff', padding: '9px 16px',
              fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13,
            }}
          >
            {action}
          </button>
        )}
      </div>
      {subtitle && <div style={{ fontSize: 12, color: '#8891a8', marginBottom: 14, marginTop: 2 }}>{subtitle}</div>}
    </div>
  )
}

// ─── EMPTY STATE ────────────────────────────────────────────────
export function Empty({ icon = '📭', text = 'Sin registros' }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: '#3e4658' }}>
      <div style={{ fontSize: 38, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 13 }}>{text}</div>
    </div>
  )
}

// ─── MINI VALUE BOX ─────────────────────────────────────────────
export function ValBox({ label, value, color = '#eef0f8' }) {
  return (
    <div style={{ background: '#181c25', borderRadius: 8, padding: 8, textAlign: 'center' }}>
      <div style={{ fontSize: 9, color: '#8891a8', textTransform: 'uppercase', letterSpacing: .3 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, marginTop: 3, color }}>{value}</div>
    </div>
  )
}
