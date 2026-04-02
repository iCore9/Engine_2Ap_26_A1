import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Portfolio from '../components/sections/Portfolio';
import Programs from '../components/sections/Programs';
import FinanceDashboard from '../components/sections/FinanceDashboard';
import LabPlanner from '../components/sections/LabPlanner';
import Partnership from '../components/sections/Partnership';
import Testimonials from '../components/sections/Testimonials';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

export default function HomePage() {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Portfolio />
        <Programs />
        <FinanceDashboard />
        <LabPlanner />
        <Partnership />
        <Testimonials />
      </main>
      <Footer />

      {/* Admin quick access */}
      {isAdmin && (
        <Link
          to="/admin"
          data-testid="admin-fab"
          className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-full shadow-lg shadow-sky-200 text-sm font-semibold z-50 hover:shadow-xl transition-all hover:-translate-y-0.5"
        >
          <Settings size={16} /> Admin Panel
        </Link>
      )}
    </div>
  );
}
