import React, { useEffect, useState, useRef } from 'react';
import api from '../../utils/api';
import { Cpu, Brain, Briefcase, Code, Users, Linkedin, ExternalLink } from 'lucide-react';

const skillColors = {
  'Robotics': 'bg-sky-100 text-sky-700', 'Automation': 'bg-sky-100 text-sky-700',
  'Embedded Systems': 'bg-cyan-100 text-cyan-700', 'Arduino': 'bg-green-100 text-green-700',
  'ROS': 'bg-purple-100 text-purple-700', 'AI': 'bg-orange-100 text-orange-700',
  'Machine Learning': 'bg-orange-100 text-orange-700', 'Python': 'bg-blue-100 text-blue-700',
  'TensorFlow': 'bg-orange-100 text-orange-700', 'IoT': 'bg-teal-100 text-teal-700',
};

function TiltCard({ children, className }) {
  const ref = useRef(null);
  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const cx = rect.width / 2, cy = rect.height / 2;
    ref.current.style.transform = `perspective(800px) rotateX(${((y - cy) / cy) * -6}deg) rotateY(${((x - cx) / cx) * 6}deg) scale3d(1.02,1.02,1.02)`;
  };
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)';
  };
  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}
      className={`tilt-card ${className}`}>{children}</div>
  );
}

export default function About() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/team').then(r => setTeam(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const roleIcons = { 0: Cpu, 1: Brain, 2: Briefcase, 3: Code };

  return (
    <section id="about" className="py-24 bg-slate-50" data-testid="about-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-widest font-semibold text-sky-600 mb-3 block">About Us</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4" style={{fontFamily:'Outfit,sans-serif'}}>
            Meet the <span className="gradient-text">Innovators</span>
          </h2>
          <p className="text-slate-500 text-base max-w-2xl mx-auto">
            Robokoshal Tech Innovation — a team of passionate engineers, educators, and industry professionals dedicated to transforming robotics education in India.
          </p>
        </div>

        {/* Mission cards */}
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Cpu, title: 'Our Mission', desc: 'Build world-class robotics education infrastructure for Indian universities, bridging the gap between academic learning and industry demands.', color: 'sky' },
            { icon: Brain, title: 'Our Vision', desc: 'Position India as a global leader in intelligent robotics engineering by 2030, training 10,000+ robotics engineers through partner institutions.', color: 'cyan' },
            { icon: Users, title: 'Our Impact', desc: 'Hands-on workshops, global competition exposure (ABU Robocon, RoboCup), and industry-grade lab setups that inspire the next generation.', color: 'orange' },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm card-hover">
              <div className={`w-12 h-12 rounded-xl bg-${item.color}-50 flex items-center justify-center mb-4`}>
                <item.icon size={22} className={`text-${item.color === 'orange' ? 'orange' : item.color}-500`} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2" style={{fontFamily:'Outfit,sans-serif'}}>{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Team */}
        <div className="text-center mb-10">
          <h3 className="text-2xl font-bold text-slate-800" style={{fontFamily:'Outfit,sans-serif'}}>Our Team & Mentors</h3>
          <p className="text-slate-500 text-sm mt-2">Experienced professionals guiding the next generation of innovators</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => {
              const Icon = roleIcons[i % 4] || Cpu;
              return (
                <TiltCard key={member.id || i} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div data-testid={`team-card-${i}`}>
                    {/* Photo */}
                    <div className="relative h-44 bg-gradient-to-br from-sky-50 to-cyan-50 flex items-center justify-center overflow-hidden">
                      {member.photo_url ? (
                        <img src={member.photo_url} alt={member.name}
                          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center border-4 border-white shadow-md">
                          <span className="text-3xl font-bold text-white">{member.name?.charAt(0)}</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 p-2 rounded-full bg-white shadow-sm">
                        <Icon size={16} className="text-sky-500" />
                      </div>
                    </div>

                    <div className="p-4">
                      <h4 className="font-bold text-slate-900 text-sm" style={{fontFamily:'Outfit,sans-serif'}}>{member.name}</h4>
                      <p className="text-xs text-sky-600 font-medium mb-2">{member.role}</p>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-3">{member.bio}</p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(member.skills || []).slice(0, 3).map((skill) => (
                          <span key={skill} className={`px-2 py-0.5 rounded-full text-xs font-medium ${skillColors[skill] || 'bg-slate-100 text-slate-600'}`}>
                            {skill}
                          </span>
                        ))}
                        {(member.skills || []).length > 3 && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-500">+{member.skills.length - 3}</span>
                        )}
                      </div>

                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-800 transition-colors">
                          <Linkedin size={12} /> LinkedIn <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        )}

        {/* Skills ladder */}
        <div className="mt-16 bg-white rounded-2xl border border-slate-200 p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6 text-center" style={{fontFamily:'Outfit,sans-serif'}}>
            Robotics Skills Progression Ladder
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-2">
            {['Arduino', 'Raspberry Pi', 'ROS', 'Computer Vision', 'AI / ML', 'Intelligent Robotic Systems'].map((skill, i, arr) => (
              <React.Fragment key={skill}>
                <div className="flex flex-col items-center">
                  <div className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 ${
                    i === 0 ? 'bg-green-50 border-green-300 text-green-700' :
                    i === arr.length - 1 ? 'bg-orange-50 border-orange-300 text-orange-700' :
                    'bg-sky-50 border-sky-300 text-sky-700'
                  }`}>
                    {skill}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Level {i + 1}</div>
                </div>
                {i < arr.length - 1 && (
                  <div className="text-slate-300 font-bold text-lg pb-4">→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
