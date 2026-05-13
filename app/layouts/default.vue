<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { LogOut, LayoutDashboard, Users, History, Sword, Settings, ChevronRight } from 'lucide-vue-next'

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
    <aside v-if="auth.isAuthenticated" class="sidebar glass-card">
      <div class="sidebar-header">
        <div class="logo-wrapper">
          <Sword :size="28" class="logo-icon" />
          <div class="logo-text">
            <span class="title">GANG SYSTEM</span>
            <span class="version">VERSION 2.0</span>
          </div>
        </div>
      </div>
      
      <nav class="nav-menu">
        <NuxtLink to="/" class="nav-link" active-class="active">
          <div class="icon-box"><LayoutDashboard :size="20" /></div>
          <span class="label">เช็คชื่อ</span>
          <ChevronRight class="arrow" :size="16" />
        </NuxtLink>
        <NuxtLink to="/members" class="nav-link" active-class="active">
          <div class="icon-box"><Users :size="20" /></div>
          <span class="label">จัดการสมาชิก</span>
          <ChevronRight class="arrow" :size="16" />
        </NuxtLink>
        <NuxtLink to="/history" class="nav-link" active-class="active">
          <div class="icon-box"><History :size="20" /></div>
          <span class="label">ประวัติการทำงาน</span>
          <ChevronRight class="arrow" :size="16" />
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <div class="user-card glass-card">
          <div class="avatar-box">
            {{ auth.user?.username.charAt(0).toUpperCase() }}
          </div>
          <div class="user-info">
            <p class="name">{{ auth.user?.username }}</p>
            <p class="role-badge">{{ auth.user?.role }}</p>
          </div>
          <button @click="handleLogout" class="logout-btn" title="ออกจากระบบ">
            <LogOut :size="18" />
          </button>
        </div>
      </div>
    </aside>

    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-main);
}

.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border-radius: 0;
  border-right: 1px solid var(--border);
  z-index: 100;
}

.sidebar-header {
  padding: 1rem 0.5rem 2.5rem;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-icon {
  color: var(--accent-primary);
  filter: drop-shadow(0 0 8px var(--accent-glow));
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-text .title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1.15rem;
  letter-spacing: 0.05em;
  color: white;
}

.logo-text .version {
  font-size: 0.65rem;
  color: var(--text-muted);
  font-weight: 700;
  letter-spacing: 0.1em;
}

.nav-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  text-decoration: none;
  color: var(--text-secondary);
  border-radius: 0.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.nav-link .icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
}

.nav-link .label {
  font-weight: 600;
  font-size: 0.9375rem;
  flex: 1;
}

.nav-link .arrow {
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s;
}

.nav-link:hover .arrow {
  opacity: 0.5;
  transform: translateX(0);
}

.nav-link.active {
  background: var(--accent-gradient);
  color: white;
  box-shadow: 0 10px 20px -5px var(--accent-glow);
}

.nav-link.active .icon-box {
  transform: scale(1.1);
}

.nav-link.active .arrow {
  opacity: 1;
  transform: translateX(0);
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 2rem;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.03);
}

.avatar-box {
  width: 40px;
  height: 40px;
  background: var(--accent-gradient);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-info .name {
  font-weight: 700;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-info .role-badge {
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.logout-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.5rem;
  transition: all 0.2s;
  border-radius: 0.5rem;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
}

.content {
  flex: 1;
  margin-left: var(--sidebar-width);
  padding: 2.5rem;
  max-width: 1400px;
}

@media (max-width: 1024px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: static;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
  .content {
    margin-left: 0;
  }
  .nav-menu {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
  .sidebar-footer {
    display: none;
  }
}
</style>
