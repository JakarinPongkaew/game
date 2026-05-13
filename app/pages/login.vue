<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { Sword, Lock, User, LogIn, ChevronRight } from 'lucide-vue-next'

definePageMeta({
  layout: false
})

const auth = useAuthStore()
const username = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (!username.value || !password.value) return
  loading.value = true
  try {
    const success = await auth.login(username.value, password.value)
    if (success) {
      navigateTo('/')
    } else {
      alert('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
    }
  } catch (e) {
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <!-- Dynamic Background Elements -->
    <div class="bg-glow-1"></div>
    <div class="bg-glow-2"></div>
    
    <div class="login-container animate-scale-up">
      <div class="login-card glass-card">
        <div class="card-header">
          <div class="logo-circle">
            <Sword :size="32" class="logo-icon" />
          </div>
          <h1>ยินดีต้อนรับ</h1>
          <p>เข้าสู่ระบบจัดการสมาชิกแก๊ง</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label>ชื่อผู้ใช้งาน</label>
            <div class="input-wrapper">
              <User :size="18" class="input-icon" />
              <input 
                v-model="username" 
                type="text" 
                class="input-field" 
                placeholder="กรอกชื่อผู้ใช้งาน..."
                required
              >
            </div>
          </div>

          <div class="form-group">
            <label>รหัสผ่าน</label>
            <div class="input-wrapper">
              <Lock :size="18" class="input-icon" />
              <input 
                v-model="password" 
                type="password" 
                class="input-field" 
                placeholder="กรอกรหัสผ่าน..."
                required
              >
            </div>
          </div>

          <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
            <span>{{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}</span>
            <LogIn v-if="!loading" :size="18" />
            <div v-else class="btn-spinner"></div>
          </button>
        </form>

        <div class="card-footer">
          <p>ติดต่อผู้ดูแลระบบหากลืมรหัสผ่าน</p>
        </div>
      </div>
      
      <p class="copyright">© 2024 GANG MANAGEMENT SYSTEM. ALL RIGHTS RESERVED.</p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #050505;
  position: relative;
  overflow: hidden;
  padding: 1.5rem;
}

/* Glow Backgrounds */
.bg-glow-1 {
  position: absolute;
  top: -10%;
  left: -10%;
  width: 50%;
  height: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
  filter: blur(80px);
  z-index: 0;
}

.bg-glow-2 {
  position: absolute;
  bottom: -10%;
  right: -10%;
  width: 50%;
  height: 50%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%);
  filter: blur(80px);
  z-index: 0;
}

.login-container {
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 10;
}

.login-card {
  padding: 3rem 2.5rem;
  border-radius: 2rem;
}

.card-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo-circle {
  width: 72px;
  height: 72px;
  background: var(--accent-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 0 30px var(--accent-glow);
}

.logo-icon {
  color: white;
}

.card-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.card-header p {
  color: var(--text-secondary);
  font-size: 0.9375rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.input-field {
  padding-left: 2.75rem !important;
}

.login-btn {
  width: 100%;
  height: 52px;
  font-size: 1rem;
  margin-top: 1rem;
}

.card-footer {
  margin-top: 2rem;
  text-align: center;
}

.card-footer p {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.copyright {
  text-align: center;
  margin-top: 2rem;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.1em;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
