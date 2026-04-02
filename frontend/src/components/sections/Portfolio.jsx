import React, { useEffect, useState, useRef } from 'react';
import api from '../../utils/api';
import { ChevronRight, Tag, Star, X } from 'lucide-react';

const levelColors = {
  basic: 'bg-green-100 text-green-700',
  intermediate: 'bg-sky-100 text-sky-700',
  advanced: 'bg-purple-100 text-purple-700',
};

const categories = ['All', 'Advanced Robotics', 'Educational Robotics', 'Electronics & Control'];

function TiltCard({ children, className }) {
  const ref = useRef(null);
  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const cx = rect.width / 2, cy = rect.height / 2;
    ref.current.style.transform = `perspective(800px) rotateX(${((y - cy) / cy) * -8}deg) rotateY(${((x - cx) / cx) * 8}deg) scale3d(1.03,1.03,1.03)`;
  };
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)';
  };
  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}
      className={`tilt-card ${className}`}>{children}</div>
  );
}

function DetailModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10">
        <div className="relative h-56 overflow-hidden rounded-t-2xl">
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 bg-white rounded-full shadow-md">
            <X size={18} className="text-slate-600" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900" style={{fontFamily:'Outfit,sans-serif'}}>{item.title}</h3>
              <p className="text-sm text-sky-600 mt-0.5">{item.category}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${levelColors[item.level] || 'bg-slate-100 text-slate-600'}`}>
              {item.level}
            </span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">{item.description}</p>
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Technologies</h4>
            <div className="flex flex-wrap gap-1.5">
              {(item.technologies || []).map(t => (
                <span key={t} className="px-2.5 py-1 bg-sky-50 text-sky-700 rounded-full text-xs font-medium">{t}</span>
              ))}
            </div>
          </div>
          {item.educational_value && (
            <div className="mb-3 p-3 bg-green-50 rounded-xl">
              <h4 className="text-xs font-semibold text-green-700 mb-1">Educational Value</h4>
              <p className="text-xs text-green-600">{item.educational_value}</p>
            </div>
          )}
          {item.course_relevance && (
            <div className="p-3 bg-sky-50 rounded-xl">
              <h4 className="text-xs font-semibold text-sky-700 mb-1">Course Relevance</h4>
              <p className="text-xs text-sky-600">{item.course_relevance}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    api.get('/portfolio').then(r => setItems(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'All' ? items : items.filter(i => i.category === activeCategory);

  return (
    <section id="portfolio" className="py-24 bg-white" data-testid="portfolio-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest font-semibold text-sky-600 mb-3 block">Our Work</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4" style={{fontFamily:'Outfit,sans-serif'}}>
            Robotics <span className="gradient-text">Portfolio</span>
          </h2>
          <p className="text-slate-500 text-base max-w-2xl mx-auto">
            Real robots, real projects. These are the systems InnovateR builds, teaches, and deploys in educational labs across India.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              data-testid={`filter-${cat.toLowerCase().replace(/ /g, '-')}`}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, i) => (
              <TiltCard key={item.id || i} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden cursor-pointer">
                <div
                  data-testid={`portfolio-card-${i}`}
                  onClick={() => setSelectedItem(item)}
                  className="group"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => { e.target.src = 'https://images.pexels.com/photos/8438967/pexels-photo-8438967.jpeg?auto=compress&cs=tinysrgb&w=400'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="p-2 bg-white rounded-full shadow-lg">
                        <ChevronRight size={16} className="text-sky-500" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-slate-900 text-sm leading-tight" style={{fontFamily:'Outfit,sans-serif'}}>{item.title}</h3>
                      <span className={`ml-2 flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${levelColors[item.level] || 'bg-slate-100 text-slate-600'}`}>
                        {item.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      <Tag size={11} className="text-slate-400" />
                      <span className="text-xs text-slate-400">{item.category}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{item.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {(item.technologies || []).slice(0, 3).map(t => (
                        <span key={t} className="px-2 py-0.5 bg-sky-50 text-sky-600 rounded text-xs">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
      </div>
    </section>
  );
}
