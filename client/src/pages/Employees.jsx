import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    designation: '',
    salary: '',
    role: 'employee'
  });

  const fetchData = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get('/employees'),
        api.get('/departments')
      ]);
      setEmployees(empRes.data.employees || []);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmp) {
        await api.put(`/employees/${editingEmp._id}`, formData);
        toast.success('Employee updated successfully');
      } else {
        await api.post('/employees', formData);
        toast.success('Employee created successfully');
      }
      setIsModalOpen(false);
      fetchData();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        toast.success('Employee deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete employee');
      }
    }
  };

  const handleEdit = (emp) => {
    setEditingEmp(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '',
      department: emp.department?._id || '',
      designation: emp.designation || '',
      salary: emp.salary || '',
      role: emp.role || 'employee'
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingEmp(null);
    setFormData({
      name: '', email: '', password: '', phone: '', department: '', designation: '', salary: '', role: 'employee'
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <FiPlus /> Add Employee
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id}>
                  <td className="font-medium text-gray-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                      {emp.name.charAt(0)}
                    </div>
                    {emp.name}
                  </td>
                  <td>{emp.email}</td>
                  <td>{emp.designation || '-'}</td>
                  <td>{emp.department?.name || '-'}</td>
                  <td>
                    <span className={`badge ${emp.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(emp)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <FiEdit2 />
                      </button>
                      <button onClick={() => handleDelete(emp._id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }} title={editingEmp ? "Edit Employee" : "Add Employee"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[var(--color-primary)]" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[var(--color-primary)]" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            {!editingEmp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[var(--color-primary)]" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[var(--color-primary)]" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[var(--color-primary)]" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <input type="text" required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[var(--color-primary)]" value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Salary</label>
              <input type="number" required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[var(--color-primary)]" value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[var(--color-primary)]" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="btn hover:bg-gray-100 border border-gray-300 text-gray-700">Cancel</button>
            <button type="submit" className="btn btn-primary">{editingEmp ? 'Update Employee' : 'Create Employee'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
