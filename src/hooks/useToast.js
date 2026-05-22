/**
 * useToast — global toast notification
 * Exposes a singleton `toast(msg)` function callable from anywhere.
 */

import { useState, useEffect } from "react"

// Module-level singleton so any component can call toast("msg")
let _setMsg = null
let _timer  = null

export function toast(msg) {
  if (_setMsg) _setMsg(msg)
}

export function Toast() {
  const [msg, setMsg]   = useState("")
  const [show, setShow] = useState(false)

  useEffect(() => {
    _setMsg = (m) => {
      setMsg(m)
      setShow(true)
      clearTimeout(_timer)
      _timer = setTimeout(() => setShow(false), 2600)
    }
    return () => { _setMsg = null }
  }, [])

  return (
    <div style={{
      position:    "fixed",
      bottom:      80,
      left:        "50%",
      transform:   `translateX(-50%) translateY(${show ? 0 : 12}px)`,
      background:  "#1c2130",
      border:      "1px solid #252d3d",
      borderRadius: 10,
      padding:     "10px 18px",
      fontSize:    13,
      fontWeight:  500,
      zIndex:      500,
      opacity:     show ? 1 : 0,
      transition:  "all .3s",
      whiteSpace:  "nowrap",
      pointerEvents: "none",
    }}>
      {msg}
    </div>
  )
}
