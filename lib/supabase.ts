import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper to get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  
  // Get user data from our users table
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle() // Use maybeSingle to avoid error if not found
  
  return userData
}

// Check if user is admin
export async function isAdmin() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  const { data } = await supabase
    .from('admins')
    .select('is_active')
    .eq('user_id', user.id)
    .maybeSingle() // Use maybeSingle to avoid error if not found
  
  return data?.is_active === true
}

// Generate unique QR code
export function generateQRCode(): string {
  const { nanoid } = require('nanoid')
  return nanoid(16) // 16 character unique ID
}

