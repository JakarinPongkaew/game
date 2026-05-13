import { defineStore } from 'pinia'

interface User {
  id: number
  username: string
  role: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'ADMIN',
  },
  actions: {
    setUser(user: User, token: string) {
      this.user = user
      this.token = token
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(user))
    },
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      navigateTo('/login')
    },
    async login(username, password) {
      try {
        const data = await $fetch('/api/auth/login', {
          method: 'POST',
          body: { username, password }
        }) as { token: string, user: User }
        
        this.setUser(data.user, data.token)
        return true
      } catch (e) {
        console.error('Login error:', e)
        return false
      }
    },
    init() {
      if (process.server) return
      const token = localStorage.getItem('auth_token')
      const user = localStorage.getItem('auth_user')
      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
      }
    },
  },
})
