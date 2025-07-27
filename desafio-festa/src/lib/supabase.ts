// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ohwxfdjdhasjafvnbhij.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9od3hmZGpkaGFzamFmdm5iaGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NDQ0NTMsImV4cCI6MjA2OTIyMDQ1M30.M05lfAFX_IHRd1m_jAyCXBQzmCQbWoCwCl2HrXaR2To'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
