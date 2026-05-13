<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { Calendar, Save, CheckCircle, XCircle } from 'lucide-vue-next'

const auth = useAuthStore()
const members = ref([])
const attendance = ref({}) // memberId: status
const loading = ref(true)
const saving = ref(false)
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
</script>

<template>
  <div class="page-container animate-fade-in">
    <header class="page-header">
      <div>
        <h1>เช็คชื่อประจำวัน</h1>
        <div class="date-badge">
          <Calendar :size="16" />
          <span>{{ today }}</span>
        </div>
      </div>
      <button 
        v-if="auth.isAdmin"
        @click="saveAttendance" 
        class="btn btn-primary" 
        :disabled="saving"
      >
        <Save :size="20" />
        <span>{{ saving ? 'กำลังบันทึก...' : 'บันทึกทั้งหมด' }}</span>
      </button>
    </header>

    <div v-if="loading" class="loader">กำลังโหลดข้อมูล...</div>

    <div v-else class="table-container glass-card">
      <table>
        <thead>
          <tr>
            <th>ชื่อ-นามสกุล</th>
            <th>อาวุธ</th>
            <th>เลเวล</th>
            <th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in members" :key="member.id">
            <td>
              <div class="member-name">{{ member.name }}</div>
            </td>
            <td>
              <div class="weapon-tags">
                <div v-for="w in member.weapons" :key="w.id" class="weapon-tag-group">
                  <span class="badge">{{ w.weaponType }}</span>
                  <span class="lv-badge">LV. {{ w.level }}</span>
                </div>
              </div>
            </td>
            <td>
              <button 
                @click="toggleStatus(member.id)"

                class="status-btn"
                :class="attendance[member.id]"
                :disabled="!auth.isAdmin"
              >
                <CheckCircle v-if="attendance[member.id] === 'PRESENT'" :size="18" />
                <XCircle v-else :size="18" />
                <span>{{ attendance[member.id] === 'PRESENT' ? 'มา' : 'ขาด' }}</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 2rem 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-family: 'Outfit', sans-serif;
  margin-bottom: 0.5rem;
}

.date-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-secondary);
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.member-name {
  font-weight: 600;
}

.badge {
  background: rgba(59, 130, 246, 0.1);
  color: var(--accent-primary);
  padding: 0.25rem 0.625rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.lv-badge {
  background: rgba(139, 92, 246, 0.1);
  color: var(--accent-secondary);
  padding: 0.25rem 0.625rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  min-width: 100px;
}

.status-btn.PRESENT {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.status-btn.ABSENT {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
}

.status-btn:disabled {
  cursor: default;
}

.loader {
  text-align: center;
  padding: 4rem;
  color: var(--text-secondary);
}
</style>
