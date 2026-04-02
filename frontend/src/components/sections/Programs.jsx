import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { formatINR } from '../../utils/format';
import { GraduationCap, Clock, Users, IndianRupee, ChevronDown, ChevronUp, BookOpen, Target, Briefcase, CheckCircle } from 'lucide-react';

const PROGRAM_TYPES = [
  { key: 'btech', label: 'B.Tech IRS', color: 'sky', icon: GraduationCap },
  { key: 'diploma', label: 'Diploma', color: 'cyan', icon: BookOpen },
  { key: 'partner_diploma', label: 'Partner Diploma', color: 'orange', icon: Briefcase },
];

const BTECH_SEMESTERS = [
  { sem: 'Sem 1-2', label: 'Foundation', items: ['Engineering Mathematics', 'Physics & Chemistry', 'Computer Programming (C/Python)', 'Electronics Fundamentals', 'Introduction to Robotics'] },
  { sem: 'Sem 3-4', label: 'Core Robotics', items: ['Microcontrollers & Embedded Systems', 'Arduino & Raspberry Pi Programming', 'Sensor Systems & Actuators', 'Robot Mechanics & Kinematics', 'Control Systems'] },
  { sem: 'Sem 5-6', label: 'Advanced Systems', items: ['ROS (Robot Operating System)', 'Computer Vision & Image Processing', 'Machine Learning Fundamentals', 'Autonomous Navigation', 'AI for Robotics'] },
  { sem: 'Sem 7-8', label: 'Intelligent Systems', items: ['Intelligent Robotic Systems Design', 'Deep Learning & Neural Networks', 'Swarm Robotics', 'Industry Capstone Project', 'Research Publication'] },
];

function AccordionItem({ title, items, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 hover:bg-sky-50 transition-colors text-left"
      >
        <span className="font-semibold text-slate-800 text-sm" style={{fontFamily:'Outfit,sans-serif'}}>{title}</span>
        {open ? <ChevronUp size={16} className="text-sky-500" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {open && (
        <div className="px-5 py-4 bg-white">
          <ul className="space-y-1.5">
            {items.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle size={14} className="text-sky-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Programs() {
  const [activeProgram, setActiveProgram] = useState('btech');
  const [programs, setPrograms] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(PROGRAM_TYPES.map(p => api.get(`/programs/${p.key}`)))
      .then(results => {
        const data = {};
        PROGRAM_TYPES.forEach((p, i) => { data[p.key] = results[i].data; });
        setPrograms(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const prog = programs[activeProgram] || {};

  const totalFee = (prog.year1_fee || 0) + (prog.year2_fee || 0) + (prog.year3_fee || 0) + (prog.year4_fee || 0);

  return (
    <section id="programs" className="py-24 bg-slate-50" data-testid="programs-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest font-semibold text-sky-600 mb-3 block">Academic Programs</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4" style={{fontFamily:'Outfit,sans-serif'}}>
            Our <span className="gradient-text">Programs</span>
          </h2>
          <p className="text-slate-500 text-base max-w-2xl mx-auto">
            Comprehensive robotics and AI programs designed for Indian universities, aligned with AICTE norms and NEP 2020.
          </p>
        </div>

        {/* Program tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {PROGRAM_TYPES.map(({ key, label, color, icon: Icon }) => (
            <button
              key={key}
              data-testid={`program-tab-${key}`}
              onClick={() => setActiveProgram(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border-2 transition-all ${
                activeProgram === key
                  ? `bg-${color === 'orange' ? 'orange' : color}-500 text-white border-${color === 'orange' ? 'orange' : color}-500 shadow-md`
                  : `bg-white text-slate-600 border-slate-200 hover:border-${color === 'orange' ? 'orange' : color}-300`
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full" /></div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8" data-testid={`program-content-${activeProgram}`}>
            {/* Main info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900 mb-2" style={{fontFamily:'Outfit,sans-serif'}}>{prog.name}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">{prog.description}</p>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { icon: Clock, label: 'Duration', value: prog.duration || '–' },
                    { icon: BookOpen, label: 'Semesters', value: prog.semesters || '–' },
                    { icon: Users, label: 'Total Seats', value: prog.total_seats || '–' },
                    { icon: IndianRupee, label: 'Total Fee', value: formatINR(totalFee) },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                      <Icon size={18} className="text-sky-500 mx-auto mb-1" />
                      <div className="text-lg font-bold text-slate-900" style={{fontFamily:'Outfit,sans-serif'}}>{value}</div>
                      <div className="text-xs text-slate-400">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Year-wise fees */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Year-wise Fee Structure</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[prog.year1_fee, prog.year2_fee, prog.year3_fee, prog.year4_fee].filter(Boolean).map((fee, i) => (
                      <div key={i} className="bg-sky-50 rounded-lg p-2.5 text-center">
                        <div className="text-xs text-sky-600 font-medium mb-0.5">Year {i + 1}</div>
                        <div className="text-sm font-bold text-sky-800">{formatINR(fee)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Eligibility */}
                {prog.eligibility && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    <span className="font-semibold">Eligibility: </span>{prog.eligibility}
                  </div>
                )}
              </div>

              {/* Curriculum (B.Tech only) */}
              {activeProgram === 'btech' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h4 className="text-lg font-bold text-slate-900 mb-4" style={{fontFamily:'Outfit,sans-serif'}}>
                    Curriculum Structure
                  </h4>
                  <div className="space-y-3">
                    {BTECH_SEMESTERS.map((sem, i) => (
                      <AccordionItem key={sem.sem} title={`${sem.sem} — ${sem.label}`} items={sem.items} defaultOpen={i === 0} />
                    ))}
                  </div>
                </div>
              )}

              {/* Key Modules */}
              {activeProgram !== 'btech' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h4 className="text-lg font-bold text-slate-900 mb-4" style={{fontFamily:'Outfit,sans-serif'}}>Key Modules</h4>
                  <div className="space-y-2">
                    {(prog.key_modules || []).map((module, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 text-xs font-bold">{i + 1}</div>
                        <span className="text-sm text-slate-700">{module}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Learning outcomes */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Target size={18} className="text-sky-500" />
                  <h4 className="font-bold text-slate-900 text-sm" style={{fontFamily:'Outfit,sans-serif'}}>Learning Outcomes</h4>
                </div>
                <ul className="space-y-2">
                  {(prog.learning_outcomes || []).map((outcome, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle size={13} className="text-green-500 flex-shrink-0 mt-0.5" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Career pathways */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase size={18} className="text-orange-500" />
                  <h4 className="font-bold text-slate-900 text-sm" style={{fontFamily:'Outfit,sans-serif'}}>Career Pathways</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(prog.career_pathways || []).map((path, i) => (
                    <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium border border-orange-200">
                      {path}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-sky-500 to-cyan-500 rounded-2xl p-5 text-white">
                <h4 className="font-bold mb-2" style={{fontFamily:'Outfit,sans-serif'}}>Ready to Partner?</h4>
                <p className="text-xs text-sky-100 mb-4">Launch this program at your institution with InnovateR's complete support.</p>
                <button
                  data-testid="request-demo-btn"
                  onClick={() => document.getElementById('partnership')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full py-2.5 bg-white text-sky-700 rounded-xl text-sm font-semibold hover:bg-sky-50 transition-colors"
                >
                  Request Partnership Demo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
