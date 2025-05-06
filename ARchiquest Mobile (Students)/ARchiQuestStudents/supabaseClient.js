import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = 'https://jsxmlkcxvnuwxhjaejlw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzeG1sa2N4dm51d3hoamFlamx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NzgxMzEsImV4cCI6MjA2MDM1NDEzMX0.QnYkvPpMVO1MvC93iBC5LNqpxjw76jABjGzcd31M-iE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})
