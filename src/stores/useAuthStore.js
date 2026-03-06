import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      set({ user: session.user, profile, session, loading: false })
    } else {
      set({ loading: false })
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        set({ user: session.user, profile, session })
      } else {
        set({ user: null, profile: null, session: null })
      }
    })
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, session: null })
  }
}))
