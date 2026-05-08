import { useState, useEffect } from 'react';
import { announcementService } from '../services/announcementService';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiSpeaker } from 'react-icons/fi';

const Announcements = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

  const fetchAnnouncements = async () => {
    try {
      const data = await announcementService.getAllAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await announcementService.createAnnouncement(formData);
      toast.success('Announcement created');
      setIsModalOpen(false);
      fetchAnnouncements();
      setFormData({ title: '', description: '', priority: 'medium' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create announcement');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await announcementService.deleteAnnouncement(id);
        toast.success('Announcement deleted');
        fetchAnnouncements();
      } catch (error) {
        toast.error('Failed to delete announcement');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high':
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Company Announcements</h1>
          <p className="text-gray-600">Stay up to date with the latest news</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <FiPlus /> New Announcement
          </button>
        )}
      </div>

      <div className="space-y-4">
        {announcements.map((item) => (
          <div key={item._id} className="card relative overflow-hidden group">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${getPriorityColor(item.priority)}`}>
                <FiSpeaker size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete(item._id)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-500 mb-2 mt-1 flex items-center gap-2">
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className={`px-2 py-0.5 rounded-full capitalize ${getPriorityColor(item.priority)}`}>
                    {item.priority} priority
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
        
        {announcements.length === 0 && (
          <div className="card text-center py-12">
            <FiSpeaker size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No announcements available right now.</p>
          </div>
        )}
      </div>

      {isAdmin && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Announcement">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Announcement Title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                required
                rows="5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Type the announcement message..."
              ></textarea>
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn hover:bg-gray-100 border border-gray-300 text-gray-700">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Post Announcement
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Announcements;
