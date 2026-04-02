import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from '../auth/LoginModal';
import { Menu, X, ChevronDown, Shield, LogOut, Settings } from 'lucide-react';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_key-3/artifacts/ufu0syu9_logo_innovateR.jpg';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Programs', href: '#programs' },
  { label: 'Finance', href: '#finance' },
  { label: 'Lab Planner', href: '#lab-planner' },
  { label: 'Partnership', href: '#partnership' },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleNavClick = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav
        data-testid="navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass shadow-sm' : 'bg-white/80 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src={LOGO_URL}
                alt="InnovateR Logo"
                className="h-9 w-auto object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-slate-900" style={{fontFamily:'Outfit,sans-serif'}}>InnovateR</div>
                <div className="text-xs text-slate-400 leading-none">Robokoshal Tech</div>
              </div>
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  data-testid={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
                  onClick={() => handleNavClick(link.href)}
                  className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-sky-600 rounded-lg hover:bg-sky-50 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Auth */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="relative">
                  <button
                    data-testid="user-menu-btn"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-sky-50 text-sky-700 text-sm font-medium hover:bg-sky-100 transition-colors"
                  >
                    <Shield size={15} />
                    <span>{user.name || user.email}</span>
                    <ChevronDown size={14} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                      {isAdmin && (
                        <button
                          data-testid="admin-panel-btn"
                          onClick={() => { navigate('/admin'); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Settings size={15} /> Admin Panel
                        </button>
                      )}
                      <button
                        data-testid="logout-btn"
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  data-testid="login-btn"
                  onClick={() => setShowLogin(true)}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-sky-200 transition-all hover:-translate-y-0.5"
                >
                  Admin Login
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              data-testid="mobile-menu-btn"
              className="md:hidden p-2 rounded-lg text-slate-700"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden glass border-t border-slate-200">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="block w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-sky-50 rounded-lg"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-2 border-t border-slate-200">
                {user ? (
                  <button onClick={() => { logout(); setMobileOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600">
                    Sign Out
                  </button>
                ) : (
                  <button onClick={() => { setShowLogin(true); setMobileOpen(false); }}
                    className="w-full px-4 py-2 bg-sky-500 text-white rounded-full text-sm font-semibold">
                    Admin Login
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
