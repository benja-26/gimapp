// ─── STORAGE KEYS ───────────────────────────────────────────────
export const KEYS = {
  clientes:     'gym_clientes',
  ingresos:     'gym_ingresos',
  gastos_fijos: 'gym_gastos_fijos',
  gastos_var:   'gym_gastos_var',
  inventario:   'gym_inventario',
  rrhh:         'gym_rrhh',
  horarios:     'gym_horarios',
  asistencias:  'gym_asistencias',
  config:       'gym_config',
  proy:         'gym_proy',
}

export const DEFAULT_CONFIG = {
  nombre: 'Gimnasio Salta',
  ticket: 18000,
  cap: 40,
}

export const DEFAULT_PROY = {
  ci: 150, altas: 12, churn: 0.05,
  ticket: 18000, gf: 346000, gv: 468, inf: 0.04, cap: 200,
}

export const HORARIOS_INIT = {
  franjas: ['06–07','07–08','08–09','09–10','10–11','17–18','18–19','19–20','20–21','21–22'],
  dias: ['L','M','X','J','V','S','D'],
  vals: {
    '07–08': [2,1,3,1,2,0,0],
    '08–09': [3,2,2,2,3,1,0],
    '18–19': [10,12,9,10,14,3,0],
    '19–20': [16,18,16,15,20,5,0],
    '20–21': [13,14,13,12,16,4,0],
  },
}

export const COLORS = [
  '#ff5722','#4fc3f7','#00e676','#ffd740',
  '#ce93d8','#80cbc4','#ffb74d','#81c784',
]

export const ACTIVIDADES  = ['Musculación','Funcional','Yoga','Crossfit']
export const PLANES       = ['Mensual','Trimestral','Semestral','Anual']
export const MEDIOS_PAGO  = ['Efectivo','Transferencia','Débito','Tarjeta','MercadoPago']
export const HORARIOS_OPT = [
  '06:00–07:00','07:00–08:00','08:00–09:00','09:00–10:00','10:00–11:00',
  '17:00–18:00','18:00–19:00','19:00–20:00','20:00–21:00','21:00–22:00',
]
export const CAT_INGRESOS  = ['Cuota','Personal Training','Suplementos','Inscripción','Otros']
export const CAT_GASTOS    = ['Mantenimiento','Insumos','Marketing','Reposición','Personal','Alquiler','Servicios','Imprevistos','Otro']
export const CAT_INVENTARIO = ['Cardio','Fuerza libre','Máquinas','Instalaciones','Accesorios']
export const REFERIDOS     = ['Instagram','Facebook','Amigo/a','Pasando','Google','Otro']
