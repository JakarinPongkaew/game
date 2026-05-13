<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { Plus, Edit2, Trash2, Sword, X, Save, User, ShieldPlus } from 'lucide-vue-next'

const auth = useAuthStore()
const members = ref([])
const weaponTypes = ref([])
const loading = ref(true)
const showModal = ref(false)
const showWeaponTypeModal = ref(false)
const editingMember = ref(null)
const newWeaponTypeName = ref('')

// Form state for Member
const form = ref({
  name: '',
  weapons: [] // [{ weaponType: '', level: 1 }]
})

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
    const [m, w] = await Promise.all([
      $fetch('/api/members'),
      $fetch('/api/weapons')
    ])
    members.value = m
    weaponTypes.value = w
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  editingMember.value = null
  form.value = { 
    name: '', 
    weapons: [{ weaponType: weaponTypes.value[0]?.name || '', level: 1 }] 
  }
  showModal.value = true
}

const openEditModal = (member) => {
  editingMember.value = member
  form.value = { 
    name: member.name, 
    weapons: member.weapons.map(w => ({ weaponType: w.weaponType, level: w.level }))
  }
  showModal.value = true
}

const addWeaponField = () => {
  form.value.weapons.push({ 
    weaponType: weaponTypes.value[0]?.name || '', 
    level: 1 
  })
}

const removeWeaponField = (index) => {
  if (form.value.weapons.length > 1) {
    form.value.weapons.splice(index, 1)
  }
}

const handleSubmit = async () => {
  try {
    if (editingMember.value) {
      await $fetch(`/api/members/${editingMember.value.id}`, {
        method: 'PATCH',
        body: form.value
      })
    } else {
      await $fetch('/api/members', {
        method: 'POST',
        body: form.value
      })
    }
    showModal.value = false
    await fetchData()
  } catch (e) {
    alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
  }
}

const deleteMember = async (id) => {
  if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสมาชิกคนนี้?')) return
  try {
    await $fetch(`/api/members/${id}`, { method: 'DELETE' })
    await fetchData()
  } catch (e) {
    alert('ไม่สามารถลบข้อมูลได้')
  }
}

const addWeaponType = async () => {
  if (!newWeaponTypeName.value) return
  try {
    await $fetch('/api/weapons', {
      method: 'POST',
      body: { name: newWeaponTypeName.value }
    })
    newWeaponTypeName.value = ''
    await fetchData()
  } catch (e) {
    alert('ไม่สามารถเพิ่มประเภทอาวุธได้')
  }
}

const deleteWeaponType = async (id) => {
  if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบประเภทอาวุธนี้?')) return
  try {
    await $fetch(`/api/weapons/${id}`, { method: 'DELETE' })
    await fetchData()
  } catch (e) {
    const msg = (e as any)?.data?.statusMessage || 'อาจมีสมาชิกใช้อาวุธนี้อยู่'
    alert('ไม่สามารถลบได้: ' + msg)
  }
}
</script>

