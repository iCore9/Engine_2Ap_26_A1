import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, BarChart3, FlaskConical, Building2, ChevronDown } from 'lucide-react';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_key-3/artifacts/ufu0syu9_logo_innovateR.jpg';

const stats = [
  { value: '₹2.40Cr', label: 'Year 1 Revenue (100 seats)', color: 'text-sky-600' },
  { value: '4+ Cr', label: 'Cumulative Profit by Year 3', color: 'text-cyan-600' },
  { value: '90%+', label: 'Target Placement Rate', color: 'text-orange-500' },
  { value: '₹53.5L', label: 'One-Time Lab CapEx', color: 'text-sky-600' },
];

const taglines = [
  "Don't Just Learn, Innovate!",
  "Building India's Future in Intelligent Robotics",
  "From Robotics Labs to Future-Ready Degree Programs",
];

function CircuitSVG() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#0EA5E9" strokeWidth="1.5" fill="none">
        <path d="M50 100 L200 100 L200 150 L350 150 L350 200" />
        <path d="M600 80 L700 80 L700 200 L750 200" />
        <path d="M100 300 L250 300 L250 400 L400 400" />
        <path d="M500 300 L600 300 L600 350 L700 350 L700 450" />
        <path d="M150 500 L300 500 L300 450 L450 450" />
        <circle cx="200" cy="100" r="5" fill="#0EA5E9" />
        <circle cx="350" cy="150" r="5" fill="#06B6D4" />
        <circle cx="700" cy="200" r="5" fill="#0EA5E9" />
        <circle cx="250" cy="300" r="5" fill="#06B6D4" />
        <circle cx="600" cy="300" r="5" fill="#0EA5E9" />
        <rect x="390" y="390" width="20" height="20" stroke="#0EA5E9" />
        <rect x="690" y="440" width="20" height="20" stroke="#06B6D4" />
      </g>
    </svg>
  );
}

export default function Hero() {
  const [spotlight, setSpotlight] = useState({ x: 400, y: 300 });
  const [taglineIdx, setTaglineIdx] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const handler = (e) => setSpotlight({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTaglineIdx(i => (i + 1) % taglines.length), 3500);
    return () => clearInterval(timer);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      data-testid="hero-section"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-white"
    >
      {/* Circuit background */}
      <CircuitSVG />

      {/* Cursor spotlight */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-all duration-75"
        style={{
          background: `radial-gradient(600px at ${spotlight.x}px ${spotlight.y}px, rgba(14, 165, 233, 0.06), transparent 70%)`,
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-sky-100 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-cyan-100 rounded-full blur-3xl opacity-30" />

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            {/* Brand tag */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 border border-sky-200 rounded-full text-xs font-semibold text-sky-700 mb-6 animate-slide-up">
              <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
              University Partnership Proposal Platform
            </div>

            {/* Logo */}
            <div className="mb-6 animate-slide-up delay-100">
              <img
                src={LOGO_URL}
                alt="InnovateR"
                className="h-20 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-tight mb-4 animate-slide-up delay-200" style={{fontFamily:'Outfit,sans-serif'}}>
              <span className="gradient-text">Intelligent</span>
              <br />
              Robotics Education
              <br />
              <span className="text-slate-400 text-4xl sm:text-5xl">for India</span>
            </h1>

            {/* Rotating tagline */}
            <div className="h-8 mb-6 overflow-hidden animate-slide-up delay-300">
              <p key={taglineIdx} className="text-lg text-slate-600 font-medium animate-slide-up">
                "{taglines[taglineIdx]}"
              </p>
            </div>

            <p className="text-slate-500 text-base leading-relaxed mb-8 max-w-xl animate-slide-up delay-300">
              Robokoshal Tech Innovation & InnovateR present a comprehensive proposal for B.Tech Intelligent Robotic Systems — a future-ready degree program with proven lab infrastructure, academic framework, and financial model.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 animate-slide-up delay-400">
              <button
                data-testid="cta-explore-proposal"
                onClick={() => scrollTo('programs')}
                className="btn-primary"
              >
                Explore Proposal <ArrowRight size={16} />
              </button>
              <button
                data-testid="cta-finance-dashboard"
                onClick={() => scrollTo('finance')}
                className="flex items-center gap-2 px-5 py-3 rounded-full border-2 border-sky-200 text-sky-700 font-semibold text-sm hover:bg-sky-50 transition-colors"
              >
                <BarChart3 size={16} /> Finance Dashboard
              </button>
              <button
                data-testid="cta-lab-planner"
                onClick={() => scrollTo('lab-planner')}
                className="flex items-center gap-2 px-5 py-3 rounded-full border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                <FlaskConical size={16} /> Lab Planner
              </button>
            </div>
          </div>

          {/* Right: Floating stat cards */}
          <div className="relative animate-slide-up delay-200">
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  data-testid={`stat-card-${i}`}
                  className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-md card-hover ${
                    i % 2 === 0 ? 'animate-float' : 'animate-float-slow'
                  }`}
                  style={{ animationDelay: `${i * 0.5}s` }}
                >
                  <div className={`text-2xl font-bold ${stat.color} mb-1`} style={{fontFamily:'Outfit,sans-serif'}}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-500 leading-snug">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Center floating badge */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white rounded-2xl px-5 py-3 shadow-lg border border-slate-200 animate-pulse-glow">
              <Building2 size={18} className="text-sky-500" />
              <span className="text-sm font-semibold text-slate-800">AICTE & NEP 2020 Aligned</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center mt-16 animate-bounce">
          <button onClick={() => scrollTo('about')} className="p-2 rounded-full bg-sky-50 text-sky-500 hover:bg-sky-100 transition-colors">
            <ChevronDown size={24} />
          </button>
        </div>
      </div>
    </section>
  );
}
