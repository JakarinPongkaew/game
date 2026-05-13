<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { Calendar, Save, CheckCircle, XCircle, Search, UserCheck, UserX, Users } from 'lucide-vue-next'

const auth = useAuthStore()
const members = ref([])
const attendance = ref({}) // memberId: status
const loading = ref(true)
const saving = ref(false)
const searchQuery = ref('')
const today = new Date().toISOString().split('T')[0]

onMounted(async () => {
  if (!auth.isAuthenticated) {
    navigateTo('/login')
    return
  }
  await fetchData()
})

const fetchData = async () => {
  loading.value = true
  try {
    const [membersData, attendanceData] = await Promise.all([
      $fetch('/api/members'),
      $fetch(`/api/attendance?date=${today}`)
    ])
    members.value = membersData
    
    // Initialize attendance map
    const map = {}
    membersData.forEach(m => map[m.id] = 'ABSENT')
    attendanceData.forEach(a => map[a.memberId] = a.status)
    attendance.value = map
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const toggleStatus = (id) => {
  if (!auth.isAdmin) return
  attendance.value[id] = attendance.value[id] === 'PRESENT' ? 'ABSENT' : 'PRESENT'
}

const saveAttendance = async () => {
  saving.value = true
  try {
    const records = Object.entries(attendance.value).map(([id, status]) => ({
      memberId: parseInt(id),
      status
    }))
    await $fetch('/api/attendance', {
      method: 'POST',
      body: { date: today, records }
    })
    alert('บันทึกสำเร็จ!')
  } catch (e) {
    alert('เกิดข้อผิดพลาดในการบันทึก')
  } finally {
    saving.value = false
  }
}

const filteredMembers = computed(() => {
  if (!searchQuery.value) return members.value
  return members.value.filter(m => 
    m.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const stats = computed(() => {
  const total = members.value.length
  const present = Object.values(attendance.value).filter(s => s === 'PRESENT').length
  return { total, present, absent: total - present }
})
</script>

<template>
  <div class="dashboard-page animate-fade-in">
    <header class="dashboard-header">
      <div class="header-content">
        <h1>เช็คชื่อประจำวัน</h1>
        <div class="date-chip">
          <Calendar :size="16" />
          <span>{{ new Date(today).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
        </div>
      </div>
      <button 
        v-if="auth.isAdmin"
        @click="saveAttendance" 
        class="btn btn-primary save-btn" 
        :disabled="saving"
      >
        <Save :size="20" />
        <span>{{ saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}</span>
      </button>
    </header>

    <!-- Stats Section -->
    <div class="stats-grid">
      <div class="stat-card glass-card">
        <div class="stat-icon total"><Users :size="24" /></div>
        <div class="stat-info">
          <span class="label">สมาชิกทั้งหมด</span>
          <span class="value">{{ stats.total }}</span>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon present"><UserCheck :size="24" /></div>
        <div class="stat-info">
          <span class="label">มาวันนี้</span>
          <span class="value">{{ stats.present }}</span>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon absent"><UserX :size="24" /></div>
        <div class="stat-info">
          <span class="label">ขาดเช็ค</span>
          <span class="value">{{ stats.absent }}</span>
        </div>
      </div>
    </div>

    <div class="search-bar glass-card">
      <Search :size="20" class="search-icon" />
      <input v-model="searchQuery" type="text" placeholder="ค้นหาชื่อสมาชิก..." class="search-input">
    </div>

    <div v-if="loading" class="loader-container">
      <div class="spinner"></div>
      <p>กำลังเตรียมข้อมูล...</p>
    </div>

    <div v-else class="table-container glass-card">
      <table>
        <thead>
          <tr>
            <th>สมาชิก</th>
            <th>อาวุธ & เลเวล</th>
            <th class="text-center">สถานะการเช็ค</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in filteredMembers" :key="member.id">
            <td>
              <div class="member-cell">
                <div class="avatar">{{ member.name.charAt(0) }}</div>
                <span class="name">{{ member.name }}</span>
              </div>
            </td>
            <td>
              <div class="weapon-tags">
                <div v-for="w in member.weapons" :key="w.id" class="weapon-tag-group">
                  <span class="badge">{{ w.weaponType }}</span>
                  <span class="lv-badge">LV.{{ w.level }}</span>
                </div>
              </div>
            </td>
            <td class="text-center">
              <button 
                @click="toggleStatus(member.id)"
                class="attendance-toggle"
                :class="attendance[member.id]"
                :disabled="!auth.isAdmin"
              >
                <div class="toggle-track">
                  <div class="toggle-thumb">
                    <CheckCircle v-if="attendance[member.id] === 'PRESENT'" :size="14" />
                    <XCircle v-else :size="14" />
                  </div>
                </div>
                <span class="status-text">{{ attendance[member.id] === 'PRESENT' ? 'มา' : 'ขาด' }}</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  padding-bottom: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.header-content h1 {
  font-size: 2.25rem;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.date-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  border-radius: 2rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.save-btn {
  height: 48px;
  padding: 0 1.5rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.total { background: rgba(59, 130, 246, 0.1); color: var(--accent-primary); }
.stat-icon.present { background: rgba(16, 185, 129, 0.1); color: var(--success); }
.stat-icon.absent { background: rgba(239, 68, 68, 0.1); color: var(--danger); }

.stat-info .label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.stat-info .value {
  font-size: 1.5rem;
  font-weight: 800;
  font-family: 'Outfit', sans-serif;
}

/* Search Bar */
.search-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1.5rem;
}

.search-icon {
  color: var(--text-muted);
}

.search-input {
  background: none;
  border: none;
  color: var(--text-primary);
  width: 100%;
  font-size: 0.9375rem;
  outline: none;
}

/* Table Enhancements */
.member-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 36px;
  height: 36px;
  background: var(--bg-main);
  border: 1px solid var(--border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--accent-primary);
}

.attendance-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.5rem 1rem 0.5rem 0.5rem;
  border-radius: 2rem;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.3s;
}

.toggle-track {
  width: 36px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  position: relative;
  transition: all 0.3s;
}

.toggle-thumb {
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 3px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
}

.attendance-toggle.PRESENT .toggle-track { background: var(--success); }
.attendance-toggle.PRESENT .toggle-thumb { left: calc(100% - 17px); color: var(--success); }
.attendance-toggle.PRESENT { background: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.2); }

.attendance-toggle.ABSENT .toggle-track { background: var(--danger); }
.attendance-toggle.ABSENT .toggle-thumb { color: var(--danger); }
.attendance-toggle.ABSENT { background: rgba(239, 68, 68, 0.05); border-color: rgba(239, 68, 68, 0.2); }

.status-text {
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.text-center { text-align: center; }

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.05);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .dashboard-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .save-btn { width: 100%; }
}
</style>
