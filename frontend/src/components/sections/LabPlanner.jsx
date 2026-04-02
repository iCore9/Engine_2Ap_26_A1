import React, { useEffect, useState, useMemo } from 'react';
import api from '../../utils/api';
import { formatINR, formatINRFull } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Plus, Trash2, Save, Package, Zap, ChevronDown, ChevronUp } from 'lucide-react';

const PRESETS = ['lean', 'recommended', 'flagship'];
const PRESET_COLORS = { lean: 'green', recommended: 'sky', flagship: 'purple' };
const NECESSITY_COLORS = { 'must-have': 'bg-green-100 text-green-700', 'recommended': 'bg-sky-100 text-sky-700', 'optional': 'bg-slate-100 text-slate-600' };
const CHART_COLORS = ['#0EA5E9', '#06B6D4', '#F97316', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#64748B'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-slate-800 mb-1">{label}</p>
      <p className="text-sky-600">{formatINR(payload[0]?.value)}</p>
    </div>
  );
};

export default function LabPlanner() {
  const { isEditor } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePreset, setActivePreset] = useState('recommended');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openCats, setOpenCats] = useState({});

  useEffect(() => {
    api.get('/lab-planner').then(r => setItems(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
    if (activePreset === 'lean') return items.filter(i => i.preset === 'lean');
    if (activePreset === 'recommended') return items.filter(i => ['lean', 'recommended'].includes(i.preset));
    return items;
  }, [items, activePreset]);

  const categories = useMemo(() => {
    const cats = {};
    filteredItems.forEach(item => {
      if (!cats[item.category]) cats[item.category] = [];
      cats[item.category].push(item);
    });
    return cats;
  }, [filteredItems]);

  const totalCapex = filteredItems.filter(i => !i.is_recurring).reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const totalRecurring = filteredItems.filter(i => i.is_recurring).reduce((s, i) => s + i.quantity * i.unit_price, 0);

  const chartData = useMemo(() =>
    Object.entries(categories).map(([cat, catItems]) => ({
      name: cat.split(' ')[0],
      fullName: cat,
      value: catItems.filter(i => !i.is_recurring).reduce((s, i) => s + i.quantity * i.unit_price, 0),
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value),
    [categories]
  );

  const updateItem = (id, field, value) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: field === 'quantity' || field === 'unit_price' ? Number(value) : value } : item
    ));
  };

  const handleSave = async () => {
    if (!isEditor) return;
    setSaving(true);
    try {
      const saveItems = items.map(({ id, ...rest }) => ({ ...rest, id }));
      await api.put('/lab-planner/bulk', saveItems);
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e) {} finally { setSaving(false); }
  };

  const toggleCat = (cat) => setOpenCats(prev => ({ ...prev, [cat]: !prev[cat] }));

  if (loading) return (
    <section id="lab-planner" className="py-24 bg-slate-50 flex justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full mt-16" />
    </section>
  );

  return (
    <section id="lab-planner" className="py-24 bg-slate-50" data-testid="lab-planner-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest font-semibold text-sky-600 mb-3 block">Infrastructure</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4" style={{fontFamily:'Outfit,sans-serif'}}>
            Robotics Lab <span className="gradient-text">Setup Planner</span>
          </h2>
          <p className="text-slate-500 text-base max-w-2xl mx-auto">
            Interactive lab configuration tool. Select a preset and customize items to plan your robotics lab investment.
          </p>
        </div>

        {/* Preset selector + save - ALWAYS VISIBLE */}
        <div className="sticky top-16 z-40 bg-slate-50/95 backdrop-blur-sm pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              {PRESETS.map(preset => (
                <button
                  key={preset}
                  data-testid={`preset-${preset}`}
                  onClick={() => setActivePreset(preset)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border-2 capitalize transition-all ${
                    activePreset === preset
                      ? `bg-${PRESET_COLORS[preset]}-500 text-white border-${PRESET_COLORS[preset]}-500 shadow-md`
                      : `bg-white text-slate-600 border-slate-200 hover:border-${PRESET_COLORS[preset]}-300`
                  }`}
                >
                  {preset === 'lean' && <Package size={14} />}
                  {preset === 'flagship' && <Zap size={14} />}
                  {preset.charAt(0).toUpperCase() + preset.slice(1)}
                </button>
              ))}
            </div>
            {isEditor && (
              <button
                data-testid="save-lab-btn"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-full text-sm font-semibold hover:bg-sky-600 transition-colors"
              >
                <Save size={14} /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          {/* Categories */}
          <div className="lg:col-span-2 space-y-3">
            {Object.entries(categories).map(([cat, catItems]) => {
              const catTotal = catItems.filter(i => !i.is_recurring).reduce((s, i) => s + i.quantity * i.unit_price, 0);
              const isOpen = openCats[cat] !== false; // default open
              return (
                <div key={cat} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" data-testid={`lab-category-${cat.toLowerCase().replace(/ /g, '-')}`}>
                  <button
                    onClick={() => toggleCat(cat)}
                    className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-sky-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-800 text-sm" style={{fontFamily:'Outfit,sans-serif'}}>{cat}</span>
                      <span className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full text-xs font-medium">
                        {catItems.length} items
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-sky-700">{formatINR(catTotal)}</span>
                      {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="divide-y divide-slate-50">
                      {catItems.map((item) => (
                        <div key={item.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm text-slate-700 font-medium truncate">{item.name}</span>
                              <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs ${NECESSITY_COLORS[item.necessity]}`}>
                                {item.necessity}
                              </span>
                              {item.is_recurring && (
                                <span className="flex-shrink-0 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">Annual</span>
                              )}
                            </div>
                            {item.comments && <p className="text-xs text-slate-400 truncate">{item.comments}</p>}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="text-xs text-slate-500">Qty:</div>
                            <input
                              type="number"
                              value={item.quantity}
                              min={1}
                              onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                              className="w-12 text-center border border-slate-200 rounded-lg px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                            />
                            <div className="text-xs text-slate-500">@</div>
                            <input
                              type="number"
                              value={item.unit_price}
                              min={0}
                              onChange={e => updateItem(item.id, 'unit_price', e.target.value)}
                              className="w-28 text-right border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                            />
                            <div className="text-sm font-semibold text-sky-700 w-24 text-right">
                              {formatINR(item.quantity * item.unit_price)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary sidebar */}
          <div className="space-y-4">
            {/* Cost summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm" data-testid="lab-cost-summary">
              <h3 className="font-bold text-slate-900 mb-4 text-sm" style={{fontFamily:'Outfit,sans-serif'}}>
                Cost Summary — {activePreset.charAt(0).toUpperCase() + activePreset.slice(1)} Setup
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-600">Total CapEx (One-time)</span>
                  <span className="font-bold text-sky-700 text-sm">{formatINR(totalCapex)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-600">Annual Recurring</span>
                  <span className="font-semibold text-amber-600 text-sm">{formatINR(totalRecurring)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-600">Total Items</span>
                  <span className="font-semibold text-slate-700 text-sm">{filteredItems.length}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-bold text-slate-800">Total Investment</span>
                  <span className="text-lg font-bold text-sky-700">{formatINR(totalCapex + totalRecurring)}</span>
                </div>
              </div>

              {/* Preset comparison */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 font-semibold mb-2">Preset Comparison</p>
                {PRESETS.map(p => {
                  const presetItems = p === 'lean' ? items.filter(i => i.preset === 'lean') :
                    p === 'recommended' ? items.filter(i => ['lean','recommended'].includes(i.preset)) : items;
                  const total = presetItems.filter(i => !i.is_recurring).reduce((s, i) => s + i.quantity * i.unit_price, 0);
                  return (
                    <div key={p} className={`flex justify-between items-center py-1.5 px-2 rounded-lg mb-1 ${activePreset === p ? 'bg-sky-50' : ''}`}>
                      <span className={`text-xs capitalize font-medium ${activePreset === p ? 'text-sky-700' : 'text-slate-500'}`}>{p}</span>
                      <span className={`text-xs font-bold ${activePreset === p ? 'text-sky-700' : 'text-slate-500'}`}>{formatINR(total)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-800 mb-3" style={{fontFamily:'Outfit,sans-serif'}}>Cost by Category</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={v => formatINR(v)} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={55} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0,3,3,0]}>
                    {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Lab image context */}
            <div className="bg-gradient-to-br from-sky-500 to-cyan-600 rounded-2xl p-5 text-white">
              <h4 className="font-bold mb-2 text-sm" style={{fontFamily:'Outfit,sans-serif'}}>InnovateR Lab Standard</h4>
              <p className="text-xs text-sky-100 mb-3">Based on the recommended preset, your lab will match InnovateR's certified lab quality — as deployed at partner institutions.</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/10 rounded-lg p-2">
                  <div className="font-semibold">{formatINR(totalCapex)}</div>
                  <div className="text-sky-200">One-time setup</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2">
                  <div className="font-semibold">{formatINR(totalRecurring)}</div>
                  <div className="text-sky-200">Annual costs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
