import React from 'react';
import { CheckCircle, Building2, GraduationCap, TrendingUp, Award, Calendar, ArrowRight, Mail, PhoneCall } from 'lucide-react';
import { formatINR } from '../../utils/format';

const BENEFITS_UNI = [
  'Turnkey curriculum — AICTE aligned, ready to deploy in 120 days',
  'Complete lab setup support with vendor negotiations',
  'Faculty recruitment assistance and training',
  'Brand association with InnovateR\'s national presence',
  'Improved NAAC score through STEM lab recognition',
  'Access to Robokoshal\'s industry and placement network',
  'Marketing and admissions support for the program',
  'Dedicated program coordinator during launch phase',
];

const BENEFITS_STUDENTS = [
  'Hands-on learning from Day 1 — not textbook-only',
  'Work with industry-grade robots (including Unitree Go2)',
  'Exposure to global competitions (ABU Robocon, RoboCup)',
  'Performance-based internship opportunities',
  'Industry certifications (ROS, Arduino, AI/ML)',
  'Guinness World Record aligned learning initiatives',
  'Placement support targeting ₹8–15 LPA starting packages',
  'Research publication guidance',
];

const TIMELINE = [
  { phase: 'Week 1–2', label: 'MOU & Agreement', desc: 'Sign partnership MOU, finalize revenue sharing', icon: Award },
  { phase: 'Week 3–6', label: 'Approvals & Registration', desc: 'AICTE affiliation, statutory filings', icon: Building2 },
  { phase: 'Week 7–12', label: 'Lab Setup', desc: 'Equipment procurement, installation, testing', icon: GraduationCap },
  { phase: 'Week 13–16', label: 'Faculty & Admissions', desc: 'Faculty recruitment, marketing launch', icon: TrendingUp },
  { phase: 'Week 17–20', label: 'Program Launch', desc: 'First batch enrolled, classes begin', icon: CheckCircle },
];

export default function Partnership() {
  const scrollToContact = () => {
    document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="partnership" className="py-24 bg-white" data-testid="partnership-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-widest font-semibold text-sky-600 mb-3 block">University Partnerships</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4" style={{fontFamily:'Outfit,sans-serif'}}>
            Partner with <span className="gradient-text">InnovateR</span>
          </h2>
          <p className="text-slate-500 text-base max-w-2xl mx-auto">
            Launch a world-class robotics program at your institution with InnovateR's proven framework, curriculum, lab infrastructure, and industry connections.
          </p>
        </div>

        {/* Hero stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          {[
            { value: '120 Days', label: 'Program Launch Time', color: 'sky' },
            { value: '₹2.40Cr', label: 'Year 1 Revenue Potential', color: 'cyan' },
            { value: '90%+', label: 'Target Placement Rate', color: 'sky' },
            { value: '₹53.5L', label: 'One-Time Lab Investment', color: 'orange' },
          ].map(({ value, label, color }) => (
            <div key={label} className="bg-slate-50 rounded-2xl p-5 text-center border border-slate-200 card-hover">
              <div className={`text-2xl font-bold text-${color === 'orange' ? 'orange' : color}-600 mb-1`} style={{fontFamily:'Outfit,sans-serif'}}>{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* University benefits */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-sky-50">
                <Building2 size={20} className="text-sky-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900" style={{fontFamily:'Outfit,sans-serif'}}>What the University Gets</h3>
            </div>
            <ul className="space-y-3">
              {BENEFITS_UNI.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle size={16} className="text-sky-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-600">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Student benefits */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-green-50">
                <GraduationCap size={20} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900" style={{fontFamily:'Outfit,sans-serif'}}>What Students Get</h3>
            </div>
            <ul className="space-y-3">
              {BENEFITS_STUDENTS.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-600">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Revenue model */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 mb-16 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2" style={{fontFamily:'Outfit,sans-serif'}}>Revenue Sharing Model</h3>
            <p className="text-slate-400 text-sm">Transparent, fair, and growth-aligned for all stakeholders</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { label: 'B.Tech IRS', univ: '60%', robo: '40%', partner: null, color: 'sky' },
              { label: 'Diploma', univ: '55%', robo: '45%', partner: null, color: 'cyan' },
              { label: 'Partner Diploma', univ: '50%', robo: '30%', partner: '20%', color: 'orange' },
            ].map(({ label, univ, robo, partner, color }) => (
              <div key={label} className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <h4 className="font-semibold text-sm mb-4 text-slate-200">{label}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">University</span>
                    <span className={`text-sm font-bold text-${color === 'orange' ? 'orange' : color}-400`}>{univ}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Robokoshal</span>
                    <span className="text-sm font-bold text-white">{robo}</span>
                  </div>
                  {partner && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Partner Inst.</span>
                      <span className="text-sm font-bold text-orange-400">{partner}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full bg-${color === 'orange' ? 'orange' : color}-500 rounded-full`}
                    style={{ width: univ }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 mt-6">
            All values adjustable in the <button onClick={() => document.getElementById('finance')?.scrollIntoView({ behavior: 'smooth' })} className="text-sky-400 underline">Finance Dashboard</button>
          </p>
        </div>

        {/* Launch timeline */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-slate-900 text-center mb-8" style={{fontFamily:'Outfit,sans-serif'}}>
            120-Day Launch Timeline
          </h3>
          <div className="relative">
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-sky-100 hidden sm:block" />
            <div className="grid sm:grid-cols-5 gap-4">
              {TIMELINE.map(({ phase, label, desc, icon: Icon }, i) => (
                <div key={phase} className="flex flex-col items-center text-center">
                  <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    i === TIMELINE.length - 1 ? 'bg-sky-500 text-white' : 'bg-white border-2 border-sky-200 text-sky-500'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <div className="text-xs font-semibold text-sky-600 mb-1">{phase}</div>
                  <div className="text-sm font-bold text-slate-800 mb-1" style={{fontFamily:'Outfit,sans-serif'}}>{label}</div>
                  <div className="text-xs text-slate-500">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="bg-gradient-to-r from-sky-50 to-cyan-50 rounded-3xl p-8 border border-sky-100">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2" style={{fontFamily:'Outfit,sans-serif'}}>Ready to Transform Your Institution?</h3>
            <p className="text-slate-500 text-sm">Schedule a presentation or download the full proposal</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:robokoshal@gmail.com?subject=University Partnership Inquiry"
              data-testid="contact-team-btn"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-sky-500 text-white font-semibold text-sm hover:bg-sky-600 transition-all hover:-translate-y-0.5 shadow-md hover:shadow-sky-200"
            >
              <Mail size={16} /> Contact Team
            </a>
            <button
              data-testid="schedule-presentation-btn"
              onClick={() => window.open('mailto:robokoshal@gmail.com?subject=Schedule Presentation Request', '_blank')}
              className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-sky-300 text-sky-700 font-semibold text-sm hover:bg-sky-50 transition-colors"
            >
              <Calendar size={16} /> Schedule Presentation
            </button>
            <button
              data-testid="finance-dashboard-btn"
              onClick={() => document.getElementById('finance')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              <TrendingUp size={16} /> Explore Financials <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
