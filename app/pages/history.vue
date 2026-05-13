<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { Search, CalendarDays, Trash2, AlertTriangle, X } from 'lucide-vue-next'

const auth = useAuthStore()
const date = ref(new Date().toISOString().split('T')[0])
const attendanceData = ref([])
const loading = ref(false)
const showDeleteModal = ref(false)
const deleteTarget = ref<{ type: 'single' | 'all', id?: number } | null>(null)

onMounted(async () => {
  if (!auth.isAuthenticated) {
    navigateTo('/login')
    return
  }
  await fetchHistory()
})

const fetchHistory = async () => {
  loading.value = true
  try {
    const data = await $fetch(`/api/attendance?date=${date.value}`)
    attendanceData.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const confirmDelete = (type: 'single' | 'all', id?: number) => {
  deleteTarget.value = { type, id }
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!deleteTarget.value) return
  
  try {
    if (deleteTarget.value.type === 'single') {
      await $fetch(`/api/attendance?id=${deleteTarget.value.id}`, { method: 'DELETE' })
    } else {
      await $fetch(`/api/attendance?date=${date.value}`, { method: 'DELETE' })
    }
    await fetchHistory()
    showDeleteModal.value = false
  } catch (e) {
    alert('ไม่สามารถลบข้อมูลได้')
  }
}

watch(date, () => {
  fetchHistory()
})
</script>

<template>
  <div class="page-container animate-fade-in">
    <header class="page-header">
      <div class="header-left">
        <h1>ประวัติการเช็คชื่อ</h1>
        <p class="subtitle">ตรวจสอบและจัดการประวัติการมาทำงานย้อนหลัง</p>
      </div>
      <div class="filter-group">
        <div class="date-selector">
          <label>เลือกวันที่:</label>
          <div class="input-wrapper">
            <CalendarDays :size="18" class="icon" />
            <input v-model="date" type="date" class="input-field date-input">
          </div>
        </div>
        <button 
          v-if="auth.isAdmin && attendanceData.length > 0"
          @click="confirmDelete('all')"
          class="btn btn-danger-outline btn-sm"
        >
          <Trash2 :size="16" />
          <span>ล้างข้อมูลวันนี้</span>
        </button>
      </div>
    </header>

    <div v-if="loading" class="loader-container">
      <div class="spinner"></div>
      <p>กำลังค้นหาข้อมูล...</p>
    </div>

    <div v-else-if="attendanceData.length === 0" class="empty-state glass-card">
      <div class="empty-icon-wrapper">
        <Search :size="48" class="muted" />
      </div>
      <h3>ไม่พบข้อมูล</h3>
      <p>ไม่มีบันทึกการเช็คชื่อในวันที่ {{ new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
    </div>

    <div v-else class="table-container glass-card">
      <table>
        <thead>
          <tr>
            <th>สมาชิก</th>
            <th>อาวุธ & เลเวล</th>
            <th>สถานะ</th>
            <th>เวลาที่บันทึก</th>
            <th v-if="auth.isAdmin" class="text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in attendanceData" :key="item.id">
            <td>
              <div class="member-info">
                <div class="avatar-sm">{{ item.member.name.charAt(0) }}</div>
                <span class="name">{{ item.member.name }}</span>
              </div>
            </td>
            <td>
              <div class="weapon-tags">
                <div v-for="w in item.member.weapons" :key="w.id" class="weapon-tag-group">
                  <span class="badge">{{ w.weaponType }}</span>
                  <span class="lv-badge">LV.{{ w.level }}</span>
                </div>
              </div>
            </td>
            <td>
              <span :class="['status-pill', item.status]">
                <span class="dot"></span>
                {{ item.status === 'PRESENT' ? 'มา' : 'ขาด' }}
              </span>
            </td>
            <td class="timestamp">
              {{ new Date(item.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) }} น.
            </td>
            <td v-if="auth.isAdmin" class="text-center">
              <button @click="confirmDelete('single', item.id)" class="btn-icon text-danger" title="ลบข้อมูล">
                <Trash2 :size="18" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal-content glass-card animate-scale-up">
          <div class="modal-header">
            <div class="warning-icon">
              <AlertTriangle :size="32" />
            </div>
            <h2>ยืนยันการลบ</h2>
            <button @click="showDeleteModal = false" class="close-btn"><X :size="20" /></button>
          </div>
          <div class="modal-body">
            <p v-if="deleteTarget?.type === 'all'">
              คุณแน่ใจหรือไม่ว่าต้องการ <strong>ลบข้อมูลทั้งหมด</strong> ของวันที่ {{ date }}?
            </p>
            <p v-else>
              คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลประวัติแถวนี้?
            </p>
            <p class="text-secondary text-sm">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
          </div>
          <div class="modal-footer">
            <button @click="showDeleteModal = false" class="btn btn-ghost">ยกเลิก</button>
            <button @click="handleDelete" class="btn btn-danger">ยืนยันการลบ</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.page-container { padding: 2rem 0; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2.5rem;
}

.header-left h1 { font-size: 2.25rem; font-family: 'Outfit', sans-serif; margin-bottom: 0.5rem; }
.subtitle { color: var(--text-secondary); font-size: 0.95rem; }

.filter-group { display: flex; align-items: flex-end; gap: 1rem; }
.date-selector { display: flex; flex-direction: column; gap: 0.5rem; }
.date-selector label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }

.input-wrapper { position: relative; width: 180px; }
.input-wrapper .icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--accent-primary);
  pointer-events: none;
}

.date-input { 
  padding-left: 2.75rem; 
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  height: 42px;
}

/* Table Styles */
.member-info { display: flex; align-items: center; gap: 0.75rem; }
.avatar-sm {
  width: 32px;
  height: 32px;
  background: var(--accent-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
}

.name { font-weight: 600; color: var(--text-primary); }

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.875rem;
  border-radius: 2rem;
  font-size: 0.85rem;
  font-weight: 700;
}

.status-pill.PRESENT { background: rgba(16, 185, 129, 0.1); color: var(--success); }
.status-pill.ABSENT { background: rgba(239, 68, 68, 0.1); color: var(--danger); }

.dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

.timestamp { font-size: 0.9rem; color: var(--text-secondary); font-weight: 500; }

.text-center { text-align: center; }

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.empty-state h3 { font-size: 1.5rem; margin-bottom: 0.5rem; }
.empty-state p { color: var(--text-secondary); }

/* Loader */
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
  border: 3px solid rgba(59, 130, 246, 0.1);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
}

.modal-content {
  width: 100%;
  max-width: 450px;
  padding: 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header {
  padding: 2rem 2rem 1rem;
  text-align: center;
  position: relative;
}

.warning-icon {
  width: 64px;
  height: 64px;
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
}

.modal-body { padding: 0 2rem 2rem; text-align: center; }
.modal-body p { margin-bottom: 0.5rem; }
.text-sm { font-size: 0.85rem; }

.modal-footer {
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.03);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.btn-danger-outline {
  background: transparent;
  border: 1.5px solid var(--danger);
  color: var(--danger);
}

.btn-danger-outline:hover {
  background: var(--danger);
  color: white;
}

@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 1.5rem; }
  .filter-group { width: 100%; flex-direction: column; align-items: stretch; }
  .input-wrapper { width: 100%; }
}
</style>
