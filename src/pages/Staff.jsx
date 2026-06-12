import { useState } from 'react'
import { Users, UserPlus, Shield, Activity, Pencil, Trash2, UserCheck, UserX } from 'lucide-react'
import DataTable from '../components/DataTable'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { staff as initialStaff, rolePermissions, activityLog } from '../data/mockData'

const roles = ['Owner', 'Manager', 'Cashier', 'Inventory Staff', 'Accountant']

export default function Staff() {
  const [staffList, setStaffList] = useState(initialStaff)
  const [staffIdCounter, setStaffIdCounter] = useState(5)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [form, setForm] = useState({ name: '', role: 'Cashier', email: '', phone: '', active: true })

  const openAdd = () => {
    setEditingStaff(null)
    setForm({ name: '', role: 'Cashier', email: '', phone: '', active: true })
    setModalOpen(true)
  }

  const openEdit = (s) => {
    setEditingStaff(s)
    setForm({ name: s.name, role: s.role, email: s.email, phone: s.phone, active: s.active })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editingStaff) {
      setStaffList(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...form } : s))
    } else {
      const newStaff = { id: staffIdCounter, ...form, avatar: `/images/avatar-placeholder.png` }
      setStaffList(prev => [...prev, newStaff])
      setStaffIdCounter(prev => prev + 1)
    }
    setModalOpen(false)
  }

  const handleDelete = (id) => {
    if (confirm('Remove this staff member?')) {
      setStaffList(prev => prev.filter(s => s.id !== id))
    }
  }

  const toggleActive = (id) => {
    setStaffList(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s))
  }

  const activeCount = staffList.filter(s => s.active).length
  const roleCounts = roles.map(r => ({ role: r, count: staffList.filter(s => s.role === r).length }))

  const staffColumns = [
    {
      key: 'avatar', label: '',
      render: r => (
        <img src={r.avatar} alt={r.name} className="w-9 h-9 rounded-full object-cover" onError={e => { e.target.style.display = 'none' }} />
      ),
    },
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role', render: r => <Badge variant="Active">{r.role}</Badge> },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'active', label: 'Status',
      render: r => (
        <button onClick={() => toggleActive(r.id)} className="cursor-pointer">
          {r.active ? <Badge variant="Active">Active</Badge> : <Badge>Inactive</Badge>}
        </button>
      ),
    },
    {
      key: 'actions', label: '',
      render: r => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 cursor-pointer">
            <Pencil size={15} />
          </button>
          <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600 cursor-pointer">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  const permissionColumns = [
    { key: 'role', label: 'Role' },
    { key: 'permissions', label: 'Permissions' },
  ]

  const logColumns = [
    { key: 'date', label: 'Date' },
    { key: 'user', label: 'User' },
    { key: 'action', label: 'Action' },
    { key: 'module', label: 'Module', render: r => <Badge variant={r.module === 'POS' ? 'Cash' : 'Active'}>{r.module}</Badge> },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Users size={20} className="text-blue-600" /></div>
          <div><p className="text-xs text-gray-500">Total Staff</p><p className="text-lg font-bold text-gray-800">{staffList.length}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><UserCheck size={20} className="text-green-600" /></div>
          <div><p className="text-xs text-gray-500">Active</p><p className="text-lg font-bold text-green-700">{activeCount}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center"><UserX size={20} className="text-red-600" /></div>
          <div><p className="text-xs text-gray-500">Inactive</p><p className="text-lg font-bold text-red-700">{staffList.length - activeCount}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center"><Shield size={20} className="text-purple-600" /></div>
          <div><p className="text-xs text-gray-500">Roles</p><p className="text-lg font-bold text-gray-800">{roles.length}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Users size={18} className="text-primary" /> Staff Members</h3>
          <button onClick={openAdd} className="flex items-center gap-1.5 text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 cursor-pointer">
            <UserPlus size={14} /> Add Staff
          </button>
        </div>
        <DataTable columns={staffColumns} data={staffList} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-sm"><Shield size={16} className="text-purple-600" /> Role Permissions</h3>
          <div className="space-y-3">
            {roleCounts.map(r => (
              <div key={r.role} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{r.role}</span>
                <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded">{r.count} staff</span>
              </div>
            ))}
          </div>
          <hr className="my-3" />
          <div className="space-y-2">
            {rolePermissions.map(rp => (
              <div key={rp.role} className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">{rp.role}:</span> {rp.permissions}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-sm"><Activity size={16} className="text-orange-600" /> Recent Activity Log</h3>
          <DataTable columns={logColumns} data={activityLog} />
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingStaff ? 'Edit Staff' : 'Add Staff'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Staff name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Phone number" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select value={form.active ? 'Active' : 'Inactive'} onChange={e => setForm(p => ({ ...p, active: e.target.value === 'Active' }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">Cancel</button>
            <button onClick={handleSave}
              className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary/90 cursor-pointer">
              {editingStaff ? 'Update' : 'Create Staff'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
