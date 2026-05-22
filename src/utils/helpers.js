// ─── FORMATTERS ─────────────────────────────────────────────────
export const fmt = n =>
  Math.round(n || 0).toLocaleString("es-AR")

export const fdate = s => {
  if (!s) return ""
  try {
    return new Date(s + "T12:00").toLocaleDateString("es-AR", {
      day: "numeric", month: "short",
    })
  } catch {
    return s
  }
}

// ─── ID GENERATOR ───────────────────────────────────────────────
export const uid = () =>
  Date.now() + Math.random().toString(36).slice(2, 6)

// ─── NAME INITIALS ──────────────────────────────────────────────
export const initials = name =>
  (name || "?").split(" ").map(w => w[0] || "").join("").slice(0, 2).toUpperCase()
