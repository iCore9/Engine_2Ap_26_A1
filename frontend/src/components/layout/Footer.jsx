import React from 'react';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_key-3/artifacts/ufu0syu9_logo_innovateR.jpg';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={LOGO_URL} alt="InnovateR" className="h-12 w-auto object-contain bg-white rounded-lg p-1" />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              InnovateR by Robokoshal Tech Innovation — Building India's Future in Intelligent Robotics through world-class education, cutting-edge lab setups, and industry-aligned programs.
            </p>
            <p className="text-slate-500 text-xs">Robokoshal Tech Innovation Pvt. Ltd.</p>
            <div className="flex gap-3 mt-4">
              <div className="w-8 h-8 rounded-lg bg-sky-600/20 flex items-center justify-center text-sky-400 text-xs font-bold">R</div>
              <div className="w-8 h-8 rounded-lg bg-cyan-600/20 flex items-center justify-center text-cyan-400 text-xs font-bold">I</div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              {['About', 'Portfolio', 'Programs', 'Finance Dashboard', 'Lab Planner', 'Partnership'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => {
                      const id = item.toLowerCase().replace(' ', '-').replace(' dashboard', '').replace('planner', 'lab-planner');
                      const el = document.getElementById(item === 'Finance Dashboard' ? 'finance' : item === 'Lab Planner' ? 'lab-planner' : item.toLowerCase());
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-sky-400 transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-sky-400 flex-shrink-0" />
                <a href="mailto:robokoshal@gmail.com" className="hover:text-sky-400 transition-colors">
                  robokoshal@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-sky-400 flex-shrink-0 mt-0.5" />
                <span>India</span>
              </li>
            </ul>
            <div className="mt-6 pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-500 mb-2">Pitch Proposal Platform</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-sky-600/20 text-sky-400 rounded text-xs">B.Tech IRS</span>
                <span className="px-2 py-1 bg-cyan-600/20 text-cyan-400 rounded text-xs">Diploma</span>
                <span className="px-2 py-1 bg-orange-600/20 text-orange-400 rounded text-xs">Partner</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © {year} Robokoshal Tech Innovation Pvt. Ltd. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            Powered by InnovateR Platform
            <ExternalLink size={10} />
          </p>
        </div>
      </div>
    </footer>
  );
}
