import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
//Real-Time Updates
import { Platform } from "react-native"
import * as SecureStore from "expo-secure-store"
const supabaseUrl = 'https://jsxmlkcxvnuwxhjaejlw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzeG1sa2N4dm51d3hoamFlamx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NzgxMzEsImV4cCI6MjA2MDM1NDEzMX0.QnYkvPpMVO1MvC93iBC5LNqpxjw76jABjGzcd31M-iE'

//Real-Time Updates Progress
const ExpoSecureStoreAdapter = {
  getItem: (key) => {
    if (Platform.OS == "web") {
      return localStorage.getItem(key)
    } else {
      return SecureStore.getItemAsync(key)
    }
  },
  setItem: (key, value) => {
    if (Platform.OS == "web") {
      localStorage.setItem(key, value)
    } else {
      return SecureStore.setItemAsync(key, value)
    }
  },
  removeItem: (key) => {
    if (Platform.OS == "web") {
      localStorage.removeItem(key)
    } else {
      return SecureStore.deleteItemAsync(key)
    }
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, ExpoSecureStoreAdapter, //ExpoSecureStoreAdapter, Real time updates for progress in design plan
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})
