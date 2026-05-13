<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { LogOut, LayoutDashboard, Users, History, Sword } from 'lucide-vue-next'

const auth = useAuthStore()

onMounted(() => {
  auth.init()
})

const handleLogout = () => {
  auth.logout()
}
</script>

<template>
  <div class="app-layout">
    <nav v-if="auth.isAuthenticated" class="sidebar glass-card">
      <div class="logo">
        <Sword :size="24" class="accent" />
        <span>GANG SYSTEM</span>
      </div>
      
      <div class="nav-links">
        <NuxtLink to="/" class="nav-item" active-class="active">
          <LayoutDashboard :size="20" />
          <span>เช็คชื่อ</span>
        </NuxtLink>
        <NuxtLink to="/members" class="nav-item" active-class="active">
          <Users :size="20" />
          <span>จัดการสมาชิก</span>
        </NuxtLink>
        <NuxtLink to="/history" class="nav-item" active-class="active">
          <History :size="20" />
          <span>ประวัติ</span>
        </NuxtLink>
      </div>

      <div class="user-info">
        <div class="details">
          <p class="username">{{ auth.user?.username }}</p>
          <p class="role">{{ auth.user?.role }}</p>
        </div>
        <button @click="handleLogout" class="btn btn-ghost btn-sm icon-btn">
          <LogOut :size="18" />
        </button>
      </div>
    </nav>

    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  padding: 1rem;
  gap: 1rem;
}

.sidebar {
  width: 260px;
  height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 1rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 800;
  font-size: 1.25rem;
  padding: 1rem;
  margin-bottom: 2rem;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.accent {
  color: var(--accent-primary);
}

.nav-links {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  text-decoration: none;
  color: var(--text-secondary);
  border-radius: 0.75rem;
  transition: all 0.2s;
  font-weight: 500;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--accent-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.user-info {
  margin-top: auto;
  padding: 1rem;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.username {
  font-weight: 600;
  font-size: 0.9rem;
}

.role {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 1024px) {
  .app-layout {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    height: auto;
    position: static;
  }
  .nav-links {
    flex-direction: row;
    overflow-x: auto;
  }
}
</style>
