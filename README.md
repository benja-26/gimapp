# GimApp Salta 🏋️

Sistema de gestión integral para gimnasio — Salta Capital, Argentina.

## Stack

- **React 18** + **Vite 5** — desarrollo ultrarrápido
- **xlsx** — exportación a Excel con 8 pestañas
- **localStorage** — persistencia automática sin servidor

## Estructura del proyecto

```
gimapp-salta/
├── src/
│   ├── App.jsx                 ← root, routing, estado global
│   ├── main.jsx                ← entry point React
│   ├── index.css               ← estilos globales + fuentes
│   ├── components/
│   │   └── ui.jsx              ← Modal, Field, Input, KCard, etc.
│   ├── pages/
│   │   ├── PageDash.jsx        ← Dashboard con KPIs
│   │   ├── PageClientes.jsx    ← CRUD socios
│   │   ├── PageIngresos.jsx    ← CRUD cobros
│   │   ├── PageGastos.jsx      ← CRUD gastos fijos/variables
│   │   ├── PageAsist.jsx       ← Registro de entradas
│   │   ├── PageHorarios.jsx    ← Grilla de saturación
│   │   ├── PageInventario.jsx  ← CRUD equipamiento
│   │   ├── PageRRHH.jsx        ← CRUD personal
│   │   ├── PageKPIs.jsx        ← Indicadores vs benchmark
│   │   ├── PageProy.jsx        ← Proyección 12 meses
│   │   ├── PageReub.jsx        ← Modelo de reubicación
│   │   ├── PageExp.jsx         ← Plan de expansión
│   │   ├── PageComp.jsx        ← Análisis de competencia
│   │   ├── PageConfig.jsx      ← Config del gimnasio
│   │   └── PageMas.jsx         ← Menú de secciones adicionales
│   ├── hooks/
│   │   ├── useStore.js         ← Persistencia localStorage
│   │   └── useToast.js         ← Notificaciones globales
│   ├── utils/
│   │   ├── helpers.js          ← fmt, fdate, uid, initials
│   │   └── exportExcel.js      ← Exportación XLSX (8 hojas)
│   └── data/
│       └── defaults.js         ← KEYS, DEFAULT_CONFIG, HORARIOS_INIT
├── public/
│   └── icon.svg
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Instalación y uso

### Requisitos
- **Node.js 18+** — descargá desde https://nodejs.org

### Primera vez
```bash
# 1. Entrá a la carpeta
cd gimapp-salta

# 2. Instalá dependencias (solo la primera vez)
npm install

# 3. Arrancá el servidor de desarrollo
npm run dev
```
La app se abre automáticamente en http://localhost:5173

### Comandos disponibles
```bash
npm run dev      # Servidor de desarrollo con hot reload
npm run build    # Genera build de producción en /dist
npm run preview  # Previsualiza el build de producción
```

## Persistencia de datos

Todos los datos se guardan automáticamente en **localStorage** del navegador.
No requiere servidor ni base de datos. Los datos se mantienen entre sesiones.

### Backup de datos
Usá el botón **📊 Excel** en la barra superior para exportar todo a un archivo `.xlsx`.

## Despliegue futuro

```bash
npm run build
# Subí la carpeta /dist a cualquier hosting estático:
# Vercel, Netlify, GitHub Pages, Cloudflare Pages
```

## Próximos pasos recomendados

1. Subir a GitHub con `git init && git add . && git commit -m "init"`
2. Conectar Vercel para deploy automático
3. Agregar autenticación (Supabase Auth o Firebase)
4. Migrar localStorage → base de datos real (Supabase + PostgreSQL)
