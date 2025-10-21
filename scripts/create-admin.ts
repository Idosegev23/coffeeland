// Run this script to create the default admin user
// Usage: npx ts-node scripts/create-admin.ts

import { createClient } from '@supabase/supabase-js'
import { nanoid } from 'nanoid'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdmin() {
  const email = 'triroars@gmail.com'
  const password = '123456'
  const fullName = 'TriRoars Admin'

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to create user')

    console.log('✅ Auth user created:', authData.user.id)

    // Create user record
    const qrCode = nanoid(16)
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        phone: '0501234567',
        qr_code: qrCode,
      })

    if (userError) throw userError
    console.log('✅ User record created with QR:', qrCode)

    // Create admin record
    const { error: adminError } = await supabase
      .from('admins')
      .insert({
        user_id: authData.user.id,
        is_active: true,
      })

    if (adminError) throw adminError
    console.log('✅ Admin record created')

    // Create loyalty card
    const { error: loyaltyError } = await supabase
      .from('loyalty_cards')
      .insert({
        user_id: authData.user.id,
        total_stamps: 0,
        redeemed_coffees: 0,
      })

    if (loyaltyError) console.warn('⚠️ Loyalty card creation failed:', loyaltyError)
    else console.log('✅ Loyalty card created')

    console.log('\n🎉 Admin user created successfully!')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('User ID:', authData.user.id)
    console.log('QR Code:', qrCode)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

createAdmin()

