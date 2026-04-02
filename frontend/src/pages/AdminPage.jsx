import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { formatINR } from '../utils/format';
import { Users, Package, BookOpen, UserCircle, MessageSquare, ArrowLeft, Plus, Trash2, Save, Shield, Edit3, X, Check } from 'lucide-react';

const TABS = [
  { key: 'users', label: 'Users', icon: Users },
  { key: 'team', label: 'Team', icon: UserCircle },
  { key: 'portfolio', label: 'Portfolio', icon: Package },
  { key: 'programs', label: 'Programs', icon: BookOpen },
  { key: 'testimonials', label: 'Testimonials', icon: MessageSquare },
];

const ROLES = ['super_admin', 'team_editor', 'external_viewer'];

function UserRow({ user, onUpdate, onDelete, currentUserId }) {
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState(user.role);
  const [isActive, setIsActive] = useState(user.is_active);

  const save = async () => {
    await onUpdate(user.id, { role, is_active: isActive });
    setEditing(false);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 gap-3" data-testid={`user-row-${user.id}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-sm flex-shrink-0">
          {user.name?.charAt(0) || '?'}
        </div>
        <div className="min-w-0">
          <div className="font-medium text-slate-800 text-sm truncate">{user.name}</div>
          <div className="text-xs text-slate-400 truncate">{user.email}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {editing ? (
          <>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-400">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button onClick={() => setIsActive(!isActive)}
              className={`px-2 py-1 rounded-lg text-xs ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {isActive ? 'Active' : 'Disabled'}
            </button>
            <button onClick={save} className="p-1.5 bg-sky-500 text-white rounded-lg"><Check size={13} /></button>
            <button onClick={() => setEditing(false)} className="p-1.5 bg-slate-100 rounded-lg"><X size={13} /></button>
          </>
        ) : (
          <>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
              user.role === 'team_editor' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'
            }`}>{user.role}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${user.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
              {user.is_active ? 'Active' : 'Disabled'}
            </span>
            {user.id !== currentUserId && (
              <>
                <button onClick={() => setEditing(true)} className="p-1.5 text-slate-400 hover:text-sky-600"><Edit3 size={14} /></button>
                <button onClick={() => onDelete(user.id)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AddUserForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'team_editor' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      onAdd(data);
      setForm({ name: '', email: '', password: '', role: 'team_editor' });
      setOpen(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create user');
    } finally { setLoading(false); }
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} data-testid="add-user-btn"
      className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-semibold hover:bg-sky-600">
      <Plus size={15} /> Add User
    </button>
  );

  return (
    <form onSubmit={submit} className="bg-sky-50 rounded-xl border border-sky-200 p-5 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input required placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-sky-400" />
        <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-sky-400" />
        <input required type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-sky-400" />
        <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-sky-400">
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-semibold">
          {loading ? 'Creating...' : 'Create User'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm">Cancel</button>
      </div>
    </form>
  );
}

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const loadData = async (tab) => {
    setLoading(true);
    try {
      let res;
      if (tab === 'users') res = await api.get('/users');
      else if (tab === 'team') res = await api.get('/team');
      else if (tab === 'portfolio') res = await api.get('/portfolio');
      else if (tab === 'programs') res = await api.get('/programs');
      else if (tab === 'testimonials') res = await api.get('/testimonials');
      setData(prev => ({ ...prev, [tab]: res.data }));
    } catch (e) {}
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(activeTab); }, [activeTab]);

  const handleUpdateUser = async (id, updates) => {
    await api.put(`/users/${id}`, updates);
    loadData('users');
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Delete this user?')) {
      await api.delete(`/users/${id}`);
      loadData('users');
    }
  };

  const handleDeleteTeam = async (id) => {
    if (window.confirm('Delete this team member?')) {
      await api.delete(`/team/${id}`);
      loadData('team');
    }
  };

  const handleDeletePortfolio = async (id) => {
    if (window.confirm('Delete this portfolio item?')) {
      await api.delete(`/portfolio/${id}`);
      loadData('portfolio');
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (window.confirm('Delete this testimonial?')) {
      await api.delete(`/testimonials/${id}`);
      loadData('testimonials');
    }
  };

  const tabData = data[activeTab] || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-sky-600 text-sm" data-testid="back-to-site">
              <ArrowLeft size={16} /> Back to Site
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-sky-500" />
              <h1 className="font-bold text-slate-900 text-sm" style={{fontFamily:'Outfit,sans-serif'}}>Admin Panel</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:block">{user?.email}</span>
            <button onClick={() => { logout(); navigate('/'); }} data-testid="admin-logout-btn"
              className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-3 sticky top-24">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  data-testid={`admin-tab-${key}`}
                  onClick={() => setActiveTab(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all ${
                    activeTab === key ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900" style={{fontFamily:'Outfit,sans-serif'}}>
                  Manage {TABS.find(t => t.key === activeTab)?.label}
                </h2>
                {activeTab === 'users' && <AddUserForm onAdd={() => loadData('users')} />}
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full" />
                </div>
              ) : (
                <>
                  {/* Users tab */}
                  {activeTab === 'users' && (
                    <div className="space-y-3" data-testid="users-list">
                      {tabData.map(u => (
                        <UserRow key={u.id} user={u} onUpdate={handleUpdateUser} onDelete={handleDeleteUser} currentUserId={user?.id} />
                      ))}
                    </div>
                  )}

                  {/* Team tab */}
                  {activeTab === 'team' && (
                    <div className="space-y-3" data-testid="team-list">
                      {tabData.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold">
                              {member.name?.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-slate-800 text-sm">{member.name}</div>
                              <div className="text-xs text-slate-500">{member.role}</div>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteTeam(member.id)} className="p-1.5 text-slate-400 hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Portfolio tab */}
                  {activeTab === 'portfolio' && (
                    <div className="space-y-3" data-testid="portfolio-list">
                      {tabData.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex items-center gap-3">
                            {item.image_url && (
                              <img src={item.image_url} alt={item.title} className="w-12 h-12 rounded-lg object-cover" />
                            )}
                            <div>
                              <div className="font-medium text-slate-800 text-sm">{item.title}</div>
                              <div className="text-xs text-slate-500">{item.category} · {item.level}</div>
                            </div>
                          </div>
                          <button onClick={() => handleDeletePortfolio(item.id)} className="p-1.5 text-slate-400 hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Programs tab */}
                  {activeTab === 'programs' && (
                    <div className="space-y-4" data-testid="programs-list">
                      {tabData.map((prog) => (
                        <div key={prog.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="font-bold text-slate-800">{prog.name}</div>
                              <div className="text-xs text-sky-600">{prog.program_type} · {prog.duration} · {prog.total_seats} seats</div>
                            </div>
                            <span className="px-2.5 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-medium">
                              {formatINR(prog.year1_fee)}/yr
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2">{prog.description}</p>
                          <p className="text-xs text-amber-600 mt-2">Edit program details in the Finance Dashboard or Programs section on the main site.</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Testimonials tab */}
                  {activeTab === 'testimonials' && (
                    <div className="space-y-3" data-testid="testimonials-list">
                      {tabData.map((t) => (
                        <div key={t.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0 pr-4">
                              <p className="text-sm text-slate-600 italic mb-2">"{t.quote}"</p>
                              <div className="text-xs font-semibold text-slate-800">{t.author}</div>
                              <div className="text-xs text-slate-500">{t.role} · {t.organization}</div>
                            </div>
                            <button onClick={() => handleDeleteTestimonial(t.id)} className="p-1.5 text-slate-400 hover:text-red-500 flex-shrink-0">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {tabData.length === 0 && !loading && (
                    <div className="text-center py-12 text-slate-400">
                      <Package size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No items found</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
