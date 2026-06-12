import { useState } from 'react'
import { Building2, Plus, Pencil, Trash2, Phone, Mail } from 'lucide-react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { suppliers as initialSuppliers } from '../data/mockData'

export default function Suppliers() {
  const [supplierList, setSupplierList] = useState(initialSuppliers)
  const [idCounter, setIdCounter] = useState(3)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', contact: '', email: '' })

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', contact: '', email: '' })
    setModalOpen(true)
  }

  const openEdit = (s) => {
    setEditing(s)
    setForm({ name: s.name, contact: s.contact, email: s.email })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editing) {
      setSupplierList(prev => prev.map(s => s.id === editing.id ? { ...s, ...form } : s))
    } else {
      setSupplierList(prev => [...prev, { id: idCounter, ...form }])
      setIdCounter(prev => prev + 1)
    }
    setModalOpen(false)
  }

  const handleDelete = (id) => {
    if (confirm('Remove this supplier?')) {
      setSupplierList(prev => prev.filter(s => s.id !== id))
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'contact', label: 'Contact', render: r => (
      <span className="flex items-center gap-1.5 text-gray-600">
        <Phone size={13} className="text-gray-400" /> {r.contact}
      </span>
    )},
    { key: 'email', label: 'Email', render: r => (
      <span className="flex items-center gap-1.5 text-gray-600">
        <Mail size={13} className="text-gray-400" /> {r.email}
      </span>
    )},
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

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Building2 size={20} className="text-blue-600" /></div>
          <div><p className="text-xs text-gray-500">Total Suppliers</p><p className="text-lg font-bold text-gray-800">{supplierList.length}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><Phone size={20} className="text-green-600" /></div>
          <div><p className="text-xs text-gray-500">With Contact</p><p className="text-lg font-bold text-green-700">{supplierList.filter(s => s.contact).length}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center"><Mail size={20} className="text-purple-600" /></div>
          <div><p className="text-xs text-gray-500">With Email</p><p className="text-lg font-bold text-gray-800">{supplierList.filter(s => s.email).length}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Building2 size={18} className="text-primary" /> Suppliers</h3>
          <button onClick={openAdd} className="flex items-center gap-1.5 text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 cursor-pointer">
            <Plus size={14} /> Add Supplier
          </button>
        </div>
        <DataTable columns={columns} data={supplierList} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Supplier' : 'Add Supplier'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Supplier Name</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Company name" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Contact Number</label>
            <input value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Phone number" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="email@example.com" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">Cancel</button>
            <button onClick={handleSave}
              className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary/90 cursor-pointer">
              {editing ? 'Update' : 'Create Supplier'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
