<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { LogIn } from 'lucide-vue-next'

definePageMeta({
  layout: false
})

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const auth = useAuthStore()

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value }
    })
    auth.setUser(response.user, response.token)
    navigateTo('/')
  } catch (e) {
    error.value = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="glass-card login-card animate-fade-in">
      <div class="header">
        <h1>เข้าสู่ระบบ</h1>
        <p>ระบุตัวตนเพื่อเข้าถึงระบบเช็คชื่อ</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>ชื่อผู้ใช้</label>
          <input 
            v-model="username" 
            type="text" 
            class="input-field" 
            placeholder="admin" 
            required
          >
        </div>
        
        <div class="form-group">
          <label>รหัสผ่าน</label>
          <input 
            v-model="password" 
            type="password" 
            class="input-field" 
            placeholder="••••••••" 
            required
          >
        </div>

        <p v-if="error" class="error-text">{{ error }}</p>

        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
          <LogIn v-if="!loading" :size="20" />
          <span>{{ loading ? 'กำลังโหลด...' : 'เข้าสู่ระบบ' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top left, #1e293b, #0f172a);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2.5rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
  font-family: 'Outfit', sans-serif;
}

.header p {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.error-text {
  color: var(--danger);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.w-full {
  width: 100%;
  justify-content: center;
}
</style>
