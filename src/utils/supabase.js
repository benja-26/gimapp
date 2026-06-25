import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log("URL de la nube cargada:", supabaseUrl)
console.log("Key de la nube cargada:", supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Error: No se pudieron leer las credenciales de Supabase del archivo .env")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)