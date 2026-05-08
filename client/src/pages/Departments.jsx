import { useState, useEffect } from 'react';
import { departmentService } from '../services/departmentService';
import api from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiFolder, FiMail } from 'react-icons/fi';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  
  const [isEmployeesModalOpen, setIsEmployeesModalOpen] = useState(false);
  const [viewingDept, setViewingDept] = useState(null);
  const [deptEmployees, setDeptEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const fetchDepartments = async () => {
    try {
      const data = await departmentService.getAllDepartments();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await departmentService.updateDepartment(editingDept._id, formData);
        toast.success('Department updated successfully');
      } else {
        await departmentService.createDepartment(formData);
        toast.success('Department created successfully');
      }
      setIsModalOpen(false);
      fetchDepartments();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await departmentService.deleteDepartment(id);
        toast.success('Department deleted');
        fetchDepartments();
      } catch (error) {
        toast.error('Failed to delete department');
      }
    }
  };

  const handleEdit = (e, dept) => {
    e.stopPropagation();
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description
    });
    setIsModalOpen(true);
  };

  const handleViewEmployees = async (dept) => {
    setViewingDept(dept);
    setIsEmployeesModalOpen(true);
    setEmployeesLoading(true);
    try {
      const res = await api.get(`/employees?department=${dept._id}&limit=100`);
      setDeptEmployees(res.data.employees || []);
    } catch (error) {
      toast.error('Failed to load employees');
    } finally {
      setEmployeesLoading(false);
    }
  };

  const handleMessageClick = (emp) => {
    setSelectedEmployee(emp);
    setMessageContent('');
    setIsMessageModalOpen(true);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    // Simulate sending message API call
    toast.success(`Message sent to ${selectedEmployee?.name}`);
    setIsMessageModalOpen(false);
    setMessageContent('');
  };

  const resetForm = () => {
    setEditingDept(null);
    setFormData({ name: '', description: '' });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Departments</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
        >
          <FiPlus /> Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div 
            key={dept._id} 
            className="card hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleViewEmployees(dept)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                <FiFolder size={24} />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => handleEdit(e, dept)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                >
                  <FiEdit2 />
                </button>
                <button 
                  onClick={(e) => handleDelete(e, dept._id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{dept.name}</h3>
            <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
              {dept.description}
            </p>
            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Employees</span>
              <span className="badge badge-warning">{dept.employeeCount || 0}</span>
            </div>
          </div>
        ))}
        {departments.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
            No departments found. Create one to get started.
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); resetForm(); }} 
        title={editingDept ? "Edit Department" : "Create Department"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => { setIsModalOpen(false); resetForm(); }} 
              className="btn hover:bg-gray-100 border border-gray-300 text-gray-700"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingDept ? 'Update Department' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={isEmployeesModalOpen} 
        onClose={() => setIsEmployeesModalOpen(false)} 
        title={`Employees in ${viewingDept?.name || 'Department'}`}
      >
        <div className="max-h-96 overflow-y-auto pr-2">
          {employeesLoading ? (
            <div className="py-8 text-center text-gray-500">Loading employees...</div>
          ) : deptEmployees.length > 0 ? (
            <div className="space-y-4">
              {deptEmployees.map(emp => (
                <div key={emp._id} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:border-[var(--color-primary)] transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600 text-lg">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg">{emp.name}</h4>
                        <p className="text-sm text-gray-500 font-medium">{emp.designation}</p>
                      </div>
                    </div>
                    <span className={`badge ${emp.status === 'active' ? 'badge-success' : 'badge-danger'} capitalize`}>
                      {emp.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-md">
                    <div>
                      <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Email</span>
                      <a href={`mailto:${emp.email}`} className="text-blue-600 hover:underline">{emp.email}</a>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Phone</span>
                      <span className="text-gray-800">{emp.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Joined</span>
                      <span className="text-gray-800">{emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Action</span>
                      <button 
                        onClick={() => handleMessageClick(emp)}
                        className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline font-medium bg-transparent border-none p-0 cursor-pointer"
                      >
                        <FiMail size={14}/> Message
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              No employees assigned to this department yet.
            </div>
          )}
        </div>
        <div className="pt-4 flex justify-end">
          <button onClick={() => setIsEmployeesModalOpen(false)} className="btn btn-secondary">
            Close
          </button>
        </div>
      </Modal>

      <Modal 
        isOpen={isMessageModalOpen} 
        onClose={() => setIsMessageModalOpen(false)} 
        title={`Send Message to ${selectedEmployee?.name}`}
      >
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              required
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder={`Type your message to ${selectedEmployee?.name}...`}
            ></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsMessageModalOpen(false)} 
              className="btn hover:bg-gray-100 border border-gray-300 text-gray-700"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex items-center gap-2">
              <FiMail size={16} /> Send Message
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Departments;