<template>
  <div class="members-page animate-fade-in">
    <header class="page-header">
      <div class="header-content">
        <h1>จัดการสมาชิก</h1>
        <p class="subtitle">จัดการข้อมูลสมาชิกและประเภทอาวุธในแก๊ง</p>
      </div>
      <div class="header-actions">
        <button v-if="auth.isAdmin" @click="showWeaponTypeModal = true" class="btn btn-ghost">
          <ShieldPlus :size="20" />
          <span>จัดการประเภทอาวุธ</span>
        </button>
        <button v-if="auth.isAdmin" @click="openAddModal" class="btn btn-primary">
          <Plus :size="20" />
          <span>เพิ่มสมาชิกใหม่</span>
        </button>
      </div>
    </header>

    <div v-if="loading" class="loader-container">
      <div class="spinner"></div>
      <p>กำลังโหลดข้อมูล...</p>
    </div>

    <div v-else class="members-grid">
      <div v-for="member in members" :key="member.id" class="member-card glass-card">
        <div class="member-header">
          <div class="member-avatar">{{ member.name.charAt(0) }}</div>
          <div class="member-title">
            <h3>{{ member.name }}</h3>
            <span class="id-badge">ID: #{{ member.id.toString().padStart(3, '0') }}</span>
          </div>
          <div v-if="auth.isAdmin" class="actions">
            <button @click="openEditModal(member)" class="action-btn edit" title="แก้ไข">
              <Edit2 :size="16" />
            </button>
            <button @click="deleteMember(member.id)" class="action-btn delete" title="ลบ">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>

        <div class="member-body">
          <div class="section-label">รายการอาวุธที่ครอบครอง</div>
          <div class="weapons-list">
            <div v-for="w in member.weapons" :key="w.id" class="weapon-item">
              <div class="weapon-info">
                <Sword :size="14" class="icon" />
                <span class="type">{{ w.weaponType }}</span>
              </div>
              <span class="level">LEVEL {{ w.level }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Member Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-content glass-card animate-scale-up">
          <div class="modal-header">
            <h2>{{ editingMember ? 'แก้ไขข้อมูลสมาชิก' : 'เพิ่มสมาชิกใหม่' }}</h2>
            <button @click="showModal = false" class="close-btn"><X :size="20" /></button>
          </div>
          
          <form @submit.prevent="handleSubmit" class="member-form">
            <div class="form-section">
              <label><User :size="16" /> ชื่อ-นามสกุล</label>
              <input v-model="form.name" type="text" class="input-field" placeholder="กรอกชื่อสมาชิก..." required>
            </div>

            <div class="form-section">
              <div class="section-header">
                <label><Sword :size="16" /> อาวุธในครอบครอง</label>
                <button type="button" @click="addWeaponField" class="btn-text">
                  <Plus :size="14" /> เพิ่มอาวุธ
                </button>
              </div>
              
              <div class="weapons-fields-container">
                <div v-for="(w, index) in form.weapons" :key="index" class="weapon-field-group">
                  <select v-model="w.weaponType" class="input-field select">
                    <option v-for="type in weaponTypes" :key="type.id" :value="type.name">
                      {{ type.name }}
                    </option>
                  </select>
                  <input v-model.number="w.level" type="number" class="input-field level-input" placeholder="LV" min="1">
                  <button type="button" @click="removeWeaponField(index)" class="btn-icon-sm danger" v-if="form.weapons.length > 1">
                    <Trash2 :size="16" />
                  </button>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" @click="showModal = false" class="btn btn-ghost">ยกเลิก</button>
              <button type="submit" class="btn btn-primary">
                <Save :size="18" />
                <span>{{ editingMember ? 'บันทึกการแก้ไข' : 'เพิ่มสมาชิก' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Weapon Type Modal -->
    <Teleport to="body">
      <div v-if="showWeaponTypeModal" class="modal-overlay" @click.self="showWeaponTypeModal = false">
        <div class="modal-content glass-card animate-scale-up">
          <div class="modal-header">
            <h2>จัดการประเภทอาวุธ</h2>
            <button @click="showWeaponTypeModal = false" class="close-btn"><X :size="20" /></button>
          </div>
          
          <div class="modal-body p-2">
            <form @submit.prevent="addWeaponType" class="input-row mb-2">
              <input v-model="newWeaponTypeName" type="text" class="input-field" placeholder="ชื่ออาวุธใหม่..." required>
              <button type="submit" class="btn btn-primary">เพิ่ม</button>
            </form>

            <div class="weapon-type-list">
              <div v-for="type in weaponTypes" :key="type.id" class="weapon-type-item">
                <span>{{ type.name }}</span>
                <button @click="deleteWeaponType(type.id)" class="btn-icon-sm danger">
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
}

.header-content h1 { font-size: 2.25rem; margin-bottom: 0.5rem; }
.subtitle { color: var(--text-secondary); font-size: 0.95rem; }

.header-actions { display: flex; gap: 1rem; }

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
}

.member-card {
  padding: 1.5rem;
  transition: all 0.3s;
}

.member-card:hover {
  transform: translateY(-5px);
  border-color: var(--accent-primary);
  box-shadow: 0 20px 40px -20px rgba(59, 130, 246, 0.3);
}

.member-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
  position: relative;
}

.member-avatar {
  width: 52px;
  height: 52px;
  background: var(--accent-gradient);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.25rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

.member-title { flex: 1; }
.member-title h3 { font-size: 1.125rem; margin-bottom: 0.25rem; }
.id-badge { font-size: 0.7rem; color: var(--text-muted); font-weight: 700; letter-spacing: 0.05em; }

.actions { display: flex; gap: 0.5rem; }

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover { color: white; background: var(--accent-primary); }
.action-btn.delete:hover { background: var(--danger); }

.member-body {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 1rem;
  padding: 1.25rem;
}

.section-label {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1rem;
}

.weapons-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.weapon-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.6rem;
  border: 1px solid var(--border);
}

.weapon-info { display: flex; align-items: center; gap: 0.5rem; }
.weapon-info .icon { color: var(--accent-primary); }
.weapon-info .type { font-weight: 600; font-size: 0.85rem; }
.weapon-item .level { font-size: 0.7rem; font-weight: 800; color: var(--accent-secondary); }

/* Modal Styles */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 1.5rem;
}

.modal-content { width: 100%; max-width: 500px; padding: 0; overflow: hidden; }

.modal-header {
  padding: 2rem; border-bottom: 1px solid var(--border);
  display: flex; justify-content: space-between; align-items: center;
}

.close-btn {
  background: none; border: none; color: var(--text-muted);
  cursor: pointer; padding: 0.5rem; border-radius: 0.5rem;
}

.member-form { padding: 2rem; }

.form-section { margin-bottom: 2rem; }
.form-section label {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.85rem; font-weight: 700; color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.section-header { display: flex; justify-content: space-between; align-items: center; }
.btn-text {
  background: none; border: none; color: var(--accent-primary);
  font-size: 0.85rem; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; gap: 0.25rem;
}

.weapons-fields-container { display: flex; flex-direction: column; gap: 0.75rem; }
.weapon-field-group { display: flex; gap: 0.75rem; align-items: center; }
.level-input { width: 80px; text-align: center; }

.modal-footer {
  display: grid; grid-template-columns: 1fr 2fr; gap: 1rem;
  margin-top: 1rem;
}

/* Weapon Type List */
.weapon-type-list {
  max-height: 300px; overflow-y: auto;
  display: flex; flex-direction: column; gap: 0.5rem;
}

.weapon-type-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.75rem 1rem; background: rgba(255,255,255,0.03);
  border-radius: 0.5rem; border: 1px solid var(--border);
}

.p-2 { padding: 2rem; }
.input-row { display: flex; gap: 0.5rem; }
.mb-2 { margin-bottom: 2rem; }

.loader-container {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 5rem; gap: 1rem;
}

.spinner {
  width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.05);
  border-top-color: var(--accent-primary); border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
  .header-actions { width: 100%; flex-direction: column; }
  .btn-primary, .btn-ghost { width: 100%; }
}
</style>
