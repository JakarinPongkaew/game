import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuthStore()

  // Skip middleware on server-side to avoid hydration mismatch
  if (process.server) return

  // Ensure store is initialized if it hasn't been yet
  if (!auth.token) {
    auth.init()
  }

  const publicPages = ['/login']
  const authRequired = !publicPages.includes(to.path)

  if (authRequired && !auth.isAuthenticated) {
    return navigateTo('/login')
  }

  if (to.path === '/login' && auth.isAuthenticated) {
    return navigateTo('/')
  }
})
