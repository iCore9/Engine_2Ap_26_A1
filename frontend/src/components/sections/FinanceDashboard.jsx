import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';
import { formatINR, formatINRFull, calculateFinance } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { Save, RotateCcw, Info, TrendingUp, TrendingDown, DollarSign, Target, Users, Percent } from 'lucide-react';
import { Slider } from '../ui/slider';

const PROGRAMS = [
  { key: 'btech', label: 'B.Tech IRS', duration: 4, color: '#0EA5E9' },
  { key: 'diploma', label: 'Diploma', duration: 2, color: '#06B6D4' },
  { key: 'partner_diploma', label: 'Partner Diploma', duration: 2, color: '#F97316' },
];

const PIE_COLORS = ['#0EA5E9', '#06B6D4', '#F97316', '#64748B'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-slate-800 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {formatINR(p.value)}
        </p>
      ))}
    </div>
  );
};

function StatCard({ title, value, sub, icon: Icon, color = 'sky', positive }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-4 shadow-sm`} data-testid={`stat-${title.toLowerCase().replace(/ /g, '-')}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-1">{title}</p>
          <p className={`text-xl font-bold text-${color === 'orange' ? 'orange' : color}-600 font-outfit`}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
        {Icon && (
          <div className={`p-2 rounded-xl bg-${color === 'orange' ? 'orange' : color}-50`}>
            <Icon size={18} className={`text-${color === 'orange' ? 'orange' : color}-500`} />
          </div>
        )}
      </div>
      {positive !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
          {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {positive ? 'Profitable' : 'Loss'}
        </div>
      )}
    </div>
  );
}

