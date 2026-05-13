<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { UserPlus, Trash2, ShieldPlus, Plus, Minus, Edit2, X } from 'lucide-vue-next'

const auth = useAuthStore()
const members = ref([])
const weaponTypes = ref([])
const loading = ref(true)

// Form states
const isEditing = ref(false)
const editId = ref(null)
const memberForm = ref({ 
  name: '', 
  weapons: [{ weaponType: '', level: 1 }] 
})
const newWeapon = ref('')

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
    if (w.length > 0 && !isEditing.value) {
      memberForm.value.weapons[0].weaponType = w[0].name
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const addWeaponRow = () => {
  memberForm.value.weapons.push({ 
    weaponType: weaponTypes.value[0]?.name || '', 
    level: 1 
  })
}

const removeWeaponRow = (index) => {
  if (memberForm.value.weapons.length > 1) {
    memberForm.value.weapons.splice(index, 1)
  }
}

const submitMember = async () => {
  try {
    if (isEditing.value) {
      await $fetch(`/api/members/${editId.value}`, {
        method: 'PATCH',
        body: memberForm.value
      })
      cancelEdit()
    } else {
      await $fetch('/api/members', {
        method: 'POST',
        body: memberForm.value
      })
      resetForm()
    }
    await fetchData()
  } catch (e) {
    alert('ไม่สามารถบันทึกข้อมูลได้')
  }
}

const resetForm = () => {
  memberForm.value = { 
    name: '', 
    weapons: [{ weaponType: weaponTypes.value[0]?.name || '', level: 1 }] 
  }
}

const startEdit = (member) => {
  isEditing.value = true
  editId.value = member.id
  memberForm.value = {
    name: member.name,
    weapons: member.weapons.map(w => ({ weaponType: w.weaponType, level: w.level }))
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  isEditing.value = false
  editId.value = null
  resetForm()
}

const deleteMember = async (id) => {
  if (!confirm('ยืนยันการลบสมาชิก?')) return
  try {
    await $fetch(`/api/members/${id}`, { method: 'DELETE' })
    await fetchData()
  } catch (e) {
    alert('ไม่สามารถลบสมาชิกได้')
  }
}

const addWeapon = async () => {
  if (!newWeapon.value) return
  try {
    await $fetch('/api/weapons', {
      method: 'POST',
      body: { name: newWeapon.value }
    })
    newWeapon.value = ''
    await fetchData()
  } catch (e) {
    alert('ไม่สามารถเพิ่มประเภทอาวุธได้')
  }
}

const deleteWeaponType = async (id) => {
  if (!confirm('ยืนยันการลบประเภทอาวุธ?')) return
  try {
    await $fetch(`/api/weapons/${id}`, { method: 'DELETE' })
    await fetchData()
  } catch (e) {
    const msg = (e && e.data && e.data.statusMessage) || 'อาจมีข้อผิดพลาดของระบบ'
    alert('ไม่สามารถลบประเภทอาวุธได้: ' + msg)
  }
}



</script>

<template>
  <div class="page-container animate-fade-in">
    <header class="page-header">
      <h1>จัดการสมาชิกและอาวุธ</h1>
    </header>

    <div v-if="!auth.isAdmin" class="alert warning">
      คุณไม่มีสิทธิ์ในการแก้ไขข้อมูล (ดูได้อย่างเดียว)
    </div>

    <div class="grid">
      <!-- Add/Edit Member Section -->
      <section v-if="auth.isAdmin" class="glass-card form-section" :class="{ 'editing-mode': isEditing }">
        <div class="section-header">
          <h3>
            <UserPlus v-if="!isEditing" :size="18" /> 
            <Edit2 v-else :size="18" />
            {{ isEditing ? 'แก้ไขข้อมูลสมาชิก' : 'เพิ่มสมาชิกใหม่' }}
          </h3>
          <button v-if="isEditing" @click="cancelEdit" class="btn btn-ghost btn-xs">
            <X :size="14" /> ยกเลิก
          </button>
        </div>
        
        <form @submit.prevent="submitMember" class="stacked-form">
          <div class="form-group">
            <label>ชื่อ-นามสกุล</label>
            <input v-model="memberForm.name" type="text" class="input-field" placeholder="ชื่อ-นามสกุล" required>
          </div>
          
          <div class="weapon-management">
            <div class="header">
              <label>อาวุธและเลเวล</label>
              <button type="button" @click="addWeaponRow" class="btn btn-ghost btn-xs">
                <Plus :size="14" /> เพิ่มอาวุธ
              </button>
            </div>
            
            <div v-for="(w, index) in memberForm.weapons" :key="index" class="weapon-row">
              <select v-model="w.weaponType" class="input-field">
                <option v-for="type in weaponTypes" :key="type.id" :value="type.name">{{ type.name }}</option>
              </select>
              <input v-model="w.level" type="number" class="input-field lv-input" placeholder="LV" min="1">
              <button type="button" @click="removeWeaponRow(index)" class="btn-icon danger" v-if="memberForm.weapons.length > 1">
                <Minus :size="16" />
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary mt-1">
            {{ isEditing ? 'บันทึกการแก้ไข' : 'บันทึกสมาชิก' }}
          </button>
        </form>
      </section>

      <!-- Manage Weapons Section -->
      <section v-if="auth.isAdmin" class="glass-card form-section">
        <h3><ShieldPlus :size="18" /> จัดการประเภทอาวุธ</h3>
        <form @submit.prevent="addWeapon" class="stacked-form mb-2">
          <div class="form-group">
            <label>เพิ่มอาวุธใหม่</label>
            <div class="input-row">
              <input v-model="newWeapon" type="text" class="input-field" placeholder="เช่น มีด, ปืน" required>
              <button type="submit" class="btn btn-primary">เพิ่ม</button>
            </div>
          </div>
        </form>

        <div class="weapon-list">
          <label class="mb-1 block text-sm color-secondary">ประเภทอาวุธที่มีอยู่:</label>
          <div class="weapon-type-tags">
            <div v-for="type in weaponTypes" :key="type.id" class="weapon-type-chip">
              <span>{{ type.name }}</span>
              <button @click="deleteWeaponType(type.id)" class="delete-chip">
                <X :size="12" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="table-container glass-card mt-2">
      <table>
        <thead>
          <tr>
            <th>ชื่อ-นามสกุล</th>
            <th>อาวุธและเลเวล</th>
            <th v-if="auth.isAdmin">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in members" :key="member.id">
            <td><span class="member-name">{{ member.name }}</span></td>
            <td>
              <div class="weapon-tags">
                <div v-for="w in member.weapons" :key="w.id" class="weapon-tag-group">
                  <span class="badge">{{ w.weaponType }}</span>
                  <span class="lv-badge">LV. {{ w.level }}</span>
                </div>
              </div>
            </td>
            <td v-if="auth.isAdmin">
              <div class="action-buttons">
                <button @click="startEdit(member)" class="btn-icon primary">
                  <Edit2 :size="18" />
                </button>
                <button @click="deleteMember(member.id)" class="btn-icon danger">
                  <Trash2 :size="18" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.page-container { padding: 2rem 0; }
.page-header h1 { font-size: 2rem; margin-bottom: 2rem; font-family: 'Outfit', sans-serif; }

.grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.form-section h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  margin: 0;
}

.editing-mode {
  border: 1px solid var(--accent-primary);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.2);
}

.stacked-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-row {
  display: flex;
  gap: 0.5rem;
}

.weapon-management {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.weapon-management .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.weapon-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.lv-input { width: 80px; text-align: center; }

.weapon-type-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.weapon-type-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  padding: 0.25rem 0.5rem 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.8rem;
}

.delete-chip {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-chip:hover { background: var(--danger); color: white; }

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon.primary { color: var(--accent-primary); }
.btn-icon.primary:hover { background: rgba(59, 130, 246, 0.1); }
.btn-icon.danger { color: var(--danger); }
.btn-icon.danger:hover { background: rgba(239, 68, 68, 0.1); }

.mt-1 { margin-top: 1rem; }
.mt-2 { margin-top: 2rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 2rem; }
.block { display: block; }
.text-sm { font-size: 0.875rem; }
.color-secondary { color: var(--text-secondary); }

@media (max-width: 1024px) {
  .grid { grid-template-columns: 1fr; }
}
</style>


