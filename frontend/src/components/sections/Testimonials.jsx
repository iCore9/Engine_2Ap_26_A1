import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    api.get('/testimonials').then(r => setTestimonials(r.data)).catch(() => {});
  }, []);

  if (!testimonials.length) return null;

  const prev = () => setActiveIdx(i => (i - 1 + testimonials.length) % testimonials.length);
  const next = () => setActiveIdx(i => (i + 1) % testimonials.length);
  const t = testimonials[activeIdx];

  return (
    <section id="testimonials" className="py-24 bg-slate-50" data-testid="testimonials-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest font-semibold text-sky-600 mb-3 block">Trust & Impact</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4" style={{fontFamily:'Outfit,sans-serif'}}>
            What They <span className="gradient-text">Say</span>
          </h2>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Voices from university leaders, faculty, and students who have experienced InnovateR firsthand.
          </p>
        </div>

        {/* Main testimonial card */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-8 relative" data-testid="testimonial-card">
            {/* Quote icon */}
            <div className="absolute -top-4 left-8 w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center">
              <Quote size={14} className="text-white" />
            </div>

            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="#F97316" className="text-orange-400" />
              ))}
            </div>

            <blockquote className="text-slate-700 text-base leading-relaxed mb-6 italic">
              "{t.quote}"
            </blockquote>

            <div className="flex items-center gap-4">
              {t.avatar_url ? (
                <img src={t.avatar_url} alt={t.author}
                  className="w-12 h-12 rounded-full object-cover border-2 border-sky-100"
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${t.author}&background=0EA5E9&color=fff`; }}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-white font-bold">
                  {t.author?.charAt(0)}
                </div>
              )}
              <div>
                <div className="font-bold text-slate-900 text-sm" style={{fontFamily:'Outfit,sans-serif'}}>{t.author}</div>
                <div className="text-xs text-sky-600">{t.role}</div>
                <div className="text-xs text-slate-400">{t.organization}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <button
            data-testid="testimonial-prev"
            onClick={prev}
            className="p-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                data-testid={`testimonial-dot-${i}`}
                onClick={() => setActiveIdx(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === activeIdx ? 'bg-sky-500 w-6' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          <button
            data-testid="testimonial-next"
            onClick={next}
            className="p-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Stats band */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: '3+', label: 'Partner Institutions', color: 'sky' },
            { value: '500+', label: 'Students Trained', color: 'cyan' },
            { value: '10+', label: 'Workshops Conducted', color: 'sky' },
            { value: '₹4Cr+', label: 'Projected 3yr Revenue', color: 'orange' },
          ].map(({ value, label, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5 text-center card-hover">
              <div className={`text-2xl font-bold text-${color === 'orange' ? 'orange' : color}-600 mb-1`} style={{fontFamily:'Outfit,sans-serif'}}>{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