export default function FinanceDashboard() {
  const { isEditor } = useAuth();
  const [activeProgram, setActiveProgram] = useState('btech');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    Promise.all(PROGRAMS.map(p => api.get(`/finance/${p.key}`)))
      .then(results => {
        const data = {};
        PROGRAMS.forEach((p, i) => { data[p.key] = results[i].data; });
        setSettings(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const current = settings[activeProgram] || {};
  const prog = PROGRAMS.find(p => p.key === activeProgram);
  const calc = Object.keys(current).length ? calculateFinance(current, activeProgram) : null;

  const update = (key, value) => {
    setSettings(prev => ({ ...prev, [activeProgram]: { ...prev[activeProgram], [key]: value } }));
    setDirty(true);
  };

  const updateOpex = (idx, field, value) => {
    const items = [...(current.opex_items || [])];
    items[idx] = { ...items[idx], [field]: field === 'amount' ? Number(value) : value };
    update('opex_items', items);
  };

  const handleSave = async () => {
    if (!isEditor) return;
    setSaving(true);
    try {
      await api.put(`/finance/${activeProgram}`, current);
      setSaved(true); setDirty(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {} finally { setSaving(false); }
  };

  const syncShares = (field, value) => {
    const numVal = Number(value);
    if (activeProgram === 'partner_diploma') {
      update(field, numVal);
    } else {
      if (field === 'university_share') {
        update('university_share', numVal);
        update('robokoshal_share', Math.max(0, 100 - numVal));
      } else {
        update('robokoshal_share', numVal);
        update('university_share', Math.max(0, 100 - numVal));
      }
    }
    setDirty(true);
  };

  if (loading) return (
    <section id="finance" className="py-24 bg-white flex justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full mt-16" />
    </section>
  );

  const yearlyData = calc?.yearlyData || [];
  const pieData = [
    { name: 'University', value: calc?.totalUniv || 0 },
    { name: 'Robokoshal', value: calc?.totalRobo || 0 },
    ...(activeProgram === 'partner_diploma' ? [{ name: 'Partner', value: calc?.totalPartner || 0 }] : []),
  ].filter(d => d.value > 0);

  return (
    <section id="finance" className="py-24 bg-white" data-testid="finance-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest font-semibold text-sky-600 mb-3 block">Strategic Finance</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4" style={{fontFamily:'Outfit,sans-serif'}}>
            Finance <span className="gradient-text">Dashboard</span>
          </h2>
          <p className="text-slate-500 text-base max-w-2xl mx-auto">
            Interactive financial simulator for all three programs. Adjust assumptions and see instant projections.
          </p>
        </div>

        {/* Program selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {PROGRAMS.map(({ key, label, color }) => (
            <button
              key={key}
              data-testid={`finance-tab-${key}`}
              onClick={() => { setActiveProgram(key); setDirty(false); }}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold border-2 transition-all ${
                activeProgram === key
                  ? 'bg-sky-500 text-white border-sky-500 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Inputs panel */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm" style={{fontFamily:'Outfit,sans-serif'}}>Assumptions & Inputs</h3>
              {isEditor && dirty && (
                <button
                  data-testid="save-finance-btn"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 text-white rounded-lg text-xs font-semibold hover:bg-sky-600"
                >
                  <Save size={12} /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
                </button>
              )}
            </div>

            {/* Seats */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 flex items-center gap-1"><Users size={12} />Total Seats</span>
                <input type="number" value={current.total_seats || 60} min={1} max={300}
                  onChange={e => update('total_seats', Number(e.target.value))}
                  className="w-16 text-right border border-slate-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>
              <Slider value={[current.total_seats || 60]} min={10} max={300} step={10}
                onValueChange={([v]) => update('total_seats', v)} />
            </div>

            {/* Conversion rate */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 flex items-center gap-1"><Percent size={12} />Admission Conversion %</span>
                <input type="number" value={current.conversion_rate || 100} min={0} max={100}
                  onChange={e => update('conversion_rate', Number(e.target.value))}
                  className="w-16 text-right border border-slate-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>
              <Slider value={[current.conversion_rate || 100]} min={0} max={100} step={5}
                onValueChange={([v]) => update('conversion_rate', v)} />
            </div>

            {/* Year 1 Fee */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Year 1 Fee (₹)</span>
                <input type="number" value={current.year1_fee || 0}
                  onChange={e => update('year1_fee', Number(e.target.value))}
                  className="w-24 text-right border border-slate-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>
              <Slider value={[current.year1_fee || 0]} min={50000} max={500000} step={5000}
                onValueChange={([v]) => update('year1_fee', v)} />
            </div>

            {/* University share */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">University Share %</span>
                <input type="number" value={current.university_share || 60} min={0} max={100}
                  onChange={e => syncShares('university_share', e.target.value)}
                  className="w-16 text-right border border-slate-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>
              <Slider value={[current.university_share || 60]} min={0} max={100} step={5}
                onValueChange={([v]) => syncShares('university_share', v)} />
            </div>

            {/* Robokoshal share */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 text-brand-blue">Robokoshal Share %</span>
                <input type="number" value={current.robokoshal_share || 40} min={0} max={100}
                  onChange={e => syncShares('robokoshal_share', e.target.value)}
                  className="w-16 text-right border border-slate-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>
              <Slider value={[current.robokoshal_share || 40]} min={0} max={100} step={5}
                onValueChange={([v]) => syncShares('robokoshal_share', v)} />
            </div>

            {activeProgram === 'partner_diploma' && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-orange-600">Partner Share %</span>
                  <input type="number" value={current.partner_share || 20} min={0} max={100}
                    onChange={e => update('partner_share', Number(e.target.value))}
                    className="w-16 text-right border border-slate-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                </div>
                <Slider value={[current.partner_share || 20]} min={0} max={100} step={5}
                  onValueChange={([v]) => update('partner_share', v)} />
                {(current.university_share || 0) + (current.robokoshal_share || 0) + (current.partner_share || 0) !== 100 && (
                  <p className="text-xs text-orange-500 mt-1 flex items-center gap-1"><Info size={11} />Shares must total 100%</p>
                )}
              </div>
            )}

            {/* Scholarship */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Scholarship / Discount %</span>
                <input type="number" value={current.scholarship_pct || 0} min={0} max={50}
                  onChange={e => update('scholarship_pct', Number(e.target.value))}
                  className="w-16 text-right border border-slate-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>
              <Slider value={[current.scholarship_pct || 0]} min={0} max={50} step={1}
                onValueChange={([v]) => update('scholarship_pct', v)} />
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-5">
            {calc && (
              <>
                {/* Key metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard title="Gross Revenue" value={formatINR(calc.totalGross)} sub={`${prog?.duration}yr total`} icon={DollarSign} color="sky" />
                  <StatCard title="Robokoshal Revenue" value={formatINR(calc.totalRobo)} sub="Net share" icon={TrendingUp} color="sky" />
                  <StatCard title="Total OPEX" value={formatINR(calc.totalOpex)} sub="All years" icon={Target} color="cyan" />
                  <StatCard title="Total EBITDA" value={formatINR(calc.totalEbitda)} sub="Robokoshal net" icon={DollarSign} color={calc.totalEbitda >= 0 ? 'sky' : 'orange'} positive={calc.totalEbitda >= 0} />
                </div>

                {/* Bar chart */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h4 className="text-sm font-semibold text-slate-800 mb-4" style={{fontFamily:'Outfit,sans-serif'}}>Year-wise Revenue Breakdown</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={yearlyData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => formatINR(v)} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="universityRevenue" name="University" fill="#0EA5E9" radius={[3,3,0,0]} stackId="a" />
                      <Bar dataKey="robokoshalRevenue" name="Robokoshal" fill="#06B6D4" radius={[3,3,0,0]} stackId="a" />
                      {activeProgram === 'partner_diploma' && (
                        <Bar dataKey="partnerRevenue" name="Partner" fill="#F97316" radius={[3,3,0,0]} stackId="a" />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* EBITDA trend + Pie */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200 p-4">
                    <h4 className="text-sm font-semibold text-slate-800 mb-3" style={{fontFamily:'Outfit,sans-serif'}}>EBITDA Trend</h4>
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart data={yearlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => formatINR(v)} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="ebitda" name="EBITDA" stroke="#0EA5E9" strokeWidth={2.5} dot={{ r: 4, fill: '#0EA5E9' }} />
                        <Line type="monotone" dataKey="robokoshalRevenue" name="Robo Revenue" stroke="#06B6D4" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 p-4">
                    <h4 className="text-sm font-semibold text-slate-800 mb-3" style={{fontFamily:'Outfit,sans-serif'}}>Revenue Share</h4>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65}
                          dataKey="value" paddingAngle={3}>
                          {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                        <Tooltip formatter={(v) => formatINR(v)} />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* P&L summary */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 overflow-x-auto">
                  <h4 className="text-sm font-semibold text-slate-800 mb-4" style={{fontFamily:'Outfit,sans-serif'}}>P&L Summary by Year</h4>
                  <table className="w-full text-xs" data-testid="pl-table">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-100">
                        <th className="text-left pb-2">Item</th>
                        {yearlyData.map(y => <th key={y.year} className="text-right pb-2">{y.year}</th>)}
                        <th className="text-right pb-2 font-semibold text-slate-600">Total</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      {[
                        { label: 'Gross Revenue', key: 'grossRevenue', bold: false },
                        { label: 'University Share', key: 'universityRevenue', bold: false },
                        { label: 'Robokoshal Revenue', key: 'robokoshalRevenue', bold: true },
                        { label: 'Annual OPEX', key: 'annualOpex', bold: false, neg: true },
                        { label: 'EBITDA', key: 'ebitda', bold: true, isEbitda: true },
                      ].map(row => (
                        <tr key={row.label} className="border-b border-slate-50 last:border-0">
                          <td className={`py-2 ${row.bold ? 'font-semibold text-sky-700' : ''}`}>{row.label}</td>
                          {yearlyData.map(y => (
                            <td key={y.year} className={`text-right py-2 ${row.isEbitda ? (y.ebitda >= 0 ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold') : row.neg ? 'text-red-400' : ''}`}>
                              {formatINR(y[row.key])}
                            </td>
                          ))}
                          <td className={`text-right py-2 font-semibold ${row.isEbitda ? (calc.totalEbitda >= 0 ? 'text-green-600' : 'text-red-500') : 'text-slate-700'}`}>
                            {formatINR(yearlyData.reduce((s, y) => s + y[row.key], 0))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* OPEX breakdown */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h4 className="text-sm font-semibold text-slate-800 mb-4" style={{fontFamily:'Outfit,sans-serif'}}>
                    Annual OPEX — {formatINR(calc.annualOpexTotal)} / year
                  </h4>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {(current.opex_items || []).map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <input
                            value={item.name}
                            onChange={e => updateOpex(i, 'name', e.target.value)}
                            className="text-xs text-slate-700 font-medium bg-transparent w-full focus:outline-none"
                            readOnly={!isEditor}
                          />
                          <div className="text-xs text-slate-400">{item.category}</div>
                        </div>
                        <input
                          type="number"
                          value={item.amount}
                          onChange={e => updateOpex(i, 'amount', e.target.value)}
                          className="w-28 text-right border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                          readOnly={!isEditor}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-700">Total Annual OPEX</span>
                    <span className="text-sm font-bold text-sky-700">{formatINRFull(calc.annualOpexTotal)}</span>
                  </div>
                </div>

                {/* Quick facts */}
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-sky-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-sky-600 mb-0.5">Effective Students</div>
                    <div className="text-lg font-bold text-sky-700">{calc.effectiveStudents}</div>
                  </div>
                  <div className="bg-cyan-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-cyan-600 mb-0.5">Break-even Students</div>
                    <div className="text-lg font-bold text-cyan-700">{calc.breakEvenStudents}</div>
                  </div>
                  <div className={`rounded-xl p-3 text-center ${calc.totalEbitda >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className={`text-xs mb-0.5 ${calc.totalEbitda >= 0 ? 'text-green-600' : 'text-red-500'}`}>Net EBITDA ({prog?.duration}yr)</div>
                    <div className={`text-lg font-bold ${calc.totalEbitda >= 0 ? 'text-green-700' : 'text-red-600'}`}>{formatINR(calc.totalEbitda)}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
