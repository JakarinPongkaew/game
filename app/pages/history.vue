<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { Search, CalendarDays, Trash2, AlertTriangle, X, Clock } from 'lucide-vue-next'

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
  <div class="history-page animate-fade-in">
    <header class="page-header">
      <div class="header-content">
        <h1>ประวัติการเช็คชื่อ</h1>
        <p class="subtitle">ตรวจสอบบันทึกการมาทำงานย้อนหลัง</p>
      </div>
      
      <div class="header-actions">
        <div class="date-picker-group">
          <label>เลือกวันที่</label>
          <div class="input-wrapper">
            <CalendarDays :size="18" class="input-icon" />
            <input v-model="date" type="date" class="input-field date-input">
          </div>
        </div>
        <button 
          v-if="auth.isAdmin && attendanceData.length > 0"
          @click="confirmDelete('all')"
          class="btn btn-ghost delete-all-btn"
        >
          <Trash2 :size="18" />
          <span>ล้างข้อมูลวันนี้</span>
        </button>
      </div>
    </header>

    <div v-if="loading" class="loader-container">
      <div class="spinner"></div>
      <p>กำลังค้นหาข้อมูล...</p>
    </div>

    <div v-else-if="attendanceData.length === 0" class="empty-state glass-card">
      <div class="empty-icon-box">
        <Search :size="40" />
      </div>
      <h3>ไม่พบข้อมูลการเช็คชื่อ</h3>
      <p>ไม่มีบันทึกในวันที่ {{ new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
    </div>

    <div v-else class="table-container glass-card">
      <table>
        <thead>
          <tr>
            <th>สมาชิก</th>
            <th>อาวุธ & เลเวล</th>
            <th>สถานะ</th>
            <th><div class="flex-center gap-2"><Clock :size="14" /> เวลาที่บันทึก</div></th>
            <th v-if="auth.isAdmin" class="text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in attendanceData" :key="item.id">
            <td>
              <div class="member-cell">
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
                {{ item.status === 'PRESENT' ? 'มาทำงาน' : 'ขาดงาน' }}
              </span>
            </td>
            <td class="timestamp">
              {{ new Date(item.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) }} น.
            </td>
            <td v-if="auth.isAdmin" class="text-center">
              <button @click="confirmDelete('single', item.id)" class="action-btn delete" title="ลบข้อมูล">
                <Trash2 :size="16" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modern Delete Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal-content glass-card animate-scale-up">
          <div class="modal-header-danger">
            <div class="danger-icon-box">
              <AlertTriangle :size="32" />
            </div>
            <h2>ยืนยันการลบ</h2>
          </div>
          
          <div class="modal-body">
            <p v-if="deleteTarget?.type === 'all'">
              คุณแน่ใจหรือไม่ว่าต้องการ <strong>ล้างข้อมูลทั้งหมด</strong> ของวันที่ {{ date }}?
            </p>
            <p v-else>
              คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลประวัตินี้?
            </p>
            <p class="warning-text">การดำเนินการนี้ไม่สามารถเรียกคืนข้อมูลได้</p>
          </div>

          <div class="modal-footer-grid">
            <button @click="showDeleteModal = false" class="btn btn-ghost">ยกเลิก</button>
            <button @click="handleDelete" class="btn btn-primary danger-btn">ยืนยันการลบ</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.history-page { padding-bottom: 2rem; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 3rem;
}

.header-content h1 { font-size: 2.25rem; margin-bottom: 0.5rem; }
.subtitle { color: var(--text-secondary); font-size: 0.95rem; }

.header-actions { display: flex; align-items: flex-end; gap: 1.5rem; }

.date-picker-group { display: flex; flex-direction: column; gap: 0.625rem; }
.date-picker-group label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-wrapper { position: relative; }
.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--accent-primary);
  pointer-events: none;
}

.date-input {
  padding-left: 2.75rem !important;
  width: 200px;
}

.delete-all-btn {
  height: 48px;
  color: var(--danger);
  border-color: rgba(239, 68, 68, 0.2);
}

.delete-all-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--danger);
}

/* Table Design */
.member-cell { display: flex; align-items: center; gap: 0.75rem; }
.avatar-sm {
  width: 32px;
  height: 32px;
  background: var(--bg-main);
  border: 1px solid var(--border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  color: var(--accent-primary);
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.875rem;
  border-radius: 2rem;
  font-size: 0.8rem;
  font-weight: 700;
}

.status-pill.PRESENT { background: rgba(16, 185, 129, 0.1); color: var(--success); }
.status-pill.ABSENT { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
.status-pill .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

.timestamp { color: var(--text-muted); font-size: 0.85rem; font-weight: 500; }

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.delete:hover {
  background: var(--danger);
  color: white;
  border-color: var(--danger);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
}

.empty-icon-box {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: var(--text-muted);
}

/* Modal Enhancements */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 1.5rem;
}

.modal-content { width: 100%; max-width: 420px; overflow: hidden; }

.modal-header-danger {
  padding: 2.5rem 2rem 1.5rem;
  text-align: center;
}

.danger-icon-box {
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

.modal-body { padding: 0 2rem 2rem; text-align: center; }
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
